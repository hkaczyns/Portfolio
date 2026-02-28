import { useCallback } from "react";
import { Plus, Edit2, Trash2, X, CheckCircle, Calendar, ClipboardList } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ClassSessionModal } from "../modals/ClassSessionModal";
import { CancelSessionModal } from "../modals/CancelSessionModal";
import { CompleteSessionModal } from "../modals/CompleteSessionModal";
import { RescheduleSessionModal } from "../modals/RescheduleSessionModal";
import { DeleteConfirmModal } from "../modals/DeleteConfirmModal";
import { ManageSessionAttendanceModal } from "../modals/ManageSessionAttendanceModal";
import { useSessionsTab } from "./hooks/useSessionsTab";
import type { ClassSessionRead } from "../../../../../store/admin/api";
import { CLASS_SESSION_STATUS } from "../../../../../constants/constants";
import styles from "./TabContent.module.css";

export const SessionsTab = () => {
    const { t } = useTranslation("common");
    const {
        items,
        isLoading,
        classGroups,
        rooms,
        instructors,
        isCreateModalOpen,
        setIsCreateModalOpen,
        editingItem,
        setEditingItem,
        deletingItem,
        setDeletingItem,
        cancellingItem,
        setCancellingItem,
        completingItem,
        setCompletingItem,
        reschedulingItem,
        setReschedulingItem,
        managingAttendanceItem,
        setManagingAttendanceItem,
        isCreating,
        isUpdating,
        isDeleting,
        isCancelling,
        isCompleting,
        isRescheduling,
        handleCreate,
        handleUpdate,
        handleDelete,
        handleCancel,
        handleComplete,
        handleReschedule,
        getClassGroupName,
        getRoomName,
        getSessionStatusLabel,
    } = useSessionsTab();

    const handleOpenCreateModal = useCallback(() => {
        setIsCreateModalOpen(true);
    }, [setIsCreateModalOpen]);

    const handleCloseCreateModal = useCallback(() => {
        setIsCreateModalOpen(false);
    }, [setIsCreateModalOpen]);

    const handleEditItem = useCallback(
        (item: ClassSessionRead) => {
            setEditingItem(item);
        },
        [setEditingItem],
    );

    const handleCloseEditModal = useCallback(() => {
        setEditingItem(null);
    }, [setEditingItem]);

    const handleCancelItem = useCallback(
        (item: ClassSessionRead) => {
            setCancellingItem(item);
        },
        [setCancellingItem],
    );

    const handleCloseCancelModal = useCallback(() => {
        setCancellingItem(null);
    }, [setCancellingItem]);

    const handleCompleteItem = useCallback(
        (item: ClassSessionRead) => {
            setCompletingItem(item);
        },
        [setCompletingItem],
    );

    const handleCloseCompleteModal = useCallback(() => {
        setCompletingItem(null);
    }, [setCompletingItem]);

    const handleRescheduleItem = useCallback(
        (item: ClassSessionRead) => {
            setReschedulingItem(item);
        },
        [setReschedulingItem],
    );

    const handleCloseRescheduleModal = useCallback(() => {
        setReschedulingItem(null);
    }, [setReschedulingItem]);

    const handleManageAttendance = useCallback(
        (item: ClassSessionRead) => {
            setManagingAttendanceItem(item);
        },
        [setManagingAttendanceItem],
    );

    const handleCloseManageAttendanceModal = useCallback(() => {
        setManagingAttendanceItem(null);
    }, [setManagingAttendanceItem]);

    const handleDeleteItem = useCallback(
        (item: ClassSessionRead) => {
            setDeletingItem(item);
        },
        [setDeletingItem],
    );

    const handleCloseDeleteModal = useCallback(() => {
        setDeletingItem(null);
    }, [setDeletingItem]);

    if (isLoading) {
        return <div className={styles.loading}>{t("admin.loading")}</div>;
    }

    return (
        <>
            <div className={styles.tabWrapper}>
                <div className={styles.header}>
                    <h3 className={styles.sectionTitle}>{t("admin.sessions")}</h3>
                    <button className={styles.addButton} onClick={handleOpenCreateModal}>
                        <Plus size={16} />
                        <span>{t("admin.addSession")}</span>
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className={styles.empty}>{t("admin.noSessions")}</div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>{t("admin.classGroup")}</th>
                                    <th className={styles.th}>{t("admin.date")}</th>
                                    <th className={styles.th}>{t("admin.time")}</th>
                                    <th className={styles.th}>{t("admin.room")}</th>
                                    <th className={styles.th}>{t("admin.status")}</th>
                                    <th className={styles.th}>{t("admin.actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className={styles.tr}>
                                        <td className={styles.td}>{getClassGroupName(item.classGroupId)}</td>
                                        <td className={styles.td}>{new Date(item.date).toLocaleDateString()}</td>
                                        <td className={styles.td}>
                                            {item.startTime} - {item.endTime}
                                        </td>
                                        <td className={styles.td}>{getRoomName(item.roomId)}</td>
                                        <td className={styles.td}>
                                            <span className={styles.statusActive}>
                                                {getSessionStatusLabel(item.status)}
                                            </span>
                                        </td>
                                        <td className={styles.td}>
                                            <div className={styles.actions}>
                                                {item.status === CLASS_SESSION_STATUS.SCHEDULED && (
                                                    <>
                                                        <button
                                                            className={styles.actionButton}
                                                            onClick={() => handleEditItem(item)}
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            className={styles.actionButton}
                                                            onClick={() => handleCancelItem(item)}
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                        <button
                                                            className={styles.actionButton}
                                                            onClick={() => handleRescheduleItem(item)}
                                                        >
                                                            <Calendar size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {item.status === CLASS_SESSION_STATUS.SCHEDULED && (
                                                    <button
                                                        className={styles.actionButton}
                                                        onClick={() => handleCompleteItem(item)}
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    className={styles.actionButton}
                                                    onClick={() => handleManageAttendance(item)}
                                                >
                                                    <ClipboardList size={16} />
                                                </button>
                                                <button
                                                    className={styles.actionButton}
                                                    onClick={() => handleDeleteItem(item)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ClassSessionModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onSubmit={handleCreate}
                isLoading={isCreating}
                classGroups={classGroups}
                rooms={rooms}
                instructors={instructors}
            />

            {editingItem && (
                <ClassSessionModal
                    isOpen={!!editingItem}
                    onClose={handleCloseEditModal}
                    onSubmit={handleUpdate}
                    isLoading={isUpdating}
                    initialData={editingItem}
                    classGroups={classGroups}
                    rooms={rooms}
                    instructors={instructors}
                />
            )}

            {deletingItem && (
                <DeleteConfirmModal
                    isOpen={!!deletingItem}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleDelete}
                    isLoading={isDeleting}
                    title={t("admin.deleteSession")}
                    message={t("admin.sessionDeleteConfirm")}
                />
            )}

            {cancellingItem && (
                <CancelSessionModal
                    isOpen={!!cancellingItem}
                    onClose={handleCloseCancelModal}
                    onSubmit={handleCancel}
                    isLoading={isCancelling}
                    sessionDate={new Date(cancellingItem.date).toLocaleDateString()}
                    sessionTime={`${cancellingItem.startTime} - ${cancellingItem.endTime}`}
                />
            )}

            {completingItem && (
                <CompleteSessionModal
                    isOpen={!!completingItem}
                    onClose={handleCloseCompleteModal}
                    onSubmit={handleComplete}
                    isLoading={isCompleting}
                    sessionDate={new Date(completingItem.date).toLocaleDateString()}
                    sessionTime={`${completingItem.startTime} - ${completingItem.endTime}`}
                />
            )}

            {reschedulingItem && (
                <RescheduleSessionModal
                    isOpen={!!reschedulingItem}
                    onClose={handleCloseRescheduleModal}
                    onSubmit={handleReschedule}
                    isLoading={isRescheduling}
                    sessionDate={new Date(reschedulingItem.date).toLocaleDateString()}
                    sessionTime={`${reschedulingItem.startTime} - ${reschedulingItem.endTime}`}
                />
            )}

            {managingAttendanceItem && (
                <ManageSessionAttendanceModal
                    isOpen={!!managingAttendanceItem}
                    onClose={handleCloseManageAttendanceModal}
                    classSession={managingAttendanceItem}
                />
            )}
        </>
    );
};
