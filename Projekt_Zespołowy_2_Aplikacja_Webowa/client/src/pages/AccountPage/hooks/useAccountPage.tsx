import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetUser } from "../../../store/auth/api/useGetUser";
import { useUpdateUser } from "../../../store/auth/api/useUpdateUser";
import { useLogout } from "../../../store/auth/api/useLogout";
import { useAlert } from "../../../components/Alert/AlertContext";
import { getRoleLabel } from "../../../utils/userRole";
import type { ChangePasswordFormValues, ChangeEmailFormValues } from "../../../store/auth/types";

type ActiveView = "details" | "changePassword" | "changeEmail";

export const useAccountPage = () => {
    const { user, isLoading: isLoadingUser, refetch } = useGetUser();
    const { updateUser, isLoading: isUpdating } = useUpdateUser();
    const { logout } = useLogout();
    const { publish } = useAlert();
    const { t } = useTranslation("common");
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState<ActiveView>("details");

    const fullName = useMemo(() => {
        return user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "";
    }, [user]);

    const roleLabel = useMemo(() => {
        return getRoleLabel(user?.role, t);
    }, [user?.role, t]);

    const handleLogout = useCallback(async () => {
        await logout();
        navigate("/login");
    }, [logout, navigate]);

    const handleChangePassword = useCallback(() => {
        setActiveView("changePassword");
    }, []);

    const handleChangeEmail = useCallback(() => {
        setActiveView("changeEmail");
    }, []);

    const handleCancelForm = useCallback(() => {
        setActiveView("details");
    }, []);

    const handleChangePasswordSubmit = useCallback(
        async (values: ChangePasswordFormValues) => {
            if (!user) return;

            const result = await updateUser({
                password: values.password,
                currentPassword: values.currentPassword,
            });

            if (result) {
                publish(t("account.updateSuccess"), "success");
                setActiveView("details");
            }
        },
        [user, updateUser, publish, t],
    );

    const handleChangeEmailSubmit = useCallback(
        async (values: ChangeEmailFormValues) => {
            if (!user) return;

            const result = await updateUser({
                email: values.email,
                currentPassword: values.currentPassword,
            });

            if (result) {
                await refetch();
                publish(t("account.emailChangeVerification"), "success");
                setActiveView("details");
            }
        },
        [user, updateUser, refetch, publish, t],
    );

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleOpenDeleteModal = useCallback(() => {
        setIsDeleteModalOpen(true);
    }, []);

    const handleCloseDeleteModal = useCallback(() => {
        setIsDeleteModalOpen(false);
    }, []);

    return {
        user,
        isLoadingUser,
        isUpdating,
        activeView,
        fullName,
        roleLabel,
        handleLogout,
        handleChangePassword,
        handleChangeEmail,
        handleCancelForm,
        handleChangePasswordSubmit,
        handleChangeEmailSubmit,
        isDeleteModalOpen,
        handleOpenDeleteModal,
        handleCloseDeleteModal,
    };
};
