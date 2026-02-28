import { renderHook, act } from "@testing-library/react";
import { useManageSessionAttendance } from "./useManageSessionAttendance";
import * as adminApi from "../../../../../../store/admin/api";
import * as alertContext from "../../../../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";

jest.mock("../../../../../../store/admin/api");
jest.mock("../../../../../../components/Alert/AlertContext");
jest.mock("react-i18next");

describe("useManageSessionAttendance", () => {
    const mockClassSession = {
        id: 1,
        classGroupId: 1,
        date: "2024-01-01",
        startTime: "10:00",
        endTime: "11:00",
        roomId: null,
        instructorId: null,
        notes: null,
        status: "scheduled",
        cancellationReason: null,
        rescheduledFromId: null,
        createdAt: "2024-01-01T00:00:00Z",
    };

    const mockAttendanceList = [
        {
            studentId: "1",
            firstName: "John",
            lastName: "Doe",
            enrollmentStatus: "ACTIVE",
            status: "PRESENT",
            isMakeup: false,
        },
        {
            studentId: "2",
            firstName: "Jane",
            lastName: "Smith",
            enrollmentStatus: "ACTIVE",
            status: null,
            isMakeup: false,
        },
    ];

    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockBulkUpdateAttendance = jest.fn();
    const mockBulkUpdateMutation = jest.fn().mockReturnValue({
        unwrap: mockBulkUpdateAttendance,
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockBulkUpdateAttendance.mockClear();
        jest.mocked(adminApi.useListSessionAttendanceQuery).mockReturnValue({
            data: mockAttendanceList,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(adminApi.useBulkUpdateAttendanceMutation).mockReturnValue([
            mockBulkUpdateMutation,
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

    it("should return attendance list and loading state", () => {
        const { result } = renderHook(() => useManageSessionAttendance(mockClassSession, true));

        expect(result.current.attendanceList).toHaveLength(2);
        expect(result.current.isLoadingAttendance).toBe(false);
        expect(result.current.isSaving).toBe(false);
    });

    it("should initialize attendance data from list", () => {
        const { result } = renderHook(() => useManageSessionAttendance(mockClassSession, true));

        const data1 = result.current.getAttendanceData("1");
        expect(data1.status).toBe("PRESENT");
        expect(data1.isMakeup).toBe(false);

        const data2 = result.current.getAttendanceData("2");
        expect(data2.status).toBe("ABSENT");
        expect(data2.isMakeup).toBe(false);
    });

    it("should change attendance status", () => {
        const { result } = renderHook(() => useManageSessionAttendance(mockClassSession, true));

        act(() => {
            result.current.handleStatusChange("1", "ABSENT");
        });

        const data = result.current.getAttendanceData("1");
        expect(data.status).toBe("ABSENT");
    });

    it("should toggle makeup status", () => {
        const { result } = renderHook(() => useManageSessionAttendance(mockClassSession, true));

        act(() => {
            result.current.handleMakeupToggle("1");
        });

        const data = result.current.getAttendanceData("1");
        expect(data.isMakeup).toBe(true);

        act(() => {
            result.current.handleMakeupToggle("1");
        });

        const data2 = result.current.getAttendanceData("1");
        expect(data2.isMakeup).toBe(false);
    });

    it("should save attendance changes", async () => {
        const mockOnClose = jest.fn();
        mockBulkUpdateAttendance.mockResolvedValue({});
        const { result } = renderHook(() => useManageSessionAttendance(mockClassSession, true));

        act(() => {
            result.current.handleStatusChange("1", "ABSENT");
        });

        await act(async () => {
            await result.current.handleSave(mockOnClose);
        });

        expect(mockBulkUpdateMutation).toHaveBeenCalledWith({
            sessionId: 1,
            data: {
                items: [
                    { studentId: "1", status: "ABSENT", isMakeup: false },
                    { studentId: "2", status: "ABSENT", isMakeup: false },
                ],
            },
        });
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.attendanceUpdateSuccess", "success");
        expect(mockOnClose).toHaveBeenCalled();
    });

    it("should handle save error", async () => {
        const mockOnClose = jest.fn();
        mockBulkUpdateAttendance.mockRejectedValue(new Error("Error"));
        const { result } = renderHook(() => useManageSessionAttendance(mockClassSession, true));

        await act(async () => {
            await result.current.handleSave(mockOnClose);
        });

        expect(mockPublish).toHaveBeenCalledWith("translated.admin.attendanceUpdateError", "error");
        expect(mockOnClose).not.toHaveBeenCalled();
    });
});
