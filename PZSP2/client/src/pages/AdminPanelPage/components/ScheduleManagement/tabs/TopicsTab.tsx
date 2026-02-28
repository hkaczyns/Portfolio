import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useListTopicsQuery, type TopicRead, type TopicCreate } from "../../../../../store/admin/api";
import { useTopic } from "../../../../../store/admin/api/useTopic";
import { TopicModal } from "../modals/TopicModal";
import { DeleteConfirmModal } from "../modals/DeleteConfirmModal";
import styles from "./TabContent.module.css";

export const TopicsTab = () => {
    const { t } = useTranslation("common");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<TopicRead | null>(null);
    const [deletingItem, setDeletingItem] = useState<TopicRead | null>(null);

    const { data: items = [], isLoading } = useListTopicsQuery();
    const { createTopic, updateTopic, deleteTopic, isCreating, isUpdating, isDeleting } = useTopic();

    const handleCreate = useCallback(
        async (data: TopicCreate) => {
            const result = await createTopic(data);
            if (result) {
                setIsCreateModalOpen(false);
            }
        },
        [createTopic],
    );

    const handleUpdate = useCallback(
        async (data: TopicCreate) => {
            if (!editingItem) return;
            const result = await updateTopic(editingItem.id, data);
            if (result) {
                setEditingItem(null);
            }
        },
        [editingItem, updateTopic],
    );

    const handleDelete = useCallback(async () => {
        if (!deletingItem) return;
        const success = await deleteTopic(deletingItem.id);
        if (success) {
            setDeletingItem(null);
        }
    }, [deletingItem, deleteTopic]);

    if (isLoading) {
        return <div className={styles.loading}>{t("admin.loading")}</div>;
    }

    return (
        <>
            <div className={styles.tabWrapper}>
                <div className={styles.header}>
                    <h3 className={styles.sectionTitle}>{t("admin.topics")}</h3>
                    <button className={styles.addButton} onClick={() => setIsCreateModalOpen(true)}>
                        <Plus size={16} />
                        <span>{t("admin.addTopic")}</span>
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className={styles.empty}>{t("admin.noTopics")}</div>
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

            <TopicModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreate}
                isLoading={isCreating}
            />

            {editingItem && (
                <TopicModal
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
                    title={t("admin.deleteTopic")}
                    message={t("admin.topicDeleteConfirm", { name: deletingItem.name })}
                />
            )}
        </>
    );
};
