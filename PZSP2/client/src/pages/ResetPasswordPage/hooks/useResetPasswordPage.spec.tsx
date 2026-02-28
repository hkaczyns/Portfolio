import { renderHook } from "@testing-library/react";
import { useResetPasswordPage } from "./useResetPasswordPage";
import * as reactRouterDom from "react-router-dom";
import * as reactI18next from "react-i18next";
import * as alertContext from "../../../components/Alert/AlertContext";
import * as useResetPasswordHook from "../../../store/auth/api/useResetPassword";

jest.mock("react-router-dom");
jest.mock("react-i18next");
jest.mock("../../../components/Alert/AlertContext");
jest.mock("../../../store/auth/api/useResetPassword");

describe("useResetPasswordPage", () => {
    const mockNavigate = jest.fn();
    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockResetPassword = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(reactRouterDom.useNavigate).mockReturnValue(mockNavigate);
        jest.mocked(reactRouterDom.useParams).mockReturnValue({ resetToken: "test-token-123" });
        jest.mocked(reactI18next.useTranslation).mockReturnValue({ t: mockT } as unknown as ReturnType<
            typeof reactI18next.useTranslation
        >);
        jest.mocked(alertContext.useAlert).mockReturnValue({ publish: mockPublish, message: "", alertType: undefined });
        jest.mocked(useResetPasswordHook.useResetPassword).mockReturnValue({
            resetPassword: mockResetPassword,
            isLoading: false,
            isSuccess: false,
            isError: false,
        });
    });

    it("should return resetToken, isLoading, navigateToLogin and handleSubmit", () => {
        const { result } = renderHook(() => useResetPasswordPage());

        expect(result.current.resetToken).toBe("test-token-123");
        expect(result.current.isLoading).toBe(false);
        expect(typeof result.current.navigateToLogin).toBe("function");
        expect(typeof result.current.handleSubmit).toBe("function");
    });

    it("should call publish and navigate when resetToken is missing", () => {
        jest.mocked(reactRouterDom.useParams).mockReturnValue({ resetToken: undefined });

        renderHook(() => useResetPasswordPage());

        expect(mockPublish).toHaveBeenCalledWith("translated.resetPassword.invalidToken", "error");
        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    it("should call publish and navigate when reset is successful", () => {
        jest.mocked(useResetPasswordHook.useResetPassword).mockReturnValue({
            resetPassword: mockResetPassword,
            isLoading: false,
            isSuccess: true,
            isError: false,
        });

        renderHook(() => useResetPasswordPage());

        expect(mockPublish).toHaveBeenCalledWith("translated.resetPassword.successMessage", "success");
        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    it("should call resetPassword with token and password when handleSubmit is called", () => {
        mockResetPassword.mockResolvedValue({ data: undefined, error: undefined });

        const { result } = renderHook(() => useResetPasswordPage());

        result.current.handleSubmit("newPassword123");

        expect(mockResetPassword).toHaveBeenCalledWith({ token: "test-token-123", password: "newPassword123" });
    });

    it("should not call resetPassword when resetToken is missing in handleSubmit", () => {
        jest.mocked(reactRouterDom.useParams).mockReturnValue({ resetToken: undefined });

        const { result } = renderHook(() => useResetPasswordPage());

        result.current.handleSubmit("newPassword123");

        expect(mockResetPassword).not.toHaveBeenCalled();
    });

    it("should return loading state when resetPassword is loading", () => {
        jest.mocked(useResetPasswordHook.useResetPassword).mockReturnValue({
            resetPassword: mockResetPassword,
            isLoading: true,
            isSuccess: false,
            isError: false,
        });

        const { result } = renderHook(() => useResetPasswordPage());

        expect(result.current.isLoading).toBe(true);
    });

    it("should call navigateToLogin when called", () => {
        const { result } = renderHook(() => useResetPasswordPage());

        result.current.navigateToLogin();

        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
});
