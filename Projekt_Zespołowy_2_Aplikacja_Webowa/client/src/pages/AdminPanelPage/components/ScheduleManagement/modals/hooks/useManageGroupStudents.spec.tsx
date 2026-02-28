import { renderHook, act } from "@testing-library/react";
import { useManageGroupStudents } from "./useManageGroupStudents";
import * as adminApi from "../../../../../../store/admin/api";
import * as alertContext from "../../../../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";
import { UserRole } from "../../../../../../store/auth/types";

jest.mock("../../../../../../store/admin/api");
jest.mock("../../../../../../components/Alert/AlertContext");
jest.mock("react-i18next");

describe("useManageGroupStudents", () => {
    const mockClassGroup = {
        id: 1,
        name: "Test Group",
        semesterId: 1,
        levelId: 1,
        topicId: 1,
        roomId: null,
        capacity: 20,
        dayOfWeek: 1,
        startTime: "10:00",
        endTime: "11:00",
        instructorId: null,
        isPublic: true,
        status: "active",
        description: null,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    };

    const mockEnrollments = [
        {
            id: 1,
            studentId: "1",
            classGroupId: 1,
            status: "ACTIVE",
            joinedAt: "2024-01-01",
            cancelledAt: null,
        },
    ];

    const mockStudents = [
        {
            id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            isActive: true,
            isSuperuser: false,
            isVerified: true,
            role: UserRole.STUDENT,
        },
        {
            id: "2",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane@example.com",
            isActive: true,
            isSuperuser: false,
            isVerified: true,
            role: UserRole.STUDENT,
        },
    ];

    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockCreateEnrollment = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
    });
    const mockDeleteEnrollment = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(adminApi.useListEnrollmentsQuery).mockReturnValue({
            data: mockEnrollments,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(adminApi.useListUsersQuery).mockReturnValue({
            data: mockStudents,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(adminApi.useCreateEnrollmentMutation).mockReturnValue([
            mockCreateEnrollment,
            { isLoading: false },
        ] as any);
        jest.mocked(adminApi.useDeleteEnrollmentMutation).mockReturnValue([
            mockDeleteEnrollment,
            { isLoading: false },
        ] as any);
        jest.mocked(alertContext.useAlert).mockReturnValue({
            publish: mockPublish,
            message: "",
            alertType: undefined,
        });
        jest.mocked(reactI18next.useTranslation).mockReturnValue({
            t: mockT,
        } as unknown as ReturnType<typeof reactI18next.useTranslation>);
    });

    it("should return enrollments and students", () => {
        const { result } = renderHook(() => useManageGroupStudents(mockClassGroup));

        expect(result.current.enrollments).toHaveLength(1);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.selectedStudentId).toBe("");
    });

    it("should set selected student ID", () => {
        const { result } = renderHook(() => useManageGroupStudents(mockClassGroup));

        act(() => {
            result.current.setSelectedStudentId("2");
        });

        expect(result.current.selectedStudentId).toBe("2");
    });

    it("should add student to group", async () => {
        const { result } = renderHook(() => useManageGroupStudents(mockClassGroup));

        act(() => {
            result.current.setSelectedStudentId("2");
        });

        await act(async () => {
            await result.current.handleAddStudent();
        });

        expect(mockCreateEnrollment).toHaveBeenCalledWith({
            studentId: "2",
            classGroupId: 1,
        });
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.enrollmentCreateSuccess", "success");
    });

    it("should remove student from group", async () => {
        const { result } = renderHook(() => useManageGroupStudents(mockClassGroup));

        await act(async () => {
            await result.current.handleRemoveStudent(mockEnrollments[0]);
        });

        expect(mockDeleteEnrollment).toHaveBeenCalledWith(1);
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.enrollmentDeleteSuccess", "success");
    });

    it("should get student name", () => {
        const { result } = renderHook(() => useManageGroupStudents(mockClassGroup));

        const name = result.current.getStudentName("1");
        expect(name).toBe("John Doe");
    });

    it("should get status label", () => {
        const { result } = renderHook(() => useManageGroupStudents(mockClassGroup));

        expect(result.current.getStatusLabel("ACTIVE")).toBe("translated.admin.enrollmentStatusActive");
        expect(result.current.getStatusLabel("WAITLISTED")).toBe("translated.admin.enrollmentStatusWaitlisted");
        expect(result.current.getStatusLabel("CANCELLED")).toBe("translated.admin.enrollmentStatusCancelled");
        expect(result.current.getStatusLabel("COMPLETED")).toBe("translated.admin.enrollmentStatusCompleted");
    });

    it("should return enrolled student IDs", () => {
        const { result } = renderHook(() => useManageGroupStudents(mockClassGroup));

        expect(result.current.enrolledStudentIds.has("1")).toBe(true);
        expect(result.current.enrolledStudentIds.has("2")).toBe(false);
    });
});
