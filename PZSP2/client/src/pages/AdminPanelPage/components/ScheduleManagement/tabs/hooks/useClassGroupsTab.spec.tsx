import { renderHook, act } from "@testing-library/react";
import { useClassGroupsTab } from "./useClassGroupsTab";
import * as adminApi from "../../../../../../store/admin/api";
import * as alertContext from "../../../../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";

jest.mock("../../../../../../store/admin/api");
jest.mock("../../../../../../components/Alert/AlertContext");
jest.mock("react-i18next");

describe("useClassGroupsTab", () => {
    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockCreateItem = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({ id: 1 }),
    });
    const mockUpdateItem = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
    });
    const mockDeleteItem = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
    });
    const mockGenerateSessions = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(adminApi.useListClassGroupsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(adminApi.useListSemestersQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(adminApi.useListSkillLevelsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(adminApi.useListTopicsQuery).mockReturnValue({
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
        jest.mocked(adminApi.useCreateClassGroupMutation).mockReturnValue([
            mockCreateItem,
            { isLoading: false },
        ] as any);
        jest.mocked(adminApi.useUpdateClassGroupMutation).mockReturnValue([
            mockUpdateItem,
            { isLoading: false },
        ] as any);
        jest.mocked(adminApi.useDeleteClassGroupMutation).mockReturnValue([
            mockDeleteItem,
            { isLoading: false },
        ] as any);
        jest.mocked(adminApi.useGenerateClassGroupSessionsMutation).mockReturnValue([
            mockGenerateSessions,
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
        const { result } = renderHook(() => useClassGroupsTab());

        expect(result.current.items).toEqual([]);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isCreateModalOpen).toBe(false);
        expect(result.current.editingItem).toBe(null);
    });

    it("should create class group", async () => {
        const { result } = renderHook(() => useClassGroupsTab());

        const data = {
            semesterId: 1,
            name: "Test Group",
            levelId: 1,
            topicId: 1,
            capacity: 20,
            dayOfWeek: 1,
            startTime: "10:00",
            endTime: "11:00",
            description: null,
            roomId: null,
            instructorId: null,
            isPublic: false,
            status: "draft",
        };

        await act(async () => {
            await result.current.handleCreate(data);
        });

        expect(mockCreateItem).toHaveBeenCalledWith(data);
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.classGroupCreateSuccess", "success");
    });

    it("should update class group", async () => {
        const mockItem = {
            id: 1,
            semesterId: 1,
            name: "Test Group",
            levelId: 1,
            topicId: 1,
            capacity: 20,
            dayOfWeek: 1,
            startTime: "10:00",
            endTime: "11:00",
            description: null,
            roomId: null,
            instructorId: null,
            isPublic: false,
            status: "draft",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
        };
        const { result } = renderHook(() => useClassGroupsTab());

        act(() => {
            result.current.setEditingItem(mockItem);
        });

        const data = {
            semesterId: 1,
            name: "Updated Group",
            levelId: 1,
            topicId: 1,
            capacity: 20,
            dayOfWeek: 1,
            startTime: "10:00",
            endTime: "11:00",
            description: null,
            roomId: null,
            instructorId: null,
            isPublic: false,
            status: "draft",
        };

        await act(async () => {
            await result.current.handleUpdate(data);
        });

        expect(mockUpdateItem).toHaveBeenCalledWith({
            classGroupId: 1,
            data,
        });
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.classGroupUpdateSuccess", "success");
    });

    it("should delete class group", async () => {
        const mockItem = {
            id: 1,
            semesterId: 1,
            name: "Test Group",
            levelId: 1,
            topicId: 1,
            capacity: 20,
            dayOfWeek: 1,
            startTime: "10:00",
            endTime: "11:00",
            description: null,
            roomId: null,
            instructorId: null,
            isPublic: false,
            status: "draft",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
        };
        const { result } = renderHook(() => useClassGroupsTab());

        act(() => {
            result.current.setDeletingItem(mockItem);
        });

        await act(async () => {
            await result.current.handleDelete();
        });

        expect(mockDeleteItem).toHaveBeenCalledWith(1);
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.classGroupDeleteSuccess", "success");
    });

    it("should get semester name", () => {
        const mockSemesters = [{ id: 1, name: "Fall 2024" }];
        jest.mocked(adminApi.useListSemestersQuery).mockReturnValue({
            data: mockSemesters,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        const { result } = renderHook(() => useClassGroupsTab());

        expect(result.current.getSemesterName(1)).toBe("Fall 2024");
    });
});
