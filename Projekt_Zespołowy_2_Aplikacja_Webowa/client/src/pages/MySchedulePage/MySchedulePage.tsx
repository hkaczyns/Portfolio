import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useCancelEnrollmentMutation, useGetEnrollmentsQuery } from "../../store/enrollment/api";
import { useGetStudentCalendarQuery } from "../../store/schedule/api";
import { useAlert } from "../../components/Alert/AlertContext";
import { CancelEnrollmentModal } from "../../components/CancelEnrollmentModal/CancelEnrollmentModal";
import type { ClassGroupResponse } from "../../store/schedule/types";
import styles from "./MySchedulePage.module.css";

const localizer = momentLocalizer(moment);

type CalendarView = "month" | "week" | "day" | "agenda" | "work_week";

interface CalendarEvent {
    title: string;
    start: Date;
    end: Date;
    resource: {
        classSessionId: number;
        classGroupId: number;
        classGroupName: string;
        status: string;
        date: string;
        startTime: string;
        endTime: string;
        enrollmentId?: number;
    };
}

export const MySchedulePage = () => {
    const { t, i18n } = useTranslation("common", { keyPrefix: "calendar" });
    const { publish } = useAlert();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<CalendarView>("week");
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const dateRange = useMemo(() => {
        const today = new Date();
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);
        const oneMonthLater = new Date(today);
        oneMonthLater.setMonth(today.getMonth() + 1);

        return {
            fromDate: oneMonthAgo.toISOString().split("T")[0],
            toDate: oneMonthLater.toISOString().split("T")[0],
        };
    }, []);

    const {
        data: calendarSessions,
        isLoading: isLoadingSessions,
        refetch: refetchSessions,
    } = useGetStudentCalendarQuery(
        {
            fromDate: dateRange.fromDate,
            toDate: dateRange.toDate,
        },
        {
            refetchOnMountOrArgChange: true,
        },
    );

    const { data: enrollments } = useGetEnrollmentsQuery();

    const [cancelEnrollment, { isLoading: isCancelling }] = useCancelEnrollmentMutation();

    useEffect(() => {
        const locale = i18n.language === "pl" ? "pl" : "en";
        if (locale === "pl") {
            // @ts-expect-error - moment/locale/pl is a runtime import
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
        if (!calendarSessions) return [];

        const enrollmentMap = new Map<number, number>();
        if (enrollments) {
            enrollments.forEach((enrollment) => {
                enrollmentMap.set(enrollment.classGroupId, enrollment.id);
            });
        }

        return calendarSessions.map((session) => {
            const sessionDate = new Date(session.date);

            let startTimeStr = session.startTime;
            if (startTimeStr.includes("T")) {
                startTimeStr = startTimeStr.split("T")[1] || startTimeStr;
            }
            if (startTimeStr.includes("Z")) {
                startTimeStr = startTimeStr.replace("Z", "");
            }
            const startTimeParts = startTimeStr.split(":");
            const startHour = parseInt(startTimeParts[0] || "0", 10);
            const startMinute = parseInt(startTimeParts[1] || "0", 10);

            let endTimeStr = session.endTime;
            if (endTimeStr.includes("T")) {
                endTimeStr = endTimeStr.split("T")[1] || endTimeStr;
            }
            if (endTimeStr.includes("Z")) {
                endTimeStr = endTimeStr.replace("Z", "");
            }
            const endTimeParts = endTimeStr.split(":");
            const endHour = parseInt(endTimeParts[0] || "0", 10);
            const endMinute = parseInt(endTimeParts[1] || "0", 10);

            const start = new Date(sessionDate);
            start.setHours(startHour, startMinute, 0, 0);

            const end = new Date(sessionDate);
            end.setHours(endHour, endMinute, 0, 0);

            const statusLabel = session.status === "scheduled" ? " [Zaplanowane]" : "";

            return {
                title: `${session.classGroupName}${statusLabel}`,
                start,
                end,
                resource: {
                    classSessionId: session.classSessionId,
                    classGroupId: session.classGroupId,
                    classGroupName: session.classGroupName,
                    status: session.status,
                    date: session.date,
                    startTime: session.startTime,
                    endTime: session.endTime,
                    enrollmentId: enrollmentMap.get(session.classGroupId),
                },
            };
        });
    }, [calendarSessions, enrollments]);

    const isLoading = isLoadingSessions;

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Mój grafik</h1>
                    <p style={{ color: "#000" }}>{t("loading")}</p>
                </div>
            </div>
        );
    }

    if (!calendarSessions || calendarSessions.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Mój grafik</h1>
                    <p style={{ marginTop: "20px", color: "#000" }}>Nie jesteś zapisany na żadne zajęcia.</p>
                </div>
            </div>
        );
    }

    const handleCancelClick = (event: CalendarEvent, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedEvent(event);
        setIsCancelModalOpen(true);
    };

    const handleCancelModalClose = () => {
        setIsCancelModalOpen(false);
        setSelectedEvent(null);
    };

    const handleConfirmCancel = async () => {
        if (!selectedEvent || !selectedEvent.resource.enrollmentId) return;

        try {
            await cancelEnrollment(selectedEvent.resource.enrollmentId).unwrap();
            publish("Zostałeś pomyślnie wypisany z zajęć.", "success");
            handleCancelModalClose();
            refetchSessions();
        } catch (error: any) {
            const errorMessage = error?.data?.detail || error?.message || "Wystąpił błąd podczas wypisywania z zajęć.";
            publish(errorMessage, "error");
        }
    };

    const eventStyleGetter = (event: CalendarEvent) => {
        const isScheduled = event.resource.status === "scheduled";
        return {
            className: isScheduled ? styles.eventActive : styles.eventWaitlist,
            style: {
                backgroundColor: isScheduled ? "#4caf50" : "#ff9800",
                color: "white",
                borderRadius: "4px",
                border: "none",
            },
        };
    };

    const EventComponent = ({ event }: { event: CalendarEvent }) => {
        const isScheduled = event.resource.status === "scheduled";
        const hasEnrollment = event.resource.enrollmentId !== undefined;

        return (
            <div className={styles.eventWrapper}>
                {isScheduled && hasEnrollment && (
                    <button
                        className={styles.cancelButton}
                        onClick={(e) => handleCancelClick(event, e)}
                        title="Wypisz się"
                    >
                        ×
                    </button>
                )}
                <span className={styles.eventTitle}>{event.title}</span>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>Mój grafik</h1>
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
            {selectedEvent && (
                <CancelEnrollmentModal
                    classGroup={
                        {
                            id: selectedEvent.resource.classGroupId,
                            name: selectedEvent.resource.classGroupName,
                            description: "",
                        } as ClassGroupResponse
                    }
                    isOpen={isCancelModalOpen}
                    onClose={handleCancelModalClose}
                    onConfirm={handleConfirmCancel}
                    isLoading={isCancelling}
                />
            )}
        </div>
    );
};
