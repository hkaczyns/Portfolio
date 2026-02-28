import { X } from "lucide-react";
import styles from "./CancelEnrollmentModal.module.css";
import type { ClassGroupResponse } from "../../store/schedule/types";

const DAYS_OF_WEEK = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];

const formatTime = (timeStr: string): string => {
    try {
        const time = timeStr.split("T")[1] || timeStr;
        return time.substring(0, 5);
    } catch {
        return timeStr;
    }
};

interface CancelEnrollmentModalProps {
    classGroup: ClassGroupResponse;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

export const CancelEnrollmentModal = ({
    classGroup,
    isOpen,
    onClose,
    onConfirm,
    isLoading,
}: CancelEnrollmentModalProps) => {
    if (!isOpen) return null;

    const dayOfWeek = DAYS_OF_WEEK[classGroup.dayOfWeek] || `Dzień ${classGroup.dayOfWeek}`;
    const timeRange = `${formatTime(classGroup.startTime)} - ${formatTime(classGroup.endTime)}`;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Potwierdzenie wypisu</h2>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Zamknij">
                        <X size={24} />
                    </button>
                </div>
                <div className={styles.modalBody}>
                    <p className={styles.confirmationText}>Czy na pewno chcesz wypisać się z następujących zajęć?</p>
                    <div className={styles.classInfo}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Nazwa:</span>
                            <span className={styles.infoValue}>{classGroup.name}</span>
                        </div>
                        {classGroup.description && (
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Opis:</span>
                                <span className={styles.infoValue}>{classGroup.description}</span>
                            </div>
                        )}
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Dzień tygodnia:</span>
                            <span className={styles.infoValue}>{dayOfWeek}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Godziny:</span>
                            <span className={styles.infoValue}>{timeRange}</span>
                        </div>
                    </div>
                </div>
                <div className={styles.modalFooter}>
                    <button className={styles.cancelButton} onClick={onClose} disabled={isLoading}>
                        Anuluj
                    </button>
                    <button className={styles.confirmButton} onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? "Wypisywanie..." : "Potwierdzam wypis"}
                    </button>
                </div>
            </div>
        </div>
    );
};
