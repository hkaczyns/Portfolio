import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useGetPublicScheduleQuery, useGetSkillLevelsQuery, useGetTopicsQuery } from "../../store/schedule/api";
import styles from "./PublicCalendarPage.module.css";

const formatTime = (timeStr: string): string => {
    try {
        const time = timeStr.split("T")[1] || timeStr;
        return time.substring(0, 5);
    } catch {
        return timeStr;
    }
};

const formatDate = (dateStr: string): string => {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("pl-PL", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch {
        return dateStr;
    }
};

export const PublicCalendarPage = () => {
    const { t } = useTranslation("common", { keyPrefix: "calendar" });
    const [levelFilter, setLevelFilter] = useState<string | null>(null);
    const [topicFilter, setTopicFilter] = useState<string | null>(null);

    const { data: scheduleData, isLoading: isLoadingSchedule } = useGetPublicScheduleQuery({
        level: levelFilter,
        topic: topicFilter,
    });

    const { data: skillLevels, isLoading: isLoadingSkillLevels } = useGetSkillLevelsQuery();
    const { data: topics, isLoading: isLoadingTopics } = useGetTopicsQuery();

    const isLoading = isLoadingSchedule || isLoadingSkillLevels || isLoadingTopics;

    const skillLevelOptions = useMemo(() => {
        if (!skillLevels) return [];
        return [...skillLevels].sort((a, b) => a.id - b.id);
    }, [skillLevels]);

    const topicOptions = useMemo(() => {
        if (!topics) return [];
        return [...topics].sort((a, b) => a.id - b.id);
    }, [topics]);

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <p>{t("loading")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>{t("title")}</h1>

                <div className={styles.filtersContainer}>
                    <div className={styles.filtersRow}>
                        <div className={styles.filterGroup}>
                            <label htmlFor="skill-level-filter" className={styles.filterLabel}>
                                Poziom zaawansowania:
                            </label>
                            <select
                                id="skill-level-filter"
                                className={styles.filterSelect}
                                value={levelFilter || ""}
                                onChange={(e) => setLevelFilter(e.target.value || null)}
                            >
                                <option value="">Wszystkie poziomy</option>
                                {skillLevelOptions.map((level) => (
                                    <option key={level.id} value={level.name}>
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
                                value={topicFilter || ""}
                                onChange={(e) => setTopicFilter(e.target.value || null)}
                            >
                                <option value="">Wszystkie tematy</option>
                                {topicOptions.map((topic) => (
                                    <option key={topic.id} value={topic.name}>
                                        {topic.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.filtersRow}>
                        <button
                            className={styles.clearFiltersButton}
                            onClick={() => {
                                setLevelFilter(null);
                                setTopicFilter(null);
                            }}
                        >
                            Wyczyść filtry
                        </button>
                    </div>
                </div>

                {!scheduleData?.groups || scheduleData.groups.length === 0 ? (
                    <p style={{ marginTop: "20px" }}>Brak grup zajęciowych do wyświetlenia.</p>
                ) : (
                    <div className={styles.listContainer}>
                        {scheduleData.groups.map((group) => (
                            <div key={group.groupId} className={styles.listItem}>
                                <div className={styles.listItemHeader}>
                                    <h3 className={styles.listItemTitle}>{group.name}</h3>
                                    <span className={styles.statusBadge}>
                                        {group.availableSpots > 0 ? "Dostępne" : "Pełne"}
                                    </span>
                                </div>
                                <div className={styles.listItemDetails}>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>Poziom zaawansowania:</span>
                                        <span>{group.level}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>Temat:</span>
                                        <span>{group.topic}</span>
                                    </div>
                                    {group.room && (
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Sala:</span>
                                            <span>{group.room.name}</span>
                                        </div>
                                    )}
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>Liczba uczestników:</span>
                                        <span>
                                            {group.enrolledCount} / {group.capacity}
                                        </span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>Dostępne miejsca:</span>
                                        <span>{group.availableSpots}</span>
                                    </div>
                                    {group.waitlistCount > 0 && (
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Lista oczekujących:</span>
                                            <span>{group.waitlistCount}</span>
                                        </div>
                                    )}
                                    {group.occurrences.length > 0 && (
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Zajęcia:</span>
                                            <div className={styles.occurrencesList}>
                                                {group.occurrences
                                                    .filter((occ) => !occ.isCancelled)
                                                    .map((occurrence, idx) => (
                                                        <div key={idx} className={styles.occurrenceItem}>
                                                            <span>{formatDate(occurrence.startAt)}</span>
                                                            <span>
                                                                {formatTime(occurrence.startAt)} -{" "}
                                                                {formatTime(occurrence.endAt)}
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
