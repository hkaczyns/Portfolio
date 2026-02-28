import { render, screen } from "@testing-library/react";
import { ClassGroupModal } from "./ClassGroupModal";
import * as useClassGroupModalHook from "./hooks/useClassGroupModal";

jest.mock("./hooks/useClassGroupModal");
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock("@radix-ui/react-dialog", () => {
    const actual = jest.requireActual("@radix-ui/react-dialog");
    return {
        ...actual,
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
    };
});

jest.mock("../../../../../components/FormField/FormField", () => ({
    FormField: ({ placeholder, value, onChangeText, onBlur, error, touched, icon }: any) => (
        <div>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChangeText && onChangeText(e.target.value)}
                onBlur={onBlur}
            />
            {icon}
            {error && touched && <div>{error}</div>}
        </div>
    ),
}));

describe("ClassGroupModal", () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();

    const mockSemesters = [{ id: 1, name: "Semester 1" }];
    const mockSkillLevels = [{ id: 1, name: "Beginner" }];
    const mockTopics = [{ id: 1, name: "Topic 1" }];
    const mockRooms = [{ id: 1, name: "Room 1" }];
    const mockInstructors = [{ id: "inst1", firstName: "John", lastName: "Doe" }];

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onSubmit: mockOnSubmit,
        isLoading: false,
        semesters: mockSemesters,
        skillLevels: mockSkillLevels,
        topics: mockTopics,
        rooms: mockRooms,
        instructors: mockInstructors,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnSubmit.mockResolvedValue(undefined);
        jest.mocked(useClassGroupModalHook.useClassGroupModal).mockReturnValue({
            isEdit: false,
            initialValues: {
                semesterId: 0,
                name: "",
                description: null,
                levelId: 0,
                topicId: 0,
                roomId: null,
                capacity: 1,
                dayOfWeek: 0,
                startTime: "",
                endTime: "",
                instructorId: null,
                isPublic: false,
                status: "draft",
            },
            daysOfWeek: [
                "admin.monday",
                "admin.tuesday",
                "admin.wednesday",
                "admin.thursday",
                "admin.friday",
                "admin.saturday",
                "admin.sunday",
            ],
            handleSubmit: jest.fn().mockResolvedValue(undefined),
        });
    });

    it("should not render when isOpen is false", () => {
        render(<ClassGroupModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText("admin.addClassGroup")).not.toBeInTheDocument();
    });
});
