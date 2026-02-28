import { useState, useCallback, useMemo } from "react";
import { useListUsersQuery } from "../../../store/admin/api";
import { UserRole } from "../../../store/auth/types";

const DEFAULT_PAGE_SIZE = 20;

export const useUsersList = () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<UserRole | undefined>(undefined);
    const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
    const [sortBy, setSortBy] = useState<string>("last_name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const {
        data: users = [],
        isLoading,
        isError,
        error,
    } = useListUsersQuery({
        page,
        page_size: pageSize,
        search: search || undefined,
        role: roleFilter,
        is_active: isActiveFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
    });

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handlePageSizeChange = useCallback((newPageSize: number) => {
        setPageSize(newPageSize);
        setPage(1);
    }, []);

    const handleSearchChange = useCallback((newSearch: string) => {
        setSearch(newSearch);
        setPage(1);
    }, []);

    const handleRoleFilterChange = useCallback((newRole: UserRole | undefined) => {
        setRoleFilter(newRole);
        setPage(1);
    }, []);

    const handleIsActiveFilterChange = useCallback((newIsActive: boolean | undefined) => {
        setIsActiveFilter(newIsActive);
        setPage(1);
    }, []);

    const handleSortChange = useCallback(
        (newSortBy: string) => {
            if (sortBy === newSortBy) {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            } else {
                setSortBy(newSortBy);
                setSortOrder("asc");
            }
        },
        [sortBy, sortOrder],
    );

    const clearFilters = useCallback(() => {
        setSearch("");
        setRoleFilter(undefined);
        setIsActiveFilter(undefined);
        setPage(1);
    }, []);

    const hasActiveFilters = useMemo(() => {
        return Boolean(search || roleFilter !== undefined || isActiveFilter !== undefined);
    }, [search, roleFilter, isActiveFilter]);

    return {
        users,
        isLoading,
        isError,
        error,
        page,
        pageSize,
        search,
        roleFilter,
        isActiveFilter,
        sortBy,
        sortOrder,
        handlePageChange,
        handlePageSizeChange,
        handleSearchChange,
        handleRoleFilterChange,
        handleIsActiveFilterChange,
        handleSortChange,
        clearFilters,
        hasActiveFilters,
    };
};
