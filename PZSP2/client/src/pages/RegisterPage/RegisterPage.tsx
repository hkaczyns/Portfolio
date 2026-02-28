import { useCallback, useEffect } from "react";
import * as Yup from "yup";
import styles from "./RegisterPage.module.css";
import {
    EMAIL_REGEX,
    LOWERCASE_LETTER_REGEX,
    NUMBER_REGEX,
    SECONDARY_TEXT_COLOR,
    SPACE_REGEX,
    UPPERCASE_LETTER_REGEX,
} from "../../constants/constants";
import { useRegister } from "../../store/auth/api/useRegister";
import { Form, Formik } from "formik";
import type { RegisterRequest } from "../../store/auth/types";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FormField } from "../../components/FormField/FormField";
import { Lock, Mail, ShieldCheck, User, Users } from "lucide-react";
import { isFormButtonDisabled } from "./helpers";
import { Spinner } from "../../components/Spinner/Spinner";

export interface RegisterFormValues extends RegisterRequest {
    confirmPassword: string;
}

const validationSchema = Yup.object({
    firstName: Yup.string()
        .required("firstName.required")
        .min(2, "firstName.minLength")
        .max(64, "firstName.maxLength")
        .matches(SPACE_REGEX, "firstName.noSpaces"),
    lastName: Yup.string()
        .required("lastName.required")
        .min(2, "lastName.minLength")
        .max(128, "lastName.maxLength")
        .matches(SPACE_REGEX, "lastName.noSpaces"),
    email: Yup.string()
        .required("email.required")
        .matches(EMAIL_REGEX, "email.invalid")
        .min(6, "email.minLength")
        .max(254, "email.maxLength")
        .matches(SPACE_REGEX, "email.noSpaces"),
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

export const RegisterPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation("common");
    const { register, isLoading, isSuccess } = useRegister();

    const navigateToLogin = useCallback(() => {
        navigate("/login");
    }, [navigate]);

    const navigateToVerification = useCallback(() => {
        navigate("/verification");
    }, [navigate]);

    useEffect(() => {
        if (isSuccess) navigateToVerification();
    }, [isSuccess, navigateToVerification]);

    return (
        <div className={styles.container}>
            <Formik
                initialValues={
                    { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" } as RegisterFormValues
                }
                validationSchema={validationSchema}
                validateOnChange
                validateOnBlur
                onSubmit={(values) => register(values)}
            >
                {({ values, handleChange, handleBlur, errors, touched, handleSubmit }) => (
                    <Form className={styles.formContainer} onSubmit={handleSubmit}>
                        <div className={styles.registerLabel}>{t("register.register")}</div>
                        <div className={styles.inputsContainer}>
                            <div className={styles.inputsColumnContainer}>
                                <div className={styles.inputsColumn}>
                                    <FormField
                                        value={values.firstName}
                                        onChangeText={handleChange("firstName")}
                                        onBlur={handleBlur("firstName")}
                                        placeholder={t("firstName")}
                                        error={errors.firstName}
                                        touched={touched.firstName}
                                        icon={<User />}
                                    />
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
                                <div className={styles.inputsColumn}>
                                    <FormField
                                        value={values.lastName}
                                        onChangeText={handleChange("lastName")}
                                        onBlur={handleBlur("lastName")}
                                        placeholder={t("lastName")}
                                        error={errors.lastName}
                                        touched={touched.lastName}
                                        icon={<Users />}
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
                            </div>
                            <FormField
                                value={values.confirmPassword}
                                onChangeText={handleChange("confirmPassword")}
                                onBlur={handleBlur("confirmPassword")}
                                placeholder={t("confirmPassword")}
                                error={errors.confirmPassword}
                                touched={touched.confirmPassword}
                                icon={<ShieldCheck />}
                                isPassword
                            />
                        </div>

                        <div className={styles.termsContainer}>
                            <span className={styles.termsText}>
                                {t("register.acceptTerms")}{" "}
                                <Link to="/terms-of-service" className={styles.termsLink}>
                                    {t("register.termsOfService")}
                                </Link>{" "}
                                {t("register.and")}{" "}
                                <Link to="/privacy-policy" className={styles.termsLink}>
                                    {t("register.privacyPolicy")}
                                </Link>
                            </span>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            onClick={() => handleSubmit()}
                            disabled={isFormButtonDisabled(isLoading, values, errors)}
                        >
                            {isLoading ? <Spinner color={SECONDARY_TEXT_COLOR} /> : t("register.register")}
                        </button>

                        <div className={styles.additionalActionsContainer}>
                            <div className={styles.accountLabel}>
                                {t("register.account")}
                                <span onClick={navigateToLogin} className={styles.loginLink}>
                                    {t("login.login")}
                                </span>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};
