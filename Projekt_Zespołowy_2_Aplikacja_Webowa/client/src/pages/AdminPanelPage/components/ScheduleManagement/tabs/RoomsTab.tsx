import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useListRoomsQuery, type RoomRead, type RoomCreate, type RoomUpdate } from "../../../../../store/admin/api";
import { useRoom } from "../../../../../store/admin/api/useRoom";
import { RoomModal } from "../modals/RoomModal";
import { DeleteConfirmModal } from "../modals/DeleteConfirmModal";
import styles from "./TabContent.module.css";

export const RoomsTab = () => {
    const { t } = useTranslation("common");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<RoomRead | null>(null);
    const [deletingRoom, setDeletingRoom] = useState<RoomRead | null>(null);

    const { data: rooms = [], isLoading } = useListRoomsQuery();
    const { createRoom, updateRoom, deleteRoom, isCreating, isUpdating, isDeleting } = useRoom();

    const handleCreate = useCallback(
        async (data: RoomCreate) => {
            const result = await createRoom(data);
            if (result) {
                setIsCreateModalOpen(false);
            }
        },
        [createRoom],
    );

    const handleUpdate = useCallback(
        async (roomId: number, data: RoomUpdate) => {
            const result = await updateRoom(roomId, data);
            if (result) {
                setEditingRoom(null);
            }
        },
        [updateRoom],
    );

    const handleDelete = useCallback(async () => {
        if (!deletingRoom) return;
        const success = await deleteRoom(deletingRoom.id);
        if (success) {
            setDeletingRoom(null);
        }
    }, [deletingRoom, deleteRoom]);

    if (isLoading) {
        return <div className={styles.loading}>{t("admin.loading")}</div>;
    }

    return (
        <>
            <div className={styles.tabWrapper}>
                <div className={styles.header}>
                    <h3 className={styles.sectionTitle}>{t("admin.rooms")}</h3>
                    <button className={styles.addButton} onClick={() => setIsCreateModalOpen(true)}>
                        <Plus size={16} />
                        <span>{t("admin.addRoom")}</span>
                    </button>
                </div>

                {rooms.length === 0 ? (
                    <div className={styles.empty}>{t("admin.noRooms")}</div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>{t("admin.name")}</th>
                                    <th className={styles.th}>{t("admin.capacity")}</th>
                                    <th className={styles.th}>{t("admin.description")}</th>
                                    <th className={styles.th}>{t("admin.status")}</th>
                                    <th className={styles.th}>{t("admin.actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.map((room) => (
                                    <tr key={room.id} className={styles.tr}>
                                        <td className={styles.td}>{room.name}</td>
                                        <td className={styles.td}>{room.capacity || "-"}</td>
                                        <td className={styles.td}>{room.description || "-"}</td>
                                        <td className={styles.td}>
                                            <span
                                                className={room.isActive ? styles.statusActive : styles.statusInactive}
                                            >
                                                {room.isActive ? t("admin.active") : t("admin.inactive")}
                                            </span>
                                        </td>
                                        <td className={styles.td}>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.actionButton}
                                                    onClick={() => setEditingRoom(room)}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className={styles.actionButton}
                                                    onClick={() => setDeletingRoom(room)}
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

            <RoomModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreate}
                isLoading={isCreating}
            />

            {editingRoom && (
                <RoomModal
                    isOpen={!!editingRoom}
                    onClose={() => setEditingRoom(null)}
                    onSubmit={(data) => handleUpdate(editingRoom.id, data)}
                    isLoading={isUpdating}
                    initialData={editingRoom}
                />
            )}

            {deletingRoom && (
                <DeleteConfirmModal
                    isOpen={!!deletingRoom}
                    onClose={() => setDeletingRoom(null)}
                    onConfirm={handleDelete}
                    isLoading={isDeleting}
                    title={t("admin.deleteRoom")}
                    message={t("admin.roomDeleteConfirm", { name: deletingRoom.name })}
                />
            )}
        </>
    );
};
