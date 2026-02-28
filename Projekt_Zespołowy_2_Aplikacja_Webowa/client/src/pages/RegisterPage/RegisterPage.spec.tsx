import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterPage } from "./RegisterPage";
import * as reactRouterDom from "react-router-dom";
import * as reactI18next from "react-i18next";
import * as useRegisterHook from "../../store/auth/api/useRegister";

jest.mock("react-router-dom");
jest.mock("react-i18next");
jest.mock("../../store/auth/api/useRegister");

describe("RegisterPage", () => {
    const mockNavigate = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockRegister = jest.fn();

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
        jest.mocked(useRegisterHook.useRegister).mockReturnValue({
            register: mockRegister,
            isLoading: false,
            isSuccess: false,
            isError: false,
            user: null,
        });
    });

    it("should render register form", () => {
        render(<RegisterPage />);

        const registerTexts = screen.getAllByText("translated.register.register");
        expect(registerTexts.length).toBeGreaterThan(0);
        expect(screen.getByPlaceholderText("translated.firstName")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("translated.lastName")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("translated.email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("translated.password")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("translated.confirmPassword")).toBeInTheDocument();
    });

    it("should render login link", () => {
        render(<RegisterPage />);

        expect(screen.getByText("translated.login.login")).toBeInTheDocument();
    });

    it("should disable submit button when form is empty", () => {
        render(<RegisterPage />);

        const submitButton = screen.getByRole("button", { name: "translated.register.register" });
        expect(submitButton).toBeDisabled();
    });

    it("should enable submit button when form is valid", async () => {
        const user = userEvent.setup();
        render(<RegisterPage />);

        await user.type(screen.getByPlaceholderText("translated.firstName"), "John");
        await user.type(screen.getByPlaceholderText("translated.lastName"), "Doe");
        await user.type(screen.getByPlaceholderText("translated.email"), "test@example.com");
        await user.type(screen.getByPlaceholderText("translated.password"), "Password123");
        await user.type(screen.getByPlaceholderText("translated.confirmPassword"), "Password123");

        const submitButton = screen.getByRole("button", { name: "translated.register.register" });
        await waitFor(() => {
            expect(submitButton).not.toBeDisabled();
        });
    });

    it("should navigate to verification when registration is successful", () => {
        jest.mocked(useRegisterHook.useRegister).mockReturnValue({
            register: mockRegister,
            isLoading: false,
            isSuccess: true,
            isError: false,
            user: null,
        });

        render(<RegisterPage />);

        expect(mockNavigate).toHaveBeenCalledWith("/verification");
    });

    it("should navigate to login when login link is clicked", async () => {
        const user = userEvent.setup();
        render(<RegisterPage />);

        const loginLink = screen.getByText("translated.login.login");
        await user.click(loginLink);

        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    it("should show validation error for invalid email", async () => {
        const user = userEvent.setup();
        render(<RegisterPage />);

        const emailInput = screen.getByPlaceholderText("translated.email");
        await user.type(emailInput, "invalid-email");
        await user.tab();

        await waitFor(() => {
            expect(screen.getByText("translated.email.invalid")).toBeInTheDocument();
        });
    });

    it("should show validation error for password mismatch", async () => {
        const user = userEvent.setup();
        render(<RegisterPage />);

        await user.type(screen.getByPlaceholderText("translated.password"), "Password123");
        await user.type(screen.getByPlaceholderText("translated.confirmPassword"), "Password456");
        await user.tab();

        await waitFor(
            () => {
                expect(screen.getByText("translated.confirmPassword.mismatch")).toBeInTheDocument();
            },
            { timeout: 10000 },
        );
    });

    it("should show validation error for weak password", async () => {
        const user = userEvent.setup();
        render(<RegisterPage />);

        const passwordInput = screen.getByPlaceholderText("translated.password");
        await user.clear(passwordInput);
        await user.type(passwordInput, "weak");
        await user.tab();

        await waitFor(
            () => {
                // Password "weak" should fail minLength (8 chars) first, but Yup may show other errors
                // Check for any password validation error
                const minLengthError = screen.queryByText("translated.password.minLength");
                const lowercaseError = screen.queryByText("translated.password.lowercase");
                const uppercaseError = screen.queryByText("translated.password.uppercase");
                const numberError = screen.queryByText("translated.password.number");

                expect(minLengthError || lowercaseError || uppercaseError || numberError).toBeInTheDocument();
            },
            { timeout: 10000 },
        );
    });

    it("should show validation error for password without uppercase", async () => {
        const user = userEvent.setup();
        render(<RegisterPage />);

        const passwordInput = screen.getByPlaceholderText("translated.password");
        await user.type(passwordInput, "password123");
        await user.tab();

        await waitFor(() => {
            expect(screen.getByText("translated.password.uppercase")).toBeInTheDocument();
        });
    });

    it("should show validation error for password without number", async () => {
        const user = userEvent.setup();
        render(<RegisterPage />);

        const passwordInput = screen.getByPlaceholderText("translated.password");
        await user.type(passwordInput, "Password");
        await user.tab();

        await waitFor(() => {
            expect(screen.getByText("translated.password.number")).toBeInTheDocument();
        });
    });
});
