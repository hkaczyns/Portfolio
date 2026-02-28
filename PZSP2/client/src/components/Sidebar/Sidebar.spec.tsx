import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "./Sidebar";
import * as useSidebarHook from "./hooks/useSidebar";

jest.mock("./hooks/useSidebar");

describe("Sidebar", () => {
    const mockOnToggle = jest.fn();
    const mockHandleLogout = jest.fn();
    const mockHandleNavClick = jest.fn();
    const mockIsActive = jest.fn((path: string) => path === "/dashboard");
    const mockT = jest.fn((key: string) => key);

    const defaultMockUseSidebar = {
        fullName: "John Doe",
        roleLabel: "Student",
        handleLogout: mockHandleLogout,
        isActive: mockIsActive,
        handleNavClick: mockHandleNavClick,
        t: mockT,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useSidebarHook.useSidebar).mockReturnValue(defaultMockUseSidebar as any);
    });

    it("should render sidebar in collapsed state", () => {
        const { container } = render(<Sidebar isExpanded={false} onToggle={mockOnToggle} />);

        const sidebar = container.querySelector("aside");
        expect(sidebar?.className).toContain("sidebarCollapsed");
        expect(sidebar?.className).not.toContain("sidebarExpanded");
    });

    it("should render sidebar in expanded state", () => {
        const { container } = render(<Sidebar isExpanded={true} onToggle={mockOnToggle} />);

        const sidebar = container.querySelector("aside");
        expect(sidebar?.className).toContain("sidebarExpanded");
        expect(sidebar?.className).not.toContain("sidebarCollapsed");
    });

    it("should render overlay when expanded", () => {
        const { container } = render(<Sidebar isExpanded={true} onToggle={mockOnToggle} />);

        const overlay = container.querySelector('[class*="overlay"]');
        expect(overlay).toBeInTheDocument();
    });

    it("should not render overlay when collapsed", () => {
        const { container } = render(<Sidebar isExpanded={false} onToggle={mockOnToggle} />);

        const overlay = container.querySelector('[class*="overlay"]');
        expect(overlay).not.toBeInTheDocument();
    });

    it("should call onToggle when overlay is clicked", async () => {
        const user = userEvent.setup();
        const { container } = render(<Sidebar isExpanded={true} onToggle={mockOnToggle} />);

        const overlay = container.querySelector('[class*="overlay"]');
        if (overlay) {
            await user.click(overlay);
            expect(mockOnToggle).toHaveBeenCalledTimes(1);
        }
    });

    it("should render toggle button", () => {
        const { container } = render(<Sidebar isExpanded={false} onToggle={mockOnToggle} />);

        const toggleButton = container.querySelector('[class*="toggleButton"]');
        expect(toggleButton).toBeInTheDocument();
    });

    it("should call onToggle when toggle button is clicked", async () => {
        const user = userEvent.setup();
        const { container } = render(<Sidebar isExpanded={false} onToggle={mockOnToggle} />);

        const toggleButton = container.querySelector('[class*="toggleButton"]') as HTMLButtonElement;
        if (toggleButton) {
            await user.click(toggleButton);
            expect(mockOnToggle).toHaveBeenCalledTimes(1);
        }
    });

    it("should render user section when expanded and fullName is available", () => {
        render(<Sidebar isExpanded={true} onToggle={mockOnToggle} />);

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Student")).toBeInTheDocument();
    });

    it("should not render user section when collapsed", () => {
        render(<Sidebar isExpanded={false} onToggle={mockOnToggle} />);

        expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
        expect(screen.queryByText("Student")).not.toBeInTheDocument();
    });

    it("should not render user section when expanded but fullName is undefined", () => {
        jest.mocked(useSidebarHook.useSidebar).mockReturnValue({
            ...defaultMockUseSidebar,
            fullName: undefined,
        } as any);

        render(<Sidebar isExpanded={true} onToggle={mockOnToggle} />);

        expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });

    it("should render navigation links", () => {
        render(<Sidebar isExpanded={true} onToggle={mockOnToggle} />);

        expect(screen.getByText("sidebar.account")).toBeInTheDocument();
    });

    it("should not render navigation link text when collapsed", () => {
        render(<Sidebar isExpanded={false} onToggle={mockOnToggle} />);

        expect(screen.queryByText("sidebar.account")).not.toBeInTheDocument();
    });

    it("should call handleNavClick when account link is clicked", async () => {
        const user = userEvent.setup();
        render(<Sidebar isExpanded={true} onToggle={mockOnToggle} />);

        const accountButton = screen.getByText("sidebar.account").closest("button");
        if (accountButton) {
            await user.click(accountButton);
            expect(mockHandleNavClick).toHaveBeenCalledWith("/account");
        }
    });

    it("should apply active class to account link when active", () => {
        jest.mocked(useSidebarHook.useSidebar).mockReturnValue({
            ...defaultMockUseSidebar,
            isActive: jest.fn((path: string) => path === "/account"),
        } as any);
        render(<Sidebar isExpanded={true} onToggle={mockOnToggle} />);

        const accountButton = screen.getByText("sidebar.account").closest("button");
        expect(accountButton?.className).toContain("navLinkActive");
    });

    it("should not apply active class to account link when not active", () => {
        render(<Sidebar isExpanded={true} onToggle={mockOnToggle} />);

        const accountButton = screen.getByText("sidebar.account").closest("button");
        expect(accountButton?.className).not.toContain("navLinkActive");
    });

    it("should apply active class to account link when active", () => {
        const mockIsActiveAccount = jest.fn((path: string) => path === "/account");
        jest.mocked(useSidebarHook.useSidebar).mockReturnValue({
            ...defaultMockUseSidebar,
            isActive: mockIsActiveAccount,
        } as any);

        render(<Sidebar isExpanded={true} onToggle={mockOnToggle} />);

        const accountButton = screen.getByText("sidebar.account").closest("button");
        expect(accountButton?.className).toContain("navLinkActive");
    });

    it("should render logout button", () => {
        render(<Sidebar isExpanded={true} onToggle={mockOnToggle} />);

        expect(screen.getByText("sidebar.logout")).toBeInTheDocument();
    });

    it("should not render logout button text when collapsed", () => {
        render(<Sidebar isExpanded={false} onToggle={mockOnToggle} />);

        expect(screen.queryByText("sidebar.logout")).not.toBeInTheDocument();
    });

    it("should call handleLogout when logout button is clicked", async () => {
        const user = userEvent.setup();
        render(<Sidebar isExpanded={true} onToggle={mockOnToggle} />);

        const logoutButton = screen.getByText("sidebar.logout").closest("button");
        if (logoutButton) {
            await user.click(logoutButton);
            expect(mockHandleLogout).toHaveBeenCalledTimes(1);
        }
    });

    it("should render separators", () => {
        const { container } = render(<Sidebar isExpanded={true} onToggle={mockOnToggle} />);

        const separators = container.querySelectorAll('[class*="separator"]');
        expect(separators.length).toBeGreaterThan(0);
    });
});
