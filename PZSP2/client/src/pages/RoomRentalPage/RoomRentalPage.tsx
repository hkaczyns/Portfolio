import { useTranslation } from "react-i18next";
import { Mail, Phone } from "lucide-react";
import { useGetContactQuery } from "../../store/public/api";
import styles from "./RoomRentalPage.module.css";

export const RoomRentalPage = () => {
    const { t } = useTranslation("common", { keyPrefix: "roomRental" });
    const { data: contactInfo, isLoading, isError } = useGetContactQuery();

    return (
        <div className={styles.container}>
            <div className={styles.content}>
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
                    </div>
                )}
            </div>
        </div>
    );
};
