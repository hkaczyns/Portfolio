import * as Dialog from "@radix-ui/react-dialog";
import { Formik, Form } from "formik";
import { X } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { Spinner } from "../../../../../components/Spinner/Spinner";
import { SECONDARY_TEXT_COLOR } from "../../../../../constants/constants";
import type { PaymentRead, PaymentCreate, PaymentUpdate } from "../../../../../store/admin/api";
import { PaymentMethod } from "../../../../../store/admin/api";
import styles from "../../ScheduleManagement/modals/Modal.module.css";

const paymentSchema = Yup.object({
    amount: Yup.string()
        .required("amount.required")
        .test("is-positive", "amount.mustBePositive", (value) => {
            if (!value) return true;
            const num = parseFloat(value);
            return !isNaN(num) && num > 0;
        }),
    paidAt: Yup.string().required("paidAt.required"),
    paymentMethod: Yup.string()
        .oneOf(["cash", "transfer", "card"], "paymentMethod.invalid")
        .required("paymentMethod.required"),
    notes: Yup.string().nullable(),
});

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PaymentCreate | PaymentUpdate) => Promise<void>;
    isLoading: boolean;
    initialData?: PaymentRead;
    studentId: string;
}

export const PaymentModal = ({ isOpen, onClose, onSubmit, isLoading, initialData }: PaymentModalProps) => {
    const { t } = useTranslation("common");
    const { t: tValidation } = useTranslation("errors", { keyPrefix: "validation" });

    const isEdit = !!initialData;

    const initialValues: PaymentCreate = {
        amount: initialData ? parseFloat(initialData.amount).toFixed(2) : "",
        paidAt: initialData
            ? new Date(initialData.paidAt).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
        paymentMethod: initialData?.paymentMethod || PaymentMethod.CASH,
        notes: initialData?.notes || null,
    };

    const handleSubmit = useCallback(
        async (values: PaymentCreate) => {
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
                            <Dialog.Title className={styles.title}>
                                {isEdit ? t("admin.editPayment") : t("admin.addPayment")}
                            </Dialog.Title>
                            <Dialog.Close className={styles.headerCloseButton} asChild>
                                <button>
                                    <X size={20} />
                                </button>
                            </Dialog.Close>
                        </div>
                        <Formik
                            initialValues={initialValues}
                            validationSchema={paymentSchema}
                            validateOnChange
                            validateOnBlur
                            onSubmit={handleSubmit}
                            enableReinitialize
                        >
                            {({ values, handleBlur, errors, touched, setFieldValue, handleSubmit }) => (
                                <Form className={styles.form} onSubmit={handleSubmit}>
                                    <div className={styles.fields}>
                                        <div className={styles.numberField}>
                                            <label className={styles.label}>{t("admin.amount")} *</label>
                                            <div className={styles.numberInputContainer}>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className={styles.numberInput}
                                                    value={values.amount}
                                                    onChange={(e) => setFieldValue("amount", e.target.value)}
                                                    onBlur={handleBlur("amount")}
                                                    placeholder={t("admin.amount")}
                                                    min="0.01"
                                                />
                                            </div>
                                            {errors.amount && touched.amount && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.amount as string)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.dateField}>
                                            <label className={styles.label}>{t("admin.paidAt")} *</label>
                                            <div className={styles.dateInputContainer}>
                                                <input
                                                    type="datetime-local"
                                                    className={styles.dateInput}
                                                    value={values.paidAt}
                                                    onChange={(e) => setFieldValue("paidAt", e.target.value)}
                                                    onBlur={handleBlur("paidAt")}
                                                />
                                            </div>
                                            {errors.paidAt && touched.paidAt && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.paidAt as string)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.selectField}>
                                            <label className={styles.label}>{t("admin.paymentMethod")} *</label>
                                            <select
                                                className={styles.select}
                                                value={values.paymentMethod}
                                                onChange={(e) =>
                                                    setFieldValue("paymentMethod", e.target.value as PaymentMethod)
                                                }
                                                onBlur={handleBlur("paymentMethod")}
                                            >
                                                <option value={PaymentMethod.CASH}>
                                                    {t("admin.paymentMethodCash")}
                                                </option>
                                                <option value={PaymentMethod.TRANSFER}>
                                                    {t("admin.paymentMethodTransfer")}
                                                </option>
                                                <option value={PaymentMethod.CARD}>
                                                    {t("admin.paymentMethodCard")}
                                                </option>
                                            </select>
                                            {errors.paymentMethod && touched.paymentMethod && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.paymentMethod as string)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.textareaField}>
                                            <label className={styles.label}>{t("admin.notes")}</label>
                                            <textarea
                                                className={styles.textarea}
                                                value={values.notes || ""}
                                                onChange={(e) => setFieldValue("notes", e.target.value || null)}
                                                onBlur={handleBlur("notes")}
                                                placeholder={t("admin.notes")}
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.actions}>
                                        <Dialog.Close asChild>
                                            <button type="button" className={styles.cancelButton} disabled={isLoading}>
                                                {t("account.cancel")}
                                            </button>
                                        </Dialog.Close>
                                        <button type="submit" className={styles.submitButton} disabled={isLoading}>
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
