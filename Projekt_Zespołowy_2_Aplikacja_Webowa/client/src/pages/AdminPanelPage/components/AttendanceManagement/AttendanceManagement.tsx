import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList, Calendar, Users } from "lucide-react";
import { ATTENDANCE_TAB } from "../../../../constants/constants";
import { SessionsAttendanceTab } from "./tabs/SessionsAttendanceTab";
import { GroupsAttendanceTab } from "./tabs/GroupsAttendanceTab";
import { StudentsAttendanceTab } from "./tabs/StudentsAttendanceTab";
import styles from "./AttendanceManagement.module.css";

type ActiveTab = "sessions" | "groups" | "students";

interface TabConfig {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
}

export const AttendanceManagement = () => {
    const { t } = useTranslation("common");
    const [activeTab, setActiveTab] = useState<ActiveTab>(ATTENDANCE_TAB.SESSIONS);

    const tabs: TabConfig[] = useMemo(
        () => [
            { id: ATTENDANCE_TAB.SESSIONS, label: t("admin.attendanceBySession"), icon: <Calendar size={20} /> },
            { id: ATTENDANCE_TAB.GROUPS, label: t("admin.attendanceByGroup"), icon: <Users size={20} /> },
            { id: ATTENDANCE_TAB.STUDENTS, label: t("admin.attendanceByStudent"), icon: <ClipboardList size={20} /> },
        ],
        [t],
    );

    const renderTabContent = useMemo(() => {
        switch (activeTab) {
            case ATTENDANCE_TAB.SESSIONS:
                return <SessionsAttendanceTab />;
            case ATTENDANCE_TAB.GROUPS:
                return <GroupsAttendanceTab />;
            case ATTENDANCE_TAB.STUDENTS:
                return <StudentsAttendanceTab />;
            default:
                return null;
        }
    }, [activeTab]);

    const handleTabChange = useCallback((tabId: ActiveTab) => {
        setActiveTab(tabId);
    }, []);

    return (
        <div className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>{t("admin.attendanceManagement")}</h2>
            </div>

            <div className={styles.tabs}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
                        onClick={() => handleTabChange(tab.id)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className={styles.tabContent}>{renderTabContent}</div>
        </div>
    );
};
