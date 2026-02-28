import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChargeModal } from "./ChargeModal";
import { ChargeType, ChargeStatus } from "../../../../../store/admin/api";

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock("@radix-ui/react-dialog", () => ({
    Root: ({ children, open }: any) => (
        <div data-testid="dialog-root" data-open={open}>
            {open && children}
        </div>
    ),
    Portal: ({ children }: any) => <div>{children}</div>,
    Overlay: () => <div data-testid="dialog-overlay" />,
    Content: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
    Title: ({ children }: any) => <h2>{children}</h2>,
    Close: ({ children, asChild }: any) => (asChild ? children : <button>{children}</button>),
}));

describe("ChargeModal", () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onSubmit: mockOnSubmit,
        isLoading: false,
        studentId: "student1",
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnSubmit.mockResolvedValue(undefined);
    });

    it("should not render when isOpen is false", () => {
        render(<ChargeModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText("admin.addCharge")).not.toBeInTheDocument();
    });

    it("should render edit title when initialData is provided", () => {
        const initialData = {
            id: 1,
            studentId: "student1",
            amountDue: "150.00",
            dueDate: "2024-02-01",
            type: ChargeType.MONTHLY_FEE,
            status: ChargeStatus.OPEN,
            createdBy: null,
            createdAt: "2024-01-01T10:00:00Z",
        };
        render(<ChargeModal {...defaultProps} initialData={initialData} />);
        expect(screen.getByText("admin.editCharge")).toBeInTheDocument();
    });

    it("should call onSubmit with form data when form is submitted", async () => {
        const user = userEvent.setup();
        render(<ChargeModal {...defaultProps} />);

        const amountInput = screen.getByPlaceholderText(/admin\.amountDue|amountDue/);
        const dueDateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
        const submitButton = screen.getByRole("button", { name: /account\.save|save/i });

        await user.type(amountInput, "150.00");
        if (dueDateInput) {
            await user.clear(dueDateInput);
            await user.type(dueDateInput, "2024-02-01");
        }
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalled();
        });
    });
});
