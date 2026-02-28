import { renderHook, waitFor } from "@testing-library/react";
import { useResendVerificationEmail } from "./useResendVerificationEmail";
import * as api from "../api";
import * as alertContext from "../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";
import * as helpers from "../../helpers";

jest.mock("../api");
jest.mock("../../../components/Alert/AlertContext");
jest.mock("react-i18next");
jest.mock("../../helpers");

describe("useResendVerificationEmail", () => {
    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockTCommon = jest.fn((key: string) => `translated.common.${key}`);
    const mockHandleError = jest.fn();
    const mockResendVerificationEmailMutation = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(alertContext.useAlert).mockReturnValue({ publish: mockPublish, message: "", alertType: undefined });
        jest.mocked(reactI18next.useTranslation)
            .mockReturnValueOnce({ t: mockT } as unknown as ReturnType<typeof reactI18next.useTranslation>)
            .mockReturnValueOnce({ t: mockTCommon } as unknown as ReturnType<typeof reactI18next.useTranslation>);
        jest.mocked(helpers.handleError).mockImplementation(mockHandleError);
        jest.mocked(api.useResendVerificationEmailMutation).mockReturnValue([
            mockResendVerificationEmailMutation,
            { isLoading: false, isSuccess: false, isError: false, reset: jest.fn() },
        ]);
    });

    it("should call resendVerificationEmailMutation with email", async () => {
        mockResendVerificationEmailMutation.mockResolvedValue({ data: undefined, error: undefined });

        const { result } = renderHook(() => useResendVerificationEmail());

        result.current.resendVerificationEmail("test@example.com");

        await waitFor(() => {
            expect(mockResendVerificationEmailMutation).toHaveBeenCalledWith({ email: "test@example.com" });
        });
    });

    it("should handle error and call handleError when mutation fails", async () => {
        const mockError = { status: 429, data: { detail: "TOO_MANY_REQUESTS" } };
        mockResendVerificationEmailMutation.mockResolvedValue({ data: undefined, error: mockError });

        const { result } = renderHook(() => useResendVerificationEmail());

        result.current.resendVerificationEmail("test@example.com");

        await waitFor(() => {
            expect(mockHandleError).toHaveBeenCalledWith(mockError, mockPublish, mockT, "UNKNOWN_ERROR", mockTCommon);
        });
    });

    it("should return loading state when mutation is loading", () => {
        jest.mocked(api.useResendVerificationEmailMutation).mockReturnValue([
            mockResendVerificationEmailMutation,
            { isLoading: true, isSuccess: false, isError: false, reset: jest.fn() },
        ]);

        const { result } = renderHook(() => useResendVerificationEmail());

        expect(result.current.isLoading).toBe(true);
    });

    it("should return success state when mutation succeeds", () => {
        jest.mocked(api.useResendVerificationEmailMutation).mockReturnValue([
            mockResendVerificationEmailMutation,
            { isLoading: false, isSuccess: true, isError: false, reset: jest.fn() },
        ]);

        const { result } = renderHook(() => useResendVerificationEmail());

        expect(result.current.isSuccess).toBe(true);
    });

    it("should return error state when mutation has error", () => {
        jest.mocked(api.useResendVerificationEmailMutation).mockReturnValue([
            mockResendVerificationEmailMutation,
            { isLoading: false, isSuccess: false, isError: true, reset: jest.fn() },
        ]);

        const { result } = renderHook(() => useResendVerificationEmail());

        expect(result.current.isError).toBe(true);
    });
});
