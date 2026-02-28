import * as Dialog from "@radix-ui/react-dialog";
import { Formik, Form } from "formik";
import { Lock, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { FormField } from "../../../../components/FormField/FormField";
import { Spinner } from "../../../../components/Spinner/Spinner";
import {
    SECONDARY_TEXT_COLOR,
    LOWERCASE_LETTER_REGEX,
    UPPERCASE_LETTER_REGEX,
    NUMBER_REGEX,
    SPACE_REGEX,
} from "../../../../constants/constants";
import styles from "./ChangeUserPasswordModal.module.css";

const passwordSchema = Yup.object({
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

interface ChangeUserPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (password: string) => Promise<void>;
    isLoading: boolean;
}

export const ChangeUserPasswordModal = ({ isOpen, onClose, onSubmit, isLoading }: ChangeUserPasswordModalProps) => {
    const { t } = useTranslation("common");

    const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
        await onSubmit(values.password);
    };

    const isFormDisabled = (values: { password: string; confirmPassword: string }, errors: any) => {
        const hasErrors = !!errors.password || !!errors.confirmPassword;
        const hasEmptyFields = !values.password.length || !values.confirmPassword.length;
        return isLoading || hasEmptyFields || hasErrors;
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} />
                <Dialog.Content className={styles.content}>
                    <div className={styles.modal}>
                        <div className={styles.header}>
                            <Dialog.Title className={styles.title}>{t("admin.changeUserPassword")}</Dialog.Title>
                            <Dialog.Close className={styles.headerCloseButton} asChild>
                                <button>
                                    <X size={20} />
                                </button>
                            </Dialog.Close>
                        </div>
                        <Dialog.Description className={styles.description}>
                            {t("admin.changeUserPasswordDescription")}
                        </Dialog.Description>
                        <Formik
                            initialValues={{ password: "", confirmPassword: "" }}
                            validationSchema={passwordSchema}
                            validateOnChange
                            validateOnBlur
                            onSubmit={handleSubmit}
                        >
                            {({ values, handleChange, handleBlur, errors, touched, handleSubmit }) => (
                                <Form className={styles.form} onSubmit={handleSubmit}>
                                    <div className={styles.fields}>
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
                                        <Dialog.Close asChild>
                                            <button type="button" className={styles.cancelButton} disabled={isLoading}>
                                                {t("account.cancel")}
                                            </button>
                                        </Dialog.Close>
                                        <button
                                            type="submit"
                                            className={styles.submitButton}
                                            disabled={isFormDisabled(values, errors)}
                                        >
                                            {isLoading ? <Spinner color={SECONDARY_TEXT_COLOR} /> : t("account.save")}
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
