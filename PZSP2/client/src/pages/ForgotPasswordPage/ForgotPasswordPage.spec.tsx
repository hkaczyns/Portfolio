import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ForgotPasswordPage } from "./ForgotPasswordPage";
import * as useForgotPasswordPage from "./hooks/useForgotPasswordPage";
import * as useForgotPasswordCooldown from "./hooks/useForgotPasswordCooldown";

jest.mock("./hooks/useForgotPasswordPage");
jest.mock("./hooks/useForgotPasswordCooldown");
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: "pl",
            changeLanguage: jest.fn(),
        },
    }),
}));

describe("ForgotPasswordPage", () => {
    const mockNavigateToLogin = jest.fn();
    const mockHandleSubmit = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useForgotPasswordPage.useForgotPasswordPage).mockReturnValue({
            isLoading: false,
            navigateToLogin: mockNavigateToLogin,
            handleSubmit: mockHandleSubmit,
        });
        jest.mocked(useForgotPasswordCooldown.useForgotPasswordCooldown).mockReturnValue({
            isCooldownActive: false,
            cooldown: "0",
        });
    });

    it("should render form", () => {
        render(<ForgotPasswordPage />);

        expect(screen.getByText("forgotPassword.title")).toBeInTheDocument();
        expect(screen.getByText("forgotPassword.description")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("email")).toBeInTheDocument();
    });

    it("should call handleSubmit when form is submitted", async () => {
        const user = userEvent.setup();
        render(<ForgotPasswordPage />);

        const emailInput = screen.getByPlaceholderText("email");
        const submitButton = screen.getByRole("button", { name: /submit/i });

        await user.type(emailInput, "test@example.com");
        await user.click(submitButton);

        await waitFor(
            () => {
                expect(mockHandleSubmit).toHaveBeenCalledWith("test@example.com");
            },
            { timeout: 10000 },
        );
    });

    it("should disable submit button when cooldown is active", () => {
        jest.mocked(useForgotPasswordCooldown.useForgotPasswordCooldown).mockReturnValue({
            isCooldownActive: true,
            cooldown: "5:00",
        });

        render(<ForgotPasswordPage />);

        const submitButton = screen.getByRole("button", { name: /forgotPassword\.submit|submit/i });
        expect(submitButton).toBeDisabled();
    });

    it("should display cooldown when active", () => {
        jest.mocked(useForgotPasswordCooldown.useForgotPasswordCooldown).mockReturnValue({
            isCooldownActive: true,
            cooldown: "5:00",
        });

        render(<ForgotPasswordPage />);

        expect(screen.getByText(/forgotPassword\.cooldownLabel.*5:00/)).toBeInTheDocument();
    });

    it("should call navigateToLogin when back to login is clicked", async () => {
        const user = userEvent.setup();
        render(<ForgotPasswordPage />);

        const backToLogin = screen.getByText("forgotPassword.backToLogin");
        await user.click(backToLogin);

        expect(mockNavigateToLogin).toHaveBeenCalled();
    });

    it("should disable submit button when email is invalid", async () => {
        render(<ForgotPasswordPage />);

        const emailInput = screen.getByPlaceholderText("email");
        const submitButton = screen.getByRole("button", { name: /submit/i });

        const user = userEvent.setup();
        await user.type(emailInput, "invalid-email");

        expect(submitButton).toBeDisabled();
    });
});
