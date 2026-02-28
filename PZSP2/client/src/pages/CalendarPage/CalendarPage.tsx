import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    useGetClassGroupsQuery,
    useGetSkillLevelsQuery,
    useGetTopicsQuery,
    useGetSemestersQuery,
} from "../../store/schedule/api";
import { useGetEnrollmentsQuery, useCreateEnrollmentMutation } from "../../store/enrollment/api";
import { useAlert } from "../../components/Alert/AlertContext";
import { EnrollmentModal } from "../../components/EnrollmentModal/EnrollmentModal";
import type { ClassGroupResponse } from "../../store/schedule/types";
import styles from "./CalendarPage.module.css";

const DAYS_OF_WEEK = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];

const formatTime = (timeStr: string): string => {
    try {
        const time = timeStr.split("T")[1] || timeStr;
        return time.substring(0, 5);
    } catch {
        return timeStr;
    }
};

export const CalendarPage = () => {
    const { t } = useTranslation("common", { keyPrefix: "calendar" });
    const { publish } = useAlert();
    const [semesterId, setSemesterId] = useState<number | null>(null);
    const [skillLevelId, setSkillLevelId] = useState<number | null>(null);
    const [topicId, setTopicId] = useState<number | null>(null);
    const [onlyAvailable, setOnlyAvailable] = useState(false);
    const [includeWaitlist, setIncludeWaitlist] = useState(false);
    const [selectedClassGroup, setSelectedClassGroup] = useState<ClassGroupResponse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [createEnrollment, { isLoading: isEnrolling }] = useCreateEnrollmentMutation();
    const { data: enrollments } = useGetEnrollmentsQuery();
    const { data: skillLevels, isLoading: isLoadingSkillLevels } = useGetSkillLevelsQuery();
    const { data: topics, isLoading: isLoadingTopics } = useGetTopicsQuery();
    const { data: semesters, isLoading: isLoadingSemesters } = useGetSemestersQuery();
    const {
        data: classGroups,
        isLoading: isLoadingClassGroups,
        isError,
        error,
    } = useGetClassGroupsQuery({
        semesterId,
        skillLevelId,
        topicId,
        onlyAvailable,
        includeWaitlist,
    });

    const isLoading = isLoadingClassGroups || isLoadingSkillLevels || isLoadingTopics || isLoadingSemesters;

    const semesterOptions = useMemo(() => {
        if (!semesters) return [];
        return [...semesters].sort((a, b) => a.id - b.id);
    }, [semesters]);

    const skillLevelOptions = useMemo(() => {
        if (!skillLevels) return [];
        return [...skillLevels].sort((a, b) => a.id - b.id);
    }, [skillLevels]);

    const topicOptions = useMemo(() => {
        if (!topics) return [];
        return [...topics].sort((a, b) => a.id - b.id);
    }, [topics]);

    const handleClearFilters = () => {
        setSemesterId(null);
        setSkillLevelId(null);
        setTopicId(null);
        setOnlyAvailable(false);
        setIncludeWaitlist(false);
    };

    const handleEnrollClick = (group: ClassGroupResponse) => {
        setSelectedClassGroup(group);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedClassGroup(null);
    };

    const handleConfirmEnrollment = async () => {
        if (!selectedClassGroup) return;

        try {
            const result = await createEnrollment({ classGroupId: selectedClassGroup.id }).unwrap();

            if (result.enrollment.status === "ACTIVE") {
                publish("Zostałeś pomyślnie zapisany na zajęcia!", "success");
            } else if (result.enrollment.status === "WAITLISTED") {
                publish(
                    "Zostałeś dodany do listy rezerwowej. Zostaniesz powiadomiony, gdy miejsce będzie dostępne.",
                    "success",
                );
            }

            handleModalClose();
        } catch (error: any) {
            const errorMessage =
                error?.data?.detail || error?.message || "Wystąpił błąd podczas zapisywania na zajęcia.";
            publish(errorMessage, "error");
        }
    };

    const getUserEnrollment = (classGroupId: number) => {
        return enrollments?.find((enrollment) => enrollment.classGroupId === classGroupId);
    };

    if (isLoading) {
        return (
            <div className={styles.calendarContainer}>
                <div className={styles.calendarContent}>
                    <p>{t("loading")}</p>
                </div>
            </div>
        );
    }

    if (isError) {
        const errorMessage =
            error && "status" in error && error.status === 403
                ? "Brak uprawnień do wyświetlenia grup zajęciowych. Wymagane są uprawnienia administratora."
                : error && "status" in error && error.status === 401
                  ? "Musisz być zalogowany, aby wyświetlić grupy zajęciowe."
                  : t("error");

        return (
            <div className={styles.calendarContainer}>
                <div className={styles.calendarContent}>
                    <h1 className={styles.title}>{t("title")}</h1>
                    <p>{errorMessage}</p>
                    {error && "status" in error && (
                        <p style={{ fontSize: "0.9em", color: "#666", marginTop: "10px" }}>Status: {error.status}</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.calendarContainer}>
            <div className={styles.calendarContent}>
                <h1 className={styles.title}>{t("title")}</h1>

                <div className={styles.filtersContainer}>
                    <div className={styles.filtersRow}>
                        <div className={styles.filterGroup}>
                            <label htmlFor="semester-filter" className={styles.filterLabel}>
                                Semestr:
                            </label>
                            <select
                                id="semester-filter"
                                className={styles.filterSelect}
                                value={semesterId || ""}
                                onChange={(e) => setSemesterId(e.target.value ? Number(e.target.value) : null)}
                            >
                                <option value="">Wszystkie semestry</option>
                                {semesterOptions.map((semester) => (
                                    <option key={semester.id} value={semester.id}>
                                        {semester.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label htmlFor="skill-level-filter" className={styles.filterLabel}>
                                Poziom zaawansowania:
                            </label>
                            <select
                                id="skill-level-filter"
                                className={styles.filterSelect}
                                value={skillLevelId || ""}
                                onChange={(e) => setSkillLevelId(e.target.value ? Number(e.target.value) : null)}
                            >
                                <option value="">Wszystkie poziomy</option>
                                {skillLevelOptions.map((level) => (
                                    <option key={level.id} value={level.id}>
                                        {level.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label htmlFor="topic-filter" className={styles.filterLabel}>
                                Temat:
                            </label>
                            <select
                                id="topic-filter"
                                className={styles.filterSelect}
                                value={topicId || ""}
                                onChange={(e) => setTopicId(e.target.value ? Number(e.target.value) : null)}
                            >
                                <option value="">Wszystkie tematy</option>
                                {topicOptions.map((topic) => (
                                    <option key={topic.id} value={topic.id}>
                                        {topic.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.filtersRow}>
                        <div className={styles.filterCheckbox}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={onlyAvailable}
                                    onChange={(e) => setOnlyAvailable(e.target.checked)}
                                />
                                <span>Tylko dostępne grupy</span>
                            </label>
                        </div>

                        <div className={styles.filterCheckbox}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={includeWaitlist}
                                    onChange={(e) => setIncludeWaitlist(e.target.checked)}
                                />
                                <span>Uwzględnij grupy z listą oczekujących</span>
                            </label>
                        </div>

                        <button className={styles.clearFiltersButton} onClick={handleClearFilters}>
                            Wyczyść filtry
                        </button>
                    </div>
                </div>

                {!classGroups || classGroups.length === 0 ? (
                    <p style={{ marginTop: "20px" }}>Brak grup zajęciowych do wyświetlenia.</p>
                ) : (
                    <div className={styles.listContainer}>
                        {classGroups.map((group) => (
                            <div key={group.id} className={styles.listItem}>
                                <div className={styles.listItemHeader}>
                                    <h3 className={styles.listItemTitle}>{group.name}</h3>
                                    <span className={styles.statusBadge}>{group.status}</span>
                                </div>
                                {group.description && <p className={styles.listItemDescription}>{group.description}</p>}
                                <div className={styles.listItemDetails}>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>Dzień tygodnia:</span>
                                        <span>{DAYS_OF_WEEK[group.dayOfWeek] || `Dzień ${group.dayOfWeek}`}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>Godziny:</span>
                                        <span>
                                            {formatTime(group.startTime)} - {formatTime(group.endTime)}
                                        </span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>Liczba uczestników:</span>
                                        <span>
                                            {group.enrolledCount} / {group.capacity}
                                        </span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>Status:</span>
                                        <span>{group.isPublic ? "Publiczna" : "Prywatna"}</span>
                                    </div>
                                </div>
                                <div className={styles.listItemActions}>
                                    {(() => {
                                        const enrollment = getUserEnrollment(group.id);
                                        if (enrollment) {
                                            if (enrollment.status === "ACTIVE") {
                                                return (
                                                    <div className={styles.enrollmentStatus}>
                                                        <span className={styles.statusTextActive}>
                                                            Jesteś uczestnikiem
                                                        </span>
                                                    </div>
                                                );
                                            } else if (enrollment.status === "WAITLISTED") {
                                                return (
                                                    <div className={styles.enrollmentStatus}>
                                                        <span className={styles.statusTextWaitlist}>
                                                            Jesteś na liście rezerwowej
                                                        </span>
                                                    </div>
                                                );
                                            }
                                        }
                                        return (
                                            <button
                                                className={styles.enrollButton}
                                                onClick={() => handleEnrollClick(group)}
                                            >
                                                Zapisz się
                                            </button>
                                        );
                                    })()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {selectedClassGroup && (
                <EnrollmentModal
                    classGroup={selectedClassGroup}
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    onConfirm={handleConfirmEnrollment}
                    isLoading={isEnrolling}
                />
            )}
        </div>
    );
};
