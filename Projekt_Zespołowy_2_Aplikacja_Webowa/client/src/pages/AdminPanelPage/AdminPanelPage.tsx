import { useMemo } from "react";
import { Spinner } from "../../components/Spinner/Spinner";
import { useAdminPanelPage } from "./hooks/useAdminPanelPage";
import { ADMIN_VIEW } from "../../constants/constants";
import { AdminActions } from "./components/AdminActions/AdminActions";
import { UsersList } from "./components/UsersList/UsersList";
import { UserDetails } from "./components/UserDetails/UserDetails";
import { ScheduleManagement } from "./components/ScheduleManagement/ScheduleManagement";
import { PaymentsManagement } from "./components/PaymentsManagement/PaymentsManagement";
import styles from "./AdminPanelPage.module.css";

export const AdminPanelPage = () => {
    const {
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
    } = useAdminPanelPage();

    const renderSection = useMemo(() => {
        if (activeView === ADMIN_VIEW.USER_DETAILS && selectedUser) {
            return <UserDetails user={selectedUser} onClose={handleCloseUserDetails} onUserUpdate={handleUserUpdate} />;
        }

        if (activeView === ADMIN_VIEW.USERS) {
            return <UsersList onSelectUser={handleSelectUser} />;
        }

        if (activeView === ADMIN_VIEW.SCHEDULE) {
            return <ScheduleManagement />;
        }

        if (activeView === ADMIN_VIEW.PAYMENTS) {
            return <PaymentsManagement />;
        }

        return null;
    }, [activeView, selectedUser, handleCloseUserDetails, handleUserUpdate, handleSelectUser]);

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
        <div className={styles.container}>
            <div className={styles.content}>{renderSection}</div>
            <div className={styles.actions}>
                <AdminActions
                    activeView={activeView}
                    onShowUsers={handleShowUsers}
                    onShowSchedule={handleShowSchedule}
                    onShowPayments={handleShowPayments}
                />
            </div>
        </div>
    );
};
