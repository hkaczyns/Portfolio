import { renderHook, act } from "@testing-library/react";
import { useSessionsTab } from "./useSessionsTab";
import * as adminApi from "../../../../../../store/admin/api";
import * as alertContext from "../../../../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";

jest.mock("../../../../../../store/admin/api");
jest.mock("../../../../../../components/Alert/AlertContext");
jest.mock("react-i18next");

describe("useSessionsTab", () => {
    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockCreateItem = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
    });
    const mockUpdateItem = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
    });
    const mockDeleteItem = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
    });
    const mockCancelItem = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
    });
    const mockCompleteItem = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
    });
    const mockRescheduleItem = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(adminApi.useListClassSessionsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(adminApi.useListClassGroupsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(adminApi.useListRoomsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(adminApi.useListInstructorsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(adminApi.useCreateClassSessionMutation).mockReturnValue([
            mockCreateItem,
            { isLoading: false },
        ] as any);
        jest.mocked(adminApi.useUpdateClassSessionMutation).mockReturnValue([
            mockUpdateItem,
            { isLoading: false },
        ] as any);
        jest.mocked(adminApi.useDeleteClassSessionMutation).mockReturnValue([
            mockDeleteItem,
            { isLoading: false },
        ] as any);
        jest.mocked(adminApi.useCancelClassSessionMutation).mockReturnValue([
            mockCancelItem,
            { isLoading: false },
        ] as any);
        jest.mocked(adminApi.useCompleteClassSessionMutation).mockReturnValue([
            mockCompleteItem,
            { isLoading: false },
        ] as any);
        jest.mocked(adminApi.useRescheduleClassSessionMutation).mockReturnValue([
            mockRescheduleItem,
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

    it("should return initial state", () => {
        const { result } = renderHook(() => useSessionsTab());

        expect(result.current.items).toEqual([]);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isCreateModalOpen).toBe(false);
    });

    it("should create session", async () => {
        const { result } = renderHook(() => useSessionsTab());

        const data = {
            classGroupId: 1,
            date: "2024-01-01",
            startTime: "10:00",
            endTime: "11:00",
            roomId: null,
            instructorId: null,
            notes: null,
            status: "scheduled",
        };

        await act(async () => {
            await result.current.handleCreate(data);
        });

        expect(mockCreateItem).toHaveBeenCalledWith(data);
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.sessionCreateSuccess", "success");
    });

    it("should get class group name", () => {
        const mockClassGroups = [{ id: 1, name: "Test Group" }];
        jest.mocked(adminApi.useListClassGroupsQuery).mockReturnValue({
            data: mockClassGroups,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        const { result } = renderHook(() => useSessionsTab());

        expect(result.current.getClassGroupName(1)).toBe("Test Group");
    });
});
