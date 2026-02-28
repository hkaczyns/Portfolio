import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UsersList } from "./UsersList";
import * as useUsersListHook from "../../hooks/useUsersList";
import { UserRole } from "../../../../store/auth/types";

jest.mock("../../hooks/useUsersList");
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));
jest.mock("../../../../utils/userRole", () => ({
    getRoleLabel: (role: UserRole) => {
        const labels: Record<UserRole, string> = {
            [UserRole.STUDENT]: "Student",
            [UserRole.INSTRUCTOR]: "Instructor",
            [UserRole.ADMIN]: "Administrator",
        };
        return labels[role] || "";
    },
}));

describe("UsersList", () => {
    const mockUsers = [
        {
            id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            isActive: true,
            isSuperuser: false,
            isVerified: true,
            role: UserRole.STUDENT,
        },
        {
            id: "2",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane@example.com",
            isActive: false,
            isSuperuser: false,
            isVerified: true,
            role: UserRole.INSTRUCTOR,
        },
    ];

    const defaultMockUseUsersList = {
        users: mockUsers,
        isLoading: false,
        isError: false,
        error: undefined,
        page: 1,
        pageSize: 20,
        search: "",
        roleFilter: undefined,
        isActiveFilter: undefined,
        sortBy: "last_name",
        sortOrder: "asc" as "asc" | "desc",
        handlePageChange: jest.fn(),
        handlePageSizeChange: jest.fn(),
        handleSearchChange: jest.fn(),
        handleRoleFilterChange: jest.fn(),
        handleIsActiveFilterChange: jest.fn(),
        handleSortChange: jest.fn(),
        clearFilters: jest.fn(),
        hasActiveFilters: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useUsersListHook.useUsersList).mockReturnValue(
            defaultMockUseUsersList as ReturnType<typeof useUsersListHook.useUsersList>,
        );
    });

    const mockOnSelectUser = jest.fn();

    it("should render search input", () => {
        render(<UsersList onSelectUser={mockOnSelectUser} />);

        const searchInput = screen.getByPlaceholderText("admin.searchUsers");
        expect(searchInput).toBeInTheDocument();
    });

    it("should render filter selects", () => {
        render(<UsersList onSelectUser={mockOnSelectUser} />);

        expect(screen.getByDisplayValue("admin.allRoles")).toBeInTheDocument();
        expect(screen.getByDisplayValue("admin.allStatuses")).toBeInTheDocument();
    });

    it("should render users table", () => {
        render(<UsersList onSelectUser={mockOnSelectUser} />);

        expect(screen.getByText("John")).toBeInTheDocument();
        expect(screen.getByText("Doe")).toBeInTheDocument();
        expect(screen.getByText("john@example.com")).toBeInTheDocument();
        expect(screen.getByText("Jane")).toBeInTheDocument();
        expect(screen.getByText("Smith")).toBeInTheDocument();
        expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    });

    it("should render role labels", () => {
        render(<UsersList onSelectUser={mockOnSelectUser} />);

        expect(screen.getByText("Student")).toBeInTheDocument();
        expect(screen.getByText("Instructor")).toBeInTheDocument();
    });

    it("should render status badges", () => {
        render(<UsersList onSelectUser={mockOnSelectUser} />);

        const activeBadges = screen.getAllByText("admin.active");
        const inactiveBadges = screen.getAllByText("admin.inactive");
        expect(activeBadges.length).toBeGreaterThan(0);
        expect(inactiveBadges.length).toBeGreaterThan(0);
    });

    it("should call handleSearchChange when search input changes", async () => {
        const handleSearchChange = jest.fn();
        const user = userEvent.setup();
        jest.mocked(useUsersListHook.useUsersList).mockReturnValue({
            ...defaultMockUseUsersList,
            handleSearchChange,
        } as ReturnType<typeof useUsersListHook.useUsersList>);

        render(<UsersList onSelectUser={mockOnSelectUser} />);

        const searchInput = screen.getByPlaceholderText("admin.searchUsers");
        await user.type(searchInput, "test");

        expect(handleSearchChange).toHaveBeenCalled();
    });

    it("should call handleRoleFilterChange when role filter changes", async () => {
        const handleRoleFilterChange = jest.fn();
        const user = userEvent.setup();
        jest.mocked(useUsersListHook.useUsersList).mockReturnValue({
            ...defaultMockUseUsersList,
            handleRoleFilterChange,
        } as ReturnType<typeof useUsersListHook.useUsersList>);

        render(<UsersList onSelectUser={mockOnSelectUser} />);

        const roleSelect = screen.getByDisplayValue("admin.allRoles");
        await user.selectOptions(roleSelect, UserRole.STUDENT);

        expect(handleRoleFilterChange).toHaveBeenCalledWith(UserRole.STUDENT);
    });

    it("should call handleIsActiveFilterChange when status filter changes", async () => {
        const handleIsActiveFilterChange = jest.fn();
        const user = userEvent.setup();
        jest.mocked(useUsersListHook.useUsersList).mockReturnValue({
            ...defaultMockUseUsersList,
            handleIsActiveFilterChange,
        } as ReturnType<typeof useUsersListHook.useUsersList>);

        render(<UsersList onSelectUser={mockOnSelectUser} />);

        const statusSelect = screen.getByDisplayValue("admin.allStatuses");
        await user.selectOptions(statusSelect, "true");

        expect(handleIsActiveFilterChange).toHaveBeenCalledWith(true);
    });

    it("should show clear filters button when hasActiveFilters is true", () => {
        jest.mocked(useUsersListHook.useUsersList).mockReturnValue({
            ...defaultMockUseUsersList,
            hasActiveFilters: true,
        } as ReturnType<typeof useUsersListHook.useUsersList>);

        render(<UsersList onSelectUser={mockOnSelectUser} />);

        expect(screen.getByText("admin.clearFilters")).toBeInTheDocument();
    });

    it("should not show clear filters button when hasActiveFilters is false", () => {
        render(<UsersList onSelectUser={mockOnSelectUser} />);

        expect(screen.queryByText("admin.clearFilters")).not.toBeInTheDocument();
    });

    it("should call clearFilters when clear filters button is clicked", async () => {
        const clearFilters = jest.fn();
        const user = userEvent.setup();
        jest.mocked(useUsersListHook.useUsersList).mockReturnValue({
            ...defaultMockUseUsersList,
            hasActiveFilters: true,
            clearFilters,
        } as ReturnType<typeof useUsersListHook.useUsersList>);

        render(<UsersList onSelectUser={mockOnSelectUser} />);

        const clearButton = screen.getByText("admin.clearFilters");
        await user.click(clearButton);

        expect(clearFilters).toHaveBeenCalledTimes(1);
    });

    it("should call handleSortChange when sort button is clicked", async () => {
        const handleSortChange = jest.fn();
        const user = userEvent.setup();
        jest.mocked(useUsersListHook.useUsersList).mockReturnValue({
            ...defaultMockUseUsersList,
            handleSortChange,
        } as ReturnType<typeof useUsersListHook.useUsersList>);

        render(<UsersList onSelectUser={mockOnSelectUser} />);

        const firstNameSortButton = screen.getByText("firstName").closest("button");
        if (firstNameSortButton) {
            await user.click(firstNameSortButton);
            expect(handleSortChange).toHaveBeenCalledWith("first_name");
        }
    });

    it("should render loading state", () => {
        jest.mocked(useUsersListHook.useUsersList).mockReturnValue({
            ...defaultMockUseUsersList,
            isLoading: true,
        } as ReturnType<typeof useUsersListHook.useUsersList>);

        render(<UsersList onSelectUser={mockOnSelectUser} />);

        expect(screen.getByText("admin.loading")).toBeInTheDocument();
    });

    it("should render no users message when users array is empty", () => {
        jest.mocked(useUsersListHook.useUsersList).mockReturnValue({
            ...defaultMockUseUsersList,
            users: [],
        } as ReturnType<typeof useUsersListHook.useUsersList>);

        render(<UsersList onSelectUser={mockOnSelectUser} />);

        expect(screen.getByText("admin.noUsersFound")).toBeInTheDocument();
    });

    it("should render pagination controls", () => {
        render(<UsersList onSelectUser={mockOnSelectUser} />);

        expect(screen.getByText("admin.previous")).toBeInTheDocument();
        expect(screen.getByText("admin.next")).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("should call handlePageChange when pagination button is clicked", async () => {
        const handlePageChange = jest.fn();
        const user = userEvent.setup();
        jest.mocked(useUsersListHook.useUsersList).mockReturnValue({
            ...defaultMockUseUsersList,
            page: 2,
            handlePageChange,
        } as ReturnType<typeof useUsersListHook.useUsersList>);

        render(<UsersList onSelectUser={mockOnSelectUser} />);

        const previousButton = screen.getByText("admin.previous");
        await user.click(previousButton);

        expect(handlePageChange).toHaveBeenCalledWith(1);
    });

    it("should call handlePageSizeChange when page size select changes", async () => {
        const handlePageSizeChange = jest.fn();
        const user = userEvent.setup();
        jest.mocked(useUsersListHook.useUsersList).mockReturnValue({
            ...defaultMockUseUsersList,
            handlePageSizeChange,
        } as ReturnType<typeof useUsersListHook.useUsersList>);

        render(<UsersList onSelectUser={mockOnSelectUser} />);

        const pageSizeSelects = screen.getAllByDisplayValue("20");
        const pageSizeSelect = pageSizeSelects.find((select) => select.tagName === "SELECT");
        if (pageSizeSelect) {
            await user.selectOptions(pageSizeSelect, "50");
            expect(handlePageSizeChange).toHaveBeenCalledWith(50);
        } else {
            throw new Error("Page size select not found");
        }
    });

    it("should disable previous button when page is 1", () => {
        render(<UsersList onSelectUser={mockOnSelectUser} />);

        const previousButton = screen.getByText("admin.previous");
        expect(previousButton).toBeDisabled();
    });

    it("should disable next button when users length is less than pageSize", () => {
        jest.mocked(useUsersListHook.useUsersList).mockReturnValue({
            ...defaultMockUseUsersList,
            users: [mockUsers[0]],
            pageSize: 20,
        } as ReturnType<typeof useUsersListHook.useUsersList>);

        render(<UsersList onSelectUser={mockOnSelectUser} />);

        const nextButton = screen.getByText("admin.next");
        expect(nextButton).toBeDisabled();
    });
});
