import * as Dialog from "@radix-ui/react-dialog";
import { Formik, Form } from "formik";
import { X } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { Spinner } from "../../../../../components/Spinner/Spinner";
import { SECONDARY_TEXT_COLOR, CHARGE_TYPE } from "../../../../../constants/constants";
import type { ChargeRead, ChargeCreate, ChargeUpdate } from "../../../../../store/admin/api";
import { ChargeType } from "../../../../../store/admin/api";
import styles from "../../ScheduleManagement/modals/Modal.module.css";

const chargeSchema = Yup.object({
    amountDue: Yup.string()
        .required("amountDue.required")
        .test("is-positive", "amountDue.mustBePositive", (value) => {
            if (!value) return true;
            const num = parseFloat(value);
            return !isNaN(num) && num > 0;
        }),
    dueDate: Yup.string().required("dueDate.required"),
    type: Yup.string()
        .oneOf([CHARGE_TYPE.MONTHLY_FEE, CHARGE_TYPE.ADDITIONAL_CLASSES, CHARGE_TYPE.ADJUSTMENT], "type.invalid")
        .required("type.required"),
});

interface ChargeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ChargeCreate | ChargeUpdate) => Promise<void>;
    isLoading: boolean;
    initialData?: ChargeRead;
    studentId: string;
}

export const ChargeModal = ({ isOpen, onClose, onSubmit, isLoading, initialData }: ChargeModalProps) => {
    const { t } = useTranslation("common");
    const { t: tValidation } = useTranslation("errors", { keyPrefix: "validation" });

    const isEdit = !!initialData;

    const initialValues: ChargeCreate = {
        amountDue: initialData ? parseFloat(initialData.amountDue).toFixed(2) : "",
        dueDate: initialData
            ? new Date(initialData.dueDate).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
        type: initialData?.type || ChargeType.MONTHLY_FEE,
    };

    const handleSubmit = useCallback(
        async (values: ChargeCreate) => {
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
                                {isEdit ? t("admin.editCharge") : t("admin.addCharge")}
                            </Dialog.Title>
                            <Dialog.Close className={styles.headerCloseButton} asChild>
                                <button>
                                    <X size={20} />
                                </button>
                            </Dialog.Close>
                        </div>
                        <Formik
                            initialValues={initialValues}
                            validationSchema={chargeSchema}
                            validateOnChange
                            validateOnBlur
                            onSubmit={handleSubmit}
                            enableReinitialize
                        >
                            {({ values, handleBlur, errors, touched, setFieldValue, handleSubmit }) => (
                                <Form className={styles.form} onSubmit={handleSubmit}>
                                    <div className={styles.fields}>
                                        <div className={styles.numberField}>
                                            <label className={styles.label}>{t("admin.amountDue")} *</label>
                                            <div className={styles.numberInputContainer}>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className={styles.numberInput}
                                                    value={values.amountDue}
                                                    onChange={(e) => setFieldValue("amountDue", e.target.value)}
                                                    onBlur={handleBlur("amountDue")}
                                                    placeholder={t("admin.amountDue")}
                                                    min="0.01"
                                                />
                                            </div>
                                            {errors.amountDue && touched.amountDue && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.amountDue as string)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.dateField}>
                                            <label className={styles.label}>{t("admin.dueDate")} *</label>
                                            <div className={styles.dateInputContainer}>
                                                <input
                                                    type="date"
                                                    className={styles.dateInput}
                                                    value={values.dueDate}
                                                    onChange={(e) => setFieldValue("dueDate", e.target.value)}
                                                    onBlur={handleBlur("dueDate")}
                                                />
                                            </div>
                                            {errors.dueDate && touched.dueDate && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.dueDate as string)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.selectField}>
                                            <label className={styles.label}>{t("admin.type")} *</label>
                                            <select
                                                className={styles.select}
                                                value={values.type}
                                                onChange={(e) => setFieldValue("type", e.target.value as ChargeType)}
                                                onBlur={handleBlur("type")}
                                            >
                                                <option value={ChargeType.MONTHLY_FEE}>
                                                    {t("admin.chargeTypeMonthlyFee")}
                                                </option>
                                                <option value={ChargeType.ADDITIONAL_CLASSES}>
                                                    {t("admin.chargeTypeAdditionalClasses")}
                                                </option>
                                                <option value={ChargeType.ADJUSTMENT}>
                                                    {t("admin.chargeTypeAdjustment")}
                                                </option>
                                            </select>
                                            {errors.type && touched.type && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.type as string)}</span>
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
