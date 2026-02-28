import { renderHook, waitFor } from "@testing-library/react";
import { useUpdateUser } from "./useUpdateUser";
import * as api from "../api";
import * as alertContext from "../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";
import * as helpers from "../../helpers";

jest.mock("../api");
jest.mock("../../../components/Alert/AlertContext");
jest.mock("react-i18next");
jest.mock("../../helpers");

describe("useUpdateUser", () => {
    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockHandleError = jest.fn();
    const mockUpdateUserMutation = jest.fn();

    const mockUserData = {
        id: "123",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        isVerified: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(alertContext.useAlert).mockReturnValue({ publish: mockPublish, message: "", alertType: undefined });
        jest.mocked(reactI18next.useTranslation).mockReturnValue({ t: mockT } as unknown as ReturnType<
            typeof reactI18next.useTranslation
        >);
        jest.mocked(helpers.handleError).mockImplementation(mockHandleError);
        jest.mocked(api.useUpdateUserMutation).mockReturnValue([
            mockUpdateUserMutation,
            { isLoading: false, isSuccess: false, isError: false, reset: jest.fn() },
        ]);
    });

    it("should return updateUser function and state", () => {
        const { result } = renderHook(() => useUpdateUser());

        expect(result.current).toHaveProperty("updateUser");
        expect(result.current).toHaveProperty("isLoading");
        expect(result.current).toHaveProperty("isSuccess");
        expect(result.current).toHaveProperty("isError");
        expect(typeof result.current.updateUser).toBe("function");
    });

    it("should call mutation and return user data on success", async () => {
        mockUpdateUserMutation.mockResolvedValue({ data: mockUserData, error: undefined });

        const { result } = renderHook(() => useUpdateUser());

        const updateData = { firstName: "Jane" };
        const updateResult = await result.current.updateUser(updateData);

        await waitFor(() => {
            expect(mockUpdateUserMutation).toHaveBeenCalledWith(updateData);
        });

        expect(updateResult).toEqual(mockUserData);
        expect(mockHandleError).not.toHaveBeenCalled();
    });

    it("should call handleError and return undefined on error", async () => {
        const mockError = { status: 400, data: { detail: "VALIDATION_ERROR" } };
        mockUpdateUserMutation.mockResolvedValue({ data: undefined, error: mockError });

        const { result } = renderHook(() => useUpdateUser());

        const updateData = { firstName: "Jane" };
        const updateResult = await result.current.updateUser(updateData);

        await waitFor(() => {
            expect(mockUpdateUserMutation).toHaveBeenCalledWith(updateData);
            expect(mockHandleError).toHaveBeenCalledWith(mockError, mockPublish, mockT, "UNKNOWN_ERROR", mockT);
        });

        expect(updateResult).toBeUndefined();
    });

    it("should return loading state when mutation is loading", () => {
        jest.mocked(api.useUpdateUserMutation).mockReturnValue([
            mockUpdateUserMutation,
            { isLoading: true, isSuccess: false, isError: false, reset: jest.fn() },
        ]);

        const { result } = renderHook(() => useUpdateUser());

        expect(result.current.isLoading).toBe(true);
    });

    it("should return success state when mutation succeeds", () => {
        jest.mocked(api.useUpdateUserMutation).mockReturnValue([
            mockUpdateUserMutation,
            { isLoading: false, isSuccess: true, isError: false, reset: jest.fn() },
        ]);

        const { result } = renderHook(() => useUpdateUser());

        expect(result.current.isSuccess).toBe(true);
    });

    it("should return error state when mutation has error", () => {
        jest.mocked(api.useUpdateUserMutation).mockReturnValue([
            mockUpdateUserMutation,
            { isLoading: false, isSuccess: false, isError: true, reset: jest.fn() },
        ]);

        const { result } = renderHook(() => useUpdateUser());

        expect(result.current.isError).toBe(true);
    });

    it("should handle partial updates (firstName only)", async () => {
        mockUpdateUserMutation.mockResolvedValue({ data: mockUserData, error: undefined });

        const { result } = renderHook(() => useUpdateUser());

        const updateData = { firstName: "Jane" };
        await result.current.updateUser(updateData);

        await waitFor(() => {
            expect(mockUpdateUserMutation).toHaveBeenCalledWith(updateData);
        });
    });

    it("should handle partial updates (email with currentPassword)", async () => {
        mockUpdateUserMutation.mockResolvedValue({ data: mockUserData, error: undefined });

        const { result } = renderHook(() => useUpdateUser());

        const updateData = { email: "new@example.com", currentPassword: "Password123" };
        await result.current.updateUser(updateData);

        await waitFor(() => {
            expect(mockUpdateUserMutation).toHaveBeenCalledWith(updateData);
        });
    });

    it("should handle password update with currentPassword", async () => {
        mockUpdateUserMutation.mockResolvedValue({ data: mockUserData, error: undefined });

        const { result } = renderHook(() => useUpdateUser());

        const updateData = { password: "NewPassword123", currentPassword: "OldPassword123" };
        await result.current.updateUser(updateData);

        await waitFor(() => {
            expect(mockUpdateUserMutation).toHaveBeenCalledWith(updateData);
        });
    });
});
