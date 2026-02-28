import { useState, useCallback, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUpdateUserMutation, useDeleteUserMutation } from "../../../../store/admin/api";
import { useAlert } from "../../../../components/Alert/AlertContext";
import { useGetUser } from "../../../../store/auth/api/useGetUser";
import { UserDetailsSection } from "../UserDetailsSection/UserDetailsSection";
import { UserActionsSection } from "../UserActionsSection/UserActionsSection";
import { UserActivitySection } from "../UserActivitySection/UserActivitySection";
import { ChangeUserPasswordModal } from "../ChangeUserPasswordModal/ChangeUserPasswordModal";
import { DeleteUserModal } from "../DeleteUserModal/DeleteUserModal";
import { UserRole } from "../../../../store/auth/types";
import type { UserResponse } from "../../../../store/auth/types";
import styles from "./UserDetails.module.css";

export interface UserDetailsProps {
    user: UserResponse;
    onClose: () => void;
    onUserUpdate?: (updatedUser: UserResponse) => void;
}

export const UserDetails = ({ user, onClose, onUserUpdate }: UserDetailsProps) => {
    const { t } = useTranslation("common");
    const { user: currentUser } = useGetUser();
    const [updateUser, { isLoading: isUpdatingPassword }] = useUpdateUserMutation();
    const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutation();
    const { publish } = useAlert();
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);

    const canDeleteUser = currentUser && currentUser.id !== user.id && user.role !== UserRole.INSTRUCTOR;

    const handleChangePassword = useCallback(
        async (password: string) => {
            try {
                await updateUser({ userId: user.id, password }).unwrap();
                publish(t("admin.userPasswordUpdateSuccess"), "success");
                setIsChangePasswordModalOpen(false);
            } catch {
                publish(t("admin.userPasswordUpdateError"), "error");
            }
        },
        [user.id, updateUser, publish, t],
    );

    const handleDeleteUser = useCallback(async () => {
        try {
            await deleteUser(user.id).unwrap();
            publish(t("admin.userDeleteSuccess"), "success");
            setIsDeleteUserModalOpen(false);
            onClose();
        } catch {
            publish(t("admin.userDeleteError"), "error");
        }
    }, [user.id, deleteUser, publish, t, onClose]);

    const userName = useMemo(
        () => `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
        [user.firstName, user.lastName, user.email],
    );

    const handleOpenChangePasswordModal = useCallback(() => {
        setIsChangePasswordModalOpen(true);
    }, []);

    const handleOpenDeleteUserModal = useCallback(() => {
        setIsDeleteUserModalOpen(true);
    }, []);

    const handleCloseChangePasswordModal = useCallback(() => {
        setIsChangePasswordModalOpen(false);
    }, []);

    const handleCloseDeleteUserModal = useCallback(() => {
        setIsDeleteUserModalOpen(false);
    }, []);

    return (
        <>
            <div className={styles.container}>
                <button className={styles.backButton} onClick={onClose}>
                    <ArrowLeft size={20} />
                    <span>{t("admin.backToUsers")}</span>
                </button>
                <div className={styles.content}>
                    <div className={styles.sectionsContainer}>
                        <div className={styles.topSections}>
                            <UserDetailsSection user={user} onUserUpdate={onUserUpdate} />
                            <UserActionsSection
                                onChangePassword={handleOpenChangePasswordModal}
                                onDeleteUser={handleOpenDeleteUserModal}
                                canDeleteUser={canDeleteUser}
                            />
                        </div>
                        <UserActivitySection user={user} />
                    </div>
                </div>
            </div>
            <ChangeUserPasswordModal
                isOpen={isChangePasswordModalOpen}
                onClose={handleCloseChangePasswordModal}
                onSubmit={handleChangePassword}
                isLoading={isUpdatingPassword}
            />
            <DeleteUserModal
                isOpen={isDeleteUserModalOpen}
                onClose={handleCloseDeleteUserModal}
                onConfirm={handleDeleteUser}
                userName={userName}
                isLoading={isDeletingUser}
            />
        </>
    );
};
