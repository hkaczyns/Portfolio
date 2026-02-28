import { renderHook, waitFor } from "@testing-library/react";
import { useVerifyUser } from "./useVerifyUser";
import * as api from "../api";
import * as alertContext from "../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";
import * as helpers from "../../helpers";

jest.mock("../api");
jest.mock("../../../components/Alert/AlertContext");
jest.mock("react-i18next");
jest.mock("../../helpers");

describe("useVerifyUser", () => {
    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockHandleError = jest.fn();
    const mockVerifyUserMutation = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(alertContext.useAlert).mockReturnValue({ publish: mockPublish, message: "", alertType: undefined });
        jest.mocked(reactI18next.useTranslation).mockReturnValue({ t: mockT } as unknown as ReturnType<
            typeof reactI18next.useTranslation
        >);
        jest.mocked(helpers.handleError).mockImplementation(mockHandleError);
        jest.mocked(api.useVerifyUserMutation).mockReturnValue([
            mockVerifyUserMutation,
            { isLoading: false, isSuccess: false, isError: false, reset: jest.fn() },
        ]);
    });

    it("should call verifyUserMutation with token when verificationToken is provided", async () => {
        mockVerifyUserMutation.mockResolvedValue({ data: undefined, error: undefined });

        const { result } = renderHook(() => useVerifyUser());

        result.current.verifyUser("test-token-123");

        await waitFor(() => {
            expect(mockVerifyUserMutation).toHaveBeenCalledWith({ token: "test-token-123" });
        });
    });

    it("should publish error when verificationToken is not provided", () => {
        const { result } = renderHook(() => useVerifyUser());

        result.current.verifyUser();

        expect(mockPublish).toHaveBeenCalledWith("translated.VERIFICATION_TOKEN_NOT_PROVIDED", "error");
        expect(mockVerifyUserMutation).not.toHaveBeenCalled();
    });

    it("should publish error when verificationToken is empty string", () => {
        const { result } = renderHook(() => useVerifyUser());

        result.current.verifyUser("");

        expect(mockPublish).toHaveBeenCalledWith("translated.VERIFICATION_TOKEN_NOT_PROVIDED", "error");
        expect(mockVerifyUserMutation).not.toHaveBeenCalled();
    });

    it("should handle error and call handleError with fallback when mutation fails", async () => {
        const mockError = { status: 400, data: { detail: "INVALID_TOKEN" } };
        mockVerifyUserMutation.mockResolvedValue({ data: undefined, error: mockError });

        const { result } = renderHook(() => useVerifyUser());

        result.current.verifyUser("invalid-token");

        await waitFor(() => {
            expect(mockHandleError).toHaveBeenCalledWith(mockError, mockPublish, mockT, "VERIFICATION_TOKEN_INVALID");
        });
    });

    it("should return loading state when mutation is loading", () => {
        jest.mocked(api.useVerifyUserMutation).mockReturnValue([
            mockVerifyUserMutation,
            { isLoading: true, isSuccess: false, isError: false, reset: jest.fn() },
        ]);

        const { result } = renderHook(() => useVerifyUser());

        expect(result.current.isLoading).toBe(true);
    });

    it("should return success state when mutation succeeds", () => {
        jest.mocked(api.useVerifyUserMutation).mockReturnValue([
            mockVerifyUserMutation,
            { isLoading: false, isSuccess: true, isError: false, reset: jest.fn() },
        ]);

        const { result } = renderHook(() => useVerifyUser());

        expect(result.current.isSuccess).toBe(true);
    });

    it("should return error state when mutation has error", () => {
        jest.mocked(api.useVerifyUserMutation).mockReturnValue([
            mockVerifyUserMutation,
            { isLoading: false, isSuccess: false, isError: true, reset: jest.fn() },
        ]);

        const { result } = renderHook(() => useVerifyUser());

        expect(result.current.isError).toBe(true);
    });
});
