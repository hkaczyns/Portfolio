import { Formik, Form } from "formik";
import { Mail, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FormField } from "../../../../components/FormField/FormField";
import { changeEmailSchema, isChangeEmailFormButtonDisabled } from "../../helpers";
import type { ChangeEmailFormValues } from "../../../../store/auth/types";
import { Spinner } from "../../../../components/Spinner/Spinner";
import { SECONDARY_TEXT_COLOR } from "../../../../constants/constants";
import styles from "./ChangeEmailSection.module.css";

export interface ChangeEmailSectionProps {
    currentEmail: string;
    onSubmit: (values: ChangeEmailFormValues) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

export const ChangeEmailSection = ({ currentEmail, onSubmit, onCancel, isLoading }: ChangeEmailSectionProps) => {
    const { t } = useTranslation("common");

    return (
        <div className={styles.formContainer}>
            <h2 className={styles.title}>{t("account.changeEmail")}</h2>
            <Formik
                initialValues={{ email: "", currentPassword: "" } as ChangeEmailFormValues}
                validationSchema={changeEmailSchema(currentEmail)}
                validateOnChange
                validateOnBlur
                onSubmit={onSubmit}
            >
                {({ values, handleChange, handleBlur, errors, touched, handleSubmit }) => (
                    <Form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.fields}>
                            <FormField
                                value={values.email}
                                onChangeText={handleChange("email")}
                                onBlur={handleBlur("email")}
                                placeholder={t("email")}
                                error={errors.email}
                                touched={touched.email}
                                icon={<Mail />}
                            />
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
                                disabled={isChangeEmailFormButtonDisabled(isLoading, values, errors)}
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
