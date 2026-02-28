import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChangeEmailSection } from "./ChangeEmailSection";

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("ChangeEmailSection", () => {
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();
    const currentEmail = "old@example.com";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render all form fields", () => {
        render(
            <ChangeEmailSection
                currentEmail={currentEmail}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
                isLoading={false}
            />,
        );

        expect(screen.getByPlaceholderText("email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("account.currentPassword")).toBeInTheDocument();
    });

    it("should render title", () => {
        render(
            <ChangeEmailSection
                currentEmail={currentEmail}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
                isLoading={false}
            />,
        );

        expect(screen.getByText("account.changeEmail")).toBeInTheDocument();
    });

    it("should initialize email field with empty string", () => {
        render(
            <ChangeEmailSection
                currentEmail={currentEmail}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
                isLoading={false}
            />,
        );

        const emailInput = screen.getByPlaceholderText("email") as HTMLInputElement;
        expect(emailInput.value).toBe("");
    });

    it("should call onCancel when cancel button is clicked", async () => {
        render(
            <ChangeEmailSection
                currentEmail={currentEmail}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
                isLoading={false}
            />,
        );

        const cancelButton = screen.getByText("account.cancel");
        await userEvent.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalled();
    });

    it("should disable submit button when form is empty", () => {
        render(
            <ChangeEmailSection
                currentEmail={currentEmail}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
                isLoading={false}
            />,
        );

        const submitButton = screen.getByText("account.save");
        expect(submitButton).toBeDisabled();
    });

    it("should disable submit button when email is same as current", async () => {
        render(
            <ChangeEmailSection
                currentEmail={currentEmail}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
                isLoading={false}
            />,
        );

        const emailInput = screen.getByPlaceholderText("email");
        const passwordInput = screen.getByPlaceholderText("account.currentPassword");

        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, currentEmail);
        await userEvent.type(passwordInput, "Password123");

        await waitFor(() => {
            const submitButton = screen.getByText("account.save");
            expect(submitButton).toBeDisabled();
        });
    });

    it("should enable submit button when form is valid with different email", async () => {
        render(
            <ChangeEmailSection
                currentEmail={currentEmail}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
                isLoading={false}
            />,
        );

        const emailInput = screen.getByPlaceholderText("email");
        const passwordInput = screen.getByPlaceholderText("account.currentPassword");

        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, "new@example.com");
        await userEvent.type(passwordInput, "Password123");

        await waitFor(() => {
            const submitButton = screen.getByText("account.save");
            expect(submitButton).not.toBeDisabled();
        });
    });

    it("should call onSubmit with form values when form is submitted", async () => {
        mockOnSubmit.mockResolvedValue(undefined);

        render(
            <ChangeEmailSection
                currentEmail={currentEmail}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
                isLoading={false}
            />,
        );

        const emailInput = screen.getByPlaceholderText("email");
        const passwordInput = screen.getByPlaceholderText("account.currentPassword");

        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, "new@example.com");
        await userEvent.type(passwordInput, "Password123");

        const submitButton = screen.getByText("account.save");
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(
                {
                    email: "new@example.com",
                    currentPassword: "Password123",
                },
                expect.any(Object),
            );
        });
    });

    it("should disable buttons when isLoading is true", () => {
        render(
            <ChangeEmailSection
                currentEmail={currentEmail}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
                isLoading={true}
            />,
        );

        const cancelButton = screen.getByText("account.cancel");
        const submitButton = cancelButton.parentElement?.querySelector("button[type='submit']");

        expect(cancelButton).toBeDisabled();
        expect(submitButton).toBeDisabled();
    });
});
