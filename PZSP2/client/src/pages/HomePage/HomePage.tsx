import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./HomePage.module.css";

export const HomePage = () => {
    const { t } = useTranslation("common", { keyPrefix: "home" });

    return (
        <div className={styles.container}>
            <section className={styles.heroSection}>
                <div className={styles.heroImageWrapper}>
                    <img src="/images/Main_img_1.png" alt="Tancerze" className={styles.heroImage} />
                    <div className={styles.heroOverlay}>
                        <h1 className={styles.heroTitle}>TIP TAP</h1>
                        <p className={styles.heroSubtitle}>{t("schoolName")}</p>
                        <Link to="/calendar" className={styles.ctaButton}>
                            {t("seeOffer")}
                        </Link>
                    </div>
                </div>
            </section>

            <section className={styles.quoteSection}>
                <div className={styles.quoteContent}>
                    <div className={styles.quoteText}>
                        <blockquote className={styles.quote}>{t("quote")}</blockquote>
                        <p className={styles.quoteDescription}>{t("quoteDescription")}</p>
                    </div>
                    <div className={styles.quoteImage}>
                        <img src="/images/Main_img_2.png" alt="Tancerze" className={styles.sectionImage} />
                    </div>
                </div>
            </section>

            <section className={styles.benefitsSection}>
                <div className={styles.benefitsContent}>
                    <div className={styles.benefitsImage}>
                        <img src="/images/Main_img_3.png" alt="Tancerka" className={styles.sectionImage} />
                    </div>
                    <div className={styles.benefitsText}>
                        <p className={styles.benefitsDescription}>{t("benefitsDescription")}</p>
                        <p className={styles.benefitsCallToAction}>{t("joinFamily")}</p>
                    </div>
                </div>
            </section>

            <section className={styles.footerSection}>
                <h2 className={styles.footerTitle}>{t("startAdventure")}</h2>
                <Link to="/calendar" className={styles.footerButton}>
                    {t("seeOffer")}
                </Link>
            </section>
        </div>
    );
};
