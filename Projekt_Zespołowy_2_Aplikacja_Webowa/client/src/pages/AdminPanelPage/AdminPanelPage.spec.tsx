import { render, screen } from "@testing-library/react";
import { AdminPanelPage } from "./AdminPanelPage";
import * as useAdminPanelPageHook from "./hooks/useAdminPanelPage";
import { UserRole } from "../../store/auth/types";

jest.mock("./hooks/useAdminPanelPage");
jest.mock("./components/UsersList/UsersList", () => ({
    UsersList: () => <div>UsersList</div>,
}));
jest.mock("./components/ScheduleManagement/ScheduleManagement", () => ({
    ScheduleManagement: () => <div>ScheduleManagement</div>,
}));
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("AdminPanelPage", () => {
    const mockUser = {
        id: "123",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        isActive: true,
        isSuperuser: true,
        isVerified: true,
        role: UserRole.ADMIN,
    };

    const mockUseAdminPanelPage = {
        user: mockUser,
        isLoadingUser: false,
        activeView: "users" as const,
        selectedUser: null,
        handleShowUsers: jest.fn(),
        handleShowSchedule: jest.fn(),
        handleShowPayments: jest.fn(),
        handleSelectUser: jest.fn(),
        handleCloseUserDetails: jest.fn(),
        handleUserUpdate: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useAdminPanelPageHook.useAdminPanelPage).mockReturnValue(
            mockUseAdminPanelPage as ReturnType<typeof useAdminPanelPageHook.useAdminPanelPage>,
        );
    });

    it("should render loading spinner when loading", () => {
        jest.mocked(useAdminPanelPageHook.useAdminPanelPage).mockReturnValue({
            ...mockUseAdminPanelPage,
            isLoadingUser: true,
        } as ReturnType<typeof useAdminPanelPageHook.useAdminPanelPage>);

        render(<AdminPanelPage />);

        expect(screen.queryByText("UsersList")).not.toBeInTheDocument();
    });

    it("should render loading spinner when user is not available", () => {
        jest.mocked(useAdminPanelPageHook.useAdminPanelPage).mockReturnValue({
            ...mockUseAdminPanelPage,
            user: undefined,
        } as ReturnType<typeof useAdminPanelPageHook.useAdminPanelPage>);

        render(<AdminPanelPage />);

        expect(screen.queryByText("UsersList")).not.toBeInTheDocument();
    });

    it("should render UsersList when activeView is users", () => {
        render(<AdminPanelPage />);

        expect(screen.getByText("UsersList")).toBeInTheDocument();
    });

    it("should render AdminActions", () => {
        render(<AdminPanelPage />);

        expect(screen.getByText("admin.users")).toBeInTheDocument();
    });

    it("should render ScheduleManagement when activeView is schedule", () => {
        jest.mocked(useAdminPanelPageHook.useAdminPanelPage).mockReturnValue({
            ...mockUseAdminPanelPage,
            activeView: "schedule" as const,
        } as ReturnType<typeof useAdminPanelPageHook.useAdminPanelPage>);

        render(<AdminPanelPage />);

        expect(screen.getByText("ScheduleManagement")).toBeInTheDocument();
    });
});
