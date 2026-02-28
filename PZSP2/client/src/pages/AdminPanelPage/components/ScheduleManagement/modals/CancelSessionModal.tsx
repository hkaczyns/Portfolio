import * as Dialog from "@radix-ui/react-dialog";
import { Formik, Form } from "formik";
import { X } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { Spinner } from "../../../../../components/Spinner/Spinner";
import { SECONDARY_TEXT_COLOR } from "../../../../../constants/constants";
import type { ClassSessionCancel } from "../../../../../store/admin/api";
import styles from "./Modal.module.css";

const cancelSchema = Yup.object({
    reason: Yup.string().nullable(),
});

interface CancelSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ClassSessionCancel) => Promise<void>;
    isLoading: boolean;
    sessionDate: string;
    sessionTime: string;
}

export const CancelSessionModal = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    sessionDate,
    sessionTime,
}: CancelSessionModalProps) => {
    const { t } = useTranslation("common");
    const { t: tValidation } = useTranslation("errors", { keyPrefix: "validation" });

    const initialValues: ClassSessionCancel = {
        reason: null,
    };

    const handleSubmit = useCallback(
        async (values: ClassSessionCancel) => {
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
                            <Dialog.Title className={styles.title}>{t("admin.cancelSession")}</Dialog.Title>
                            <Dialog.Close className={styles.headerCloseButton} asChild>
                                <button>
                                    <X size={20} />
                                </button>
                            </Dialog.Close>
                        </div>
                        <Formik
                            initialValues={initialValues}
                            validationSchema={cancelSchema}
                            validateOnChange
                            validateOnBlur
                            onSubmit={handleSubmit}
                        >
                            {({ values, handleBlur, errors, touched, setFieldValue, handleSubmit }) => (
                                <Form className={styles.form} onSubmit={handleSubmit}>
                                    <div className={styles.fields}>
                                        <div className={styles.description}>
                                            {t("admin.cancelSessionMessage", { date: sessionDate, time: sessionTime })}
                                        </div>
                                        <div className={styles.textareaField}>
                                            <label className={styles.label}>{t("admin.reason")}</label>
                                            <textarea
                                                className={styles.textarea}
                                                value={values.reason || ""}
                                                onChange={(e) => setFieldValue("reason", e.target.value || null)}
                                                onBlur={handleBlur("reason")}
                                                placeholder={t("admin.reasonPlaceholder")}
                                                rows={4}
                                            />
                                            {errors.reason && touched.reason && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.reason as string)}</span>
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
                                            {isLoading ? <Spinner color={SECONDARY_TEXT_COLOR} /> : t("admin.cancel")}
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
