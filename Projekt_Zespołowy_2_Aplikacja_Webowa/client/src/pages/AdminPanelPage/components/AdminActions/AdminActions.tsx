import { Users, Calendar, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ADMIN_VIEW } from "../../../../constants/constants";
import styles from "./AdminActions.module.css";

export interface AdminActionsProps {
    activeView: "users" | "userDetails" | "schedule" | "payments";
    onShowUsers: () => void;
    onShowSchedule: () => void;
    onShowPayments: () => void;
}

export const AdminActions = ({ activeView, onShowUsers, onShowSchedule, onShowPayments }: AdminActionsProps) => {
    const { t } = useTranslation("common");

    return (
        <div className={styles.column}>
            <nav className={styles.actions}>
                <button
                    className={`${styles.actionButton} ${activeView === ADMIN_VIEW.USERS ? styles.actionButtonActive : ""}`}
                    onClick={onShowUsers}
                >
                    <Users size={20} />
                    <span>{t("admin.users")}</span>
                </button>
                <button
                    className={`${styles.actionButton} ${activeView === ADMIN_VIEW.SCHEDULE ? styles.actionButtonActive : ""}`}
                    onClick={onShowSchedule}
                >
                    <Calendar size={20} />
                    <span>{t("admin.schedule")}</span>
                </button>
                <button
                    className={`${styles.actionButton} ${activeView === ADMIN_VIEW.PAYMENTS ? styles.actionButtonActive : ""}`}
                    onClick={onShowPayments}
                >
                    <CreditCard size={20} />
                    <span>{t("admin.payments")}</span>
                </button>
            </nav>
        </div>
    );
};
