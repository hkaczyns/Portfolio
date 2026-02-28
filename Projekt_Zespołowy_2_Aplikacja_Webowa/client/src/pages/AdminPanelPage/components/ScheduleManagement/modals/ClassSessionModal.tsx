import * as Dialog from "@radix-ui/react-dialog";
import { Formik, Form } from "formik";
import { Clock, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { Spinner } from "../../../../../components/Spinner/Spinner";
import { SECONDARY_TEXT_COLOR } from "../../../../../constants/constants";
import type { ClassSessionRead, ClassSessionCreate } from "../../../../../store/admin/api";
import { useClassSessionModal } from "./hooks/useClassSessionModal";
import styles from "./Modal.module.css";

const classSessionSchema = Yup.object({
    classGroupId: Yup.number().required("classGroupId.required"),
    date: Yup.date().required("date.required").typeError("date.invalid"),
    startTime: Yup.string()
        .required("startTime.required")
        .test("is-before-end", "endTime.mustBeAfterStart", function (value) {
            const { endTime } = this.parent;
            if (!value || !endTime) return true;
            return value < endTime;
        }),
    endTime: Yup.string()
        .required("endTime.required")
        .test("is-after-start", "endTime.mustBeAfterStart", function (value) {
            const { startTime } = this.parent;
            if (!value || !startTime) return true;
            return value > startTime;
        }),
    roomId: Yup.number().nullable(),
    instructorId: Yup.string().nullable(),
    notes: Yup.string().nullable().max(500, "notes.maxLength"),
    status: Yup.string(),
});

interface ClassSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ClassSessionCreate) => Promise<void>;
    isLoading: boolean;
    initialData?: ClassSessionRead;
    classGroups: Array<{ id: number; name: string }>;
    rooms: Array<{ id: number; name: string }>;
    instructors: Array<{ id: string; firstName: string; lastName: string }>;
}

export const ClassSessionModal = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    initialData,
    classGroups,
    rooms,
    instructors,
}: ClassSessionModalProps) => {
    const { t } = useTranslation("common");
    const { t: tValidation } = useTranslation("errors", { keyPrefix: "validation" });
    const { isEdit, initialValues, handleSubmit } = useClassSessionModal(initialData);

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} />
                <Dialog.Content className={`${styles.content} ${styles.contentWide}`}>
                    <div className={styles.modal}>
                        <div className={styles.header}>
                            <Dialog.Title className={styles.title}>
                                {isEdit ? t("admin.editSession") : t("admin.addSession")}
                            </Dialog.Title>
                            <Dialog.Close className={styles.headerCloseButton} asChild>
                                <button>
                                    <X size={20} />
                                </button>
                            </Dialog.Close>
                        </div>
                        <Formik
                            initialValues={initialValues}
                            validationSchema={classSessionSchema}
                            validateOnChange
                            validateOnBlur
                            onSubmit={(values) => handleSubmit(values, onSubmit)}
                            enableReinitialize
                        >
                            {({
                                values,
                                handleBlur,
                                errors,
                                touched,
                                setFieldValue,
                                handleSubmit: formikHandleSubmit,
                            }) => (
                                <Form className={styles.form} onSubmit={formikHandleSubmit}>
                                    <div className={styles.fields}>
                                        <div className={styles.selectField}>
                                            <label className={styles.label}>{t("admin.classGroup")} *</label>
                                            <select
                                                className={styles.select}
                                                value={values.classGroupId || ""}
                                                onChange={(e) =>
                                                    setFieldValue("classGroupId", parseInt(e.target.value) || 0)
                                                }
                                                onBlur={handleBlur("classGroupId")}
                                                disabled={isEdit}
                                            >
                                                <option value="">{t("admin.selectClassGroup")}</option>
                                                {classGroups.map((group) => (
                                                    <option key={group.id} value={group.id}>
                                                        {group.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.classGroupId && touched.classGroupId && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.classGroupId as string)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.dateField}>
                                            <label className={styles.label}>{t("admin.date")} *</label>
                                            <div className={styles.dateInputContainer}>
                                                <Clock size={20} className={styles.dateIcon} />
                                                <input
                                                    type="date"
                                                    className={styles.dateInput}
                                                    value={values.date}
                                                    onChange={(e) => setFieldValue("date", e.target.value)}
                                                    onBlur={handleBlur("date")}
                                                />
                                            </div>
                                            {errors.date && touched.date && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.date as string)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.dateField}>
                                            <label className={styles.label}>{t("admin.startTime")} *</label>
                                            <div className={styles.dateInputContainer}>
                                                <input
                                                    type="time"
                                                    className={styles.dateInput}
                                                    value={values.startTime}
                                                    onChange={(e) => setFieldValue("startTime", e.target.value)}
                                                    onBlur={handleBlur("startTime")}
                                                />
                                            </div>
                                            {errors.startTime && touched.startTime && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.startTime as string)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.dateField}>
                                            <label className={styles.label}>{t("admin.endTime")} *</label>
                                            <div className={styles.dateInputContainer}>
                                                <input
                                                    type="time"
                                                    className={styles.dateInput}
                                                    value={values.endTime}
                                                    onChange={(e) => setFieldValue("endTime", e.target.value)}
                                                    onBlur={handleBlur("endTime")}
                                                />
                                            </div>
                                            {errors.endTime && touched.endTime && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.endTime as string)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.selectField}>
                                            <label className={styles.label}>{t("admin.room")}</label>
                                            <select
                                                className={styles.select}
                                                value={values.roomId || ""}
                                                onChange={(e) =>
                                                    setFieldValue(
                                                        "roomId",
                                                        e.target.value ? parseInt(e.target.value) : null,
                                                    )
                                                }
                                                onBlur={handleBlur("roomId")}
                                            >
                                                <option value="">{t("admin.noRoom")}</option>
                                                {rooms.map((room) => (
                                                    <option key={room.id} value={room.id}>
                                                        {room.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className={styles.selectField}>
                                            <label className={styles.label}>{t("admin.instructor")}</label>
                                            <select
                                                className={styles.select}
                                                value={values.instructorId || ""}
                                                onChange={(e) => setFieldValue("instructorId", e.target.value || null)}
                                                onBlur={handleBlur("instructorId")}
                                            >
                                                <option value="">{t("admin.noInstructor")}</option>
                                                {instructors.map((instructor) => (
                                                    <option key={instructor.id} value={instructor.id}>
                                                        {instructor.firstName} {instructor.lastName}
                                                    </option>
                                                ))}
                                            </select>
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
