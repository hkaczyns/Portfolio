import { useMemo } from "react";
import { Spinner } from "../../components/Spinner/Spinner";
import { useAccountPage } from "./hooks/useAccountPage";
import { AccountActions } from "./components/AccountActions/AccountActions";
import { AccountDetailsSection } from "./components/AccountDetailsSection/AccountDetailsSection";
import { ChangePasswordSection } from "./components/ChangePasswordSection/ChangePasswordSection";
import { ChangeEmailSection } from "./components/ChangeEmailSection/ChangeEmailSection";
import { DeleteAccountModal } from "./components/DeleteAccountModal/DeleteAccountModal";
import styles from "./AccountPage.module.css";

export const AccountPage = () => {
    const {
        user,
        isLoadingUser,
        isUpdating,
        handleLogout,
        handleChangePassword,
        handleChangeEmail,
        handleCancelForm,
        handleChangePasswordSubmit,
        handleChangeEmailSubmit,
        activeView,
        fullName,
        roleLabel,
        isDeleteModalOpen,
        handleOpenDeleteModal,
        handleCloseDeleteModal,
    } = useAccountPage();

    const renderSection = useMemo(() => {
        if (activeView === "changePassword") {
            return (
                <ChangePasswordSection
                    onSubmit={handleChangePasswordSubmit}
                    onCancel={handleCancelForm}
                    isLoading={isUpdating}
                />
            );
        }

        if (activeView === "changeEmail") {
            return (
                <ChangeEmailSection
                    currentEmail={user?.email || ""}
                    onSubmit={handleChangeEmailSubmit}
                    onCancel={handleCancelForm}
                    isLoading={isUpdating}
                />
            );
        }

        if (user) {
            return <AccountDetailsSection user={user} />;
        }

        return null;
    }, [activeView, user, handleChangePasswordSubmit, handleChangeEmailSubmit, handleCancelForm, isUpdating]);

    if (isLoadingUser || !user) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <Spinner size={60} />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={styles.container}>
                <div className={styles.content}>{renderSection}</div>
                <div className={styles.actions}>
                    <AccountActions
                        fullName={fullName}
                        roleLabel={roleLabel}
                        userRole={user?.role}
                        activeView={activeView}
                        onShowDetails={handleCancelForm}
                        onLogout={handleLogout}
                        onDeleteAccount={handleOpenDeleteModal}
                        onChangePassword={handleChangePassword}
                        onChangeEmail={handleChangeEmail}
                    />
                </div>
            </div>
            <DeleteAccountModal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} />
        </>
    );
};
