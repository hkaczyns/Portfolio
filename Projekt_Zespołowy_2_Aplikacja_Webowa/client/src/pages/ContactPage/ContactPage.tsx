import { useTranslation } from "react-i18next";
import { Mail, Phone, MapPin, Clock, Instagram, Youtube, Facebook } from "lucide-react";
import { useGetContactQuery } from "../../store/public/api";
import styles from "./ContactPage.module.css";

export const ContactPage = () => {
    const { t } = useTranslation("common", { keyPrefix: "contact" });
    const { data: contactInfo, isLoading, isError } = useGetContactQuery();

    return (
        <div className={styles.contactContainer}>
            <div className={styles.contactContent}>
                <h1 className={styles.title}>{t("title")}</h1>
                <p className={styles.description}>{t("description")}</p>

                {isLoading && <p className={styles.loading}>{t("loading")}</p>}
                {isError && <p className={styles.error}>{t("error")}</p>}

                {contactInfo && (
                    <div className={styles.contactInfo}>
                        <div className={styles.contactItem}>
                            <div className={styles.contactHeader}>
                                <Mail className={styles.contactIcon} />
                                <h2 className={styles.contactLabel}>{t("email")}</h2>
                            </div>
                            <a href={`mailto:${contactInfo.contact_email}`} className={styles.contactValue}>
                                {contactInfo.contact_email}
                            </a>
                        </div>

                        <div className={styles.contactItem}>
                            <div className={styles.contactHeader}>
                                <Phone className={styles.contactIcon} />
                                <h2 className={styles.contactLabel}>{t("phone")}</h2>
                            </div>
                            <a href={`tel:${contactInfo.phone_number}`} className={styles.contactValue}>
                                {contactInfo.phone_number}
                            </a>
                        </div>

                        <div className={styles.contactItem}>
                            <div className={styles.contactHeader}>
                                <MapPin className={styles.contactIcon} />
                                <h2 className={styles.contactLabel}>{t("address")}</h2>
                            </div>
                            <p className={styles.contactValue}>{contactInfo.address}</p>
                        </div>

                        <div className={styles.contactItem}>
                            <div className={styles.contactHeader}>
                                <Clock className={styles.contactIcon} />
                                <h2 className={styles.contactLabel}>{t("hours")}</h2>
                            </div>
                            <p className={styles.contactValue}>{contactInfo.open_hours}</p>
                        </div>
                    </div>
                )}

                <div className={styles.socialMediaSection}>
                    <h2 className={styles.socialTitle}>{t("socialMedia")}</h2>
                    <div className={styles.socialIcons}>
                        <a
                            href={t("instagramUrl")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialIcon}
                            aria-label="Instagram"
                        >
                            <Instagram className={styles.socialIconSvg} />
                        </a>
                        <a
                            href={t("youtubeUrl")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialIcon}
                            aria-label="YouTube"
                        >
                            <Youtube className={styles.socialIconSvg} />
                        </a>
                        <a
                            href={t("facebookUrl")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialIcon}
                            aria-label="Facebook"
                        >
                            <Facebook className={styles.socialIconSvg} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
