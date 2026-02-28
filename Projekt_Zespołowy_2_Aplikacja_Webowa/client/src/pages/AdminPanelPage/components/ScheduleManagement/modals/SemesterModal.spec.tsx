import { render, screen } from "@testing-library/react";
import { SemesterModal } from "./SemesterModal";

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

describe("SemesterModal", () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnSubmit.mockResolvedValue(undefined);
    });

    it("should render modal when open", () => {
        render(<SemesterModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} isLoading={false} />);

        expect(screen.getByText("admin.addSemester")).toBeInTheDocument();
    });

    it("should render edit title when initialData is provided", () => {
        const initialData = {
            id: 1,
            name: "Fall 2024",
            startDate: "2024-09-01",
            endDate: "2024-12-31",
            isActive: true,
            createdAt: "2024-01-01T00:00:00Z",
            createdBy: "user-1",
            updatedAt: "2024-01-01T00:00:00Z",
        };

        render(
            <SemesterModal
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                isLoading={false}
                initialData={initialData}
            />,
        );

        expect(screen.getByText("admin.editSemester")).toBeInTheDocument();
    });
});
