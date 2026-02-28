import { useTranslation } from "react-i18next";
import { useGetUserDetailsQuery } from "../../../../store/admin/api";
import { UserRole } from "../../../../store/auth/types";
import type { UserResponse } from "../../../../store/auth/types";
import styles from "./UserActivitySection.module.css";

export interface UserActivitySectionProps {
    user: UserResponse;
}

export const UserActivitySection = ({ user }: UserActivitySectionProps) => {
    const { t } = useTranslation("common");
    const { data: userDetails, isLoading } = useGetUserDetailsQuery(user.id);

    if (isLoading) {
        return (
            <div className={styles.container}>
                <h3 className={styles.title}>{t("admin.userActivity")}</h3>
                <div className={styles.loading}>{t("admin.loading")}</div>
            </div>
        );
    }

    if (!userDetails) {
        return null;
    }

    const { classGroups, enrollments, activityStats } = userDetails;

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>{t("admin.userActivity")}</h3>
            <div className={styles.content}>
                {user.role === UserRole.INSTRUCTOR && (
                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>{t("admin.classGroups")}</h4>
                        {classGroups.length === 0 ? (
                            <p className={styles.empty}>{t("admin.noClassGroups")}</p>
                        ) : (
                            <div className={styles.list}>
                                {classGroups.map((group) => (
                                    <div key={group.id} className={styles.item}>
                                        <div className={styles.itemHeader}>
                                            <span className={styles.itemName}>{group.name}</span>
                                            <span className={styles.itemStatus}>{group.status}</span>
                                        </div>
                                        {group.description && (
                                            <p className={styles.itemDescription}>{group.description}</p>
                                        )}
                                        <div className={styles.itemMeta}>
                                            <span>
                                                {t("admin.capacity")}: {group.capacity}
                                            </span>
                                            <span>
                                                {t("admin.dayOfWeek")}: {group.dayOfWeek}
                                            </span>
                                            <span>
                                                {t("admin.time")}: {group.startTime} - {group.endTime}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {(activityStats?.classGroupsTotal !== undefined ||
                            activityStats?.classSessionsTotal !== undefined) && (
                            <div className={styles.statsContainer}>
                                {activityStats?.classGroupsTotal !== undefined && (
                                    <div className={styles.stats}>
                                        <div className={styles.statLabel}>{t("admin.totalClassGroups")}</div>
                                        <div className={styles.statValue}>{activityStats.classGroupsTotal}</div>
                                    </div>
                                )}
                                {activityStats?.classSessionsTotal !== undefined && (
                                    <div className={styles.stats}>
                                        <div className={styles.statLabel}>{t("admin.totalSessions")}</div>
                                        <div className={styles.statValue}>{activityStats.classSessionsTotal}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {user.role === UserRole.STUDENT && (
                    <>
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>{t("admin.enrollments")}</h4>
                            {enrollments.length === 0 ? (
                                <p className={styles.empty}>{t("admin.noEnrollments")}</p>
                            ) : (
                                <div className={styles.list}>
                                    {enrollments.map((enrollment) => (
                                        <div key={enrollment.id} className={styles.item}>
                                            <div className={styles.itemHeader}>
                                                <span className={styles.itemName}>
                                                    {t("admin.enrollment")} #{enrollment.id}
                                                </span>
                                                <span className={styles.itemStatus}>{enrollment.status}</span>
                                            </div>
                                            <div className={styles.itemMeta}>
                                                <span>
                                                    {t("admin.joinedAt")}:{" "}
                                                    {new Date(enrollment.joinedAt).toLocaleDateString()}
                                                </span>
                                                {enrollment.cancelledAt && (
                                                    <span>
                                                        {t("admin.cancelledAt")}:{" "}
                                                        {new Date(enrollment.cancelledAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {activityStats && (
                                <div className={styles.statsContainer}>
                                    <div className={styles.stats}>
                                        <div className={styles.statLabel}>{t("admin.totalEnrollments")}</div>
                                        <div className={styles.statValue}>{activityStats.enrollmentsTotal || 0}</div>
                                    </div>
                                    <div className={styles.stats}>
                                        <div className={styles.statLabel}>{t("admin.activeEnrollments")}</div>
                                        <div className={styles.statValue}>{activityStats.enrollmentsActive || 0}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {activityStats?.attendanceSummary && (
                            <div className={styles.section}>
                                <h4 className={styles.sectionTitle}>{t("admin.attendance")}</h4>
                                <div className={styles.statsContainer}>
                                    <div className={styles.stats}>
                                        <div className={styles.statLabel}>{t("admin.totalSessions")}</div>
                                        <div className={styles.statValue}>
                                            {activityStats.attendanceSummary.totalCount}
                                        </div>
                                    </div>
                                    <div className={styles.stats}>
                                        <div className={styles.statLabel}>{t("admin.present")}</div>
                                        <div className={styles.statValue}>
                                            {activityStats.attendanceSummary.presentCount}
                                        </div>
                                    </div>
                                    <div className={styles.stats}>
                                        <div className={styles.statLabel}>{t("admin.absent")}</div>
                                        <div className={styles.statValue}>
                                            {activityStats.attendanceSummary.absentCount}
                                        </div>
                                    </div>
                                    <div className={styles.stats}>
                                        <div className={styles.statLabel}>{t("admin.excused")}</div>
                                        <div className={styles.statValue}>
                                            {activityStats.attendanceSummary.excusedCount}
                                        </div>
                                    </div>
                                    <div className={styles.stats}>
                                        <div className={styles.statLabel}>{t("admin.makeup")}</div>
                                        <div className={styles.statValue}>
                                            {activityStats.attendanceSummary.makeupCount}
                                        </div>
                                    </div>
                                    {activityStats.attendanceSummary.attendanceRate !== null && (
                                        <div className={styles.stats}>
                                            <div className={styles.statLabel}>{t("admin.attendanceRate")}</div>
                                            <div className={styles.statValue}>
                                                {(activityStats.attendanceSummary.attendanceRate * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
