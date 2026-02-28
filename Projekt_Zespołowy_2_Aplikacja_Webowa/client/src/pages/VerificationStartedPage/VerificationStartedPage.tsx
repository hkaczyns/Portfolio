import { useNavigate } from "react-router";
import { useAlert } from "../../components/Alert/AlertContext";
import { useEffect } from "react";
import styles from "./VerificationStartedPage.module.css";
import { SECONDARY_TEXT_COLOR, UNKNOWN_ERROR } from "../../constants/constants";
import { useAppSelector } from "../../store/store";
import { useTranslation } from "react-i18next";
import { selectEmail } from "../../store/auth/selectors";
import { useResendVerificationEmail } from "../../store/auth/api/useResendVerificationEmail";
import { Spinner } from "../../components/Spinner/Spinner";
import { useVerificationCooldown } from "./hooks/useVerificationCooldown";

export const VerificationStartedPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation("common", { keyPrefix: "verification" });
    const { t: tError } = useTranslation("errors", { keyPrefix: "common" });
    const { publish } = useAlert();

    const email = useAppSelector(selectEmail);

    const { resendVerificationEmail, isLoading, isSuccess } = useResendVerificationEmail();
    const { isCooldownActive, cooldown } = useVerificationCooldown();

    useEffect(() => {
        if (isSuccess) publish(t("resendSuccessMessage"), "success");
    }, [isSuccess, publish, t]);

    useEffect(() => {
        if (!email) {
            publish(tError(UNKNOWN_ERROR), "error");
            navigate("/login");
        }
    }, [email, publish, tError, navigate]);

    return (
        <div className={styles.container}>
            <div className={styles.infoContainer}>
                <div className={styles.verificationLabel}>{t("title")}</div>
                <div className={styles.paragraph}>
                    {t("firstParagraph")}
                    <span className={styles.email}>{email}</span>
                </div>
                <div className={styles.paragraph}>{t("secondParagraph")}</div>
                <div className={styles.paragraphMuted}>{t("resendButtonInfo")}</div>
                <button
                    className={styles.resendButton}
                    onClick={() => resendVerificationEmail(email ?? "")}
                    disabled={isLoading || isCooldownActive}
                >
                    {isLoading ? <Spinner color={SECONDARY_TEXT_COLOR} /> : t("resendButtonLabel")}
                </button>
                {isCooldownActive && (
                    <div className={styles.cooldown}>
                        {t("cooldownLabel")}: {cooldown}
                    </div>
                )}
            </div>
        </div>
    );
};
