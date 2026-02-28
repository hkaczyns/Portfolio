import { useState } from "react";
import styles from "./CompleteSessionModal.module.css";

interface CompleteSessionModalProps {
    sessionName: string;
    onConfirm: (notes: string) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const CompleteSessionModal = ({ sessionName, onConfirm, onCancel, isLoading }: CompleteSessionModalProps) => {
    const [notes, setNotes] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(notes);
    };

    return (
        <div className={styles.modalOverlay} onClick={onCancel}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>Oznacz zajęcia jako wykonane</h2>
                <p className={styles.sessionInfo}>
                    Zajęcia: <strong>{sessionName}</strong>
                </p>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="notes" className={styles.label}>
                            Notatka (opcjonalnie):
                        </label>
                        <textarea
                            id="notes"
                            className={styles.textarea}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Wpisz notatkę dotyczącą zajęć..."
                            rows={4}
                            disabled={isLoading}
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
