import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

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
    Description: ({ children }: any) => <p>{children}</p>,
    Close: ({ children, asChild }: any) => (asChild ? children : <button>{children}</button>),
}));

describe("DeleteConfirmModal", () => {
    const mockOnClose = jest.fn();
    const mockOnConfirm = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnConfirm.mockResolvedValue(undefined);
    });

    it("should render modal when open", () => {
        render(
            <DeleteConfirmModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
                isLoading={false}
                title="Delete Item"
                message="Are you sure?"
            />,
        );

        expect(screen.getByText("Delete Item")).toBeInTheDocument();
        expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    });

    it("should call onConfirm when delete button is clicked", async () => {
        render(
            <DeleteConfirmModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
                isLoading={false}
                title="Delete Item"
                message="Are you sure?"
            />,
        );

        const deleteButton = screen.getByText("admin.delete");
        await userEvent.click(deleteButton);

        expect(mockOnConfirm).toHaveBeenCalled();
    });

    it("should be disabled when isLoading is true", () => {
        render(
            <DeleteConfirmModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
                isLoading={true}
                title="Delete Item"
                message="Are you sure?"
            />,
        );

        const buttons = screen.getAllByRole("button");
        const deleteButton = buttons.find((btn) => btn.className.includes("deleteButton"));
        expect(deleteButton).toBeDisabled();
    });
});
