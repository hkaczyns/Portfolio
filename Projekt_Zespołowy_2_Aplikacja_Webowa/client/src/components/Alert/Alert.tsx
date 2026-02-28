import { useAlert } from "./AlertContext";
import styles from "./Alert.module.css";

export const Alert = () => {
    const { message, alertType } = useAlert();

    if (!message || !alertType) return null;

    return (
        <div className={`${styles.alert} ${alertType === "success" ? styles.alertSuccess : styles.alertError}`}>
            {message}
        </div>
    );
};
