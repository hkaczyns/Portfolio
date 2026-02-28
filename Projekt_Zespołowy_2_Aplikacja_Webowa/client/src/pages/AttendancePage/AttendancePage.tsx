import { useState, useMemo } from "react";
import {
    useGetAttendanceQuery,
    useGetAttendanceSummaryQuery,
    type GetAttendanceParams,
} from "../../store/attendance/api";
import { useGetSemestersQuery } from "../../store/schedule/api";
import styles from "./AttendancePage.module.css";

const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("pl-PL", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(date);
    } catch {
        return dateString;
    }
};

const getStatusLabel = (status: string): string => {
    switch (status) {
        case "PRESENT":
            return "Obecny";
        case "ABSENT":
            return "Nieobecny";
        case "EXCUSED":
            return "Usprawiedliwiony";
        default:
            return status;
    }
};

const getStatusClassName = (status: string): string => {
    switch (status) {
        case "PRESENT":
            return styles.statusPresent;
        case "ABSENT":
            return styles.statusAbsent;
        case "EXCUSED":
            return styles.statusExcused;
        default:
            return "";
    }
};

export const AttendancePage = () => {
    const [filters, setFilters] = useState<GetAttendanceParams>({});
    const {
        data: attendance,
        isLoading: isLoadingAttendance,
        isError: isAttendanceError,
    } = useGetAttendanceQuery(filters, {
        refetchOnMountOrArgChange: true,
    });
    const {
        data: summary,
        isLoading: isLoadingSummary,
        isError: isSummaryError,
    } = useGetAttendanceSummaryQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    const { data: semesters } = useGetSemestersQuery();

    const handleFilterChange = (key: keyof GetAttendanceParams, value: string | number | boolean | null) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value === "" || value === null ? null : value,
        }));
    };

    const handleClearFilters = () => {
        setFilters({});
    };

    const hasActiveFilters = Object.values(filters).some(
        (value) => value !== null && value !== undefined && value !== "",
    );

    const semesterOptions = useMemo(() => {
        if (!semesters) return [];
        return [...semesters].sort((a, b) => a.id - b.id);
    }, [semesters]);

    const classGroupOptions = useMemo(() => {
        if (!attendance) return [];
        const uniqueGroups = new Map<number, { id: number; name: string }>();
        attendance.forEach((record) => {
            if (!uniqueGroups.has(record.classGroupId)) {
                uniqueGroups.set(record.classGroupId, {
                    id: record.classGroupId,
                    name: record.classGroupName,
                });
            }
        });
        return Array.from(uniqueGroups.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [attendance]);

    const isLoading = isLoadingAttendance || isLoadingSummary;
    const isError = isAttendanceError || isSummaryError;

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Obecności</h1>
                    <p className={styles.loading}>Ładowanie...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Obecności</h1>
                    <p className={styles.error}>Wystąpił błąd podczas ładowania danych.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>Obecności</h1>

                {summary && (
                    <div className={styles.summarySection}>
                        <h2 className={styles.sectionTitle}>Statystyki obecności</h2>
                        <div className={styles.summaryGrid}>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryLabel}>Łączna liczba zajęć:</span>
                                <span className={styles.summaryValue}>{summary.totalCount}</span>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryLabel}>Obecny:</span>
                                <span className={`${styles.summaryValue} ${styles.present}`}>
                                    {summary.presentCount}
                                </span>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryLabel}>Nieobecny:</span>
                                <span className={`${styles.summaryValue} ${styles.absent}`}>{summary.absentCount}</span>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryLabel}>Usprawiedliwiony:</span>
                                <span className={`${styles.summaryValue} ${styles.excused}`}>
                                    {summary.excusedCount}
                                </span>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryLabel}>Odrabianie:</span>
                                <span className={styles.summaryValue}>{summary.makeupCount}</span>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryLabel}>Frekwencja:</span>
                                <span className={`${styles.summaryValue} ${styles.rate}`}>
                                    {(summary.attendanceRate * 100).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.attendanceSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Lista obecności</h2>
                        {hasActiveFilters && (
                            <button className={styles.clearFiltersButton} onClick={handleClearFilters}>
                                Wyczyść filtry
                            </button>
                        )}
                    </div>

                    <div className={styles.filtersSection}>
                        <div className={styles.filtersGrid}>
                            <div className={styles.filterGroup}>
                                <label htmlFor="semester-filter" className={styles.filterLabel}>
                                    Semestr:
                                </label>
                                <select
                                    id="semester-filter"
                                    className={styles.filterSelect}
                                    value={filters.semesterId || ""}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "semesterId",
                                            e.target.value ? parseInt(e.target.value, 10) : null,
                                        )
                                    }
                                >
                                    <option value="">Wszystkie</option>
                                    {semesterOptions.map((semester) => (
                                        <option key={semester.id} value={semester.id}>
                                            {semester.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.filterGroup}>
                                <label htmlFor="class-group-filter" className={styles.filterLabel}>
                                    Grupa zajęć:
                                </label>
                                <select
                                    id="class-group-filter"
                                    className={styles.filterSelect}
                                    value={filters.classGroupId || ""}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "classGroupId",
                                            e.target.value ? parseInt(e.target.value, 10) : null,
                                        )
                                    }
                                >
                                    <option value="">Wszystkie</option>
                                    {classGroupOptions.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.filterGroup}>
                                <label htmlFor="status-filter" className={styles.filterLabel}>
                                    Status:
                                </label>
                                <select
                                    id="status-filter"
                                    className={styles.filterSelect}
                                    value={filters.status || ""}
                                    onChange={(e) => handleFilterChange("status", e.target.value || null)}
                                >
                                    <option value="">Wszystkie</option>
                                    <option value="PRESENT">Obecny</option>
                                    <option value="ABSENT">Nieobecny</option>
                                    <option value="EXCUSED">Usprawiedliwiony</option>
                                </select>
                            </div>

                            <div className={styles.filterGroup}>
                                <label htmlFor="from-filter" className={styles.filterLabel}>
                                    Od:
                                </label>
                                <input
                                    id="from-filter"
                                    type="date"
                                    className={styles.filterInput}
                                    value={filters.from || ""}
                                    onChange={(e) => handleFilterChange("from", e.target.value || null)}
                                />
                            </div>

                            <div className={styles.filterGroup}>
                                <label htmlFor="to-filter" className={styles.filterLabel}>
                                    Do:
                                </label>
                                <input
                                    id="to-filter"
                                    type="date"
                                    className={styles.filterInput}
                                    value={filters.to || ""}
                                    onChange={(e) => handleFilterChange("to", e.target.value || null)}
                                />
                            </div>

                            <div className={styles.filterGroup}>
                                <label htmlFor="makeup-filter" className={styles.filterLabel}>
                                    Odrabianie:
                                </label>
                                <select
                                    id="makeup-filter"
                                    className={styles.filterSelect}
                                    value={
                                        filters.isMakeup === undefined || filters.isMakeup === null
                                            ? ""
                                            : filters.isMakeup.toString()
                                    }
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        handleFilterChange("isMakeup", value === "" ? null : value === "true");
                                    }}
                                >
                                    <option value="">Wszystkie</option>
                                    <option value="true">Tak</option>
                                    <option value="false">Nie</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {attendance && attendance.length > 0 ? (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Grupa zajęć</th>
                                        <th>Semestr</th>
                                        <th>Status</th>
                                        <th>Odrabianie</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.map((record) => (
                                        <tr key={record.id}>
                                            <td>{formatDate(record.date)}</td>
                                            <td>{record.classGroupName}</td>
                                            <td>{record.semesterName || "-"}</td>
                                            <td>
                                                <span
                                                    className={`${styles.statusBadge} ${getStatusClassName(record.status)}`}
                                                >
                                                    {getStatusLabel(record.status)}
                                                </span>
                                            </td>
                                            <td>{record.isMakeup ? "Tak" : "Nie"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className={styles.emptyState}>Brak obecności spełniających wybrane kryteria.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
