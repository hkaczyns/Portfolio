import { useCallback } from "react";
import { Plus, Edit2, Trash2, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ClassGroupModal } from "../modals/ClassGroupModal";
import { DeleteConfirmModal } from "../modals/DeleteConfirmModal";
import { ManageGroupStudentsModal } from "../modals/ManageGroupStudentsModal";
import { useClassGroupsTab } from "./hooks/useClassGroupsTab";
import type { ClassGroupRead } from "../../../../../store/admin/api";
import styles from "./TabContent.module.css";

export const ClassGroupsTab = () => {
    const { t } = useTranslation("common");
    const {
        items,
        isLoading,
        semesters,
        skillLevels,
        topics,
        rooms,
        instructors,
        isCreateModalOpen,
        setIsCreateModalOpen,
        editingItem,
        setEditingItem,
        deletingItem,
        setDeletingItem,
        managingStudentsItem,
        setManagingStudentsItem,
        isCreating,
        isUpdating,
        isDeleting,
        handleCreate,
        handleUpdate,
        handleDelete,
        getSemesterName,
        getSkillLevelName,
        getTopicName,
        getDayName,
    } = useClassGroupsTab();

    const handleOpenCreateModal = useCallback(() => {
        setIsCreateModalOpen(true);
    }, [setIsCreateModalOpen]);

    const handleCloseCreateModal = useCallback(() => {
        setIsCreateModalOpen(false);
    }, [setIsCreateModalOpen]);

    const handleEditItem = useCallback(
        (item: ClassGroupRead) => {
            setEditingItem(item);
        },
        [setEditingItem],
    );

    const handleCloseEditModal = useCallback(() => {
        setEditingItem(null);
    }, [setEditingItem]);

    const handleManageStudents = useCallback(
        (item: ClassGroupRead) => {
            setManagingStudentsItem(item);
        },
        [setManagingStudentsItem],
    );

    const handleCloseManageStudentsModal = useCallback(() => {
        setManagingStudentsItem(null);
    }, [setManagingStudentsItem]);

    const handleDeleteItem = useCallback(
        (item: ClassGroupRead) => {
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
                    <h3 className={styles.sectionTitle}>{t("admin.classGroups")}</h3>
                    <button className={styles.addButton} onClick={handleOpenCreateModal}>
                        <Plus size={16} />
                        <span>{t("admin.addClassGroup")}</span>
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className={styles.empty}>{t("admin.noClassGroups")}</div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>{t("admin.name")}</th>
                                    <th className={styles.th}>{t("admin.semester")}</th>
                                    <th className={styles.th}>{t("admin.level")}</th>
                                    <th className={styles.th}>{t("admin.topic")}</th>
                                    <th className={styles.th}>{t("admin.day")}</th>
                                    <th className={styles.th}>{t("admin.time")}</th>
                                    <th className={styles.th}>{t("admin.actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className={styles.tr}>
                                        <td className={styles.td}>{item.name}</td>
                                        <td className={styles.td}>{getSemesterName(item.semesterId)}</td>
                                        <td className={styles.td}>{getSkillLevelName(item.levelId)}</td>
                                        <td className={styles.td}>{getTopicName(item.topicId)}</td>
                                        <td className={styles.td}>{getDayName(item.dayOfWeek)}</td>
                                        <td className={styles.td}>
                                            {item.startTime} - {item.endTime}
                                        </td>
                                        <td className={styles.td}>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.actionButton}
                                                    onClick={() => handleEditItem(item)}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className={styles.actionButton}
                                                    onClick={() => handleManageStudents(item)}
                                                >
                                                    <Users size={16} />
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

            <ClassGroupModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onSubmit={handleCreate}
                isLoading={isCreating}
                semesters={semesters}
                skillLevels={skillLevels}
                topics={topics}
                rooms={rooms}
                instructors={instructors}
            />

            {editingItem && (
                <ClassGroupModal
                    isOpen={!!editingItem}
                    onClose={handleCloseEditModal}
                    onSubmit={handleUpdate}
                    isLoading={isUpdating}
                    initialData={editingItem}
                    semesters={semesters}
                    skillLevels={skillLevels}
                    topics={topics}
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
                    title={t("admin.deleteClassGroup")}
                    message={t("admin.classGroupDeleteConfirm", { name: deletingItem.name })}
                />
            )}

            {managingStudentsItem && (
                <ManageGroupStudentsModal
                    isOpen={!!managingStudentsItem}
                    onClose={handleCloseManageStudentsModal}
                    classGroup={managingStudentsItem}
                />
            )}
        </>
    );
};
