import { Formik, Form } from "formik";
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FormField } from "../../../../components/FormField/FormField";
import { changePasswordSchema, isChangePasswordFormButtonDisabled } from "../../helpers";
import type { ChangePasswordFormValues } from "../../../../store/auth/types";
import { Spinner } from "../../../../components/Spinner/Spinner";
import { SECONDARY_TEXT_COLOR } from "../../../../constants/constants";
import styles from "./ChangePasswordSection.module.css";

export interface ChangePasswordSectionProps {
    onSubmit: (values: ChangePasswordFormValues) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

export const ChangePasswordSection = ({ onSubmit, onCancel, isLoading }: ChangePasswordSectionProps) => {
    const { t } = useTranslation("common");

    return (
        <div className={styles.formContainer}>
            <h2 className={styles.title}>{t("account.changePassword")}</h2>
            <Formik
                initialValues={{ currentPassword: "", password: "", confirmPassword: "" } as ChangePasswordFormValues}
                validationSchema={changePasswordSchema}
                validateOnChange
                validateOnBlur
                onSubmit={onSubmit}
            >
                {({ values, handleChange, handleBlur, errors, touched, handleSubmit }) => (
                    <Form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.fields}>
                            <FormField
                                value={values.currentPassword}
                                onChangeText={handleChange("currentPassword")}
                                onBlur={handleBlur("currentPassword")}
                                placeholder={t("account.currentPassword")}
                                error={errors.currentPassword}
                                touched={touched.currentPassword}
                                icon={<Lock />}
                                isPassword
                            />
                            <FormField
                                value={values.password}
                                onChangeText={handleChange("password")}
                                onBlur={handleBlur("password")}
                                placeholder={t("account.newPassword")}
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
                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={onCancel}
                                disabled={isLoading}
                            >
                                {t("account.cancel")}
                            </button>
                            <button
                                type="submit"
                                className={styles.submitButton}
                                onClick={() => handleSubmit()}
                                disabled={isChangePasswordFormButtonDisabled(isLoading, values, errors)}
                            >
                                {isLoading ? <Spinner color={SECONDARY_TEXT_COLOR} /> : t("account.save")}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};
