import { renderHook, act } from "@testing-library/react";
import { useUsersList } from "./useUsersList";
import * as adminApi from "../../../store/admin/api";
import { UserRole } from "../../../store/auth/types";

jest.mock("../../../store/admin/api");

describe("useUsersList", () => {
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
            isActive: true,
            isSuperuser: false,
            isVerified: true,
            role: UserRole.INSTRUCTOR,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(adminApi.useListUsersQuery).mockReturnValue({
            data: mockUsers,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
    });

    it("should return all required properties", () => {
        const { result } = renderHook(() => useUsersList());

        expect(result.current).toHaveProperty("users");
        expect(result.current).toHaveProperty("isLoading");
        expect(result.current).toHaveProperty("isError");
        expect(result.current).toHaveProperty("error");
        expect(result.current).toHaveProperty("page");
        expect(result.current).toHaveProperty("pageSize");
        expect(result.current).toHaveProperty("search");
        expect(result.current).toHaveProperty("roleFilter");
        expect(result.current).toHaveProperty("isActiveFilter");
        expect(result.current).toHaveProperty("sortBy");
        expect(result.current).toHaveProperty("sortOrder");
        expect(result.current).toHaveProperty("handlePageChange");
        expect(result.current).toHaveProperty("handlePageSizeChange");
        expect(result.current).toHaveProperty("handleSearchChange");
        expect(result.current).toHaveProperty("handleRoleFilterChange");
        expect(result.current).toHaveProperty("handleIsActiveFilterChange");
        expect(result.current).toHaveProperty("handleSortChange");
        expect(result.current).toHaveProperty("clearFilters");
        expect(result.current).toHaveProperty("hasActiveFilters");
    });

    it("should have default values", () => {
        const { result } = renderHook(() => useUsersList());

        expect(result.current.page).toBe(1);
        expect(result.current.pageSize).toBe(20);
        expect(result.current.search).toBe("");
        expect(result.current.roleFilter).toBeUndefined();
        expect(result.current.isActiveFilter).toBeUndefined();
        expect(result.current.sortBy).toBe("last_name");
        expect(result.current.sortOrder).toBe("asc");
    });

    it("should return users from query", () => {
        const { result } = renderHook(() => useUsersList());

        expect(result.current.users).toEqual(mockUsers);
    });

    it("should change page when handlePageChange is called", () => {
        const { result } = renderHook(() => useUsersList());

        act(() => {
            result.current.handlePageChange(2);
        });

        expect(result.current.page).toBe(2);
    });

    it("should change pageSize and reset page to 1 when handlePageSizeChange is called", () => {
        const { result } = renderHook(() => useUsersList());

        act(() => {
            result.current.handlePageChange(3);
        });

        act(() => {
            result.current.handlePageSizeChange(50);
        });

        expect(result.current.pageSize).toBe(50);
        expect(result.current.page).toBe(1);
    });

    it("should change search and reset page to 1 when handleSearchChange is called", () => {
        const { result } = renderHook(() => useUsersList());

        act(() => {
            result.current.handlePageChange(2);
        });

        act(() => {
            result.current.handleSearchChange("test");
        });

        expect(result.current.search).toBe("test");
        expect(result.current.page).toBe(1);
    });

    it("should change roleFilter and reset page to 1 when handleRoleFilterChange is called", () => {
        const { result } = renderHook(() => useUsersList());

        act(() => {
            result.current.handlePageChange(2);
        });

        act(() => {
            result.current.handleRoleFilterChange(UserRole.STUDENT);
        });

        expect(result.current.roleFilter).toBe(UserRole.STUDENT);
        expect(result.current.page).toBe(1);
    });

    it("should change isActiveFilter and reset page to 1 when handleIsActiveFilterChange is called", () => {
        const { result } = renderHook(() => useUsersList());

        act(() => {
            result.current.handlePageChange(2);
        });

        act(() => {
            result.current.handleIsActiveFilterChange(true);
        });

        expect(result.current.isActiveFilter).toBe(true);
        expect(result.current.page).toBe(1);
    });

    it("should toggle sortOrder when handleSortChange is called with same sortBy", () => {
        const { result } = renderHook(() => useUsersList());

        expect(result.current.sortOrder).toBe("asc");

        act(() => {
            result.current.handleSortChange("last_name");
        });

        expect(result.current.sortOrder).toBe("desc");

        act(() => {
            result.current.handleSortChange("last_name");
        });

        expect(result.current.sortOrder).toBe("asc");
    });

    it("should change sortBy and reset sortOrder to asc when handleSortChange is called with different sortBy", () => {
        const { result } = renderHook(() => useUsersList());

        act(() => {
            result.current.handleSortChange("last_name");
        });

        expect(result.current.sortOrder).toBe("desc");

        act(() => {
            result.current.handleSortChange("first_name");
        });

        expect(result.current.sortBy).toBe("first_name");
        expect(result.current.sortOrder).toBe("asc");
    });

    it("should clear all filters when clearFilters is called", () => {
        const { result } = renderHook(() => useUsersList());

        act(() => {
            result.current.handleSearchChange("test");
            result.current.handleRoleFilterChange(UserRole.STUDENT);
            result.current.handleIsActiveFilterChange(true);
            result.current.handlePageChange(3);
        });

        act(() => {
            result.current.clearFilters();
        });

        expect(result.current.search).toBe("");
        expect(result.current.roleFilter).toBeUndefined();
        expect(result.current.isActiveFilter).toBeUndefined();
        expect(result.current.page).toBe(1);
    });

    it("should return hasActiveFilters as true when filters are active", () => {
        const { result } = renderHook(() => useUsersList());

        act(() => {
            result.current.handleSearchChange("test");
        });

        expect(result.current.hasActiveFilters).toBe(true);
    });

    it("should return hasActiveFilters as false when no filters are active", () => {
        const { result } = renderHook(() => useUsersList());

        expect(result.current.hasActiveFilters).toBe(false);
    });

    it("should call useListUsersQuery with correct parameters", () => {
        renderHook(() => useUsersList());

        expect(adminApi.useListUsersQuery).toHaveBeenCalledWith({
            page: 1,
            page_size: 20,
            search: undefined,
            role: undefined,
            is_active: undefined,
            sort_by: "last_name",
            sort_order: "asc",
        });
    });

    it("should call useListUsersQuery with updated parameters when filters change", () => {
        const { result } = renderHook(() => useUsersList());

        act(() => {
            result.current.handleSearchChange("test");
            result.current.handleRoleFilterChange(UserRole.STUDENT);
            result.current.handleIsActiveFilterChange(true);
        });

        expect(adminApi.useListUsersQuery).toHaveBeenCalledWith({
            page: 1,
            page_size: 20,
            search: "test",
            role: UserRole.STUDENT,
            is_active: true,
            sort_by: "last_name",
            sort_order: "asc",
        });
    });
});
