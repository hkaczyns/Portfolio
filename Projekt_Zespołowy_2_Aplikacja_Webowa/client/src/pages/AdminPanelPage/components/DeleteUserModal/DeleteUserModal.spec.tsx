import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteUserModal } from "./DeleteUserModal";

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, options?: { userName?: string }) => {
            if (key === "admin.deleteUserMessage" && options?.userName) {
                return `Czy na pewno chcesz usunąć konto dla ${options.userName}?`;
            }
            return key;
        },
    }),
}));

describe("DeleteUserModal", () => {
    const mockOnClose = jest.fn();
    const mockOnConfirm = jest.fn();

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onConfirm: mockOnConfirm,
        userName: "John Doe",
        isLoading: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnConfirm.mockResolvedValue(undefined);
    });

    it("should not render when isOpen is false", () => {
        render(<DeleteUserModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText("admin.deleteUser")).not.toBeInTheDocument();
    });

    it("should render modal content when isOpen is true", () => {
        render(<DeleteUserModal {...defaultProps} />);

        expect(screen.getByText("admin.deleteUser")).toBeInTheDocument();
        expect(screen.getByText(/Czy na pewno chcesz usunąć konto dla John Doe\?/)).toBeInTheDocument();
        expect(screen.getByText("admin.deleteUserWarning")).toBeInTheDocument();
    });

    it("should call onClose when cancel button is clicked", async () => {
        const user = userEvent.setup();
        render(<DeleteUserModal {...defaultProps} />);

        const cancelButton = screen.getByText("account.cancel");
        await user.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when X button is clicked", async () => {
        const user = userEvent.setup();
        render(<DeleteUserModal {...defaultProps} />);

        const headerCloseButton = screen.getAllByRole("button").find((btn) => {
            const svg = btn.querySelector("svg");
            return svg !== null;
        });
        if (headerCloseButton) {
            await user.click(headerCloseButton);
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        }
    });

    it("should call onConfirm when delete button is clicked", async () => {
        const user = userEvent.setup();
        render(<DeleteUserModal {...defaultProps} />);

        const deleteButton = screen.getByText("admin.delete");
        await user.click(deleteButton);

        await waitFor(() => {
            expect(mockOnConfirm).toHaveBeenCalledTimes(1);
        });
    });

    it("should disable buttons when isLoading is true", () => {
        render(<DeleteUserModal {...defaultProps} isLoading={true} />);

        const deleteButton = screen.getByText("admin.deleting");
        const cancelButton = screen.getByText("account.cancel");

        expect(deleteButton).toBeDisabled();
        expect(cancelButton).toBeDisabled();
    });

    it("should show deleting text when isLoading is true", () => {
        render(<DeleteUserModal {...defaultProps} isLoading={true} />);

        expect(screen.getByText("admin.deleting")).toBeInTheDocument();
    });
});
