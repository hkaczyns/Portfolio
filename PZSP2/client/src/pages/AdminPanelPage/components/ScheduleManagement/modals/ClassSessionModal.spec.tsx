import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClassSessionModal } from "./ClassSessionModal";

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
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

describe("ClassSessionModal", () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();

    const mockClassGroups = [{ id: 1, name: "Group 1" }];
    const mockRooms = [{ id: 1, name: "Room 1" }];
    const mockInstructors = [
        { id: "1", firstName: "John", lastName: "Doe" },
        { id: "2", firstName: "Jane", lastName: "Smith" },
    ];

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onSubmit: mockOnSubmit,
        isLoading: false,
        classGroups: mockClassGroups,
        rooms: mockRooms,
        instructors: mockInstructors,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnSubmit.mockResolvedValue(undefined);
        mockOnOpenChange.mockClear();
    });

    it("should not render when isOpen is false", () => {
        render(<ClassSessionModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText("admin.addSession")).not.toBeInTheDocument();
    });

    it("should render modal content when isOpen is true", () => {
        render(<ClassSessionModal {...defaultProps} />);

        expect(screen.getByText("admin.addSession")).toBeInTheDocument();
        expect(screen.getByText(/admin\.classGroup/)).toBeInTheDocument();
        expect(screen.getByText("admin.selectClassGroup")).toBeInTheDocument();
        expect(screen.getByText(/admin\.date/)).toBeInTheDocument();
        expect(screen.getByText(/admin\.instructor/)).toBeInTheDocument();
    });

    it("should render edit title when initialData is provided", () => {
        const initialData = {
            id: 1,
            classGroupId: 1,
            date: "2024-01-01",
            startTime: "10:00",
            endTime: "11:00",
            instructorId: null,
            roomId: null,
            notes: null,
            status: "scheduled",
            cancellationReason: null,
            rescheduledFromId: null,
            createdAt: "2024-01-01T00:00:00Z",
        };

        render(<ClassSessionModal {...defaultProps} initialData={initialData} />);

        expect(screen.getByText("admin.editSession")).toBeInTheDocument();
    });

    it("should disable classGroup select when editing", () => {
        const initialData = {
            id: 1,
            classGroupId: 1,
            date: "2024-01-01",
            startTime: "10:00",
            endTime: "11:00",
            instructorId: null,
            roomId: null,
            notes: null,
            status: "scheduled",
            cancellationReason: null,
            rescheduledFromId: null,
            createdAt: "2024-01-01T00:00:00Z",
        };

        render(<ClassSessionModal {...defaultProps} initialData={initialData} />);

        const selects = screen.getAllByRole("combobox");
        const classGroupSelect = selects[0] as HTMLSelectElement;
        expect(classGroupSelect).toBeDisabled();
    });

    it("should call onClose when cancel button is clicked", async () => {
        const user = userEvent.setup();
        render(<ClassSessionModal {...defaultProps} />);

        const cancelButton = screen.getByRole("button", { name: /account\.cancel|cancel/i });
        await user.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should render instructor select with options", () => {
        render(<ClassSessionModal {...defaultProps} />);

        const selects = screen.getAllByRole("combobox");
        const instructorSelect = selects[2] as HTMLSelectElement;
        expect(instructorSelect).toBeInTheDocument();
        expect(screen.getByText("admin.noInstructor")).toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    it("should allow selecting an instructor", async () => {
        const user = userEvent.setup();
        render(<ClassSessionModal {...defaultProps} />);

        const selects = screen.getAllByRole("combobox");
        const instructorSelect = selects[2] as HTMLSelectElement;
        await user.selectOptions(instructorSelect, "1");

        expect(instructorSelect.value).toBe("1");
    });

    it("should allow clearing instructor selection", async () => {
        const user = userEvent.setup();
        const initialData = {
            id: 1,
            classGroupId: 1,
            date: "2024-01-01",
            startTime: "10:00",
            endTime: "11:00",
            instructorId: "1",
            roomId: null,
            notes: null,
            status: "scheduled",
            cancellationReason: null,
            rescheduledFromId: null,
            createdAt: "2024-01-01T00:00:00Z",
        };

        render(<ClassSessionModal {...defaultProps} initialData={initialData} />);

        const selects = screen.getAllByRole("combobox");
        const instructorSelect = selects[2] as HTMLSelectElement;
        expect(instructorSelect.value).toBe("1");

        await user.selectOptions(instructorSelect, "");
        expect(instructorSelect.value).toBe("");
    });
});
