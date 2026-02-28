import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ManageSessionAttendanceModal } from "./ManageSessionAttendanceModal";
import * as useManageSessionAttendance from "./hooks/useManageSessionAttendance";

jest.mock("./hooks/useManageSessionAttendance");
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

describe("ManageSessionAttendanceModal", () => {
    const mockOnClose = jest.fn();
    const mockClassSession = {
        id: 1,
        classGroupId: 1,
        date: "2024-01-01",
        startTime: "10:00",
        endTime: "11:00",
        roomId: null,
        instructorId: null,
        notes: null,
        status: "scheduled",
        cancellationReason: null,
        rescheduledFromId: null,
        createdAt: "2024-01-01T00:00:00Z",
    };

    const mockAttendanceList = [
        {
            studentId: "1",
            firstName: "John",
            lastName: "Doe",
            enrollmentStatus: "ACTIVE",
            status: "PRESENT",
            isMakeup: false,
        },
    ];

    const mockUseManageSessionAttendance = {
        attendanceList: mockAttendanceList,
        isLoadingAttendance: false,
        isSaving: false,
        handleStatusChange: jest.fn(),
        handleMakeupToggle: jest.fn(),
        handleSave: jest.fn(),
        getAttendanceData: jest.fn(() => ({
            status: "PRESENT" as const,
            isMakeup: false,
        })),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useManageSessionAttendance.useManageSessionAttendance).mockReturnValue(
            mockUseManageSessionAttendance as any,
        );
    });

    it("should render modal when open", () => {
        render(<ManageSessionAttendanceModal isOpen={true} onClose={mockOnClose} classSession={mockClassSession} />);

        expect(screen.getByText("admin.manageSessionAttendance")).toBeInTheDocument();
    });

    it("should show loading state", () => {
        jest.mocked(useManageSessionAttendance.useManageSessionAttendance).mockReturnValue({
            ...mockUseManageSessionAttendance,
            isLoadingAttendance: true,
        } as any);

        const { container } = render(
            <ManageSessionAttendanceModal isOpen={true} onClose={mockOnClose} classSession={mockClassSession} />,
        );

        expect(screen.getByText("admin.manageSessionAttendance")).toBeInTheDocument();
        const spinner = container.querySelector('[class*="spinner"]');
        expect(spinner).toBeInTheDocument();
    });

    it("should display attendance list", () => {
        render(<ManageSessionAttendanceModal isOpen={true} onClose={mockOnClose} classSession={mockClassSession} />);

        expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("should call handleSave when save button is clicked", async () => {
        render(<ManageSessionAttendanceModal isOpen={true} onClose={mockOnClose} classSession={mockClassSession} />);

        const saveButton = screen.getByText("account.save");
        await userEvent.click(saveButton);

        expect(mockUseManageSessionAttendance.handleSave).toHaveBeenCalled();
    });

    it("should show empty state when no students", () => {
        jest.mocked(useManageSessionAttendance.useManageSessionAttendance).mockReturnValue({
            ...mockUseManageSessionAttendance,
            attendanceList: [],
        } as any);

        render(<ManageSessionAttendanceModal isOpen={true} onClose={mockOnClose} classSession={mockClassSession} />);

        expect(screen.getByText("admin.noStudentsInSession")).toBeInTheDocument();
    });
});
