import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { getRoleLabel } from "../../../utils/userRole";
import { useLogout } from "../../../store/auth/api/useLogout";
import { useGetUser } from "../../../store/auth/api/useGetUser";
import { useAppSelector } from "../../../store/store";
import {
    selectIsAdmin,
    selectIsStudent,
    selectIsInstructor,
    selectUserRole,
    selectFullName,
} from "../../../store/auth/selectors";
import { UserRole } from "../../../store/auth/types";

export const useSidebar = () => {
    const { t } = useTranslation("common");
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useGetUser();
    const { logout } = useLogout();

    const isStudent = useAppSelector(selectIsStudent);
    const isInstructor = useAppSelector(selectIsInstructor);
    const isAdminFromSelector = useAppSelector(selectIsAdmin);
    const roleFromSelector = useAppSelector(selectUserRole);
    const fullNameFromSelector = useAppSelector(selectFullName);

    const fullName = useMemo(() => {
        return fullNameFromSelector || (user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : undefined);
    }, [fullNameFromSelector, user]);

    const role = useMemo(() => {
        return roleFromSelector || user?.role;
    }, [roleFromSelector, user?.role]);

    const isAdmin = useMemo(() => {
        return isAdminFromSelector || role === UserRole.ADMIN;
    }, [isAdminFromSelector, role]);

    const roleLabel = getRoleLabel(role, t);

    const handleLogout = useCallback(async () => {
        await logout();
    }, [logout]);

    const isActive = useCallback(
        (path: string) => {
            return location.pathname === path;
        },
        [location.pathname],
    );

    const handleNavClick = useCallback(
        (path: string) => {
            navigate(path);
        },
        [navigate],
    );

    return {
        fullName,
        roleLabel,
        handleLogout,
        isActive,
        handleNavClick,
        isAdmin,
        isStudent,
        isInstructor,
        t,
    };
};
