import { useCallback } from "react";
import { Search, ChevronUp, ChevronDown, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUsersList } from "../../hooks/useUsersList";
import { UserRole, type UserResponse } from "../../../../store/auth/types";
import { getRoleLabel } from "../../../../utils/userRole";
import styles from "./UsersList.module.css";

export interface UsersListProps {
    onSelectUser: (user: UserResponse) => void;
}

export const UsersList = ({ onSelectUser }: UsersListProps) => {
    const { t } = useTranslation("common");
    const {
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
    } = useUsersList();

    const handleSort = useCallback(
        (field: string) => {
            handleSortChange(field);
        },
        [handleSortChange],
    );

    const renderSortIcon = useCallback(
        (field: string) => {
            if (sortBy !== field) return null;
            return sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
        },
        [sortBy, sortOrder],
    );

    return (
        <div className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>{t("admin.users")}</h2>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchContainer}>
                    <div className={styles.searchInputWrapper}>
                        <Search size={20} className={styles.searchIcon} />
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder={t("admin.searchUsers")}
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.filterGroup}>
                    <select
                        className={styles.filterSelect}
                        value={roleFilter || ""}
                        onChange={(e) =>
                            handleRoleFilterChange(e.target.value ? (e.target.value as UserRole) : undefined)
                        }
                    >
                        <option value="">{t("admin.allRoles")}</option>
                        <option value={UserRole.STUDENT}>{t("roles.student")}</option>
                        <option value={UserRole.INSTRUCTOR}>{t("roles.instructor")}</option>
                        <option value={UserRole.ADMIN}>{t("roles.admin")}</option>
                    </select>

                    <select
                        className={styles.filterSelect}
                        value={isActiveFilter === undefined ? "" : String(isActiveFilter)}
                        onChange={(e) =>
                            handleIsActiveFilterChange(e.target.value === "" ? undefined : e.target.value === "true")
                        }
                    >
                        <option value="">{t("admin.allStatuses")}</option>
                        <option value="true">{t("admin.active")}</option>
                        <option value="false">{t("admin.inactive")}</option>
                    </select>

                    {hasActiveFilters && (
                        <button className={styles.clearFiltersButton} onClick={clearFilters}>
                            <X size={16} />
                            {t("admin.clearFilters")}
                        </button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className={styles.loading}>{t("admin.loading")}</div>
            ) : isError ? (
                <div className={styles.error}>
                    {t("admin.errorLoadingUsers")}
                    {error && "data" in error && error.data && typeof error.data === "object" && "detail" in error.data
                        ? `: ${error.data.detail}`
                        : ""}
                </div>
            ) : (
                <>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>
                                        <button className={styles.sortButton} onClick={() => handleSort("first_name")}>
                                            {t("firstName")}
                                            {renderSortIcon("first_name")}
                                        </button>
                                    </th>
                                    <th className={styles.th}>
                                        <button className={styles.sortButton} onClick={() => handleSort("last_name")}>
                                            {t("lastName")}
                                            {renderSortIcon("last_name")}
                                        </button>
                                    </th>
                                    <th className={styles.th}>
                                        <button className={styles.sortButton} onClick={() => handleSort("email")}>
                                            {t("email")}
                                            {renderSortIcon("email")}
                                        </button>
                                    </th>
                                    <th className={styles.th}>{t("admin.role")}</th>
                                    <th className={styles.th}>{t("admin.status")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className={styles.noData}>
                                            {t("admin.noUsersFound")}
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className={`${styles.tr} ${styles.trClickable}`}
                                            onClick={() => onSelectUser(user)}
                                        >
                                            <td className={styles.td}>{user.firstName || "-"}</td>
                                            <td className={styles.td}>{user.lastName || "-"}</td>
                                            <td className={styles.td}>{user.email}</td>
                                            <td className={styles.td}>{getRoleLabel(user.role, t)}</td>
                                            <td className={styles.td}>
                                                <span
                                                    className={
                                                        user.isVerified ? styles.statusActive : styles.statusInactive
                                                    }
                                                >
                                                    {user.isVerified ? t("admin.active") : t("admin.inactive")}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.pagination}>
                        <div className={styles.paginationInfo}>
                            <span>{t("admin.showing")}</span>
                            <select
                                className={styles.pageSizeSelect}
                                value={pageSize}
                                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span>{t("admin.perPage")}</span>
                        </div>

                        <div className={styles.paginationControls}>
                            <button
                                className={styles.paginationButton}
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                            >
                                {t("admin.previous")}
                            </button>
                            <span className={styles.pageNumber}>{page}</span>
                            <button
                                className={styles.paginationButton}
                                onClick={() => handlePageChange(page + 1)}
                                disabled={users.length < pageSize}
                            >
                                {t("admin.next")}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
