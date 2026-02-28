import { renderHook, waitFor } from "@testing-library/react";
import { useRoom } from "./useRoom";
import * as api from "../api";
import * as alertContext from "../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";
import * as helpers from "../../helpers";

jest.mock("../api");
jest.mock("../../../components/Alert/AlertContext");
jest.mock("react-i18next");
jest.mock("../../helpers");

describe("useRoom", () => {
    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockTErrors = jest.fn((key: string) => `translated.errors.${key}`);
    const mockHandleError = jest.fn();
    const mockCreateRoomMutation = jest.fn();
    const mockUpdateRoomMutation = jest.fn();
    const mockDeleteRoomMutation = jest.fn();

    const mockRoom: api.RoomRead = {
        id: 1,
        name: "Room 1",
        capacity: 20,
        description: "Test room",
        isAvailableForRental: false,
        hourlyRate: null,
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(alertContext.useAlert).mockReturnValue({ publish: mockPublish, message: "", alertType: undefined });
        jest.mocked(reactI18next.useTranslation)
            .mockReturnValueOnce({ t: mockT } as unknown as ReturnType<typeof reactI18next.useTranslation>)
            .mockReturnValueOnce({ t: mockTErrors } as unknown as ReturnType<typeof reactI18next.useTranslation>);
        jest.mocked(helpers.handleError).mockImplementation(mockHandleError);
        jest.mocked(api.useCreateRoomMutation).mockReturnValue([mockCreateRoomMutation, { isLoading: false }] as any);
        jest.mocked(api.useUpdateRoomMutation).mockReturnValue([mockUpdateRoomMutation, { isLoading: false }] as any);
        jest.mocked(api.useDeleteRoomMutation).mockReturnValue([mockDeleteRoomMutation, { isLoading: false }] as any);
    });

    it("should create room successfully", async () => {
        mockCreateRoomMutation.mockResolvedValue({ data: mockRoom, error: undefined });

        const { result } = renderHook(() => useRoom());

        const roomData: api.RoomCreate = {
            name: "Room 1",
            capacity: 20,
            description: "Test room",
            isAvailableForRental: false,
            hourlyRate: null,
        };

        const createdRoom = await result.current.createRoom(roomData);

        await waitFor(() => {
            expect(mockCreateRoomMutation).toHaveBeenCalledWith(roomData);
        });

        expect(createdRoom).toEqual(mockRoom);
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.roomCreateSuccess", "success");
    });

    it("should handle create room error", async () => {
        const mockError = { status: 400, data: { detail: "ROOM_NAME_EXISTS" } };
        mockCreateRoomMutation.mockResolvedValue({ data: undefined, error: mockError });

        const { result } = renderHook(() => useRoom());

        const roomData: api.RoomCreate = {
            name: "Room 1",
            capacity: 20,
        };

        const createdRoom = await result.current.createRoom(roomData);

        await waitFor(() => {
            expect(mockHandleError).toHaveBeenCalledWith(
                mockError,
                mockPublish,
                mockTErrors,
                "UNKNOWN_ERROR",
                mockTErrors,
            );
        });

        expect(createdRoom).toBeUndefined();
    });

    it("should update room successfully", async () => {
        mockUpdateRoomMutation.mockResolvedValue({ data: mockRoom, error: undefined });

        const { result } = renderHook(() => useRoom());

        const updateData: api.RoomUpdate = {
            name: "Updated Room",
        };

        const updatedRoom = await result.current.updateRoom(1, updateData);

        await waitFor(() => {
            expect(mockUpdateRoomMutation).toHaveBeenCalledWith({ roomId: 1, data: updateData });
        });

        expect(updatedRoom).toEqual(mockRoom);
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.roomUpdateSuccess", "success");
    });

    it("should handle update room error", async () => {
        const mockError = { status: 404, data: { detail: "ROOM_NOT_FOUND" } };
        mockUpdateRoomMutation.mockResolvedValue({ data: undefined, error: mockError });

        const { result } = renderHook(() => useRoom());

        const updateData: api.RoomUpdate = {
            name: "Updated Room",
        };

        const updatedRoom = await result.current.updateRoom(1, updateData);

        await waitFor(() => {
            expect(mockHandleError).toHaveBeenCalledWith(
                mockError,
                mockPublish,
                mockTErrors,
                "UNKNOWN_ERROR",
                mockTErrors,
            );
        });

        expect(updatedRoom).toBeUndefined();
    });

    it("should delete room successfully", async () => {
        mockDeleteRoomMutation.mockResolvedValue({ data: undefined, error: undefined });

        const { result } = renderHook(() => useRoom());

        const deleted = await result.current.deleteRoom(1);

        await waitFor(() => {
            expect(mockDeleteRoomMutation).toHaveBeenCalledWith(1);
        });

        expect(deleted).toBe(true);
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.roomDeleteSuccess", "success");
    });

    it("should handle delete room error", async () => {
        const mockError = { status: 404, data: { detail: "ROOM_NOT_FOUND" } };
        mockDeleteRoomMutation.mockResolvedValue({ data: undefined, error: mockError });

        const { result } = renderHook(() => useRoom());

        const deleted = await result.current.deleteRoom(1);

        await waitFor(() => {
            expect(mockHandleError).toHaveBeenCalledWith(
                mockError,
                mockPublish,
                mockTErrors,
                "UNKNOWN_ERROR",
                mockTErrors,
            );
        });

        expect(deleted).toBe(false);
    });

    it("should return loading states", () => {
        jest.mocked(api.useCreateRoomMutation).mockReturnValue([mockCreateRoomMutation, { isLoading: true }] as any);
        jest.mocked(api.useUpdateRoomMutation).mockReturnValue([mockUpdateRoomMutation, { isLoading: true }] as any);
        jest.mocked(api.useDeleteRoomMutation).mockReturnValue([mockDeleteRoomMutation, { isLoading: true }] as any);

        const { result } = renderHook(() => useRoom());

        expect(result.current.isCreating).toBe(true);
        expect(result.current.isUpdating).toBe(true);
        expect(result.current.isDeleting).toBe(true);
    });
});
