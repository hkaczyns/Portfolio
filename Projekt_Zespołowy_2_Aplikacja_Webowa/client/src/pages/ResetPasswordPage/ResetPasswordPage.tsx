import * as Yup from "yup";
import styles from "./ResetPasswordPage.module.css";
import {
    LOWERCASE_LETTER_REGEX,
    NUMBER_REGEX,
    SECONDARY_TEXT_COLOR,
    SPACE_REGEX,
    UPPERCASE_LETTER_REGEX,
} from "../../constants/constants";
import { Form, Formik } from "formik";
import { useTranslation } from "react-i18next";
import { FormField } from "../../components/FormField/FormField";
import { Lock } from "lucide-react";
import { isFormButtonDisabled } from "./helpers";
import { Spinner } from "../../components/Spinner/Spinner";
import { useResetPasswordPage } from "./hooks/useResetPasswordPage";

export interface ResetPasswordFormValues {
    password: string;
    confirmPassword: string;
}

const validationSchema = Yup.object({
    password: Yup.string()
        .required("password.required")
        .min(8, "password.minLength")
        .max(128, "password.maxLength")
        .matches(LOWERCASE_LETTER_REGEX, "password.lowercase")
        .matches(UPPERCASE_LETTER_REGEX, "password.uppercase")
        .matches(NUMBER_REGEX, "password.number")
        .matches(SPACE_REGEX, "password.noSpaces"),
    confirmPassword: Yup.string()
        .required("confirmPassword.required")
        .oneOf([Yup.ref("password")], "confirmPassword.mismatch"),
});

export const ResetPasswordPage = () => {
    const { t } = useTranslation("common");
    const { resetToken, isLoading, navigateToLogin, handleSubmit } = useResetPasswordPage();

    if (!resetToken) {
        return null;
    }

    return (
        <div className={styles.container}>
            <Formik
                initialValues={{ password: "", confirmPassword: "" } as ResetPasswordFormValues}
                validationSchema={validationSchema}
                validateOnChange
                validateOnBlur
                onSubmit={(values) => handleSubmit(values.password)}
            >
                {({ values, handleChange, handleBlur, errors, touched, handleSubmit }) => (
                    <Form className={styles.formContainer}>
                        <div className={styles.titleLabel}>{t("resetPassword.title")}</div>
                        <div className={styles.descriptionLabel}>{t("resetPassword.description")}</div>
                        <div className={styles.inputsContainer}>
                            <FormField
                                value={values.password}
                                onChangeText={handleChange("password")}
                                onBlur={handleBlur("password")}
                                placeholder={t("password")}
                                error={errors.password}
                                touched={touched.password}
                                icon={<Lock />}
                                isPassword
                            />
                            <FormField
                                value={values.confirmPassword}
                                onChangeText={handleChange("confirmPassword")}
                                onBlur={handleBlur("confirmPassword")}
                                placeholder={t("confirmPassword")}
                                error={errors.confirmPassword}
                                touched={touched.confirmPassword}
                                icon={<Lock />}
                                isPassword
                            />
                        </div>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            onClick={() => handleSubmit()}
                            disabled={isFormButtonDisabled(isLoading, values, errors)}
                        >
                            {isLoading ? <Spinner color={SECONDARY_TEXT_COLOR} /> : t("resetPassword.submit")}
                        </button>
                        <div className={styles.additionalActionsContainer}>
                            <div className={styles.backToLoginLabel} onClick={navigateToLogin}>
                                {t("resetPassword.backToLogin")}
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};
