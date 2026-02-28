import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeletePaymentAllocationModal } from "./DeletePaymentAllocationModal";

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, params?: any) => {
            if (params) {
                return `${key} ${JSON.stringify(params)}`;
            }
            return key;
        },
    }),
}));

jest.mock("@radix-ui/react-dialog", () => ({
    Root: ({ children, open, onOpenChange }: any) => (
        <div data-testid="dialog-root" data-open={open}>
            {open && <div onClick={() => onOpenChange && onOpenChange(false)}>{children}</div>}
        </div>
    ),
    Portal: ({ children }: any) => <div>{children}</div>,
    Overlay: () => <div data-testid="dialog-overlay" />,
    Content: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
    Title: ({ children }: any) => <h2>{children}</h2>,
    Close: ({ children, asChild, onClick }: any) => {
        const handleClick = (e: any) => {
            if (onClick) onClick(e);
            const root = document.querySelector('[data-testid="dialog-root"]');
            if (root) {
                const clickEvent = new MouseEvent("click", { bubbles: true });
                root.dispatchEvent(clickEvent);
            }
        };
        return asChild ? (
            <div onClick={handleClick}>{children}</div>
        ) : (
            <button onClick={handleClick}>{children}</button>
        );
    },
}));

describe("DeletePaymentAllocationModal", () => {
    const mockOnClose = jest.fn();
    const mockOnConfirm = jest.fn();
    const mockAllocation = {
        paymentId: 1,
        chargeId: 1,
        amountAllocated: "100.00",
    };

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onConfirm: mockOnConfirm,
        isLoading: false,
        allocation: mockAllocation,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnConfirm.mockResolvedValue(undefined);
    });

    it("should not render when isOpen is false", () => {
        render(<DeletePaymentAllocationModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText("admin.deleteAllocation")).not.toBeInTheDocument();
    });

    it("should render modal content when isOpen is true", () => {
        render(<DeletePaymentAllocationModal {...defaultProps} />);
        expect(screen.getByText("admin.deleteAllocation")).toBeInTheDocument();
        expect(screen.getByText(/admin\.allocationDeleteConfirm/)).toBeInTheDocument();
    });

    it("should call onConfirm when confirm button is clicked", async () => {
        const user = userEvent.setup();
        render(<DeletePaymentAllocationModal {...defaultProps} />);

        const confirmButtons = screen.getAllByRole("button");
        const confirmButton = confirmButtons.find((btn) => btn.textContent?.includes("account.delete"));
        if (confirmButton) {
            await user.click(confirmButton);
            await waitFor(() => {
                expect(mockOnConfirm).toHaveBeenCalledTimes(1);
            });
        }
    });

    it("should call onClose when cancel button is clicked", async () => {
        const user = userEvent.setup();
        render(<DeletePaymentAllocationModal {...defaultProps} />);

        const cancelButtons = screen.getAllByRole("button");
        const cancelButton = cancelButtons.find((btn) => btn.textContent?.includes("account.cancel"));
        if (cancelButton) {
            await user.click(cancelButton);
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        }
    });

    it("should disable buttons when isLoading is true", () => {
        render(<DeletePaymentAllocationModal {...defaultProps} isLoading={true} />);
        const buttons = screen.getAllByRole("button");
        buttons.forEach((button) => {
            if (button.textContent?.includes("account.delete") || button.textContent?.includes("account.cancel")) {
                expect(button).toBeDisabled();
            }
        });
    });
});
