import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useCallback, useState, type ReactNode } from "react";
import styles from "./FormField.module.css";
import { useTranslation } from "react-i18next";

export interface FormFieldProps {
    value: string;
    onChangeText: (text: string) => void;
    onBlur: (e: any) => void;
    placeholder?: string;
    error?: string;
    touched?: boolean;
    icon?: ReactNode;
    isPassword?: boolean;
}

export const FormField = ({
    value,
    onChangeText,
    onBlur,
    placeholder,
    error,
    touched,
    icon,
    isPassword,
}: FormFieldProps) => {
    const { t } = useTranslation("errors", { keyPrefix: "validation" });
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const onEyeClick = useCallback(() => {
        setIsPasswordVisible((prev) => !prev);
    }, []);

    return (
        <div className={styles.formFieldContainer}>
            <div className={`${styles.inputContainer} ${error && touched ? styles.inputContainerError : ""}`}>
                {icon && <div className={styles.icon}>{icon}</div>}
                <input
                    className={styles.input}
                    type={isPassword && !isPasswordVisible ? "password" : "text"}
                    value={value}
                    onChange={(e) => onChangeText(e.target.value)}
                    onBlur={onBlur}
                    placeholder={placeholder}
                />
                {isPassword && (
                    <div className={styles.icon} onClick={onEyeClick}>
                        {isPasswordVisible ? <EyeOff /> : <Eye />}
                    </div>
                )}
                {error && touched && (
                    <div className={`${styles.icon} ${styles.errorIcon}`}>
                        <AlertCircle />
                    </div>
                )}
            </div>
            <div className={styles.errorMessage}>
                <span className={error && touched ? styles.errorVisible : styles.errorHidden}>
                    {error && touched ? t(error) : ""}
                </span>
            </div>
        </div>
    );
};
