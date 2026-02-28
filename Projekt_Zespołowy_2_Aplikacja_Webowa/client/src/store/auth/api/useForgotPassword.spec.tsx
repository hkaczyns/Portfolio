import { renderHook, waitFor } from "@testing-library/react";
import { useForgotPassword } from "./useForgotPassword";
import * as api from "../api";
import * as alertContext from "../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";
import * as helpers from "../../helpers";

jest.mock("../api");
jest.mock("../../../components/Alert/AlertContext");
jest.mock("react-i18next");
jest.mock("../../helpers");

describe("useForgotPassword", () => {
    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockTCommon = jest.fn((key: string) => `translated.common.${key}`);
    const mockHandleError = jest.fn();
    const mockForgotPasswordMutation = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(alertContext.useAlert).mockReturnValue({ publish: mockPublish, message: "", alertType: undefined });
        jest.mocked(reactI18next.useTranslation)
            .mockReturnValueOnce({ t: mockT } as unknown as ReturnType<typeof reactI18next.useTranslation>)
            .mockReturnValueOnce({ t: mockTCommon } as unknown as ReturnType<typeof reactI18next.useTranslation>);
        jest.mocked(helpers.handleError).mockImplementation(mockHandleError);
        jest.mocked(api.useForgotPasswordMutation).mockReturnValue([
            mockForgotPasswordMutation,
            { isLoading: false, isSuccess: false, isError: false, reset: jest.fn() },
        ]);
    });

    it("should call forgotPasswordMutation with email", async () => {
        mockForgotPasswordMutation.mockResolvedValue({ data: undefined, error: undefined });

        const { result } = renderHook(() => useForgotPassword());

        result.current.forgotPassword({ email: "test@example.com" });

        await waitFor(() => {
            expect(mockForgotPasswordMutation).toHaveBeenCalledWith({ email: "test@example.com" });
        });
    });

    it("should handle error and call handleError when mutation fails", async () => {
        const mockError = { status: 404, data: { detail: "USER_NOT_FOUND" } };
        mockForgotPasswordMutation.mockResolvedValue({ data: undefined, error: mockError });

        const { result } = renderHook(() => useForgotPassword());

        result.current.forgotPassword({ email: "nonexistent@example.com" });

        await waitFor(() => {
            expect(mockHandleError).toHaveBeenCalledWith(mockError, mockPublish, mockT, "UNKNOWN_ERROR", mockTCommon);
        });
    });

    it("should return loading state when mutation is loading", () => {
        jest.mocked(api.useForgotPasswordMutation).mockReturnValue([
            mockForgotPasswordMutation,
            { isLoading: true, isSuccess: false, isError: false, reset: jest.fn() },
        ]);

        const { result } = renderHook(() => useForgotPassword());

        expect(result.current.isLoading).toBe(true);
    });

    it("should return success state when mutation succeeds", () => {
        jest.mocked(api.useForgotPasswordMutation).mockReturnValue([
            mockForgotPasswordMutation,
            { isLoading: false, isSuccess: true, isError: false, reset: jest.fn() },
        ]);

        const { result } = renderHook(() => useForgotPassword());

        expect(result.current.isSuccess).toBe(true);
    });

    it("should return error state when mutation has error", () => {
        jest.mocked(api.useForgotPasswordMutation).mockReturnValue([
            mockForgotPasswordMutation,
            { isLoading: false, isSuccess: false, isError: true, reset: jest.fn() },
        ]);

        const { result } = renderHook(() => useForgotPassword());

        expect(result.current.isError).toBe(true);
    });
});
