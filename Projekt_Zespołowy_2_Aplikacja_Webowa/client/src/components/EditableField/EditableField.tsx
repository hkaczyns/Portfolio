import { Edit2, Check, X } from "lucide-react";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import styles from "./EditableField.module.css";

export interface EditableFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
    error?: string;
    touched?: boolean;
    icon?: ReactNode;
    isEditing: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    canSave: boolean;
    isLoading?: boolean;
}

export const EditableField = ({
    label,
    value,
    onChange,
    onBlur,
    error,
    touched,
    icon,
    isEditing,
    onEdit,
    onSave,
    onCancel,
    canSave,
    isLoading,
}: EditableFieldProps) => {
    const { t } = useTranslation("errors", { keyPrefix: "validation" });

    return (
        <div className={styles.fieldContainer}>
            <label className={styles.label}>{label}</label>
            <div className={styles.inputWrapper}>
                <div className={`${styles.inputContainer} ${error && touched ? styles.inputContainerError : ""}`}>
                    {icon && <div className={styles.icon}>{icon}</div>}
                    <input
                        className={styles.input}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        disabled={!isEditing}
                        readOnly={!isEditing}
                        onClick={(e) => {
                            if (!isEditing) {
                                e.stopPropagation();
                            }
                        }}
                    />
                    {isEditing ? (
                        <div className={styles.actionButtons}>
                            <button
                                className={styles.actionButton}
                                onClick={onSave}
                                disabled={!canSave || isLoading}
                                aria-label="Zapisz"
                            >
                                <Check size={20} />
                            </button>
                            <button
                                className={styles.actionButton}
                                onClick={onCancel}
                                disabled={isLoading}
                                aria-label="Anuluj"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ) : (
                        <button className={styles.editButton} onClick={onEdit} aria-label="Edytuj">
                            <Edit2 size={20} />
                        </button>
                    )}
                </div>
                {error && touched && (
                    <div className={styles.errorMessage}>
                        <span>{t(error)}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
