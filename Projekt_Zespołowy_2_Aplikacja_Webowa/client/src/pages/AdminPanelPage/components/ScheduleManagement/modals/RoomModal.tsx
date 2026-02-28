import * as Dialog from "@radix-ui/react-dialog";
import { Formik, Form } from "formik";
import { Building2, X } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { FormField } from "../../../../../components/FormField/FormField";
import { Spinner } from "../../../../../components/Spinner/Spinner";
import { SECONDARY_TEXT_COLOR } from "../../../../../constants/constants";
import type { RoomRead, RoomCreate } from "../../../../../store/admin/api";
import styles from "./Modal.module.css";

const roomSchema = Yup.object({
    name: Yup.string().required("name.required").max(128, "name.maxLength"),
    capacity: Yup.number().nullable().min(1, "capacity.min"),
    description: Yup.string().nullable(),
    isAvailableForRental: Yup.boolean(),
    hourlyRate: Yup.number().nullable().min(0, "hourlyRate.min").max(99999999.99, "hourlyRate.max"),
    isActive: Yup.boolean(),
});

interface RoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: RoomCreate) => Promise<void>;
    isLoading: boolean;
    initialData?: RoomRead;
}

export const RoomModal = ({ isOpen, onClose, onSubmit, isLoading, initialData }: RoomModalProps) => {
    const { t } = useTranslation("common");
    const { t: tValidation } = useTranslation("errors", { keyPrefix: "validation" });

    const isEdit = !!initialData;

    const initialValues: RoomCreate = {
        name: initialData?.name || "",
        capacity: initialData?.capacity || null,
        description: initialData?.description || null,
        isAvailableForRental: initialData?.isAvailableForRental || false,
        hourlyRate: initialData?.hourlyRate || null,
        isActive: initialData?.isActive ?? true,
    };

    const handleSubmit = useCallback(
        async (values: RoomCreate) => {
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
                                {isEdit ? t("admin.editRoom") : t("admin.addRoom")}
                            </Dialog.Title>
                            <Dialog.Close className={styles.headerCloseButton} asChild>
                                <button>
                                    <X size={20} />
                                </button>
                            </Dialog.Close>
                        </div>
                        <Formik
                            initialValues={initialValues}
                            validationSchema={roomSchema}
                            validateOnChange
                            validateOnBlur
                            onSubmit={handleSubmit}
                            enableReinitialize
                        >
                            {({ values, handleChange, handleBlur, errors, touched, setFieldValue, handleSubmit }) => (
                                <Form className={styles.form} onSubmit={handleSubmit}>
                                    <div className={styles.fields}>
                                        <div className={styles.textField}>
                                            <label className={styles.label}>{t("admin.roomName")}</label>
                                            <FormField
                                                value={values.name}
                                                onChangeText={handleChange("name")}
                                                onBlur={handleBlur("name")}
                                                placeholder={t("admin.roomName")}
                                                error={errors.name}
                                                touched={touched.name}
                                                icon={<Building2 />}
                                            />
                                        </div>
                                        <div className={styles.numberField}>
                                            <label className={styles.label}>{t("admin.capacity")}</label>
                                            <div className={styles.numberInputContainer}>
                                                <input
                                                    type="number"
                                                    className={styles.numberInput}
                                                    value={values.capacity || ""}
                                                    onChange={(e) =>
                                                        setFieldValue(
                                                            "capacity",
                                                            e.target.value ? parseInt(e.target.value, 10) : null,
                                                        )
                                                    }
                                                    onBlur={handleBlur("capacity")}
                                                    placeholder={t("admin.capacity")}
                                                    min="1"
                                                />
                                            </div>
                                            {errors.capacity && touched.capacity && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.capacity as string)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.textareaField}>
                                            <label className={styles.label}>{t("admin.description")}</label>
                                            <textarea
                                                className={styles.textarea}
                                                value={values.description || ""}
                                                onChange={(e) => setFieldValue("description", e.target.value || null)}
                                                onBlur={handleBlur("description")}
                                                placeholder={t("admin.description")}
                                                rows={4}
                                            />
                                        </div>
                                        <div className={styles.checkboxField}>
                                            <label className={styles.checkboxLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={values.isAvailableForRental}
                                                    onChange={(e) =>
                                                        setFieldValue("isAvailableForRental", e.target.checked)
                                                    }
                                                />
                                                <span>{t("admin.availableForRental")}</span>
                                            </label>
                                        </div>
                                        {values.isAvailableForRental && (
                                            <div className={styles.numberField}>
                                                <label className={styles.label}>{t("admin.hourlyRate")}</label>
                                                <div className={styles.numberInputContainer}>
                                                    <input
                                                        type="number"
                                                        className={styles.numberInput}
                                                        value={values.hourlyRate ?? ""}
                                                        onChange={(e) =>
                                                            setFieldValue(
                                                                "hourlyRate",
                                                                e.target.value ? parseFloat(e.target.value) : null,
                                                            )
                                                        }
                                                        onBlur={handleBlur("hourlyRate")}
                                                        placeholder={t("admin.hourlyRate")}
                                                        step="0.01"
                                                        min="0"
                                                    />
                                                </div>
                                            </div>
                                        )}
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
