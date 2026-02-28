import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
    useListUsersQuery,
    useListAttendanceQuery,
    useListClassSessionsQuery,
    useListClassGroupsQuery,
} from "../../../../../store/admin/api";
import { UserRole } from "../../../../../store/auth/types";
import { ATTENDANCE_STATUS } from "../../../../../constants/constants";
import styles from "../TabContent.module.css";

export const StudentsAttendanceTab = () => {
    const { t } = useTranslation("common");
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    const { data: students = [], isLoading: isLoadingStudents } = useListUsersQuery({
        role: UserRole.STUDENT,
    });

    const { data: attendance = [], isLoading: isLoadingAttendance } = useListAttendanceQuery(
        selectedStudentId ? { studentId: selectedStudentId } : { studentId: "" },
        { skip: !selectedStudentId },
    );

    const { data: sessions = [] } = useListClassSessionsQuery({});
    const { data: classGroups = [] } = useListClassGroupsQuery();

    const getSessionInfo = useCallback(
        (sessionId: number) => {
            const session = sessions.find((s) => s.id === sessionId);
            if (!session) return { date: null, classGroupName: null };
            const classGroup = classGroups.find((cg) => cg.id === session.classGroupId);
            return {
                date: session.date,
                classGroupName: classGroup?.name || session.classGroupId,
            };
        },
        [sessions, classGroups],
    );

    const getStatusLabel = useCallback(
        (status: string) => {
            switch (status) {
                case ATTENDANCE_STATUS.PRESENT:
                    return t("admin.present");
                case ATTENDANCE_STATUS.ABSENT:
                    return t("admin.absent");
                case ATTENDANCE_STATUS.EXCUSED:
                    return t("admin.excused");
                case ATTENDANCE_STATUS.MAKEUP:
                    return t("admin.makeup");
                default:
                    return status;
            }
        },
        [t],
    );

    const handleStudentChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedStudentId(e.target.value || null);
    }, []);

    if (isLoadingStudents) {
        return <div className={styles.loading}>{t("admin.loading")}</div>;
    }

    return (
        <>
            <div className={styles.header}>
                <h3 className={styles.sectionTitle}>{t("admin.attendanceByStudent")}</h3>
            </div>

            <div className={`${styles.selectField} ${styles.selectFieldWithMargin}`}>
                <label className={styles.label}>{t("admin.selectStudent")}</label>
                <select className={styles.select} value={selectedStudentId || ""} onChange={handleStudentChange}>
                    <option value="">{t("admin.selectStudent")}</option>
                    {students.map((student) => (
                        <option key={student.id} value={student.id}>
                            {`${student.firstName || ""} ${student.lastName || ""}`.trim() || student.email}
                        </option>
                    ))}
                </select>
            </div>

            {selectedStudentId && (
                <>
                    {isLoadingAttendance ? (
                        <div className={styles.loading}>{t("admin.loading")}</div>
                    ) : attendance.length === 0 ? (
                        <div className={styles.empty}>{t("admin.noAttendanceRecords")}</div>
                    ) : (
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.th}>{t("admin.date")}</th>
                                        <th className={styles.th}>{t("admin.classGroup")}</th>
                                        <th className={styles.th}>{t("admin.status")}</th>
                                        <th className={styles.th}>{t("admin.makeup")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.map((record) => {
                                        const sessionInfo = getSessionInfo(record.classSessionId);
                                        return (
                                            <tr key={record.id} className={styles.tr}>
                                                <td className={styles.td}>
                                                    {sessionInfo.date
                                                        ? new Date(sessionInfo.date).toLocaleDateString()
                                                        : "-"}
                                                </td>
                                                <td className={styles.td}>
                                                    {sessionInfo.classGroupName || record.classSessionId}
                                                </td>
                                                <td className={styles.td}>
                                                    <span className={styles.statusActive}>
                                                        {getStatusLabel(record.status)}
                                                    </span>
                                                </td>
                                                <td className={styles.td}>
                                                    {record.isMakeup ? t("admin.yes") : t("admin.no")}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </>
    );
};
