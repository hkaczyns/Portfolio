import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetPasswordPage } from "./ResetPasswordPage";
import * as useResetPasswordPage from "./hooks/useResetPasswordPage";

jest.mock("./hooks/useResetPasswordPage");
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: "pl",
            changeLanguage: jest.fn(),
        },
    }),
}));

describe("ResetPasswordPage", () => {
    const mockNavigateToLogin = jest.fn();
    const mockHandleSubmit = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useResetPasswordPage.useResetPasswordPage).mockReturnValue({
            resetToken: "test-token-123",
            isLoading: false,
            navigateToLogin: mockNavigateToLogin,
            handleSubmit: mockHandleSubmit,
        });
    });

    it("should render form when resetToken is present", () => {
        render(<ResetPasswordPage />);

        expect(screen.getByText("resetPassword.title")).toBeInTheDocument();
        expect(screen.getByText("resetPassword.description")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("password")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("confirmPassword")).toBeInTheDocument();
    });

    it("should not render when resetToken is missing", () => {
        jest.mocked(useResetPasswordPage.useResetPasswordPage).mockReturnValue({
            resetToken: null,
            isLoading: false,
            navigateToLogin: mockNavigateToLogin,
            handleSubmit: mockHandleSubmit,
        });

        const { container } = render(<ResetPasswordPage />);

        expect(container.firstChild).toBeNull();
    });

    it("should call handleSubmit when form is submitted", async () => {
        const user = userEvent.setup();
        render(<ResetPasswordPage />);

        const passwordInput = screen.getByPlaceholderText("password");
        const confirmPasswordInput = screen.getByPlaceholderText("confirmPassword");
        const submitButton = screen.getByRole("button", { name: /submit/i });

        await user.type(passwordInput, "NewPassword123");
        await user.type(confirmPasswordInput, "NewPassword123");
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockHandleSubmit).toHaveBeenCalledWith("NewPassword123");
        });
    });

    it("should call navigateToLogin when back to login is clicked", async () => {
        const user = userEvent.setup();
        render(<ResetPasswordPage />);

        const backToLogin = screen.getByText("resetPassword.backToLogin");
        await user.click(backToLogin);

        expect(mockNavigateToLogin).toHaveBeenCalled();
    });

    it("should disable submit button when password is invalid", () => {
        render(<ResetPasswordPage />);

        const passwordInput = screen.getByPlaceholderText("password");
        const submitButton = screen.getByRole("button", { name: /resetPassword\.submit|submit/i });

        userEvent.type(passwordInput, "short");

        expect(submitButton).toBeDisabled();
    });
});
