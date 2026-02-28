import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Building2, GraduationCap, BookOpen, Calendar, Users, Clock } from "lucide-react";
import { SCHEDULE_TAB } from "../../../../constants/constants";
import { RoomsTab } from "./tabs/RoomsTab";
import { SkillLevelsTab } from "./tabs/SkillLevelsTab";
import { TopicsTab } from "./tabs/TopicsTab";
import { SemestersTab } from "./tabs/SemestersTab";
import { ClassGroupsTab } from "./tabs/ClassGroupsTab";
import { SessionsTab } from "./tabs/SessionsTab";
import styles from "./ScheduleManagement.module.css";

type ActiveTab = "rooms" | "skillLevels" | "topics" | "semesters" | "classGroups" | "sessions";

interface TabConfig {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
}

export const ScheduleManagement = () => {
    const { t } = useTranslation("common");
    const [activeTab, setActiveTab] = useState<ActiveTab>(SCHEDULE_TAB.ROOMS);

    const tabs: TabConfig[] = useMemo(
        () => [
            { id: SCHEDULE_TAB.ROOMS, label: t("admin.rooms"), icon: <Building2 size={20} /> },
            { id: SCHEDULE_TAB.SKILL_LEVELS, label: t("admin.skillLevels"), icon: <GraduationCap size={20} /> },
            { id: SCHEDULE_TAB.TOPICS, label: t("admin.topics"), icon: <BookOpen size={20} /> },
            { id: SCHEDULE_TAB.SEMESTERS, label: t("admin.semesters"), icon: <Calendar size={20} /> },
            { id: SCHEDULE_TAB.CLASS_GROUPS, label: t("admin.classGroups"), icon: <Users size={20} /> },
            { id: SCHEDULE_TAB.SESSIONS, label: t("admin.sessions"), icon: <Clock size={20} /> },
        ],
        [t],
    );

    const renderTabContent = useMemo(() => {
        switch (activeTab) {
            case SCHEDULE_TAB.ROOMS:
                return <RoomsTab />;
            case SCHEDULE_TAB.SKILL_LEVELS:
                return <SkillLevelsTab />;
            case SCHEDULE_TAB.TOPICS:
                return <TopicsTab />;
            case SCHEDULE_TAB.SEMESTERS:
                return <SemestersTab />;
            case SCHEDULE_TAB.CLASS_GROUPS:
                return <ClassGroupsTab />;
            case SCHEDULE_TAB.SESSIONS:
                return <SessionsTab />;
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
                <h2 className={styles.title}>{t("admin.scheduleManagement")}</h2>
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
