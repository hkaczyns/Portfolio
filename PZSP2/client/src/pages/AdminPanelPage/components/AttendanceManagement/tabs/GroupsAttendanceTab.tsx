import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import { useListClassGroupsQuery, useListSemestersQuery, type ClassGroupRead } from "../../../../../store/admin/api";
import { ManageGroupStudentsModal } from "../../ScheduleManagement/modals/ManageGroupStudentsModal";
import styles from "../TabContent.module.css";

export const GroupsAttendanceTab = () => {
    const { t } = useTranslation("common");
    const [selectedGroup, setSelectedGroup] = useState<ClassGroupRead | null>(null);

    const { data: groups = [], isLoading } = useListClassGroupsQuery();
    const { data: semesters = [] } = useListSemestersQuery();

    const getSemesterName = useCallback((id: number) => semesters.find((s) => s.id === id)?.name || id, [semesters]);

    const daysOfWeek = useMemo(
        () => [
            t("admin.monday"),
            t("admin.tuesday"),
            t("admin.wednesday"),
            t("admin.thursday"),
            t("admin.friday"),
            t("admin.saturday"),
            t("admin.sunday"),
        ],
        [t],
    );

    const getDayName = useCallback((dayIndex: number) => daysOfWeek[dayIndex] || dayIndex, [daysOfWeek]);

    const handleGroupSelect = useCallback((group: ClassGroupRead) => {
        setSelectedGroup(group);
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedGroup(null);
    }, []);

    if (isLoading) {
        return <div className={styles.loading}>{t("admin.loading")}</div>;
    }

    return (
        <>
            <div className={styles.header}>
                <h3 className={styles.sectionTitle}>{t("admin.attendanceByGroup")}</h3>
            </div>

            {groups.length === 0 ? (
                <div className={styles.empty}>{t("admin.noClassGroups")}</div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>{t("admin.name")}</th>
                                <th className={styles.th}>{t("admin.semester")}</th>
                                <th className={styles.th}>{t("admin.day")}</th>
                                <th className={styles.th}>{t("admin.time")}</th>
                                <th className={styles.th}>{t("admin.actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groups.map((group) => (
                                <tr key={group.id} className={styles.tr}>
                                    <td className={styles.td}>{group.name}</td>
                                    <td className={styles.td}>{getSemesterName(group.semesterId)}</td>
                                    <td className={styles.td}>{getDayName(group.dayOfWeek)}</td>
                                    <td className={styles.td}>
                                        {group.startTime} - {group.endTime}
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.actionButton}
                                                onClick={() => handleGroupSelect(group)}
                                            >
                                                <Users size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedGroup && (
                <ManageGroupStudentsModal
                    isOpen={!!selectedGroup}
                    onClose={handleCloseModal}
                    classGroup={selectedGroup}
                />
            )}
        </>
    );
};
