import * as Dialog from "@radix-ui/react-dialog";
import { Formik, Form } from "formik";
import { Calendar, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { FormField } from "../../../../../components/FormField/FormField";
import { Spinner } from "../../../../../components/Spinner/Spinner";
import { SECONDARY_TEXT_COLOR } from "../../../../../constants/constants";
import type { SemesterRead, SemesterCreate } from "../../../../../store/admin/api";
import { useSemesterModal } from "./hooks/useSemesterModal";
import styles from "./Modal.module.css";

const semesterSchema = Yup.object({
    name: Yup.string().required("name.required").max(128, "name.maxLength"),
    startDate: Yup.date().required("startDate.required").typeError("startDate.invalid"),
    endDate: Yup.date()
        .required("endDate.required")
        .typeError("endDate.invalid")
        .min(Yup.ref("startDate"), "endDate.mustBeAfterStartDate"),
    isActive: Yup.boolean(),
});

interface SemesterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SemesterCreate) => Promise<void>;
    isLoading: boolean;
    initialData?: SemesterRead;
}

export const SemesterModal = ({ isOpen, onClose, onSubmit, isLoading, initialData }: SemesterModalProps) => {
    const { t } = useTranslation("common");
    const { t: tValidation } = useTranslation("errors", { keyPrefix: "validation" });
    const { isEdit, initialValues, handleSubmit } = useSemesterModal(initialData);

    const handleFormSubmit = async (values: typeof initialValues) => {
        await handleSubmit(values, onSubmit);
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} />
                <Dialog.Content className={styles.content}>
                    <div className={styles.modal}>
                        <div className={styles.header}>
                            <Dialog.Title className={styles.title}>
                                {isEdit ? t("admin.editSemester") : t("admin.addSemester")}
                            </Dialog.Title>
                            <Dialog.Close className={styles.headerCloseButton} asChild>
                                <button>
                                    <X size={20} />
                                </button>
                            </Dialog.Close>
                        </div>
                        <Formik
                            initialValues={initialValues}
                            validationSchema={semesterSchema}
                            validateOnChange
                            validateOnBlur
                            onSubmit={handleFormSubmit}
                            enableReinitialize
                        >
                            {({
                                values,
                                handleChange,
                                handleBlur,
                                errors,
                                touched,
                                setFieldValue,
                                handleSubmit: formikHandleSubmit,
                            }) => (
                                <Form className={styles.form} onSubmit={formikHandleSubmit}>
                                    <div className={styles.fields}>
                                        <FormField
                                            value={values.name}
                                            onChangeText={handleChange("name")}
                                            onBlur={handleBlur("name")}
                                            placeholder={t("admin.name")}
                                            error={errors.name}
                                            touched={touched.name}
                                            icon={<Calendar />}
                                        />
                                        <div className={styles.dateField}>
                                            <label className={styles.label}>{t("admin.startDate")}</label>
                                            <div className={styles.dateInputContainer}>
                                                <Calendar size={20} className={styles.dateIcon} />
                                                <input
                                                    type="date"
                                                    className={styles.dateInput}
                                                    value={values.startDate}
                                                    onChange={(e) => setFieldValue("startDate", e.target.value)}
                                                    onBlur={handleBlur("startDate")}
                                                />
                                            </div>
                                            {errors.startDate && touched.startDate && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.startDate as string)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.dateField}>
                                            <label className={styles.label}>{t("admin.endDate")}</label>
                                            <div className={styles.dateInputContainer}>
                                                <Calendar size={20} className={styles.dateIcon} />
                                                <input
                                                    type="date"
                                                    className={styles.dateInput}
                                                    value={values.endDate}
                                                    onChange={(e) => setFieldValue("endDate", e.target.value)}
                                                    onBlur={handleBlur("endDate")}
                                                    min={values.startDate}
                                                />
                                            </div>
                                            {errors.endDate && touched.endDate && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.endDate as string)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.checkboxField}>
                                            <label className={styles.checkboxLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={values.isActive}
                                                    onChange={(e) => setFieldValue("isActive", e.target.checked)}
                                                />
                                                <span>{t("admin.active")}</span>
                                            </label>
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
