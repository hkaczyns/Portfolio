import { renderHook, act } from "@testing-library/react";
import { useAdminPanelPage } from "./useAdminPanelPage";
import * as useGetUserHook from "../../../store/auth/api/useGetUser";
import { UserRole } from "../../../store/auth/types";

jest.mock("../../../store/auth/api/useGetUser");

describe("useAdminPanelPage", () => {
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

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useGetUserHook.useGetUser).mockReturnValue({
            user: mockUser,
            isLoading: false,
            isSuccess: true,
            isError: false,
            refetch: jest.fn(),
        });
    });

    it("should return all required properties", () => {
        const { result } = renderHook(() => useAdminPanelPage());

        expect(result.current).toHaveProperty("user");
        expect(result.current).toHaveProperty("isLoadingUser");
        expect(result.current).toHaveProperty("activeView");
        expect(result.current).toHaveProperty("selectedUser");
        expect(result.current).toHaveProperty("handleShowUsers");
        expect(result.current).toHaveProperty("handleShowSchedule");
        expect(result.current).toHaveProperty("handleSelectUser");
        expect(result.current).toHaveProperty("handleCloseUserDetails");
        expect(result.current).toHaveProperty("handleUserUpdate");
    });

    it("should return user data", () => {
        const { result } = renderHook(() => useAdminPanelPage());

        expect(result.current.user).toEqual(mockUser);
    });

    it("should have default activeView as users", () => {
        const { result } = renderHook(() => useAdminPanelPage());

        expect(result.current.activeView).toBe("users");
    });

    it("should change activeView to users when handleShowUsers is called", () => {
        const { result } = renderHook(() => useAdminPanelPage());

        act(() => {
            result.current.handleShowUsers();
        });

        expect(result.current.activeView).toBe("users");
        expect(result.current.selectedUser).toBe(null);
    });

    it("should set selectedUser and change activeView when handleSelectUser is called", () => {
        const { result } = renderHook(() => useAdminPanelPage());
        const selectedUser = {
            ...mockUser,
            id: "456",
            firstName: "Jane",
        };

        act(() => {
            result.current.handleSelectUser(selectedUser);
        });

        expect(result.current.selectedUser).toEqual(selectedUser);
        expect(result.current.activeView).toBe("userDetails");
    });

    it("should clear selectedUser and change activeView when handleCloseUserDetails is called", () => {
        const { result } = renderHook(() => useAdminPanelPage());
        const selectedUser = {
            ...mockUser,
            id: "456",
            firstName: "Jane",
        };

        act(() => {
            result.current.handleSelectUser(selectedUser);
        });

        expect(result.current.selectedUser).toEqual(selectedUser);

        act(() => {
            result.current.handleCloseUserDetails();
        });

        expect(result.current.selectedUser).toBe(null);
        expect(result.current.activeView).toBe("users");
    });

    it("should change activeView to schedule when handleShowSchedule is called", () => {
        const { result } = renderHook(() => useAdminPanelPage());

        act(() => {
            result.current.handleShowSchedule();
        });

        expect(result.current.activeView).toBe("schedule");
        expect(result.current.selectedUser).toBe(null);
    });

    it("should handle loading state", () => {
        jest.mocked(useGetUserHook.useGetUser).mockReturnValue({
            user: undefined,
            isLoading: true,
            isSuccess: false,
            isError: false,
            refetch: jest.fn(),
        });

        const { result } = renderHook(() => useAdminPanelPage());

        expect(result.current.isLoadingUser).toBe(true);
    });
});
