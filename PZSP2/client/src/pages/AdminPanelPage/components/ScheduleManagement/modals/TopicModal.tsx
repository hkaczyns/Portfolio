import * as Dialog from "@radix-ui/react-dialog";
import { Formik, Form } from "formik";
import { BookOpen, X } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { FormField } from "../../../../../components/FormField/FormField";
import { Spinner } from "../../../../../components/Spinner/Spinner";
import { SECONDARY_TEXT_COLOR } from "../../../../../constants/constants";
import type { TopicRead, TopicCreate } from "../../../../../store/admin/api";
import styles from "./Modal.module.css";

const topicSchema = Yup.object({
    name: Yup.string().required("name.required").max(64, "name.maxLength"),
    description: Yup.string().nullable(),
});

interface TopicModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TopicCreate) => Promise<void>;
    isLoading: boolean;
    initialData?: TopicRead;
}

export const TopicModal = ({ isOpen, onClose, onSubmit, isLoading, initialData }: TopicModalProps) => {
    const { t } = useTranslation("common");
    const { t: tValidation } = useTranslation("errors", { keyPrefix: "validation" });

    const isEdit = !!initialData;

    const initialValues: TopicCreate = {
        name: initialData?.name || "",
        description: initialData?.description || null,
    };

    const handleSubmit = useCallback(
        async (values: TopicCreate) => {
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
                                {isEdit ? t("admin.editTopic") : t("admin.addTopic")}
                            </Dialog.Title>
                            <Dialog.Close className={styles.headerCloseButton} asChild>
                                <button>
                                    <X size={20} />
                                </button>
                            </Dialog.Close>
                        </div>
                        <Formik
                            initialValues={initialValues}
                            validationSchema={topicSchema}
                            validateOnChange
                            validateOnBlur
                            onSubmit={handleSubmit}
                            enableReinitialize
                        >
                            {({ values, handleChange, handleBlur, errors, touched, setFieldValue, handleSubmit }) => (
                                <Form className={styles.form} onSubmit={handleSubmit}>
                                    <div className={styles.fields}>
                                        <div className={styles.textField}>
                                            <label className={styles.label}>{t("admin.name")}</label>
                                            <FormField
                                                value={values.name}
                                                onChangeText={handleChange("name")}
                                                onBlur={handleBlur("name")}
                                                placeholder={t("admin.name")}
                                                error={errors.name}
                                                touched={touched.name}
                                                icon={<BookOpen />}
                                            />
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
                                            {errors.description && touched.description && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.description as string)}</span>
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
