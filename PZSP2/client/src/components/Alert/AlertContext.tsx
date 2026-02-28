import { createContext, useCallback, useContext, useRef, useState } from "react";

/* eslint-disable react-refresh/only-export-components */

type AlertType = "success" | "error";

export interface AlertContextValue {
    message: string;
    alertType: AlertType | undefined;
    publish: (message: string, alertType: AlertType, durationMs?: number) => void;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
    const [message, setMessage] = useState<string>("");
    const [alertType, setAlertType] = useState<AlertType | undefined>(undefined);

    const timeoutRef = useRef<number | undefined>(undefined);

    const publish = useCallback((msg: string, alertType: AlertType, durationMs = 5000) => {
        if (timeoutRef.current !== undefined) window.clearTimeout(timeoutRef.current);
        setMessage(msg);
        setAlertType(alertType);

        timeoutRef.current = window.setTimeout(() => {
            setMessage("");
            setAlertType(undefined);
            timeoutRef.current = undefined;
        }, durationMs);
    }, []);

    return <AlertContext.Provider value={{ message, alertType, publish }}>{children}</AlertContext.Provider>;
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) throw new Error("useAlert must be used within an AlertProvider");
    return context;
};
