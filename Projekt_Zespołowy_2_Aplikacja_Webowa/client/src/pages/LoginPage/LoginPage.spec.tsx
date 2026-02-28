import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "./LoginPage";
import * as reactRouterDom from "react-router-dom";
import * as reactI18next from "react-i18next";
import * as useLoginHook from "../../store/auth/api/useLogin";

jest.mock("react-router-dom");
jest.mock("react-i18next");
jest.mock("../../store/auth/api/useLogin");

describe("LoginPage", () => {
    const mockNavigate = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockLogin = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(reactRouterDom.useNavigate).mockReturnValue(mockNavigate);
        jest.mocked(reactI18next.useTranslation).mockReturnValue({
            t: mockT,
            i18n: {
                language: "en",
                changeLanguage: jest.fn(),
            },
            ready: true,
        } as unknown as ReturnType<typeof reactI18next.useTranslation>);
        jest.mocked(useLoginHook.useLogin).mockReturnValue({
            login: mockLogin,
            isLoading: false,
            isSuccess: false,
            isError: false,
        });
    });

    it("should render login form", () => {
        render(<LoginPage />);

        const loginTexts = screen.getAllByText("translated.login.login");
        expect(loginTexts.length).toBeGreaterThan(0);
        expect(screen.getByPlaceholderText("translated.email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("translated.password")).toBeInTheDocument();
    });

    it("should render forgot password link", () => {
        render(<LoginPage />);

        expect(screen.getByText("translated.login.forgotPassword")).toBeInTheDocument();
    });

    it("should render register link", () => {
        render(<LoginPage />);

        expect(screen.getByText("translated.register.register")).toBeInTheDocument();
    });

    it("should disable submit button when form is empty", () => {
        render(<LoginPage />);

        const submitButton = screen.getByRole("button", { name: "translated.login.login" });
        expect(submitButton).toBeDisabled();
    });

    it("should enable submit button when form is valid", async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        const emailInput = screen.getByPlaceholderText("translated.email");
        const passwordInput = screen.getByPlaceholderText("translated.password");

        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");

        const submitButton = screen.getByRole("button", { name: "translated.login.login" });
        await waitFor(() => {
            expect(submitButton).not.toBeDisabled();
        });
    });

    it("should call login when form is submitted", async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        const emailInput = screen.getByPlaceholderText("translated.email");
        const passwordInput = screen.getByPlaceholderText("translated.password");
        const submitButton = screen.getByRole("button", { name: "translated.login.login" });

        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");
        await waitFor(() => {
            expect(submitButton).not.toBeDisabled();
        });

        await user.click(submitButton);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                username: "test@example.com",
                password: "password123",
            });
        });
    });

    it("should navigate to register when register link is clicked", async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        const registerLink = screen.getByText("translated.register.register");
        await user.click(registerLink);

        expect(mockNavigate).toHaveBeenCalledWith("/register");
    });

    it("should navigate to forgot password when forgot password link is clicked", async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        const forgotPasswordLink = screen.getByText("translated.login.forgotPassword");
        await user.click(forgotPasswordLink);

        expect(mockNavigate).toHaveBeenCalledWith("/forgot-password");
    });

    it("should show validation error for invalid email", async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        const emailInput = screen.getByPlaceholderText("translated.email");
        await user.type(emailInput, "invalid-email");
        await user.tab();

        await waitFor(() => {
            expect(screen.getByText("translated.email.invalid")).toBeInTheDocument();
        });
    });

    it("should show validation error for empty password", async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        const passwordInput = screen.getByPlaceholderText("translated.password");
        await user.click(passwordInput);
        await user.tab();

        await waitFor(() => {
            expect(screen.getByText("translated.password.required")).toBeInTheDocument();
        });
    });
});
