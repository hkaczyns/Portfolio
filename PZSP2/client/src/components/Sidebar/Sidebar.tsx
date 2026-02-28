import {
    Menu,
    X,
    User,
    LogOut,
    UserCircle,
    Calendar,
    Clock,
    Receipt,
    Shield,
    ClipboardCheck,
    LayoutDashboard,
} from "lucide-react";
import { useSidebar } from "./hooks/useSidebar";
import styles from "./Sidebar.module.css";

export interface SidebarProps {
    isExpanded: boolean;
    onToggle: () => void;
}

export const Sidebar = ({ isExpanded, onToggle }: SidebarProps) => {
    const { fullName, roleLabel, handleLogout, isActive, handleNavClick, isAdmin, isStudent, isInstructor, t } =
        useSidebar();

    return (
        <>
            {isExpanded && <div className={styles.overlay} onClick={onToggle} />}
            <aside className={`${styles.sidebar} ${isExpanded ? styles.sidebarExpanded : styles.sidebarCollapsed}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.headerContent}>
                        {isExpanded && fullName && (
                            <div className={styles.userSection}>
                                <div className={styles.userAvatar}>
                                    <User size={20} />
                                </div>
                                <div className={styles.userInfo}>
                                    <div className={styles.userName}>{fullName}</div>
                                    <div className={styles.userRole}>{roleLabel}</div>
                                </div>
                            </div>
                        )}
                        <button className={styles.toggleButton} onClick={onToggle}>
                            {isExpanded ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                <div className={styles.sidebarContent}>
                    <div className={styles.separator} />

                    <nav className={styles.nav}>
                        <ul>
                            <li>
                                <button
                                    className={`${styles.navLink} ${isActive("/dashboard") && styles.navLinkActive}`}
                                    onClick={() => handleNavClick("/dashboard")}
                                >
                                    <LayoutDashboard size={20} />
                                    {isExpanded && <span>Dashboard</span>}
                                </button>
                            </li>
                            {isStudent && (
                                <li>
                                    <button
                                        className={`${styles.navLink} ${isActive("/classes") && styles.navLinkActive}`}
                                        onClick={() => handleNavClick("/classes")}
                                    >
                                        <Calendar size={20} />
                                        {isExpanded && <span>{t("sidebar.calendar")}</span>}
                                    </button>
                                </li>
                            )}
                            {isStudent && (
                                <li>
                                    <button
                                        className={`${styles.navLink} ${isActive("/my-schedule") && styles.navLinkActive}`}
                                        onClick={() => handleNavClick("/my-schedule")}
                                    >
                                        <Clock size={20} />
                                        {isExpanded && <span>{t("sidebar.mySchedule")}</span>}
                                    </button>
                                </li>
                            )}
                            {isStudent && (
                                <li>
                                    <button
                                        className={`${styles.navLink} ${isActive("/billing") && styles.navLinkActive}`}
                                        onClick={() => handleNavClick("/billing")}
                                    >
                                        <Receipt size={20} />
                                        {isExpanded && <span>Moje rozliczenia</span>}
                                    </button>
                                </li>
                            )}
                            {isStudent && (
                                <li>
                                    <button
                                        className={`${styles.navLink} ${isActive("/attendance") && styles.navLinkActive}`}
                                        onClick={() => handleNavClick("/attendance")}
                                    >
                                        <ClipboardCheck size={20} />
                                        {isExpanded && <span>Obecności</span>}
                                    </button>
                                </li>
                            )}
                            {isInstructor && (
                                <li>
                                    <button
                                        className={`${styles.navLink} ${isActive("/my-classes") && styles.navLinkActive}`}
                                        onClick={() => handleNavClick("/my-classes")}
                                    >
                                        <Calendar size={20} />
                                        {isExpanded && <span>Moje zajęcia</span>}
                                    </button>
                                </li>
                            )}
                            <li>
                                <button
                                    className={`${styles.navLink} ${isActive("/account") && styles.navLinkActive}`}
                                    onClick={() => handleNavClick("/account")}
                                >
                                    <UserCircle size={20} />
                                    {isExpanded && <span>{t("sidebar.account")}</span>}
                                </button>
                            </li>
                            {isAdmin && (
                                <li>
                                    <button
                                        className={`${styles.navLink} ${isActive("/admin") && styles.navLinkActive}`}
                                        onClick={() => handleNavClick("/admin")}
                                    >
                                        <Shield size={20} />
                                        {isExpanded && <span>{t("sidebar.adminPanel")}</span>}
                                    </button>
                                </li>
                            )}
                        </ul>
                    </nav>

                    <div className={styles.separator} />

                    <nav className={styles.nav}>
                        <ul>
                            <li>
                                <button className={styles.navLink} onClick={handleLogout}>
                                    <LogOut size={20} />
                                    {isExpanded && <span>{t("sidebar.logout")}</span>}
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </aside>
        </>
    );
};
