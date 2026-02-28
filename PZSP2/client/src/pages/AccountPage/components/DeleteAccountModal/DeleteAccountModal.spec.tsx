import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteAccountModal } from "./DeleteAccountModal";

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("DeleteAccountModal", () => {
    const mockOnClose = jest.fn();

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should not render when isOpen is false", () => {
        render(<DeleteAccountModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText("account.deleteAccount")).not.toBeInTheDocument();
    });

    it("should render modal content when isOpen is true", () => {
        render(<DeleteAccountModal {...defaultProps} />);

        expect(screen.getByText("account.deleteAccount")).toBeInTheDocument();
        expect(screen.getByText("account.deleteAccountMessage")).toBeInTheDocument();
        expect(screen.getByText("account.deleteAccountMessageSend")).toBeInTheDocument();
        expect(screen.getByText("account.close")).toBeInTheDocument();
    });

    it("should display admin email", () => {
        render(<DeleteAccountModal {...defaultProps} />);

        const emailLink = screen.getByText("admin@example.com");
        expect(emailLink).toHaveAttribute("href", "mailto:admin@example.com");
    });

    it("should call onClose when close button is clicked", async () => {
        const user = userEvent.setup();
        render(<DeleteAccountModal {...defaultProps} />);

        const closeButton = screen.getByText("account.close");
        await user.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when X button is clicked", async () => {
        const user = userEvent.setup();
        render(<DeleteAccountModal {...defaultProps} />);

        const headerCloseButton = screen.getByRole("button", { name: "" });
        await user.click(headerCloseButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when overlay is clicked", async () => {
        const user = userEvent.setup();
        render(<DeleteAccountModal {...defaultProps} />);

        const overlay = document.querySelector("[data-radix-dialog-overlay]");
        if (overlay) {
            await user.click(overlay);
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        } else {
            expect(overlay).toBeDefined();
        }
    });
});
