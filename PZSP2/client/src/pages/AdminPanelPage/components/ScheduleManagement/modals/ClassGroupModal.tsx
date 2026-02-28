import * as Dialog from "@radix-ui/react-dialog";
import { Formik, Form } from "formik";
import { Users, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { FormField } from "../../../../../components/FormField/FormField";
import { Spinner } from "../../../../../components/Spinner/Spinner";
import { SECONDARY_TEXT_COLOR } from "../../../../../constants/constants";
import type { ClassGroupRead, ClassGroupCreate } from "../../../../../store/admin/api";
import { useClassGroupModal } from "./hooks/useClassGroupModal";
import styles from "./Modal.module.css";

const classGroupSchema = Yup.object({
    semesterId: Yup.number().required("semesterId.required"),
    name: Yup.string().required("name.required").max(128, "name.maxLength"),
    description: Yup.string().nullable(),
    levelId: Yup.number().required("levelId.required"),
    topicId: Yup.number().required("topicId.required"),
    roomId: Yup.number().nullable(),
    capacity: Yup.number().required("capacity.required").min(1, "capacity.min"),
    dayOfWeek: Yup.number().required("dayOfWeek.required").min(0).max(6),
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
    instructorId: Yup.string().nullable(),
    isPublic: Yup.boolean(),
    status: Yup.string(),
});

interface ClassGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ClassGroupCreate) => Promise<void>;
    isLoading: boolean;
    initialData?: ClassGroupRead;
    semesters: Array<{ id: number; name: string }>;
    skillLevels: Array<{ id: number; name: string }>;
    topics: Array<{ id: number; name: string }>;
    rooms: Array<{ id: number; name: string }>;
    instructors: Array<{ id: string; firstName: string; lastName: string }>;
}

export const ClassGroupModal = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    initialData,
    semesters,
    skillLevels,
    topics,
    rooms,
    instructors,
}: ClassGroupModalProps) => {
    const { t } = useTranslation("common");
    const { t: tValidation } = useTranslation("errors", { keyPrefix: "validation" });
    const { isEdit, initialValues, daysOfWeek, handleSubmit } = useClassGroupModal(initialData);

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} />
                <Dialog.Content className={`${styles.content} ${styles.contentWide}`}>
                    <div className={styles.modal}>
                        <div className={styles.header}>
                            <Dialog.Title className={styles.title}>
                                {isEdit ? t("admin.editClassGroup") : t("admin.addClassGroup")}
                            </Dialog.Title>
                            <Dialog.Description className={styles.description}>
                                {isEdit
                                    ? t("admin.editClassGroupDescription", {
                                          defaultValue: "Edytuj szczegóły grupy zajęciowej",
                                      })
                                    : t("admin.addClassGroupDescription", {
                                          defaultValue: "Dodaj nową grupę zajęciową",
                                      })}
                            </Dialog.Description>
                            <Dialog.Close className={styles.headerCloseButton} asChild>
                                <button>
                                    <X size={20} />
                                </button>
                            </Dialog.Close>
                        </div>
                        <Formik
                            initialValues={initialValues}
                            validationSchema={classGroupSchema}
                            validateOnChange
                            validateOnBlur
                            onSubmit={(values) => handleSubmit(values, onSubmit)}
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
                                        <div className={styles.selectField}>
                                            <label className={styles.label}>{t("admin.semester")} *</label>
                                            <select
                                                className={styles.select}
                                                value={values.semesterId || ""}
                                                onChange={(e) =>
                                                    setFieldValue("semesterId", parseInt(e.target.value) || 0)
                                                }
                                                onBlur={handleBlur("semesterId")}
                                            >
                                                <option value="">{t("admin.selectSemester")}</option>
                                                {semesters.map((semester) => (
                                                    <option key={semester.id} value={semester.id}>
                                                        {semester.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.semesterId && touched.semesterId && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.semesterId as string)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.textField}>
                                            <label className={styles.label}>{t("admin.name")}</label>
                                            <FormField
                                                value={values.name}
                                                onChangeText={handleChange("name")}
                                                onBlur={handleBlur("name")}
                                                placeholder={t("admin.name")}
                                                error={errors.name}
                                                touched={touched.name}
                                                icon={<Users />}
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

                                        <div className={styles.selectField}>
                                            <label className={styles.label}>{t("admin.level")} *</label>
                                            <select
                                                className={styles.select}
                                                value={values.levelId || ""}
                                                onChange={(e) =>
                                                    setFieldValue("levelId", parseInt(e.target.value) || 0)
                                                }
                                                onBlur={handleBlur("levelId")}
                                            >
                                                <option value="">{t("admin.selectLevel")}</option>
                                                {skillLevels.map((level) => (
                                                    <option key={level.id} value={level.id}>
                                                        {level.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.levelId && touched.levelId && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.levelId as string)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.selectField}>
                                            <label className={styles.label}>{t("admin.topic")} *</label>
                                            <select
                                                className={styles.select}
                                                value={values.topicId || ""}
                                                onChange={(e) =>
                                                    setFieldValue("topicId", parseInt(e.target.value) || 0)
                                                }
                                                onBlur={handleBlur("topicId")}
                                            >
                                                <option value="">{t("admin.selectTopic")}</option>
                                                {topics.map((topic) => (
                                                    <option key={topic.id} value={topic.id}>
                                                        {topic.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.topicId && touched.topicId && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.topicId as string)}</span>
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

                                        <div className={styles.numberField}>
                                            <label className={styles.label}>{t("admin.capacity")} *</label>
                                            <div className={styles.numberInputContainer}>
                                                <input
                                                    type="number"
                                                    className={styles.numberInput}
                                                    value={values.capacity || ""}
                                                    onChange={(e) =>
                                                        setFieldValue(
                                                            "capacity",
                                                            e.target.value ? parseInt(e.target.value, 10) : 1,
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

                                        <div className={styles.selectField}>
                                            <label className={styles.label}>{t("admin.day")} *</label>
                                            <select
                                                className={styles.select}
                                                value={values.dayOfWeek ?? ""}
                                                onChange={(e) =>
                                                    setFieldValue("dayOfWeek", parseInt(e.target.value) || 0)
                                                }
                                                onBlur={handleBlur("dayOfWeek")}
                                            >
                                                {daysOfWeek.map((day, index) => (
                                                    <option key={index} value={index}>
                                                        {day}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.dayOfWeek && touched.dayOfWeek && (
                                                <div className={styles.errorMessage}>
                                                    <span>{tValidation(errors.dayOfWeek as string)}</span>
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
                                            <label className={styles.label}>{t("admin.instructor")}</label>
                                            <select
                                                className={styles.select}
                                                value={values.instructorId || ""}
                                                onChange={(e) =>
                                                    setFieldValue(
                                                        "instructorId",
                                                        e.target.value ? e.target.value : null,
                                                    )
                                                }
                                                onBlur={handleBlur("instructorId")}
                                            >
                                                <option value="">{t("admin.noInstructor")}</option>
                                                {instructors.map((instructor) => (
                                                    <option key={instructor.id} value={instructor.id}>
                                                        {`${instructor.firstName} ${instructor.lastName}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className={styles.checkboxField}>
                                            <label className={styles.checkboxLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={values.isPublic}
                                                    onChange={(e) => setFieldValue("isPublic", e.target.checked)}
                                                />
                                                <span>{t("admin.isPublic")}</span>
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
