import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Spinner } from "../../../../../components/Spinner/Spinner";
import { SECONDARY_TEXT_COLOR } from "../../../../../constants/constants";
import { StudentSearchInput } from "../../../../../components/StudentSearchInput/StudentSearchInput";
import { useManageGroupStudents } from "./hooks/useManageGroupStudents";
import type { ClassGroupRead } from "../../../../../store/admin/api";
import styles from "./Modal.module.css";

interface ManageGroupStudentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    classGroup: ClassGroupRead;
}

export const ManageGroupStudentsModal = ({ isOpen, onClose, classGroup }: ManageGroupStudentsModalProps) => {
    const { t } = useTranslation("common");
    const {
        enrollments,
        isLoading,
        selectedStudentId,
        setSelectedStudentId,
        enrolledStudentIds,
        isCreating,
        isDeleting,
        handleAddStudent,
        handleRemoveStudent,
        getStudentName,
        getStatusLabel,
    } = useManageGroupStudents(classGroup);

    if (isLoading) {
        return (
            <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <Dialog.Portal>
                    <Dialog.Overlay className={styles.overlay} />
                    <Dialog.Content className={styles.content}>
                        <div className={styles.modal}>
                            <div className={styles.loading}>
                                <Spinner size={40} />
                            </div>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        );
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} />
                <Dialog.Content className={`${styles.content} ${styles.contentWide}`}>
                    <div className={styles.modal}>
                        <div className={styles.header}>
                            <Dialog.Title className={styles.title}>
                                {t("admin.manageGroupStudents")} - {classGroup.name}
                            </Dialog.Title>
                            <Dialog.Close className={styles.headerCloseButton} asChild>
                                <button>
                                    <X size={20} />
                                </button>
                            </Dialog.Close>
                        </div>

                        <div className={styles.fields}>
                            <div className={styles.selectField}>
                                <label className={styles.label}>{t("admin.addStudent")}</label>
                                <div className={styles.searchInputContainer}>
                                    <StudentSearchInput
                                        value={selectedStudentId || null}
                                        onChange={(id) => setSelectedStudentId(id || "")}
                                        excludeIds={enrolledStudentIds}
                                        placeholder={t("admin.selectStudent")}
                                        disabled={isCreating}
                                    />
                                    <button
                                        type="button"
                                        className={`${styles.submitButton} ${styles.submitButtonCompact}`}
                                        onClick={handleAddStudent}
                                        disabled={!selectedStudentId || isCreating}
                                    >
                                        {isCreating ? (
                                            <Spinner color={SECONDARY_TEXT_COLOR} size={16} />
                                        ) : (
                                            <Plus size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.enrolledStudentsSection}>
                                <h3 className={`${styles.label} ${styles.enrolledStudentsTitle}`}>
                                    {t("admin.enrolledStudents")} ({enrollments.length})
                                </h3>
                                {enrollments.length === 0 ? (
                                    <div className={styles.empty}>{t("admin.noEnrolledStudents")}</div>
                                ) : (
                                    <div className={styles.tableContainer}>
                                        <table className={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th className={styles.th}>{t("admin.student")}</th>
                                                    <th className={styles.th}>{t("admin.status")}</th>
                                                    <th className={styles.th}>{t("admin.joinedAt")}</th>
                                                    <th className={styles.th}>{t("admin.actions")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {enrollments.map((enrollment) => (
                                                    <tr key={enrollment.id} className={styles.tr}>
                                                        <td className={styles.td}>
                                                            {getStudentName(enrollment.studentId)}
                                                        </td>
                                                        <td className={styles.td}>
                                                            <span className={styles.statusActive}>
                                                                {getStatusLabel(enrollment.status)}
                                                            </span>
                                                        </td>
                                                        <td className={styles.td}>
                                                            {new Date(enrollment.joinedAt).toLocaleDateString()}
                                                        </td>
                                                        <td className={styles.td}>
                                                            <button
                                                                type="button"
                                                                className={styles.actionButton}
                                                                onClick={() => handleRemoveStudent(enrollment)}
                                                                disabled={isDeleting}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <Dialog.Close asChild>
                                <button type="button" className={styles.cancelButton}>
                                    {t("account.cancel")}
                                </button>
                            </Dialog.Close>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
