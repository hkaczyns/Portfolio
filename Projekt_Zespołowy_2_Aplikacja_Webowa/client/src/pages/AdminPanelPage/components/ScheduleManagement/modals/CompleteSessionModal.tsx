import * as Dialog from "@radix-ui/react-dialog";
import { Formik, Form } from "formik";
import { X } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { Spinner } from "../../../../../components/Spinner/Spinner";
import { SECONDARY_TEXT_COLOR } from "../../../../../constants/constants";
import type { ClassSessionComplete } from "../../../../../store/admin/api";
import styles from "./Modal.module.css";

const completeSchema = Yup.object({
    notes: Yup.string().nullable(),
});

interface CompleteSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ClassSessionComplete) => Promise<void>;
    isLoading: boolean;
    sessionDate: string;
    sessionTime: string;
}

export const CompleteSessionModal = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    sessionDate,
    sessionTime,
}: CompleteSessionModalProps) => {
    const { t } = useTranslation("common");
    const { t: tValidation } = useTranslation("errors", { keyPrefix: "validation" });

    const initialValues: ClassSessionComplete = {
        notes: null,
    };

    const handleSubmit = useCallback(
        async (values: ClassSessionComplete) => {
            await onSubmit(values);
        },
        [onSubmit],
    );

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} />
                <Dialog.Content className={styles.content}>
                    <div className={styles.modal}>
                        <div className={styles.header}>
                            <Dialog.Title className={styles.title}>{t("admin.completeSession")}</Dialog.Title>
                            <Dialog.Close className={styles.headerCloseButton} asChild>
                                <button>
                                    <X size={20} />
                                </button>
                            </Dialog.Close>
                        </div>
                        <Formik
                            initialValues={initialValues}
                            validationSchema={completeSchema}
                            validateOnChange
                            validateOnBlur
                            onSubmit={handleSubmit}
                        >
                            {({ values, handleBlur, errors, touched, setFieldValue, handleSubmit }) => (
                                <Form className={styles.form} onSubmit={handleSubmit}>
                                    <div className={styles.fields}>
                                        <div className={styles.description}>
                                            {t("admin.completeSessionMessage", {
                                                date: sessionDate,
                                                time: sessionTime,
                                            })}
                                        </div>
                                        <div className={styles.textareaField}>
                                            <label className={styles.label}>{t("admin.notes")}</label>
                                            <textarea
                                                className={styles.textarea}
                                                value={values.notes || ""}
                                                onChange={(e) => setFieldValue("notes", e.target.value || null)}
                                                onBlur={handleBlur("notes")}
                                                placeholder={t("admin.notes")}
                                                rows={4}
                                            />
                                            {errors.notes && touched.notes && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.notes as string)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.actions}>
                                        <Dialog.Close asChild>
                                            <button type="button" className={styles.cancelButton} disabled={isLoading}>
                                                {t("account.cancel")}
                                            </button>
                                        </Dialog.Close>
                                        <button type="submit" className={styles.submitButton} disabled={isLoading}>
                                            {isLoading ? <Spinner color={SECONDARY_TEXT_COLOR} /> : t("admin.complete")}
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
