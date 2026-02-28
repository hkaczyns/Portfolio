import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
    useGetInstructorCalendarQuery,
    useCompleteSessionMutation,
    useGetInstructorsQuery,
    useCreateSubstitutionMutation,
    type InstructorCalendarSession,
} from "../../store/schedule/api";
import { useAlert } from "../../components/Alert/AlertContext";
import { CompleteSessionModal } from "../../components/CompleteSessionModal/CompleteSessionModal";
import { SubstitutionModal } from "../../components/SubstitutionModal/SubstitutionModal";
import styles from "./InstructorCalendarPage.module.css";

const localizer = momentLocalizer(moment);

type CalendarView = "month" | "week" | "day" | "agenda" | "work_week";

interface CalendarEvent {
    title: string;
    start: Date;
    end: Date;
    resource: {
        session: InstructorCalendarSession;
    };
}

export const InstructorCalendarPage = () => {
    const { t, i18n } = useTranslation("common", { keyPrefix: "calendar" });
    const navigate = useNavigate();
    const { publish } = useAlert();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<CalendarView>("week");
    const [sessionToComplete, setSessionToComplete] = useState<InstructorCalendarSession | null>(null);
    const [sessionForSubstitution, setSessionForSubstitution] = useState<InstructorCalendarSession | null>(null);

    const [completeSession, { isLoading: isCompleting }] = useCompleteSessionMutation();
    const [createSubstitution, { isLoading: isCreatingSubstitution }] = useCreateSubstitutionMutation();
    const { data: instructors = [] } = useGetInstructorsQuery();

    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);

    const formatDate = (date: Date): string => {
        return date.toISOString().split("T")[0];
    };

    const {
        data: sessions,
        isLoading,
        refetch,
    } = useGetInstructorCalendarQuery({
        fromDate: formatDate(oneMonthAgo),
        toDate: formatDate(oneMonthLater),
    });

    useEffect(() => {
        const locale = i18n.language === "pl" ? "pl" : "en";
        if (locale === "pl") {
            // @ts-expect-error runtime import
            import("moment/locale/pl")
                .then(() => {
                    moment.locale("pl");
                })
                .catch(() => {
                    moment.locale("pl");
                });
        } else {
            moment.locale("en");
        }
    }, [i18n.language]);

    const events = useMemo<CalendarEvent[]>(() => {
        if (!sessions) return [];

        const calendarEvents: CalendarEvent[] = [];

        sessions.forEach((session) => {
            const dateStr = session.date;
            let startTimeStr = session.startTime;
            let endTimeStr = session.endTime;

            if (startTimeStr.includes("T")) {
                startTimeStr = startTimeStr.split("T")[1] || startTimeStr;
            }
            if (endTimeStr.includes("T")) {
                endTimeStr = endTimeStr.split("T")[1] || endTimeStr;
            }

            const date = moment(dateStr);
            const startTimeParts = startTimeStr.split(":");
            const endTimeParts = endTimeStr.split(":");

            const startHour = parseInt(startTimeParts[0] || "0", 10);
            const startMinute = parseInt(startTimeParts[1] || "0", 10);
            const startSecond = parseInt((startTimeParts[2] || "0").split(".")[0] || "0", 10);

            const endHour = parseInt(endTimeParts[0] || "0", 10);
            const endMinute = parseInt(endTimeParts[1] || "0", 10);
            const endSecond = parseInt((endTimeParts[2] || "0").split(".")[0] || "0", 10);

            const start = date.clone().hour(startHour).minute(startMinute).second(startSecond).toDate();
            const end = date.clone().hour(endHour).minute(endMinute).second(endSecond).toDate();

            const statusLabel = session.status === "scheduled" ? "" : ` [${session.status}]`;

            calendarEvents.push({
                title: `${session.classGroupName}${statusLabel}`,
                start,
                end,
                resource: {
                    session,
                },
            });
        });

        return calendarEvents;
    }, [sessions]);

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Moje zajęcia</h1>
                    <p style={{ color: "#000" }}>{t("loading")}</p>
                </div>
            </div>
        );
    }

    if (!sessions || sessions.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Moje zajęcia</h1>
                    <p style={{ marginTop: "20px", color: "#000" }}>Nie masz żadnych zajęć.</p>
                </div>
            </div>
        );
    }

    const handleAttendanceClick = (sessionId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/attendance/${sessionId}`);
    };

    const handleCompleteClick = (session: InstructorCalendarSession, e: React.MouseEvent) => {
        e.stopPropagation();
        setSessionToComplete(session);
    };

    const handleSubstitutionClick = (session: InstructorCalendarSession, e: React.MouseEvent) => {
        e.stopPropagation();
        setSessionForSubstitution(session);
    };

    const handleConfirmComplete = async (notes: string) => {
        if (!sessionToComplete) return;

        try {
            await completeSession({
                classSessionId: sessionToComplete.classSessionId,
                body: { notes },
            }).unwrap();

            publish("Zajęcia zostały oznaczone jako wykonane!", "success");
            setSessionToComplete(null);

            // Odświeżenie kalendarza po zakończeniu zajęć
            refetch();
        } catch (err) {
            console.error("Failed to complete session:", err);
            publish("Wystąpił błąd podczas oznaczania zajęć jako wykonane.", "error");
        }
    };

    const handleConfirmSubstitution = async (substituteInstructorId: string, reason: string) => {
        if (!sessionForSubstitution) return;

        try {
            await createSubstitution({
                classSessionId: sessionForSubstitution.classSessionId,
                body: { substituteInstructorId, reason },
            }).unwrap();

            publish("Zastępstwo zostało dodane!", "success");
            setSessionForSubstitution(null);

            // Odświeżenie kalendarza
            refetch();
        } catch (err) {
            console.error("Failed to create substitution:", err);
            publish("Wystąpił błąd podczas dodawania zastępstwa.", "error");
        }
    };

    const handleCancelComplete = () => {
        setSessionToComplete(null);
    };

    const handleCancelSubstitution = () => {
        setSessionForSubstitution(null);
    };

    const eventStyleGetter = (event: CalendarEvent) => {
        const isScheduled = event.resource.session.status === "scheduled";
        return {
            className: isScheduled ? styles.eventScheduled : styles.eventOther,
            style: {
                backgroundColor: isScheduled ? "#4caf50" : "#ff9800",
                color: "white",
                borderRadius: "4px",
                border: "none",
            },
        };
    };

    const EventComponent = ({ event }: { event: CalendarEvent }) => {
        const isScheduled = event.resource.session.status === "scheduled";

        return (
            <div className={styles.eventWrapper}>
                {isScheduled && (
                    <>
                        <button
                            className={styles.attendanceButton}
                            onClick={(e) => handleAttendanceClick(event.resource.session.classSessionId, e)}
                            title="Zarządzaj obecnością"
                        >
                            👥
                        </button>
                        <button
                            className={styles.substitutionButton}
                            onClick={(e) => handleSubstitutionClick(event.resource.session, e)}
                            title="Dodaj zastępstwo"
                        >
                            🔄
                        </button>
                        <button
                            className={styles.completeButton}
                            onClick={(e) => handleCompleteClick(event.resource.session, e)}
                            title="Oznacz jako wykonane"
                        >
                            ✓
                        </button>
                    </>
                )}
                <span className={styles.eventTitle}>{event.title}</span>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>Moje zajęcia</h1>
                {events.length === 0 ? (
                    <p style={{ marginTop: "20px", color: "#000" }}>Brak zajęć do wyświetlenia.</p>
                ) : (
                    <div className={styles.calendarWrapper}>
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 600 }}
                            view={view}
                            onView={(newView) => setView(newView as CalendarView)}
                            date={currentDate}
                            onNavigate={(newDate) => setCurrentDate(newDate)}
                            eventPropGetter={eventStyleGetter}
                            components={{
                                event: EventComponent,
                            }}
                            messages={{
                                next: "Następny",
                                previous: "Poprzedni",
                                today: "Dzisiaj",
                                month: "Miesiąc",
                                week: "Tydzień",
                                day: "Dzień",
                                agenda: "Agenda",
                                date: "Data",
                                time: "Czas",
                                event: "Wydarzenie",
                                noEventsInRange: "Brak wydarzeń w tym zakresie",
                            }}
                        />
                    </div>
                )}
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
