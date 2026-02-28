import { Lock, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./UserActionsSection.module.css";

export interface UserActionsSectionProps {
    onChangePassword: () => void;
    onDeleteUser: () => void;
    canDeleteUser?: boolean;
}

export const UserActionsSection = ({
    onChangePassword,
    onDeleteUser,
    canDeleteUser = true,
}: UserActionsSectionProps) => {
    const { t } = useTranslation("common");

    return (
        <div className={styles.section}>
            <h2 className={styles.title}>{t("admin.actions")}</h2>
            <div className={styles.actions}>
                <button className={styles.actionButton} onClick={onChangePassword} type="button">
                    <Lock size={20} />
                    <span>{t("admin.changePassword")}</span>
                </button>
                {canDeleteUser && (
                    <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={onDeleteUser}
                        type="button"
                    >
                        <Trash2 size={20} />
                        <span>{t("admin.deleteUser")}</span>
                    </button>
                )}
            </div>
        </div>
    );
};
