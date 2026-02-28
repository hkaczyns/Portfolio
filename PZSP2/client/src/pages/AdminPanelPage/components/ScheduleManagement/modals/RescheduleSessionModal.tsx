import * as Dialog from "@radix-ui/react-dialog";
import { Formik, Form } from "formik";
import { Clock, X } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { Spinner } from "../../../../../components/Spinner/Spinner";
import { SECONDARY_TEXT_COLOR } from "../../../../../constants/constants";
import type { ClassSessionReschedule } from "../../../../../store/admin/api";
import styles from "./Modal.module.css";

const rescheduleSchema = Yup.object({
    newDate: Yup.date().required("date.required").typeError("date.invalid"),
    newStartTime: Yup.string()
        .required("startTime.required")
        .test("is-before-end", "endTime.mustBeAfterStart", function (value) {
            const { newEndTime } = this.parent;
            if (!value || !newEndTime) return true;
            return value < newEndTime;
        }),
    newEndTime: Yup.string()
        .required("endTime.required")
        .test("is-after-start", "endTime.mustBeAfterStart", function (value) {
            const { newStartTime } = this.parent;
            if (!value || !newStartTime) return true;
            return value > newStartTime;
        }),
    reason: Yup.string().nullable(),
});

interface RescheduleSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ClassSessionReschedule) => Promise<void>;
    isLoading: boolean;
    sessionDate: string;
    sessionTime: string;
}

export const RescheduleSessionModal = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    sessionDate,
    sessionTime,
}: RescheduleSessionModalProps) => {
    const { t } = useTranslation("common");
    const { t: tValidation } = useTranslation("errors", { keyPrefix: "validation" });

    const initialValues: ClassSessionReschedule = {
        newDate: "",
        newStartTime: "",
        newEndTime: "",
        reason: null,
    };

    const handleSubmit = useCallback(
        async (values: ClassSessionReschedule) => {
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
                            <Dialog.Title className={styles.title}>{t("admin.rescheduleSession")}</Dialog.Title>
                            <Dialog.Close className={styles.headerCloseButton} asChild>
                                <button>
                                    <X size={20} />
                                </button>
                            </Dialog.Close>
                        </div>
                        <Formik
                            initialValues={initialValues}
                            validationSchema={rescheduleSchema}
                            validateOnChange
                            validateOnBlur
                            onSubmit={handleSubmit}
                        >
                            {({ values, handleBlur, errors, touched, setFieldValue, handleSubmit }) => (
                                <Form className={styles.form} onSubmit={handleSubmit}>
                                    <div className={styles.fields}>
                                        <div className={styles.description}>
                                            {t("admin.rescheduleSessionMessage", {
                                                date: sessionDate,
                                                time: sessionTime,
                                            })}
                                        </div>
                                        <div className={styles.dateField}>
                                            <label className={styles.label}>{t("admin.newDate")} *</label>
                                            <div className={styles.dateInputContainer}>
                                                <Clock size={20} className={styles.dateIcon} />
                                                <input
                                                    type="date"
                                                    className={styles.dateInput}
                                                    value={values.newDate}
                                                    onChange={(e) => setFieldValue("newDate", e.target.value)}
                                                    onBlur={handleBlur("newDate")}
                                                />
                                            </div>
                                            {errors.newDate && touched.newDate && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.newDate as string)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.dateField}>
                                            <label className={styles.label}>{t("admin.newStartTime")} *</label>
                                            <div className={styles.dateInputContainer}>
                                                <input
                                                    type="time"
                                                    className={styles.dateInput}
                                                    value={values.newStartTime}
                                                    onChange={(e) => setFieldValue("newStartTime", e.target.value)}
                                                    onBlur={handleBlur("newStartTime")}
                                                />
                                            </div>
                                            {errors.newStartTime && touched.newStartTime && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.newStartTime as string)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.dateField}>
                                            <label className={styles.label}>{t("admin.newEndTime")} *</label>
                                            <div className={styles.dateInputContainer}>
                                                <input
                                                    type="time"
                                                    className={styles.dateInput}
                                                    value={values.newEndTime}
                                                    onChange={(e) => setFieldValue("newEndTime", e.target.value)}
                                                    onBlur={handleBlur("newEndTime")}
                                                />
                                            </div>
                                            {errors.newEndTime && touched.newEndTime && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.newEndTime as string)}</span>
                                                </div>
                                            )}
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
                                            {isLoading ? (
                                                <Spinner color={SECONDARY_TEXT_COLOR} />
                                            ) : (
                                                t("admin.reschedule")
                                            )}
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
