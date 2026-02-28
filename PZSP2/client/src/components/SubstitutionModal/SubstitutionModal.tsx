import { useState } from "react";
import type { InstructorUser } from "../../store/schedule/api";
import styles from "./SubstitutionModal.module.css";

interface SubstitutionModalProps {
    sessionName: string;
    instructors: InstructorUser[];
    onConfirm: (substituteInstructorId: string, reason: string) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const SubstitutionModal = ({
    sessionName,
    instructors,
    onConfirm,
    onCancel,
    isLoading,
}: SubstitutionModalProps) => {
    const [substituteInstructorId, setSubstituteInstructorId] = useState("");
    const [reason, setReason] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!substituteInstructorId) {
            alert("Wybierz instruktora zastępującego");
            return;
        }
        onConfirm(substituteInstructorId, reason);
    };

    return (
        <div className={styles.modalOverlay} onClick={onCancel}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>Dodaj zastępstwo</h2>
                <p className={styles.sessionInfo}>
                    Zajęcia: <strong>{sessionName}</strong>
                </p>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="instructor" className={styles.label}>
                            Instruktor zastępujący:
                        </label>
                        <select
                            id="instructor"
                            className={styles.select}
                            value={substituteInstructorId}
                            onChange={(e) => setSubstituteInstructorId(e.target.value)}
                            disabled={isLoading}
                            required
                        >
                            <option value="">Wybierz instruktora</option>
                            {instructors.map((instructor) => (
                                <option key={instructor.id} value={instructor.id}>
                                    {instructor.firstName} {instructor.lastName} ({instructor.email})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="reason" className={styles.label}>
                            Powód zastępstwa:
                        </label>
                        <textarea
                            id="reason"
                            className={styles.textarea}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Wpisz powód zastępstwa..."
                            rows={4}
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <div className={styles.buttonGroup}>
                        <button type="button" className={styles.cancelButton} onClick={onCancel} disabled={isLoading}>
                            Anuluj
                        </button>
                        <button type="submit" className={styles.confirmButton} disabled={isLoading}>
                            {isLoading ? "Zapisywanie..." : "Potwierdź"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
