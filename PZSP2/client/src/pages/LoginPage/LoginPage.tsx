import { useTranslation } from "react-i18next";
import styles from "./LoginPage.module.css";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import { Lock, Mail } from "lucide-react";
import { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EMAIL_REGEX, SECONDARY_TEXT_COLOR, SPACE_REGEX } from "../../constants/constants";
import { useLogin } from "../../store/auth/api/useLogin";
import type { LoginRequest } from "../../store/auth/types";
import { FormField } from "../../components/FormField/FormField";
import { isFormButtonDisabled } from "./helpers";
import { Spinner } from "../../components/Spinner/Spinner";

const validationSchema = Yup.object({
    username: Yup.string()
        .required("email.required")
        .matches(EMAIL_REGEX, "email.invalid")
        .min(6, "email.minLength")
        .max(254, "email.maxLength")
        .matches(SPACE_REGEX, "email.noSpaces"),
    password: Yup.string().required("password.required").matches(SPACE_REGEX, "password.noSpaces"),
});

export const LoginPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation("common");
    const { login, isLoading } = useLogin();

    const navigateToRegister = useCallback(() => {
        navigate("/register");
    }, [navigate]);

    return (
        <div className={styles.container}>
            <Formik
                initialValues={{ username: "", password: "" } as LoginRequest}
                validationSchema={validationSchema}
                validateOnChange
                validateOnBlur
                onSubmit={(values) => login(values)}
            >
                {({ values, handleChange, handleBlur, errors, touched, handleSubmit }) => (
                    <Form className={styles.formContainer}>
                        <div className={styles.loginLabel}>{t("login.login")}</div>
                        <div className={styles.inputsContainer}>
                            <FormField
                                value={values.username}
                                onChangeText={handleChange("username")}
                                onBlur={handleBlur("username")}
                                placeholder={t("email")}
                                error={errors.username}
                                touched={touched.username}
                                icon={<Mail />}
                            />
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
                        </div>
                        <div className={styles.termsContainer}>
                            <span className={styles.termsText}>
                                {t("login.acceptTerms")}{" "}
                                <Link to="/terms-of-service" className={styles.termsLink}>
                                    {t("login.termsOfService")}
                                </Link>{" "}
                                {t("login.and")}{" "}
                                <Link to="/privacy-policy" className={styles.termsLink}>
                                    {t("login.privacyPolicy")}
                                </Link>
                            </span>
                        </div>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            onClick={() => handleSubmit()}
                            disabled={isFormButtonDisabled(isLoading, values, errors)}
                        >
                            {isLoading ? <Spinner color={SECONDARY_TEXT_COLOR} /> : t("login.login")}
                        </button>
                        <div className={styles.additionalActionsContainer}>
                            <div className={styles.forgotPasswordLabel} onClick={() => navigate("/forgot-password")}>
                                {t("login.forgotPassword")}
                            </div>
                            <div className={styles.noAccountLabel}>
                                {t("login.noAccount")}
                                <span onClick={navigateToRegister} className={styles.registerLink}>
                                    {t("register.register")}
                                </span>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};
