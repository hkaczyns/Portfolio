import { useMemo, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    useGetStudentCalendarQuery,
    useGetInstructorCalendarQuery,
    useCompleteSessionMutation,
    useCreateSubstitutionMutation,
    useGetInstructorsQuery,
    type InstructorCalendarSession,
} from "../../store/schedule/api";
import { useGetBillingSummaryQuery } from "../../store/billing/api";
import { useGetAttendanceSummaryQuery } from "../../store/attendance/api";
import { useGetUserQuery } from "../../store/auth/api";
import { useAppSelector } from "../../store/store";
import { selectIsStudent, selectIsInstructor, selectIsAdmin } from "../../store/auth/selectors";
import { useAlert } from "../../components/Alert/AlertContext";
import { CompleteSessionModal } from "../../components/CompleteSessionModal/CompleteSessionModal";
import { SubstitutionModal } from "../../components/SubstitutionModal/SubstitutionModal";
import styles from "./DashboardPage.module.css";

const formatAmount = (amount: string): string => {
    try {
        const num = parseFloat(amount);
        if (isNaN(num)) return amount;
        return new Intl.NumberFormat("pl-PL", {
            style: "currency",
            currency: "PLN",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    } catch {
        return amount;
    }
};

const formatTime = (timeString: string): string => {
    try {
        let time = timeString;
        if (time.includes("T")) {
            time = time.split("T")[1] || time;
        }
        if (time.includes("Z")) {
            time = time.replace("Z", "");
        }
        const [hours, minutes] = time.split(":");
        return `${hours}:${minutes}`;
    } catch {
        return timeString;
    }
};

const formatDateOnly = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("pl-PL", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date);
    } catch {
        return dateString;
    }
};

export const DashboardPage = () => {
    const isStudent = useAppSelector(selectIsStudent);
    const isInstructor = useAppSelector(selectIsInstructor);
    const isAdmin = useAppSelector(selectIsAdmin);
    const navigate = useNavigate();
    const { publish } = useAlert();
    const [sessionToComplete, setSessionToComplete] = useState<InstructorCalendarSession | null>(null);
    const [sessionForSubstitution, setSessionForSubstitution] = useState<InstructorCalendarSession | null>(null);

    const {
        data: user,
        isLoading: isLoadingUser,
        refetch: refetchUser,
    } = useGetUserQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    const today = new Date();
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    const fromDate = today.toISOString().split("T")[0];
    const toDate = oneMonthLater.toISOString().split("T")[0];
    const fromDatePast = oneMonthAgo.toISOString().split("T")[0];

    const {
        data: studentCalendarSessions,
        isLoading: isLoadingStudentCalendar,
        refetch: refetchStudentCalendar,
    } = useGetStudentCalendarQuery(
        {
            fromDate,
            toDate,
        },
        {
            refetchOnMountOrArgChange: true,
            skip: !isStudent,
        },
    );

    const {
        data: instructorCalendarSessions,
        isLoading: isLoadingInstructorCalendar,
        refetch: refetchInstructorCalendar,
    } = useGetInstructorCalendarQuery(
        {
            fromDate,
            toDate,
        },
        {
            refetchOnMountOrArgChange: true,
            skip: !isInstructor && !isAdmin,
        },
    );

    const {
        data: instructorCalendarSessionsForUnfinished,
        isLoading: isLoadingInstructorCalendarForUnfinished,
        refetch: refetchInstructorCalendarForUnfinished,
    } = useGetInstructorCalendarQuery(
        {
            fromDate: fromDatePast,
            toDate: fromDate,
        },
        {
            refetchOnMountOrArgChange: true,
            skip: !isInstructor,
        },
    );

    const { data: instructors = [] } = useGetInstructorsQuery(undefined, {
        skip: !isInstructor,
    });

    const [completeSession, { isLoading: isCompleting }] = useCompleteSessionMutation();
    const [createSubstitution, { isLoading: isCreatingSubstitution }] = useCreateSubstitutionMutation();

    const {
        data: billingSummary,
        isLoading: isLoadingBilling,
        refetch: refetchBilling,
    } = useGetBillingSummaryQuery(undefined, {
        refetchOnMountOrArgChange: true,
        skip: !isStudent,
    });

    const {
        data: attendanceSummary,
        isLoading: isLoadingAttendance,
        refetch: refetchAttendance,
    } = useGetAttendanceSummaryQuery(undefined, {
        refetchOnMountOrArgChange: true,
        skip: !isStudent,
    });

    const isLoading =
        isLoadingUser ||
        (isStudent && isLoadingStudentCalendar) ||
        ((isInstructor || isAdmin) && isLoadingInstructorCalendar) ||
        (isInstructor && isLoadingInstructorCalendarForUnfinished) ||
        (isStudent && isLoadingBilling) ||
        (isStudent && isLoadingAttendance);

    useEffect(() => {
        refetchUser();
        if (isStudent) {
            refetchStudentCalendar();
            refetchBilling();
            refetchAttendance();
        }
        if (isInstructor || isAdmin) {
            refetchInstructorCalendar();
        }
        if (isInstructor) {
            refetchInstructorCalendarForUnfinished();
        }
    }, [
        refetchUser,
        refetchStudentCalendar,
        refetchInstructorCalendar,
        refetchInstructorCalendarForUnfinished,
        refetchBilling,
        refetchAttendance,
        isStudent,
        isInstructor,
        isAdmin,
    ]);

    const upcomingStudentClasses = useMemo(() => {
        if (!studentCalendarSessions) return [];

        const now = new Date();
        const upcoming = studentCalendarSessions
            .filter((session) => {
                const sessionDate = new Date(`${session.date}T${session.startTime}`);
                return sessionDate >= now && session.status === "scheduled";
            })
            .sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.startTime}`);
                const dateB = new Date(`${b.date}T${b.startTime}`);
                return dateA.getTime() - dateB.getTime();
            })
            .slice(0, 5);

        return upcoming;
    }, [studentCalendarSessions]);

    const upcomingInstructorClasses = useMemo(() => {
        if (!instructorCalendarSessions) return [];

        const now = new Date();
        const upcoming = instructorCalendarSessions
            .filter((session) => {
                const sessionDate = new Date(`${session.date}T${session.startTime}`);
                return sessionDate >= now && session.status === "scheduled";
            })
            .sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.startTime}`);
                const dateB = new Date(`${b.date}T${b.startTime}`);
                return dateA.getTime() - dateB.getTime();
            })
            .slice(0, 5);

        return upcoming;
    }, [instructorCalendarSessions]);

    const unfinishedClasses = useMemo(() => {
        if (!instructorCalendarSessionsForUnfinished) return [];

        const now = new Date();
        const unfinished = instructorCalendarSessionsForUnfinished
            .filter((session) => {
                const sessionDate = new Date(`${session.date}T${session.startTime}`);
                return sessionDate < now && session.status === "scheduled";
            })
            .sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.startTime}`);
                const dateB = new Date(`${b.date}T${b.startTime}`);
                return dateB.getTime() - dateA.getTime();
            });

        return unfinished;
    }, [instructorCalendarSessionsForUnfinished]);

    const handleAttendanceClick = useCallback(
        (sessionId: number, e: React.MouseEvent) => {
            e.stopPropagation();
            navigate(`/attendance/${sessionId}`);
        },
        [navigate],
    );

    const handleCompleteClick = useCallback((session: InstructorCalendarSession, e: React.MouseEvent) => {
        e.stopPropagation();
        setSessionToComplete(session);
    }, []);

    const handleSubstitutionClick = useCallback((session: InstructorCalendarSession, e: React.MouseEvent) => {
        e.stopPropagation();
        setSessionForSubstitution(session);
    }, []);

    const handleConfirmComplete = useCallback(
        async (notes: string) => {
            if (!sessionToComplete) return;

            try {
                await completeSession({
                    classSessionId: sessionToComplete.classSessionId,
                    body: { notes },
                }).unwrap();

                publish("Zajęcia zostały oznaczone jako wykonane!", "success");
                setSessionToComplete(null);
                refetchInstructorCalendarForUnfinished();
            } catch (err) {
                console.error("Failed to complete session:", err);
                publish("Wystąpił błąd podczas oznaczania zajęć jako wykonane.", "error");
            }
        },
        [sessionToComplete, completeSession, publish, refetchInstructorCalendarForUnfinished],
    );

    const handleConfirmSubstitution = useCallback(
        async (substituteInstructorId: string, reason: string) => {
            if (!sessionForSubstitution) return;

            try {
                await createSubstitution({
                    classSessionId: sessionForSubstitution.classSessionId,
                    body: { substituteInstructorId, reason },
                }).unwrap();

                publish("Zastępstwo zostało dodane!", "success");
                setSessionForSubstitution(null);
                refetchInstructorCalendarForUnfinished();
            } catch (err) {
                console.error("Failed to create substitution:", err);
                publish("Wystąpił błąd podczas dodawania zastępstwa.", "error");
            }
        },
        [sessionForSubstitution, createSubstitution, publish, refetchInstructorCalendarForUnfinished],
    );

    const handleCancelComplete = useCallback(() => {
        setSessionToComplete(null);
    }, []);

    const handleCancelSubstitution = useCallback(() => {
        setSessionForSubstitution(null);
    }, []);

    const getGreeting = (): string => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            return "Dzień dobry";
        } else if (hour >= 12 && hour < 18) {
            return "Dzień dobry";
        } else if (hour >= 18 && hour < 22) {
            return "Dobry wieczór";
        } else {
            return "Dobry wieczór";
        }
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <p className={styles.loading}>Ładowanie...</p>
                </div>
            </div>
        );
    }

    const fullName = user ? `${user.firstName} ${user.lastName}` : "";

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.welcomeSection}>
                    <h1 className={styles.welcomeTitle}>
                        {getGreeting()}, {fullName || "Użytkowniku"}!
                    </h1>
                    <p className={styles.welcomeSubtitle}>Witamy w panelu użytkownika</p>
                </div>

                <div className={styles.grid}>
                    {isStudent && (
                        <>
                            <div className={styles.card}>
                                <h2 className={styles.cardTitle}>Najbliższe zajęcia</h2>
                                {upcomingStudentClasses.length > 0 ? (
                                    <div className={styles.classesList}>
                                        {upcomingStudentClasses.map((session) => (
                                            <div key={session.classSessionId} className={styles.classItem}>
                                                <div className={styles.classHeader}>
                                                    <h3 className={styles.className}>{session.classGroupName}</h3>
                                                </div>
                                                <div className={styles.classDetails}>
                                                    <p className={styles.classDate}>
                                                        <strong>Data:</strong> {formatDateOnly(session.date)}
                                                    </p>
                                                    <p className={styles.classTime}>
                                                        <strong>Godzina:</strong> {formatTime(session.startTime)} -{" "}
                                                        {formatTime(session.endTime)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={styles.noClassesMessage}>Nie jesteś zapisany na żadne zajęcia.</p>
                                )}
                            </div>

                            {billingSummary && (
                                <div className={styles.card}>
                                    <h2 className={styles.cardTitle}>Saldo płatności</h2>
                                    <div className={styles.billingInfo}>
                                        <div className={styles.billingItem}>
                                            <span className={styles.billingLabel}>Do zapłaty w tym miesiącu:</span>
                                            <span className={styles.billingValue}>
                                                {formatAmount(billingSummary.currentMonthDue)}
                                            </span>
                                        </div>
                                        <div className={styles.billingItem}>
                                            <span className={styles.billingLabel}>Zaległości:</span>
                                            <span className={`${styles.billingValue} ${styles.overdue}`}>
                                                {formatAmount(billingSummary.totalOverdue)}
                                            </span>
                                        </div>
                                        {billingSummary.openCharges && billingSummary.openCharges.length > 0 && (
                                            <div className={styles.billingItem}>
                                                <span className={styles.billingLabel}>Otwarte należności:</span>
                                                <span className={styles.billingValue}>
                                                    {billingSummary.openCharges.length}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {attendanceSummary && (
                                <div className={`${styles.card} ${styles.attendanceCard}`}>
                                    <h2 className={styles.cardTitle}>Podsumowanie obecności</h2>
                                    <div className={styles.attendanceInfo}>
                                        <div className={styles.attendanceItem}>
                                            <span className={styles.attendanceLabel}>Liczba zajęć:</span>
                                            <span className={styles.attendanceValue}>
                                                {attendanceSummary.totalCount}
                                            </span>
                                        </div>
                                        <div className={styles.attendanceItem}>
                                            <span className={styles.attendanceLabel}>Obecny:</span>
                                            <span className={`${styles.attendanceValue} ${styles.present}`}>
                                                {attendanceSummary.presentCount}
                                            </span>
                                        </div>
                                        <div className={styles.attendanceItem}>
                                            <span className={styles.attendanceLabel}>Nieobecny:</span>
                                            <span className={`${styles.attendanceValue} ${styles.absent}`}>
                                                {attendanceSummary.absentCount}
                                            </span>
                                        </div>
                                        <div className={styles.attendanceItem}>
                                            <span className={styles.attendanceLabel}>Frekwencja:</span>
                                            <span className={`${styles.attendanceValue} ${styles.rate}`}>
                                                {(attendanceSummary.attendanceRate * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {(isInstructor || isAdmin) && (
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>Najbliższe zajęcia</h2>
                            {upcomingInstructorClasses.length > 0 ? (
                                <div className={styles.classesList}>
                                    {upcomingInstructorClasses.map((session) => (
                                        <div key={session.classSessionId} className={styles.classItem}>
                                            <div className={styles.classHeader}>
                                                <h3 className={styles.className}>{session.classGroupName}</h3>
                                            </div>
                                            <div className={styles.classDetails}>
                                                <p className={styles.classDate}>
                                                    <strong>Data:</strong> {formatDateOnly(session.date)}
                                                </p>
                                                <p className={styles.classTime}>
                                                    <strong>Godzina:</strong> {formatTime(session.startTime)} -{" "}
                                                    {formatTime(session.endTime)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.noClassesMessage}>Nie masz zaplanowanych żadnych zajęć.</p>
                            )}
                        </div>
                    )}

                    {isInstructor && (
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>Niezakończone zajęcia</h2>
                            {unfinishedClasses.length > 0 ? (
                                <div className={styles.classesList}>
                                    {unfinishedClasses.map((session) => (
                                        <div key={session.classSessionId} className={styles.classItem}>
                                            <div className={styles.classHeader}>
                                                <h3 className={styles.className}>{session.classGroupName}</h3>
                                                <div className={styles.actionButtons}>
                                                    <button
                                                        className={styles.attendanceButton}
                                                        onClick={(e) =>
                                                            handleAttendanceClick(session.classSessionId, e)
                                                        }
                                                        title="Zarządzaj obecnością"
                                                        type="button"
                                                    >
                                                        👥
                                                    </button>
                                                    <button
                                                        className={styles.substitutionButton}
                                                        onClick={(e) => handleSubstitutionClick(session, e)}
                                                        title="Dodaj zastępstwo"
                                                        type="button"
                                                    >
                                                        🔄
                                                    </button>
                                                    <button
                                                        className={styles.completeButton}
                                                        onClick={(e) => handleCompleteClick(session, e)}
                                                        title="Oznacz jako wykonane"
                                                        type="button"
                                                    >
                                                        ✓
                                                    </button>
                                                </div>
                                            </div>
                                            <div className={styles.classDetails}>
                                                <p className={styles.classDate}>
                                                    <strong>Data:</strong> {formatDateOnly(session.date)}
                                                </p>
                                                <p className={styles.classTime}>
                                                    <strong>Godzina:</strong> {formatTime(session.startTime)} -{" "}
                                                    {formatTime(session.endTime)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.noClassesMessage}>Brak niezakończonych zajęć.</p>
                            )}
                        </div>
                    )}

                    {isAdmin && (
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>Panel administracyjny</h2>
                            <p className={styles.noClassesMessage}>
                                Zarządzaj systemem z poziomu panelu administracyjnego.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            {sessionToComplete && (
                <CompleteSessionModal
                    sessionName={sessionToComplete.classGroupName}
                    onConfirm={handleConfirmComplete}
                    onCancel={handleCancelComplete}
                    isLoading={isCompleting}
                />
            )}
            {sessionForSubstitution && (
                <SubstitutionModal
                    sessionName={sessionForSubstitution.classGroupName}
                    instructors={instructors}
                    onConfirm={handleConfirmSubstitution}
                    onCancel={handleCancelSubstitution}
                    isLoading={isCreatingSubstitution}
                />
            )}
        </div>
    );
};
