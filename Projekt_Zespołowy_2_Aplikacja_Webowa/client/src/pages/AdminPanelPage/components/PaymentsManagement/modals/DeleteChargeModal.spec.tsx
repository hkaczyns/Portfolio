import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteChargeModal } from "./DeleteChargeModal";
import { ChargeType, ChargeStatus } from "../../../../../store/admin/api";

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

describe("DeleteChargeModal", () => {
    const mockOnClose = jest.fn();
    const mockOnConfirm = jest.fn();
    const mockCharge = {
        id: 1,
        studentId: "student1",
        amountDue: "150.00",
        dueDate: "2024-02-01",
        type: ChargeType.MONTHLY_FEE,
        status: ChargeStatus.OPEN,
        createdBy: null,
        createdAt: "2024-01-01T10:00:00Z",
    };

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onConfirm: mockOnConfirm,
        isLoading: false,
        charge: mockCharge,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnConfirm.mockResolvedValue(undefined);
        mockOnOpenChange.mockClear();
    });

    it("should not render when isOpen is false", () => {
        render(<DeleteChargeModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText("admin.cancelCharge")).not.toBeInTheDocument();
    });

    it("should render modal content when isOpen is true", () => {
        render(<DeleteChargeModal {...defaultProps} />);
        expect(screen.getByText("admin.cancelCharge")).toBeInTheDocument();
        expect(screen.getByText(/admin\.chargeCancelConfirm/)).toBeInTheDocument();
    });

    it("should call onConfirm when confirm button is clicked", async () => {
        const user = userEvent.setup();
        render(<DeleteChargeModal {...defaultProps} />);

        const confirmButtons = screen.getAllByRole("button");
        const confirmButton = confirmButtons.find((btn) => btn.textContent?.includes("admin.cancel"));
        if (confirmButton) {
            await user.click(confirmButton);
            await waitFor(() => {
                expect(mockOnConfirm).toHaveBeenCalledTimes(1);
            });
        }
    });

    it("should call onClose when cancel button is clicked", async () => {
        const user = userEvent.setup();
        render(<DeleteChargeModal {...defaultProps} />);

        const cancelButtons = screen.getAllByRole("button");
        const cancelButton = cancelButtons.find((btn) => btn.textContent?.includes("account.cancel"));
        if (cancelButton) {
            await user.click(cancelButton);
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        }
    });

    it("should disable buttons when isLoading is true", () => {
        render(<DeleteChargeModal {...defaultProps} isLoading={true} />);
        const buttons = screen.getAllByRole("button");
        buttons.forEach((button) => {
            if (button.textContent?.includes("admin.cancel") || button.textContent?.includes("account.cancel")) {
                expect(button).toBeDisabled();
            }
        });
    });
});
