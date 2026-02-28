import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import i18n from "../../utils/i18n";
import styles from "./Header.module.css";

export const Header = () => {
    const { t, i18n: i18nInstance } = useTranslation("common", { keyPrefix: "header" });

    const toggleLanguage = () => {
        const newLang = i18nInstance.language === "pl" ? "en" : "pl";
        i18n.changeLanguage(newLang);
    };

    return (
        <div className={styles.headerContainer}>
            <div className={styles.headerContent}>
                <div className={styles.leftSection}>
                    <button onClick={toggleLanguage} className={styles.languageButton}>
                        {i18nInstance.language === "pl" ? "EN" : "PL"}
                    </button>
                    <nav className={styles.leftNav}>
                        <Link to="/calendar" className={styles.navLink}>
                            {t("calendar")}
                        </Link>
                        <Link to="/room-rental" className={styles.navLink}>
                            {t("roomRental")}
                        </Link>
                    </nav>
                </div>

                <Link to="/" className={styles.logoLink}>
                    <img src="/images/tiptap_logo_black.png" alt="TiP TAP" className={styles.logo} />
                </Link>

                <div className={styles.rightSection}>
                    <nav className={styles.rightNav}>
                        <Link to="/contact" className={styles.navLink}>
                            {t("contact")}
                        </Link>
                        <Link to="/login" className={styles.navLink}>
                            {t("login")}
                        </Link>
                        <Link to="/register" className={styles.navLink}>
                            {t("register")}
                        </Link>
                    </nav>
                </div>
            </div>
        </div>
    );
};
