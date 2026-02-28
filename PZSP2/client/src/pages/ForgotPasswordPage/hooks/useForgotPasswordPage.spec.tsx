import { renderHook } from "@testing-library/react";
import { useForgotPasswordPage } from "./useForgotPasswordPage";
import * as reactRouterDom from "react-router-dom";
import * as reactI18next from "react-i18next";
import * as alertContext from "../../../components/Alert/AlertContext";
import * as useForgotPasswordHook from "../../../store/auth/api/useForgotPassword";

jest.mock("react-router-dom");
jest.mock("react-i18next");
jest.mock("../../../components/Alert/AlertContext");
jest.mock("../../../store/auth/api/useForgotPassword");

describe("useForgotPasswordPage", () => {
    const mockNavigate = jest.fn();
    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockForgotPassword = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(reactRouterDom.useNavigate).mockReturnValue(mockNavigate);
        jest.mocked(reactI18next.useTranslation).mockReturnValue({ t: mockT } as unknown as ReturnType<
            typeof reactI18next.useTranslation
        >);
        jest.mocked(alertContext.useAlert).mockReturnValue({ publish: mockPublish, message: "", alertType: undefined });
        jest.mocked(useForgotPasswordHook.useForgotPassword).mockReturnValue({
            forgotPassword: mockForgotPassword,
            isLoading: false,
            isSuccess: false,
            isError: false,
        });
    });

    it("should return isLoading, navigateToLogin and handleSubmit", () => {
        const { result } = renderHook(() => useForgotPasswordPage());

        expect(result.current.isLoading).toBe(false);
        expect(typeof result.current.navigateToLogin).toBe("function");
        expect(typeof result.current.handleSubmit).toBe("function");
    });

    it("should call publish and navigate when forgot password is successful", () => {
        jest.mocked(useForgotPasswordHook.useForgotPassword).mockReturnValue({
            forgotPassword: mockForgotPassword,
            isLoading: false,
            isSuccess: true,
            isError: false,
        });

        renderHook(() => useForgotPasswordPage());

        expect(mockPublish).toHaveBeenCalledWith("translated.forgotPassword.successMessage", "success");
        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    it("should call forgotPassword with email when handleSubmit is called", () => {
        mockForgotPassword.mockResolvedValue({ data: undefined, error: undefined });

        const { result } = renderHook(() => useForgotPasswordPage());

        result.current.handleSubmit("test@example.com");

        expect(mockForgotPassword).toHaveBeenCalledWith({ email: "test@example.com" });
    });

    it("should return loading state when forgotPassword is loading", () => {
        jest.mocked(useForgotPasswordHook.useForgotPassword).mockReturnValue({
            forgotPassword: mockForgotPassword,
            isLoading: true,
            isSuccess: false,
            isError: false,
        });

        const { result } = renderHook(() => useForgotPasswordPage());

        expect(result.current.isLoading).toBe(true);
    });

    it("should call navigateToLogin when called", () => {
        const { result } = renderHook(() => useForgotPasswordPage());

        result.current.navigateToLogin();

        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
});
