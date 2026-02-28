import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList } from "lucide-react";
import {
    useListClassSessionsQuery,
    useListClassGroupsQuery,
    type ClassSessionRead,
} from "../../../../../store/admin/api";
import { ManageSessionAttendanceModal } from "../../ScheduleManagement/modals/ManageSessionAttendanceModal";
import { CLASS_SESSION_STATUS } from "../../../../../constants/constants";
import styles from "../TabContent.module.css";

export const SessionsAttendanceTab = () => {
    const { t } = useTranslation("common");
    const [selectedSession, setSelectedSession] = useState<ClassSessionRead | null>(null);

    const { data: sessions = [], isLoading } = useListClassSessionsQuery({});
    const { data: classGroups = [] } = useListClassGroupsQuery();

    const getClassGroupName = (id: number) => classGroups.find((cg) => cg.id === id)?.name || id;

    const getSessionStatusLabel = (status: string) => {
        switch (status) {
            case CLASS_SESSION_STATUS.SCHEDULED:
                return t("admin.sessionStatusScheduled");
            case CLASS_SESSION_STATUS.COMPLETED:
                return t("admin.sessionStatusCompleted");
            case CLASS_SESSION_STATUS.CANCELLED:
                return t("admin.sessionStatusCancelled");
            default:
                return status;
        }
    };

    if (isLoading) {
        return <div className={styles.loading}>{t("admin.loading")}</div>;
    }

    return (
        <>
            <div className={styles.header}>
                <h3 className={styles.sectionTitle}>{t("admin.attendanceBySession")}</h3>
            </div>

            {sessions.length === 0 ? (
                <div className={styles.empty}>{t("admin.noSessions")}</div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>{t("admin.classGroup")}</th>
                                <th className={styles.th}>{t("admin.date")}</th>
                                <th className={styles.th}>{t("admin.time")}</th>
                                <th className={styles.th}>{t("admin.status")}</th>
                                <th className={styles.th}>{t("admin.actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((session) => (
                                <tr key={session.id} className={styles.tr}>
                                    <td className={styles.td}>{getClassGroupName(session.classGroupId)}</td>
                                    <td className={styles.td}>{new Date(session.date).toLocaleDateString()}</td>
                                    <td className={styles.td}>
                                        {session.startTime} - {session.endTime}
                                    </td>
                                    <td className={styles.td}>
                                        <span className={styles.statusActive}>
                                            {getSessionStatusLabel(session.status)}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.actionButton}
                                                onClick={() => setSelectedSession(session)}
                                            >
                                                <ClipboardList size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedSession && (
                <ManageSessionAttendanceModal
                    isOpen={!!selectedSession}
                    onClose={() => setSelectedSession(null)}
                    classSession={selectedSession}
                />
            )}
        </>
    );
};
