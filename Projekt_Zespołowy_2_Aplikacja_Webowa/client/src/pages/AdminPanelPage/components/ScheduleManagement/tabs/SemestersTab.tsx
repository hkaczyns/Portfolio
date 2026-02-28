import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useListSemestersQuery, type SemesterRead, type SemesterCreate } from "../../../../../store/admin/api";
import { useSemester } from "../../../../../store/admin/api/useSemester";
import { DeleteConfirmModal } from "../modals/DeleteConfirmModal";
import { SemesterModal } from "../modals/SemesterModal";
import styles from "./TabContent.module.css";

export const SemestersTab = () => {
    const { t } = useTranslation("common");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<SemesterRead | null>(null);
    const [deletingItem, setDeletingItem] = useState<SemesterRead | null>(null);

    const { data: items = [], isLoading } = useListSemestersQuery();
    const { createSemester, updateSemester, deleteSemester, isCreating, isUpdating, isDeleting } = useSemester();

    const handleCreate = useCallback(
        async (data: SemesterCreate) => {
            const result = await createSemester(data);
            if (result) {
                setIsCreateModalOpen(false);
            }
        },
        [createSemester],
    );

    const handleUpdate = useCallback(
        async (data: SemesterCreate) => {
            if (!editingItem) return;
            const result = await updateSemester(editingItem.id, data);
            if (result) {
                setEditingItem(null);
            }
        },
        [editingItem, updateSemester],
    );

    const handleDelete = useCallback(async () => {
        if (!deletingItem) return;
        const success = await deleteSemester(deletingItem.id);
        if (success) {
            setDeletingItem(null);
        }
    }, [deletingItem, deleteSemester]);

    if (isLoading) {
        return <div className={styles.loading}>{t("admin.loading")}</div>;
    }

    return (
        <>
            <div className={styles.tabWrapper}>
                <div className={styles.header}>
                    <h3 className={styles.sectionTitle}>{t("admin.semesters")}</h3>
                    <button className={styles.addButton} onClick={() => setIsCreateModalOpen(true)}>
                        <Plus size={16} />
                        <span>{t("admin.addSemester")}</span>
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className={styles.empty}>{t("admin.noSemesters")}</div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>{t("admin.name")}</th>
                                    <th className={styles.th}>{t("admin.startDate")}</th>
                                    <th className={styles.th}>{t("admin.endDate")}</th>
                                    <th className={styles.th}>{t("admin.status")}</th>
                                    <th className={styles.th}>{t("admin.actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className={styles.tr}>
                                        <td className={styles.td}>{item.name}</td>
                                        <td className={styles.td}>{new Date(item.startDate).toLocaleDateString()}</td>
                                        <td className={styles.td}>{new Date(item.endDate).toLocaleDateString()}</td>
                                        <td className={styles.td}>
                                            <span
                                                className={item.isActive ? styles.statusActive : styles.statusInactive}
                                            >
                                                {item.isActive ? t("admin.active") : t("admin.inactive")}
                                            </span>
                                        </td>
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

            <SemesterModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreate}
                isLoading={isCreating}
            />

            {editingItem && (
                <SemesterModal
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
                    title={t("admin.deleteSemester")}
                    message={t("admin.semesterDeleteConfirm", { name: deletingItem.name })}
                />
            )}
        </>
    );
};
