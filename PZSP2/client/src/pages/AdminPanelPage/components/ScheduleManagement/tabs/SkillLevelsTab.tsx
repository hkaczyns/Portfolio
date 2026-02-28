import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useListSkillLevelsQuery, type SkillLevelRead, type SkillLevelCreate } from "../../../../../store/admin/api";
import { useSkillLevel } from "../../../../../store/admin/api/useSkillLevel";
import { SkillLevelModal } from "../../ScheduleManagement/modals/SkillLevelModal";
import { DeleteConfirmModal } from "../modals/DeleteConfirmModal";
import styles from "./TabContent.module.css";

export const SkillLevelsTab = () => {
    const { t } = useTranslation("common");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<SkillLevelRead | null>(null);
    const [deletingItem, setDeletingItem] = useState<SkillLevelRead | null>(null);

    const { data: items = [], isLoading } = useListSkillLevelsQuery();
    const { createSkillLevel, updateSkillLevel, deleteSkillLevel, isCreating, isUpdating, isDeleting } =
        useSkillLevel();

    const handleCreate = useCallback(
        async (data: SkillLevelCreate) => {
            const result = await createSkillLevel(data);
            if (result) {
                setIsCreateModalOpen(false);
            }
        },
        [createSkillLevel],
    );

    const handleUpdate = useCallback(
        async (data: SkillLevelCreate) => {
            if (!editingItem) return;
            const result = await updateSkillLevel(editingItem.id, data);
            if (result) {
                setEditingItem(null);
            }
        },
        [editingItem, updateSkillLevel],
    );

    const handleDelete = useCallback(async () => {
        if (!deletingItem) return;
        const success = await deleteSkillLevel(deletingItem.id);
        if (success) {
            setDeletingItem(null);
        }
    }, [deletingItem, deleteSkillLevel]);

    if (isLoading) {
        return <div className={styles.loading}>{t("admin.loading")}</div>;
    }

    return (
        <>
            <div className={styles.tabWrapper}>
                <div className={styles.header}>
                    <h3 className={styles.sectionTitle}>{t("admin.skillLevels")}</h3>
                    <button className={styles.addButton} onClick={() => setIsCreateModalOpen(true)}>
                        <Plus size={16} />
                        <span>{t("admin.addSkillLevel")}</span>
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className={styles.empty}>{t("admin.noSkillLevels")}</div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>{t("admin.name")}</th>
                                    <th className={styles.th}>{t("admin.description")}</th>
                                    <th className={styles.th}>{t("admin.actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className={styles.tr}>
                                        <td className={styles.td}>{item.name}</td>
                                        <td className={styles.td}>{item.description || "-"}</td>
                                        <td className={styles.td}>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.actionButton}
                                                    onClick={() => setEditingItem(item)}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className={styles.actionButton}
                                                    onClick={() => setDeletingItem(item)}
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

            <SkillLevelModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreate}
                isLoading={isCreating}
            />

            {editingItem && (
                <SkillLevelModal
                    isOpen={!!editingItem}
                    onClose={() => setEditingItem(null)}
                    onSubmit={handleUpdate}
                    isLoading={isUpdating}
                    initialData={editingItem}
                />
            )}

            {deletingItem && (
                <DeleteConfirmModal
                    isOpen={!!deletingItem}
                    onClose={() => setDeletingItem(null)}
                    onConfirm={handleDelete}
                    isLoading={isDeleting}
                    title={t("admin.deleteSkillLevel")}
                    message={t("admin.skillLevelDeleteConfirm", { name: deletingItem.name })}
                />
            )}
        </>
    );
};
