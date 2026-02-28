import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

export const Footer = () => {
    const { t } = useTranslation("common", { keyPrefix: "footer" });
    const currentYear = new Date().getFullYear();

    return (
        <div className={styles.footerContainer}>
            <div className={styles.footerContent}>
                <div className={styles.logoSection}>
                    <img src="/images/titptap_logo_white.png" alt="TiP TAP" className={styles.logo} />
                </div>
                <div className={styles.linksSection}>
                    <div className={styles.linkColumn}>
                        <h3 className={styles.columnTitle}>{t("company.title", { year: currentYear })}</h3>
                        <ul className={styles.linkList}>
                            <li>
                                <Link to="/privacy-policy" className={styles.link}>
                                    {t("company.privacyPolicy")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms-of-service" className={styles.link}>
                                    {t("company.termsOfService")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className={styles.link}>
                                    {t("company.contact")}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
