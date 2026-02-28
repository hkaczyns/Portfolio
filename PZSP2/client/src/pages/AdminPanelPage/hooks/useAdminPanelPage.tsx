import { useState, useCallback } from "react";
import { useGetUser } from "../../../store/auth/api/useGetUser";
import type { UserResponse } from "../../../store/auth/types";
import { ADMIN_VIEW } from "../../../constants/constants";

type ActiveView = "users" | "userDetails" | "schedule" | "payments";

export const useAdminPanelPage = () => {
    const { user, isLoading: isLoadingUser } = useGetUser();
    const [activeView, setActiveView] = useState<ActiveView>(ADMIN_VIEW.USERS);
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

    const handleShowUsers = useCallback(() => {
        setActiveView(ADMIN_VIEW.USERS);
        setSelectedUser(null);
    }, []);

    const handleShowSchedule = useCallback(() => {
        setActiveView(ADMIN_VIEW.SCHEDULE);
        setSelectedUser(null);
    }, []);

    const handleShowPayments = useCallback(() => {
        setActiveView(ADMIN_VIEW.PAYMENTS);
        setSelectedUser(null);
    }, []);

    const handleSelectUser = useCallback((user: UserResponse) => {
        setSelectedUser(user);
        setActiveView(ADMIN_VIEW.USER_DETAILS);
    }, []);

    const handleCloseUserDetails = useCallback(() => {
        setSelectedUser(null);
        setActiveView(ADMIN_VIEW.USERS);
    }, []);

    const handleUserUpdate = useCallback((updatedUser: UserResponse) => {
        setSelectedUser(updatedUser);
    }, []);

    return {
        user,
        isLoadingUser,
        activeView,
        selectedUser,
        handleShowUsers,
        handleShowSchedule,
        handleShowPayments,
        handleSelectUser,
        handleCloseUserDetails,
        handleUserUpdate,
    };
};
