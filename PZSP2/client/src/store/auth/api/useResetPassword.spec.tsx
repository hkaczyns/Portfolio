import { renderHook, waitFor } from "@testing-library/react";
import { useResetPassword } from "./useResetPassword";
import * as api from "../api";
import * as alertContext from "../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";
import * as helpers from "../../helpers";

jest.mock("../api");
jest.mock("../../../components/Alert/AlertContext");
jest.mock("react-i18next");
jest.mock("../../helpers");

describe("useResetPassword", () => {
    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockHandleError = jest.fn();
    const mockResetPasswordMutation = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(alertContext.useAlert).mockReturnValue({ publish: mockPublish, message: "", alertType: undefined });
        jest.mocked(reactI18next.useTranslation).mockReturnValue({ t: mockT } as unknown as ReturnType<
            typeof reactI18next.useTranslation
        >);
        jest.mocked(helpers.handleError).mockImplementation(mockHandleError);
        jest.mocked(api.useResetPasswordMutation).mockReturnValue([
            mockResetPasswordMutation,
            { isLoading: false, isSuccess: false, isError: false, reset: jest.fn() },
        ]);
    });

    it("should call resetPasswordMutation with token and password", async () => {
        mockResetPasswordMutation.mockResolvedValue({ data: undefined, error: undefined });

        const { result } = renderHook(() => useResetPassword());

        result.current.resetPassword({ token: "test-token-123", password: "newPassword123" });

        await waitFor(() => {
            expect(mockResetPasswordMutation).toHaveBeenCalledWith({
                token: "test-token-123",
                password: "newPassword123",
            });
        });
    });

    it("should handle error and call handleError with fallback when mutation fails", async () => {
        const mockError = { status: 400, data: { detail: "INVALID_TOKEN" } };
        mockResetPasswordMutation.mockResolvedValue({ data: undefined, error: mockError });

        const { result } = renderHook(() => useResetPassword());

        result.current.resetPassword({ token: "invalid-token", password: "newPassword123" });

        await waitFor(() => {
            expect(mockHandleError).toHaveBeenCalledWith(mockError, mockPublish, mockT, "RESET_PASSWORD_BAD_TOKEN");
        });
    });

    it("should return loading state when mutation is loading", () => {
        jest.mocked(api.useResetPasswordMutation).mockReturnValue([
            mockResetPasswordMutation,
            { isLoading: true, isSuccess: false, isError: false, reset: jest.fn() },
        ]);

        const { result } = renderHook(() => useResetPassword());

        expect(result.current.isLoading).toBe(true);
    });

    it("should return success state when mutation succeeds", () => {
        jest.mocked(api.useResetPasswordMutation).mockReturnValue([
            mockResetPasswordMutation,
            { isLoading: false, isSuccess: true, isError: false, reset: jest.fn() },
        ]);

        const { result } = renderHook(() => useResetPassword());

        expect(result.current.isSuccess).toBe(true);
    });

    it("should return error state when mutation has error", () => {
        jest.mocked(api.useResetPasswordMutation).mockReturnValue([
            mockResetPasswordMutation,
            { isLoading: false, isSuccess: false, isError: true, reset: jest.fn() },
        ]);

        const { result } = renderHook(() => useResetPassword());

        expect(result.current.isError).toBe(true);
    });
});
