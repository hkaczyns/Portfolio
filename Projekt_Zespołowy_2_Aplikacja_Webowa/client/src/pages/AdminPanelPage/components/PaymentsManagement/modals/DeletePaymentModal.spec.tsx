import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeletePaymentModal } from "./DeletePaymentModal";
import { PaymentMethod } from "../../../../../store/admin/api";

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

const mockOnOpenChange = jest.fn();

jest.mock("@radix-ui/react-dialog", () => ({
    Root: ({ children, open, onOpenChange }: any) => {
        if (onOpenChange) {
            mockOnOpenChange.mockImplementation(onOpenChange);
        }
        return (
            <div data-testid="dialog-root" data-open={open}>
                {open && children}
            </div>
        );
    },
    Portal: ({ children }: any) => <div>{children}</div>,
    Overlay: () => <div data-testid="dialog-overlay" />,
    Content: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
    Title: ({ children }: any) => <h2>{children}</h2>,
    Close: ({ children, asChild, ...props }: any) => {
        const handleClick = () => {
            if (props.onClick) {
                props.onClick();
            }
            mockOnOpenChange(false);
        };
        if (asChild) {
            return <div onClick={handleClick}>{children}</div>;
        }
        return <button onClick={handleClick}>{children}</button>;
    },
}));

describe("DeletePaymentModal", () => {
    const mockOnClose = jest.fn();
    const mockOnConfirm = jest.fn();
    const mockPayment = {
        id: 1,
        userId: "student1",
        amount: "100.00",
        paidAt: "2024-01-15T10:00:00Z",
        paymentMethod: PaymentMethod.CASH,
        notes: "Test payment",
    };

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onConfirm: mockOnConfirm,
        isLoading: false,
        payment: mockPayment,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnConfirm.mockResolvedValue(undefined);
        mockOnOpenChange.mockClear();
    });

    it("should not render when isOpen is false", () => {
        render(<DeletePaymentModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText("admin.deletePayment")).not.toBeInTheDocument();
    });

    it("should render modal content when isOpen is true", () => {
        render(<DeletePaymentModal {...defaultProps} />);
        expect(screen.getByText("admin.deletePayment")).toBeInTheDocument();
        expect(screen.getByText(/admin\.paymentDeleteConfirm/)).toBeInTheDocument();
    });

    it("should call onConfirm when confirm button is clicked", async () => {
        const user = userEvent.setup();
        render(<DeletePaymentModal {...defaultProps} />);

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
        render(<DeletePaymentModal {...defaultProps} />);

        const cancelButtons = screen.getAllByRole("button");
        const cancelButton = cancelButtons.find((btn) => btn.textContent?.includes("account.cancel"));
        if (cancelButton) {
            await user.click(cancelButton);
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        }
    });

    it("should disable buttons when isLoading is true", () => {
        render(<DeletePaymentModal {...defaultProps} isLoading={true} />);
        const buttons = screen.getAllByRole("button");
        buttons.forEach((button) => {
            if (button.textContent?.includes("account.delete") || button.textContent?.includes("account.cancel")) {
                expect(button).toBeDisabled();
            }
        });
    });
});
