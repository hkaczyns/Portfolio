import { useTranslation } from "react-i18next";
import { useGetUserDetailsQuery } from "../../../../store/admin/api";
import { UserRole } from "../../../../store/auth/types";
import type { UserResponse } from "../../../../store/auth/types";
import { Spinner } from "../../../../components/Spinner/Spinner";
import styles from "./AccountStatsSection.module.css";

export interface AccountStatsSectionProps {
    user: UserResponse;
}

export const AccountStatsSection = ({ user }: AccountStatsSectionProps) => {
    const { t } = useTranslation("common");
    const {
        data: userDetails,
        isLoading,
        isError,
    } = useGetUserDetailsQuery(user.id, {
        skip: !user.id, // Skip if no user ID
    });

    if (isLoading) {
        return (
            <div className={styles.section}>
                <h3 className={styles.title}>{t("account.statistics")}</h3>
                <div className={styles.loading}>
                    <Spinner size={40} />
                </div>
            </div>
        );
    }

    if (isError || !userDetails || !userDetails.activityStats) {
        return null;
    }

    const { activityStats } = userDetails;

    return (
        <div className={styles.section}>
            <h3 className={styles.title}>{t("account.statistics")}</h3>
            <div className={styles.content}>
                {user.role === UserRole.INSTRUCTOR && (
                    <div className={styles.statsGrid}>
                        {activityStats.classGroupsTotal !== undefined && (
                            <div className={styles.statCard}>
                                <div className={styles.statValue}>{activityStats.classGroupsTotal}</div>
                                <div className={styles.statLabel}>{t("account.totalClassGroups")}</div>
                            </div>
                        )}
                        {activityStats.classSessionsTotal !== undefined && (
                            <div className={styles.statCard}>
                                <div className={styles.statValue}>{activityStats.classSessionsTotal}</div>
                                <div className={styles.statLabel}>{t("account.totalSessions")}</div>
                            </div>
                        )}
                    </div>
                )}

                {user.role === UserRole.STUDENT && (
                    <div className={styles.statsGrid}>
                        {activityStats.enrollmentsTotal !== undefined && (
                            <div className={styles.statCard}>
                                <div className={styles.statValue}>{activityStats.enrollmentsTotal}</div>
                                <div className={styles.statLabel}>{t("account.totalEnrollments")}</div>
                            </div>
                        )}
                        {activityStats.enrollmentsActive !== undefined && (
                            <div className={styles.statCard}>
                                <div className={styles.statValue}>{activityStats.enrollmentsActive}</div>
                                <div className={styles.statLabel}>{t("account.activeEnrollments")}</div>
                            </div>
                        )}
                        {activityStats.attendanceSummary && (
                            <>
                                <div className={styles.statCard}>
                                    <div className={styles.statValue}>{activityStats.attendanceSummary.totalCount}</div>
                                    <div className={styles.statLabel}>{t("account.totalSessions")}</div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statValue}>
                                        {activityStats.attendanceSummary.presentCount}
                                    </div>
                                    <div className={styles.statLabel}>{t("account.present")}</div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statValue}>
                                        {activityStats.attendanceSummary.absentCount}
                                    </div>
                                    <div className={styles.statLabel}>{t("account.absent")}</div>
                                </div>
                                {activityStats.attendanceSummary.attendanceRate !== null && (
                                    <div className={styles.statCard}>
                                        <div className={styles.statValue}>
                                            {(activityStats.attendanceSummary.attendanceRate * 100).toFixed(1)}%
                                        </div>
                                        <div className={styles.statLabel}>{t("account.attendanceRate")}</div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
