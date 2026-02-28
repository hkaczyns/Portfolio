import pytest
from fastapi import status
from httpx import AsyncClient

from app.core.config import get_settings
from app.models.enrollment import EnrollmentStatus
from app.models.user import UserRole
from tests.admin.helpers import create_admin_and_login, create_verified_user

settings = get_settings()


async def create_schedule_dependencies(client: AsyncClient) -> dict:
    level_beginner = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/skill-levels",
        json={"name": "Beginner", "description": "Start"},
    )
    assert level_beginner.status_code == status.HTTP_201_CREATED
    level_advanced = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/skill-levels",
        json={"name": "Advanced", "description": "Pro"},
    )
    assert level_advanced.status_code == status.HTTP_201_CREATED
    topic_hip_hop = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/topics",
        json={"name": "Hip Hop", "description": "Dance"},
    )
    assert topic_hip_hop.status_code == status.HTTP_201_CREATED
    topic_ballet = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/topics",
        json={"name": "Ballet", "description": "Classic"},
    )
    assert topic_ballet.status_code == status.HTTP_201_CREATED
    room_a = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/rooms",
        json={"name": "Sala A", "capacity": 20},
    )
    assert room_a.status_code == status.HTTP_201_CREATED
    room_b = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/rooms",
        json={"name": "Sala B", "capacity": 10},
    )
    assert room_b.status_code == status.HTTP_201_CREATED
    semester = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/semesters",
        json={
            "name": "2026 Zima",
            "startDate": "2026-01-01",
            "endDate": "2026-06-30",
            "isActive": True,
        },
    )
    assert semester.status_code == status.HTTP_201_CREATED
    return {
        "level_beginner_id": level_beginner.json()["id"],
        "level_advanced_id": level_advanced.json()["id"],
        "topic_hip_hop_id": topic_hip_hop.json()["id"],
        "topic_ballet_id": topic_ballet.json()["id"],
        "room_a_id": room_a.json()["id"],
        "room_b_id": room_b.json()["id"],
        "semester_id": semester.json()["id"],
    }


async def create_class_group(client: AsyncClient, payload: dict) -> dict:
    response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-groups", json=payload
    )
    assert response.status_code == status.HTTP_201_CREATED
    return response.json()


async def create_class_session(client: AsyncClient, payload: dict) -> dict:
    response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions", json=payload
    )
    assert response.status_code == status.HTTP_201_CREATED
    return response.json()


@pytest.mark.asyncio
async def test_public_schedule_lists_groups_and_filters(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    deps = await create_schedule_dependencies(client)

    group_1 = await create_class_group(
        client,
        {
            "semesterId": deps["semester_id"],
            "name": "Hip Hop Kids 8-10",
            "levelId": deps["level_beginner_id"],
            "topicId": deps["topic_hip_hop_id"],
            "dayOfWeek": 2,
            "startTime": "17:00",
            "endTime": "18:00",
            "capacity": 2,
            "roomId": deps["room_a_id"],
            "isPublic": True,
            "status": "OPEN",
        },
    )
    group_2 = await create_class_group(
        client,
        {
            "semesterId": deps["semester_id"],
            "name": "Ballet Adults",
            "levelId": deps["level_advanced_id"],
            "topicId": deps["topic_ballet_id"],
            "dayOfWeek": 3,
            "startTime": "19:00",
            "endTime": "20:00",
            "capacity": 1,
            "roomId": deps["room_b_id"],
            "isPublic": True,
            "status": "OPEN",
        },
    )

    await create_class_session(
        client,
        {
            "classGroupId": group_1["id"],
            "date": "2026-01-20",
            "startTime": "17:00",
            "endTime": "18:00",
            "roomId": deps["room_a_id"],
        },
    )
    await create_class_session(
        client,
        {
            "classGroupId": group_1["id"],
            "date": "2026-01-22",
            "startTime": "17:00",
            "endTime": "18:00",
            "roomId": deps["room_a_id"],
            "status": "cancelled",
        },
    )
    await create_class_session(
        client,
        {
            "classGroupId": group_2["id"],
            "date": "2026-01-21",
            "startTime": "19:00",
            "endTime": "20:00",
            "roomId": deps["room_b_id"],
        },
    )

    student_active = await create_verified_user(
        email="student_active@example.com",
        password="Student_Password1",
        first_name="Active",
        last_name="Student",
        role=UserRole.STUDENT,
    )
    student_waitlisted = await create_verified_user(
        email="student_waitlisted@example.com",
        password="Student_Password1",
        first_name="Waitlisted",
        last_name="Student",
        role=UserRole.STUDENT,
    )
    student_full = await create_verified_user(
        email="student_full@example.com",
        password="Student_Password1",
        first_name="Full",
        last_name="Student",
        role=UserRole.STUDENT,
    )

    enrollment_active = await client.post(
        f"{settings.API_V1_STR}/admin/enrollments",
        json={
            "studentId": str(student_active.id),
            "classGroupId": group_1["id"],
            "status": EnrollmentStatus.ACTIVE.value,
        },
    )
    assert enrollment_active.status_code == status.HTTP_201_CREATED
    enrollment_waitlisted = await client.post(
        f"{settings.API_V1_STR}/admin/enrollments",
        json={
            "studentId": str(student_waitlisted.id),
            "classGroupId": group_1["id"],
            "status": EnrollmentStatus.WAITLISTED.value,
        },
    )
    assert enrollment_waitlisted.status_code == status.HTTP_201_CREATED
    enrollment_full = await client.post(
        f"{settings.API_V1_STR}/admin/enrollments",
        json={
            "studentId": str(student_full.id),
            "classGroupId": group_2["id"],
            "status": EnrollmentStatus.ACTIVE.value,
        },
    )
    assert enrollment_full.status_code == status.HTTP_201_CREATED

    client.cookies.clear()

    params = {"from": "2026-01-19", "to": "2026-01-25"}
    response = await client.get(
        f"{settings.API_V1_STR}/public/schedule", params=params
    )
    assert response.status_code == status.HTTP_200_OK
    payload = response.json()
    assert payload["range"] == params
    assert len(payload["groups"]) == 1

    group = payload["groups"][0]
    assert group["groupId"] == group_1["id"]
    assert group["availableSpots"] == 1
    assert group["waitlistCount"] == 1
    assert group["canJoinWaitlist"] is False
    assert len(group["occurrences"]) == 2
    assert any(item["isCancelled"] for item in group["occurrences"])

    include_full_response = await client.get(
        f"{settings.API_V1_STR}/public/schedule",
        params={**params, "include_full": "true"},
    )
    assert include_full_response.status_code == status.HTTP_200_OK
    group_ids = {
        item["groupId"] for item in include_full_response.json()["groups"]
    }
    assert group_ids == {group_1["id"], group_2["id"]}

    level_response = await client.get(
        f"{settings.API_V1_STR}/public/schedule",
        params={**params, "level": "Beginner"},
    )
    assert level_response.status_code == status.HTTP_200_OK
    assert len(level_response.json()["groups"]) == 1
    assert level_response.json()["groups"][0]["groupId"] == group_1["id"]

    weekday_response = await client.get(
        f"{settings.API_V1_STR}/public/schedule",
        params={**params, "weekday": 2},
    )
    assert weekday_response.status_code == status.HTTP_200_OK
    assert len(weekday_response.json()["groups"]) == 1
    assert weekday_response.json()["groups"][0]["groupId"] == group_1["id"]
