import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import styles from "./CookieConsent.module.css";

const COOKIE_CONSENT_KEY = "cookieConsentAccepted";

export const CookieConsent = () => {
    const { t } = useTranslation("common", { keyPrefix: "cookieConsent" });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consentAccepted = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!consentAccepted) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, "true");
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className={styles.cookieConsentContainer}>
            <button onClick={handleAccept} className={styles.closeButton} aria-label="Close">
                <X className={styles.closeIcon} />
            </button>
            <div className={styles.cookieConsentContent}>
                <p className={styles.cookieConsentText}>
                    {t("message")}{" "}
                    <Link to="/privacy-policy" className={styles.privacyLink}>
                        {t("privacyPolicy")}
                    </Link>
                </p>
            </div>
        </div>
    );
};
