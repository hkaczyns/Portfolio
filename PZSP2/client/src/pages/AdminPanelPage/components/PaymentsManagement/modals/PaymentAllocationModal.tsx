import * as Dialog from "@radix-ui/react-dialog";
import { Formik, Form } from "formik";
import { X } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import type {
    PaymentAllocationRead,
    PaymentAllocationCreate,
    PaymentAllocationUpdate,
} from "../../../../../store/admin/api";
import { Spinner } from "../../../../../components/Spinner/Spinner";
import { SECONDARY_TEXT_COLOR } from "../../../../../constants/constants";
import { usePaymentAllocationModal } from "./hooks/usePaymentAllocationModal";
import styles from "../../ScheduleManagement/modals/Modal.module.css";

const allocationSchema = Yup.object({
    chargeId: Yup.number().required("chargeId.required"),
    amountAllocated: Yup.string()
        .required("amountAllocated.required")
        .test("is-positive", "amountAllocated.mustBePositive", (value) => {
            if (!value) return true;
            const num = parseFloat(value);
            return !isNaN(num) && num > 0;
        }),
});

interface PaymentAllocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    paymentId: number;
    initialData?: PaymentAllocationRead;
}

export const PaymentAllocationModal = ({ isOpen, onClose, paymentId, initialData }: PaymentAllocationModalProps) => {
    const { t } = useTranslation("common");
    const { t: tValidation } = useTranslation("errors", { keyPrefix: "validation" });
    const { isEdit, isLoading, initialValues, handleSubmit, availableCharges } = usePaymentAllocationModal(
        paymentId,
        initialData,
    );

    const handleFormSubmit = useCallback(
        async (values: PaymentAllocationCreate | PaymentAllocationUpdate) => {
            await handleSubmit(values, onClose);
        },
        [handleSubmit, onClose],
    );

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} />
                <Dialog.Content className={styles.content}>
                    <div className={styles.modal}>
                        <div className={styles.header}>
                            <Dialog.Title className={styles.title}>
                                {isEdit ? t("admin.editAllocation") : t("admin.addAllocation")}
                            </Dialog.Title>
                            <Dialog.Close className={styles.headerCloseButton} asChild>
                                <button>
                                    <X size={20} />
                                </button>
                            </Dialog.Close>
                        </div>
                        <Formik
                            initialValues={initialValues}
                            validationSchema={allocationSchema}
                            validateOnChange
                            validateOnBlur
                            onSubmit={handleFormSubmit}
                            enableReinitialize
                        >
                            {({
                                values,
                                handleBlur,
                                errors,
                                touched,
                                setFieldValue,
                                handleSubmit: formikHandleSubmit,
                            }) => {
                                const formValues = values as PaymentAllocationCreate;
                                const formErrors = errors as Partial<Record<keyof PaymentAllocationCreate, string>>;
                                const formTouched = touched as Partial<Record<keyof PaymentAllocationCreate, boolean>>;

                                return (
                                    <Form className={styles.form} onSubmit={formikHandleSubmit}>
                                        <div className={styles.fields}>
                                            <div className={styles.selectField}>
                                                <label className={styles.label}>{t("admin.charge")} *</label>
                                                <select
                                                    className={styles.select}
                                                    value={formValues.chargeId || ""}
                                                    onChange={(e) =>
                                                        setFieldValue("chargeId", parseInt(e.target.value) || 0)
                                                    }
                                                    onBlur={handleBlur("chargeId")}
                                                    disabled={isEdit}
                                                >
                                                    <option value="">{t("admin.selectCharge")}</option>
                                                    {availableCharges.map((charge) => (
                                                        <option key={charge.id} value={charge.id}>
                                                            {parseFloat(charge.amountDue).toFixed(2)}{" "}
                                                            {t("admin.currency")} -{" "}
                                                            {new Date(charge.dueDate).toLocaleDateString()}
                                                        </option>
                                                    ))}
                                                </select>
                                                {formErrors.chargeId && formTouched.chargeId && (
                                                    <div className={styles.errorMessage}>
                                                        <span>{tValidation(formErrors.chargeId)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className={styles.numberField}>
                                                <label className={styles.label}>{t("admin.amountAllocated")} *</label>
                                                <div className={styles.numberInputContainer}>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className={styles.numberInput}
                                                        value={formValues.amountAllocated}
                                                        onChange={(e) =>
                                                            setFieldValue("amountAllocated", e.target.value)
                                                        }
                                                        onBlur={handleBlur("amountAllocated")}
                                                        placeholder={t("admin.amountAllocated")}
                                                        min="0.01"
                                                    />
                                                </div>
                                                {formErrors.amountAllocated && formTouched.amountAllocated && (
                                                    <div className={styles.errorMessage}>
                                                        <span>{tValidation(formErrors.amountAllocated)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.actions}>
                                            <Dialog.Close asChild>
                                                <button
                                                    type="button"
                                                    className={styles.cancelButton}
                                                    disabled={isLoading}
                                                >
                                                    {t("account.cancel")}
                                                </button>
                                            </Dialog.Close>
                                            <button type="submit" className={styles.submitButton} disabled={isLoading}>
                                                {isLoading ? (
                                                    <Spinner color={SECONDARY_TEXT_COLOR} />
                                                ) : (
                                                    t("account.save")
                                                )}
                                            </button>
                                        </div>
                                    </Form>
                                );
                            }}
                        </Formik>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
