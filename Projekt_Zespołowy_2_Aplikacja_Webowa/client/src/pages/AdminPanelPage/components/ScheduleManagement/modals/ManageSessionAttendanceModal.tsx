import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { ClassSessionRead } from "../../../../../store/admin/api";
import { Spinner } from "../../../../../components/Spinner/Spinner";
import { SECONDARY_TEXT_COLOR, ATTENDANCE_STATUS } from "../../../../../constants/constants";
import { useManageSessionAttendance } from "./hooks/useManageSessionAttendance";
import styles from "./Modal.module.css";
import tabContentStyles from "../tabs/TabContent.module.css";

type AttendanceStatus = "PRESENT" | "ABSENT" | "EXCUSED" | "MAKEUP";

interface ManageSessionAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    classSession: ClassSessionRead;
}

export const ManageSessionAttendanceModal = ({ isOpen, onClose, classSession }: ManageSessionAttendanceModalProps) => {
    const { t } = useTranslation("common");
    const {
        attendanceList,
        isLoadingAttendance,
        isSaving,
        handleStatusChange,
        handleMakeupToggle,
        handleSave,
        getAttendanceData,
    } = useManageSessionAttendance(classSession, isOpen);

    const handleSaveClick = useCallback(() => {
        handleSave(onClose);
    }, [handleSave, onClose]);

    if (isLoadingAttendance) {
        return (
            <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <Dialog.Portal>
                    <Dialog.Overlay className={styles.overlay} />
                    <Dialog.Content className={`${styles.content} ${styles.contentWide}`}>
                        <div className={styles.modal}>
                            <div className={styles.header}>
                                <Dialog.Title className={styles.title}>
                                    {t("admin.manageSessionAttendance")}
                                </Dialog.Title>
                                <Dialog.Close className={styles.headerCloseButton} asChild>
                                    <button>
                                        <X size={20} />
                                    </button>
                                </Dialog.Close>
                            </div>
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
                            <Dialog.Title className={styles.title}>{t("admin.manageSessionAttendance")}</Dialog.Title>
                            <Dialog.Close className={styles.headerCloseButton} asChild>
                                <button>
                                    <X size={20} />
                                </button>
                            </Dialog.Close>
                        </div>

                        <div className={styles.description}>
                            {new Date(classSession.date).toLocaleDateString()} • {classSession.startTime} -{" "}
                            {classSession.endTime}
                        </div>

                        <div className={styles.body}>
                            {attendanceList.length === 0 ? (
                                <div className={tabContentStyles.empty}>{t("admin.noStudentsInSession")}</div>
                            ) : (
                                <div className={`${tabContentStyles.tableContainer} ${styles.tableContainerModal}`}>
                                    <table className={tabContentStyles.table}>
                                        <thead>
                                            <tr>
                                                <th className={tabContentStyles.th}>{t("admin.studentName")}</th>
                                                <th className={tabContentStyles.th}>{t("admin.enrollmentStatus")}</th>
                                                <th className={tabContentStyles.th}>{t("admin.attendanceStatus")}</th>
                                                <th className={tabContentStyles.th}>{t("admin.isMakeup")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendanceList.map((item) => {
                                                const currentData = getAttendanceData(item.studentId);
                                                return (
                                                    <tr key={item.studentId} className={tabContentStyles.tr}>
                                                        <td className={tabContentStyles.td}>
                                                            {`${item.firstName} ${item.lastName}`.trim()}
                                                        </td>
                                                        <td className={tabContentStyles.td}>
                                                            <span className={tabContentStyles.statusActive}>
                                                                {item.enrollmentStatus}
                                                            </span>
                                                        </td>
                                                        <td className={tabContentStyles.td}>
                                                            <select
                                                                className={styles.select}
                                                                value={currentData.status}
                                                                onChange={(e) =>
                                                                    handleStatusChange(
                                                                        item.studentId,
                                                                        e.target.value as AttendanceStatus,
                                                                    )
                                                                }
                                                                disabled={isSaving}
                                                            >
                                                                <option value={ATTENDANCE_STATUS.PRESENT}>
                                                                    {t("admin.attendanceStatusPresent")}
                                                                </option>
                                                                <option value={ATTENDANCE_STATUS.ABSENT}>
                                                                    {t("admin.attendanceStatusAbsent")}
                                                                </option>
                                                                <option value={ATTENDANCE_STATUS.EXCUSED}>
                                                                    {t("admin.attendanceStatusExcused")}
                                                                </option>
                                                                <option value={ATTENDANCE_STATUS.MAKEUP}>
                                                                    {t("admin.attendanceStatusMakeup")}
                                                                </option>
                                                            </select>
                                                        </td>
                                                        <td className={tabContentStyles.td}>
                                                            <label className={styles.checkboxLabel}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={currentData.isMakeup}
                                                                    onChange={() => handleMakeupToggle(item.studentId)}
                                                                    disabled={isSaving}
                                                                />
                                                                <span>
                                                                    {currentData.isMakeup
                                                                        ? t("admin.yes")
                                                                        : t("admin.no")}
                                                                </span>
                                                            </label>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className={styles.actions}>
                            <Dialog.Close asChild>
                                <button type="button" className={styles.cancelButton} disabled={isSaving}>
                                    {t("account.cancel")}
                                </button>
                            </Dialog.Close>
                            <button
                                type="button"
                                className={styles.submitButton}
                                onClick={handleSaveClick}
                                disabled={isSaving || attendanceList.length === 0}
                            >
                                {isSaving ? <Spinner color={SECONDARY_TEXT_COLOR} /> : t("account.save")}
                            </button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
