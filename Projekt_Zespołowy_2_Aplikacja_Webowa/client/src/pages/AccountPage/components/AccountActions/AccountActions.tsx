import { User, LogOut, Trash2, Lock, Mail, FileText, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { UserRole } from "../../../../store/auth/types";
import styles from "./AccountActions.module.css";

export interface AccountActionsProps {
    fullName: string;
    roleLabel: string;
    userRole?: UserRole;
    activeView: "details" | "changePassword" | "changeEmail";
    onShowDetails: () => void;
    onLogout: () => void;
    onDeleteAccount: () => void;
    onChangePassword: () => void;
    onChangeEmail: () => void;
}

export const AccountActions = ({
    fullName,
    roleLabel,
    userRole,
    activeView,
    onShowDetails,
    onLogout,
    onDeleteAccount,
    onChangePassword,
    onChangeEmail,
}: AccountActionsProps) => {
    const { t, i18n } = useTranslation("common");
    const currentLanguage = i18n.language || "pl";

    const canDeleteAccount = userRole !== UserRole.ADMIN && userRole !== UserRole.INSTRUCTOR;

    return (
        <div className={styles.column}>
            <div className={styles.avatarSection}>
                <div className={styles.avatar}>
                    <User size={64} />
                </div>
                <div className={styles.userInfo}>
                    <div className={styles.fullName}>{fullName}</div>
                    <div className={styles.role}>{roleLabel}</div>
                </div>
            </div>
            <nav className={styles.actions}>
                <button
                    className={`${styles.actionButton} ${activeView === "details" ? styles.actionButtonActive : ""}`}
                    onClick={onShowDetails}
                >
                    <FileText size={20} />
                    <span>{t("account.title")}</span>
                </button>
                <button
                    className={`${styles.actionButton} ${activeView === "changeEmail" ? styles.actionButtonActive : ""}`}
                    onClick={onChangeEmail}
                >
                    <Mail size={20} />
                    <span>{t("account.changeEmail")}</span>
                </button>
                <button
                    className={`${styles.actionButton} ${activeView === "changePassword" ? styles.actionButtonActive : ""}`}
                    onClick={onChangePassword}
                >
                    <Lock size={20} />
                    <span>{t("account.changePassword")}</span>
                </button>
                <div className={styles.separator} />
                <div className={styles.languageSection}>
                    <div className={styles.languageInfo}>
                        <Globe size={20} />
                        <span>{t("settings.language")}</span>
                    </div>
                    <div className={styles.languageToggle}>
                        <button
                            type="button"
                            className={`${styles.languageOption} ${currentLanguage === "pl" ? styles.languageOptionActive : ""}`}
                            onClick={() => i18n.changeLanguage("pl")}
                        >
                            PL
                        </button>
                        <button
                            type="button"
                            className={`${styles.languageOption} ${currentLanguage === "en" ? styles.languageOptionActive : ""}`}
                            onClick={() => i18n.changeLanguage("en")}
                        >
                            ENG
                        </button>
                    </div>
                </div>
                <div className={styles.separator} />
                <button className={styles.actionButton} onClick={onLogout}>
                    <LogOut size={20} />
                    <span>{t("sidebar.logout")}</span>
                </button>
                {canDeleteAccount && (
                    <button className={styles.actionButton} onClick={onDeleteAccount}>
                        <Trash2 size={20} />
                        <span>{t("account.deleteAccount")}</span>
                    </button>
                )}
            </nav>
        </div>
    );
};
