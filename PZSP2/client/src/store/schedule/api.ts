import { createApi } from "@reduxjs/toolkit/query/react";
import type { ClassGroupResponse } from "./types";
import { baseApiQuery } from "../api";

export interface GetClassGroupsParams {
    semesterId?: number | null;
    skillLevelId?: number | null;
    topicId?: number | null;
    onlyAvailable?: boolean;
    includeWaitlist?: boolean;
}

export interface SkillLevelMap {
    id: number;
    name: string;
}

export interface TopicMap {
    id: number;
    name: string;
}

export interface SemesterMap {
    id: number;
    name: string;
}

export interface PublicScheduleRange {
    from: string;
    to: string;
}

export interface PublicScheduleRoom {
    id: number;
    name: string;
}

export interface PublicScheduleOccurrence {
    startAt: string;
    endAt: string;
    isCancelled: boolean;
}

export interface PublicScheduleGroup {
    groupId: number;
    name: string;
    level: string;
    topic: string;
    room: PublicScheduleRoom | null;
    capacity: number;
    enrolledCount: number;
    availableSpots: number;
    waitlistCount: number;
    canJoinWaitlist: boolean;
    occurrences: PublicScheduleOccurrence[];
}

export interface PublicScheduleResponse {
    range: PublicScheduleRange;
    groups: PublicScheduleGroup[];
}

export interface GetPublicScheduleParams {
    level?: string | null;
    topic?: string | null;
    locationId?: number | null;
    roomId?: number | null;
    weekday?: number | null;
    includeFull?: boolean;
}

export interface InstructorCalendarSession {
    classSessionId: number;
    classGroupId: number;
    classGroupName: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    roomId: number;
    instructorId: string;
    topicId: number;
    levelId: number;
}

export interface StudentCalendarSession {
    classSessionId: number;
    classGroupId: number;
    classGroupName: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    roomId: number;
    instructorId: string;
    topicId: number;
    levelId: number;
}

export interface GetInstructorCalendarParams {
    fromDate?: string | null;
    toDate?: string | null;
    roomId?: number | null;
}

export interface GetStudentCalendarParams {
    fromDate?: string | null;
    toDate?: string | null;
    roomId?: number | null;
}

export interface AttendanceRecord {
    studentId: string;
    firstName: string;
    lastName: string;
    email: string;
    status: "PRESENT" | "ABSENT" | "EXCUSED" | null;
}

export interface AttendanceItem {
    studentId: string;
    status: "PRESENT" | "ABSENT" | "EXCUSED";
    isMakeup: boolean;
}

export interface UpdateAttendanceRequest {
    items: AttendanceItem[];
}

export interface CompleteSessionRequest {
    notes: string;
}

export interface InstructorUser {
    id: string;
    email: string;
    isActive: boolean;
    isSuperuser: boolean;
    isVerified: boolean;
    firstName: string;
    lastName: string;
    role: string;
}

export interface Student {
    id: string;
    email: string;
    isActive: boolean;
    isSuperuser: boolean;
    isVerified: boolean;
    firstName: string;
    lastName: string;
    role: string;
}

export interface CreateSubstitutionRequest {
    substituteInstructorId: string;
    reason: string;
}

export interface MakeupMarkResponse {
    isMakeup: boolean;
}

export const scheduleApi = createApi({
    reducerPath: "scheduleApi",
    baseQuery: baseApiQuery,
    tagTypes: ["ClassGroups", "InstructorCalendar"],
    endpoints: (builder) => ({
        getClassGroups: builder.query<ClassGroupResponse[], GetClassGroupsParams | void>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params && typeof params === "object") {
                    if (params.semesterId !== undefined && params.semesterId !== null) {
                        searchParams.append("semester_id", params.semesterId.toString());
                    }
                    if (params.skillLevelId !== undefined && params.skillLevelId !== null) {
                        searchParams.append("skill_level_id", params.skillLevelId.toString());
                    }
                    if (params.topicId !== undefined && params.topicId !== null) {
                        searchParams.append("topic_id", params.topicId.toString());
                    }
                    if (params.onlyAvailable !== undefined) {
                        searchParams.append("only_available", params.onlyAvailable.toString());
                    }
                    if (params.includeWaitlist !== undefined) {
                        searchParams.append("include_waitlist", params.includeWaitlist.toString());
                    }
                }
                const queryString = searchParams.toString();
                return {
                    url: `/v1/class-groups${queryString ? `?${queryString}` : ""}`,
                    method: "GET",
                };
            },
            providesTags: ["ClassGroups"],
        }),
        getSkillLevels: builder.query<SkillLevelMap[], void>({
            query: () => ({
                url: "/v1/public/skill-levels",
                method: "GET",
            }),
        }),
        getTopics: builder.query<TopicMap[], void>({
            query: () => ({
                url: "/v1/public/topics",
                method: "GET",
            }),
        }),
        getSemesters: builder.query<SemesterMap[], void>({
            query: () => ({
                url: "/v1/public/semesters",
                method: "GET",
            }),
        }),
        getPublicSchedule: builder.query<PublicScheduleResponse, GetPublicScheduleParams | void>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                const today = new Date();
                const oneYearAgo = new Date(today);
                oneYearAgo.setFullYear(today.getFullYear() - 1);
                const oneYearLater = new Date(today);
                oneYearLater.setFullYear(today.getFullYear() + 1);

                const formatDate = (date: Date): string => {
                    return date.toISOString().split("T")[0];
                };

                searchParams.append("from", formatDate(oneYearAgo));
                searchParams.append("to", formatDate(oneYearLater));

                if (params && params.level) {
                    searchParams.append("level", params.level);
                }
                if (params && params.topic) {
                    searchParams.append("topic", params.topic);
                }
                if (params && params.locationId !== undefined && params.locationId !== null) {
                    searchParams.append("location_id", params.locationId.toString());
                }
                if (params && params.roomId !== undefined && params.roomId !== null) {
                    searchParams.append("room_id", params.roomId.toString());
                }
                if (params && params.weekday !== undefined && params.weekday !== null) {
                    searchParams.append("weekday", params.weekday.toString());
                }
                if (params && params.includeFull !== undefined) {
                    searchParams.append("include_full", params.includeFull.toString());
                }
                const queryString = searchParams.toString();
                return {
                    url: `/v1/public/schedule${queryString ? `?${queryString}` : ""}`,
                    method: "GET",
                };
            },
        }),
        getInstructorCalendar: builder.query<InstructorCalendarSession[], GetInstructorCalendarParams | void>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params && params.fromDate) {
                    searchParams.append("from_date", params.fromDate);
                }
                if (params && params.toDate) {
                    searchParams.append("to_date", params.toDate);
                }
                if (params && params.roomId !== undefined && params.roomId !== null) {
                    searchParams.append("room_id", params.roomId.toString());
                }
                const queryString = searchParams.toString();
                return {
                    url: `/v1/instructor/calendar${queryString ? `?${queryString}` : ""}`,
                    method: "GET",
                };
            },
            providesTags: ["InstructorCalendar"],
        }),
        getStudentCalendar: builder.query<StudentCalendarSession[], GetStudentCalendarParams | void>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params && params.fromDate) {
                    searchParams.append("from_date", params.fromDate);
                }
                if (params && params.toDate) {
                    searchParams.append("to_date", params.toDate);
                }
                if (params && params.roomId !== undefined && params.roomId !== null) {
                    searchParams.append("room_id", params.roomId.toString());
                }
                const queryString = searchParams.toString();
                return {
                    url: `/v1/me/calendar${queryString ? `?${queryString}` : ""}`,
                    method: "GET",
                };
            },
            providesTags: ["ClassGroups"],
        }),
        getSessionAttendance: builder.query<AttendanceRecord[], number>({
            query: (sessionId) => ({
                url: `/v1/instructor/sessions/${sessionId}/attendance`,
                method: "GET",
            }),
        }),
        updateSessionAttendance: builder.mutation<void, { sessionId: number; body: UpdateAttendanceRequest }>({
            query: ({ sessionId, body }) => ({
                url: `/v1/instructor/sessions/${sessionId}/attendance`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["ClassGroups"],
        }),
        completeSession: builder.mutation<void, { classSessionId: number; body: CompleteSessionRequest }>({
            query: ({ classSessionId, body }) => ({
                url: `/v1/instructor/schedule/class-sessions/${classSessionId}/complete`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["ClassGroups", "InstructorCalendar"],
        }),
        getInstructors: builder.query<InstructorUser[], void>({
            query: () => ({
                url: "/v1/instructor/users/instructors",
                method: "GET",
            }),
        }),
        getStudents: builder.query<Student[], void>({
            query: () => ({
                url: "/v1/instructor/users/students",
                method: "GET",
            }),
        }),
        createSubstitution: builder.mutation<void, { classSessionId: number; body: CreateSubstitutionRequest }>({
            query: ({ classSessionId, body }) => ({
                url: `/v1/instructor/schedule/class-sessions/${classSessionId}/substitutions`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["ClassGroups", "InstructorCalendar"],
        }),
        markMakeup: builder.mutation<MakeupMarkResponse, { sessionId: number; studentId: string }>({
            query: ({ sessionId, studentId }) => ({
                url: `/v1/instructor/sessions/${sessionId}/makeup/${studentId}`,
                method: "POST",
            }),
            invalidatesTags: ["ClassGroups", "InstructorCalendar"],
        }),
    }),
});

export const {
    useGetClassGroupsQuery,
    useGetSkillLevelsQuery,
    useGetTopicsQuery,
    useGetSemestersQuery,
    useGetPublicScheduleQuery,
    useGetInstructorCalendarQuery,
    useGetStudentCalendarQuery,
    useGetSessionAttendanceQuery,
    useUpdateSessionAttendanceMutation,
    useCompleteSessionMutation,
    useGetInstructorsQuery,
    useGetStudentsQuery,
    useCreateSubstitutionMutation,
    useMarkMakeupMutation,
} = scheduleApi;
