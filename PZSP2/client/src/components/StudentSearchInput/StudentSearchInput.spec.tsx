import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StudentSearchInput } from "./StudentSearchInput";
import * as useStudentSearch from "../../hooks/useStudentSearch";

jest.mock("../../hooks/useStudentSearch");
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("StudentSearchInput", () => {
    const mockOnChange = jest.fn();
    const mockStudents = [
        {
            id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            isActive: true,
            isSuperuser: false,
            isVerified: true,
            role: "STUDENT" as const,
        },
        {
            id: "2",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane@example.com",
            isActive: true,
            isSuperuser: false,
            isVerified: true,
            role: "STUDENT" as const,
        },
    ];

    const mockUseStudentSearch = {
        searchQuery: "",
        setSearchQuery: jest.fn(),
        isDropdownOpen: false,
        setIsDropdownOpen: jest.fn(),
        filteredStudents: mockStudents,
        availableStudents: mockStudents,
        isLoading: false,
        dropdownRef: { current: null },
        inputRef: { current: null },
        handleSearchChange: jest.fn(),
        reset: jest.fn(),
        getStudentName: jest.fn((id: string) => {
            const student = mockStudents.find((s) => s.id === id);
            return student ? `${student.firstName} ${student.lastName}` : id;
        }),
        showAllOption: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useStudentSearch.useStudentSearch).mockReturnValue(mockUseStudentSearch as any);
    });

    it("should render search input", () => {
        render(<StudentSearchInput value={null} onChange={mockOnChange} />);

        expect(screen.getByPlaceholderText("admin.selectStudent")).toBeInTheDocument();
    });

    it("should display selected student name", () => {
        jest.mocked(useStudentSearch.useStudentSearch).mockReturnValue({
            ...mockUseStudentSearch,
            getStudentName: jest.fn(() => "John Doe"),
        } as any);

        render(<StudentSearchInput value="1" onChange={mockOnChange} />);

        expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
    });

    it("should open dropdown when input is focused", async () => {
        const mockSetIsDropdownOpen = jest.fn();
        jest.mocked(useStudentSearch.useStudentSearch).mockReturnValue({
            ...mockUseStudentSearch,
            setIsDropdownOpen: mockSetIsDropdownOpen,
        } as any);

        render(<StudentSearchInput value={null} onChange={mockOnChange} />);

        const input = screen.getByPlaceholderText("admin.selectStudent");
        await userEvent.click(input);

        expect(mockSetIsDropdownOpen).toHaveBeenCalledWith(true);
    });

    it("should call onChange when student is selected", async () => {
        jest.mocked(useStudentSearch.useStudentSearch).mockReturnValue({
            ...mockUseStudentSearch,
            isDropdownOpen: true,
        } as any);

        render(<StudentSearchInput value={null} onChange={mockOnChange} />);

        const studentOption = screen.getByText("John Doe");
        await userEvent.click(studentOption);

        expect(mockOnChange).toHaveBeenCalledWith("1");
    });

    it("should show all students option when allowAll is true", () => {
        jest.mocked(useStudentSearch.useStudentSearch).mockReturnValue({
            ...mockUseStudentSearch,
            isDropdownOpen: true,
            showAllOption: true,
        } as any);

        render(<StudentSearchInput value={null} onChange={mockOnChange} allowAll={true} />);

        expect(screen.getByText("admin.allStudents")).toBeInTheDocument();
    });

    it("should be disabled when disabled prop is true", () => {
        jest.mocked(useStudentSearch.useStudentSearch).mockReturnValue({
            ...mockUseStudentSearch,
            availableStudents: [],
        } as any);

        render(<StudentSearchInput value={null} onChange={mockOnChange} disabled={true} />);

        expect(screen.getByPlaceholderText("admin.selectStudent")).toBeDisabled();
    });
});
