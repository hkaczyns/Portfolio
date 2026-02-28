import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChangeUserPasswordModal } from "./ChangeUserPasswordModal";

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("ChangeUserPasswordModal", () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onSubmit: mockOnSubmit,
        isLoading: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnSubmit.mockResolvedValue(undefined);
    });

    it("should not render when isOpen is false", () => {
        render(<ChangeUserPasswordModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText("admin.changeUserPassword")).not.toBeInTheDocument();
    });

    it("should render modal content when isOpen is true", () => {
        render(<ChangeUserPasswordModal {...defaultProps} />);

        expect(screen.getByText("admin.changeUserPassword")).toBeInTheDocument();
        expect(screen.getByText("admin.changeUserPasswordDescription")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("account.newPassword")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("confirmPassword")).toBeInTheDocument();
    });

    it("should call onClose when cancel button is clicked", async () => {
        const user = userEvent.setup();
        render(<ChangeUserPasswordModal {...defaultProps} />);

        const cancelButton = screen.getByText("account.cancel");
        await user.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when X button is clicked", async () => {
        const user = userEvent.setup();
        render(<ChangeUserPasswordModal {...defaultProps} />);

        const headerCloseButton = screen.getAllByRole("button").find((btn) => {
            const svg = btn.querySelector("svg");
            return svg !== null;
        });
        if (headerCloseButton) {
            await user.click(headerCloseButton);
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        }
    });

    it("should disable submit button when form is invalid", async () => {
        render(<ChangeUserPasswordModal {...defaultProps} />);

        await waitFor(() => {
            const submitButton = screen.getByRole("button", { name: /account\.save/i });
            expect(submitButton).toBeDisabled();
        });
    });

    it("should enable submit button when form is valid", async () => {
        const user = userEvent.setup();
        render(<ChangeUserPasswordModal {...defaultProps} />);

        const passwordInput = screen.getByPlaceholderText("account.newPassword");
        const confirmPasswordInput = screen.getByPlaceholderText("confirmPassword");

        await user.type(passwordInput, "NewPassword123");
        await user.type(confirmPasswordInput, "NewPassword123");

        await waitFor(() => {
            const submitButton = screen.getByRole("button", { name: /account\.save/i });
            expect(submitButton).not.toBeDisabled();
        });
    });

    it("should call onSubmit with password when form is submitted", async () => {
        const user = userEvent.setup();
        render(<ChangeUserPasswordModal {...defaultProps} />);

        const passwordInput = screen.getByPlaceholderText("account.newPassword");
        const confirmPasswordInput = screen.getByPlaceholderText("confirmPassword");

        await user.type(passwordInput, "NewPassword123");
        await user.type(confirmPasswordInput, "NewPassword123");

        const submitButton = screen.getByRole("button", { name: /account\.save/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith("NewPassword123");
        });
    });

    it("should disable submit button when isLoading is true", () => {
        render(<ChangeUserPasswordModal {...defaultProps} isLoading={true} />);

        const buttons = screen.getAllByRole("button");
        const submitButton = buttons.find((btn) => (btn as HTMLButtonElement).type === "submit");
        expect(submitButton).toBeDefined();
        if (submitButton) {
            expect(submitButton).toBeDisabled();
        }
    });
});
