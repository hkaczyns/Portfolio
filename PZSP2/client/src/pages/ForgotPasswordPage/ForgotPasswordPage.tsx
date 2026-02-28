import { useTranslation } from "react-i18next";
import styles from "./ForgotPasswordPage.module.css";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import { Mail } from "lucide-react";
import { EMAIL_REGEX, SECONDARY_TEXT_COLOR, SPACE_REGEX } from "../../constants/constants";
import type { ForgotPasswordRequest } from "../../store/auth/types";
import { FormField } from "../../components/FormField/FormField";
import { isFormButtonDisabled } from "./helpers";
import { Spinner } from "../../components/Spinner/Spinner";
import { useForgotPasswordPage } from "./hooks/useForgotPasswordPage";
import { useForgotPasswordCooldown } from "./hooks/useForgotPasswordCooldown";

const validationSchema = Yup.object({
    email: Yup.string()
        .required("email.required")
        .matches(EMAIL_REGEX, "email.invalid")
        .min(6, "email.minLength")
        .max(254, "email.maxLength")
        .matches(SPACE_REGEX, "email.noSpaces"),
});

export const ForgotPasswordPage = () => {
    const { t } = useTranslation("common");
    const { isLoading, navigateToLogin, handleSubmit } = useForgotPasswordPage();
    const { isCooldownActive, cooldown } = useForgotPasswordCooldown();

    return (
        <div className={styles.container}>
            <Formik
                initialValues={{ email: "" } as ForgotPasswordRequest}
                validationSchema={validationSchema}
                validateOnChange
                validateOnBlur
                onSubmit={(values) => handleSubmit(values.email)}
            >
                {({ values, handleChange, handleBlur, errors, touched, handleSubmit }) => (
                    <Form className={styles.formContainer}>
                        <div className={styles.titleLabel}>{t("forgotPassword.title")}</div>
                        <div className={styles.descriptionLabel}>{t("forgotPassword.description")}</div>
                        <div className={styles.inputsContainer}>
                            <FormField
                                value={values.email}
                                onChangeText={handleChange("email")}
                                onBlur={handleBlur("email")}
                                placeholder={t("email")}
                                error={errors.email}
                                touched={touched.email}
                                icon={<Mail />}
                            />
                        </div>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            onClick={() => handleSubmit()}
                            disabled={isFormButtonDisabled(isLoading, values, errors) || isCooldownActive}
                        >
                            {isLoading ? <Spinner color={SECONDARY_TEXT_COLOR} /> : t("forgotPassword.submit")}
                        </button>
                        {isCooldownActive && (
                            <div className={styles.cooldown}>
                                {t("forgotPassword.cooldownLabel")}: {cooldown}
                            </div>
                        )}
                        <div className={styles.additionalActionsContainer}>
                            <div className={styles.backToLoginLabel} onClick={navigateToLogin}>
                                {t("forgotPassword.backToLogin")}
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};
