import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChangePasswordSection } from "./ChangePasswordSection";

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("ChangePasswordSection", () => {
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render all form fields", () => {
        render(<ChangePasswordSection onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

        expect(screen.getByPlaceholderText("account.currentPassword")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("account.newPassword")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("confirmPassword")).toBeInTheDocument();
    });

    it("should render title", () => {
        render(<ChangePasswordSection onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

        expect(screen.getByText("account.changePassword")).toBeInTheDocument();
    });

    it("should call onCancel when cancel button is clicked", async () => {
        render(<ChangePasswordSection onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

        const cancelButton = screen.getByText("account.cancel");
        await userEvent.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalled();
    });

    it("should disable submit button when form is empty", () => {
        render(<ChangePasswordSection onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

        const submitButton = screen.getByText("account.save");
        expect(submitButton).toBeDisabled();
    });

    it("should enable submit button when form is valid", async () => {
        render(<ChangePasswordSection onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

        const currentPasswordInput = screen.getByPlaceholderText("account.currentPassword");
        const passwordInput = screen.getByPlaceholderText("account.newPassword");
        const confirmPasswordInput = screen.getByPlaceholderText("confirmPassword");

        await userEvent.type(currentPasswordInput, "CurrentPass123");
        await userEvent.type(passwordInput, "NewPassword123");
        await userEvent.type(confirmPasswordInput, "NewPassword123");

        await waitFor(() => {
            const submitButton = screen.getByText("account.save");
            expect(submitButton).not.toBeDisabled();
        });
    });

    it("should call onSubmit with form values when form is submitted", async () => {
        mockOnSubmit.mockResolvedValue(undefined);

        render(<ChangePasswordSection onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

        const currentPasswordInput = screen.getByPlaceholderText("account.currentPassword");
        const passwordInput = screen.getByPlaceholderText("account.newPassword");
        const confirmPasswordInput = screen.getByPlaceholderText("confirmPassword");

        await userEvent.type(currentPasswordInput, "CurrentPass123");
        await userEvent.type(passwordInput, "NewPassword123");
        await userEvent.type(confirmPasswordInput, "NewPassword123");

        const submitButton = screen.getByText("account.save");
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(
                {
                    currentPassword: "CurrentPass123",
                    password: "NewPassword123",
                    confirmPassword: "NewPassword123",
                },
                expect.any(Object),
            );
        });
    });

    it("should disable buttons when isLoading is true", () => {
        render(<ChangePasswordSection onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />);

        const cancelButton = screen.getByText("account.cancel");
        const submitButton = cancelButton.parentElement?.querySelector("button[type='submit']");

        expect(cancelButton).toBeDisabled();
        expect(submitButton).toBeDisabled();
    });

    it("should show spinner when isLoading is true", () => {
        render(<ChangePasswordSection onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />);

        const submitButton = screen.getByRole("button", { name: "" });
        expect(submitButton).toBeInTheDocument();
        expect(submitButton.querySelector(".spinner")).toBeInTheDocument();
    });
});
