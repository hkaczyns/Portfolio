import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import styles from "./CookiePolicyPage.module.css";

export const TermsOfServicePage = () => {
    const { t, i18n } = useTranslation("common", { keyPrefix: "termsOfService" });
    const locale = i18n.language === "pl" ? "pl-PL" : "en-US";
    const currentDate = useMemo(
        () =>
            new Date().toLocaleDateString(locale, {
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
        [locale],
    );

    return (
        <div className={styles.policyContainer}>
            <div className={styles.policyContent}>
                <h1 className={styles.title}>{t("title")}</h1>
                <p className={styles.lastUpdated}>{t("lastUpdated", { date: currentDate })}</p>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t("section1.title")}</h2>
                    <p className={styles.paragraph}>{t("section1.content")}</p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t("section2.title")}</h2>
                    <p className={styles.paragraph}>{t("section2.content")}</p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t("section3.title")}</h2>
                    <p className={styles.paragraph}>{t("section3.content")}</p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t("section4.title")}</h2>
                    <p className={styles.paragraph}>{t("section4.content")}</p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t("section5.title")}</h2>
                    <p className={styles.paragraph}>{t("section5.content")}</p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t("section6.title")}</h2>
                    <p className={styles.paragraph}>{t("section6.content")}</p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t("section7.title")}</h2>
                    <p className={styles.paragraph}>{t("section7.content")}</p>
                </section>
            </div>
        </div>
    );
};
