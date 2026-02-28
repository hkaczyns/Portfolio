import { useCallback } from "react";
import { Plus, Edit2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ChargeModal } from "../modals/ChargeModal";
import { DeleteChargeModal } from "../modals/DeleteChargeModal";
import { Spinner } from "../../../../../components/Spinner/Spinner";
import { StudentSearchInput } from "../../../../../components/StudentSearchInput/StudentSearchInput";
import { useChargesTab } from "./hooks/useChargesTab";
import type { ChargeRead } from "../../../../../store/admin/api";
import { CHARGE_STATUS } from "../../../../../constants/constants";
import styles from "./TabContent.module.css";

export const ChargesTab = () => {
    const { t } = useTranslation("common");
    const {
        items,
        isLoading,
        selectedStudentId,
        setSelectedStudentId,
        isCreateModalOpen,
        setIsCreateModalOpen,
        editingItem,
        setEditingItem,
        deletingItem,
        setDeletingItem,
        isCreating,
        isUpdating,
        isCancelling,
        handleCreate,
        handleUpdate,
        handleCancel,
        getStudentName,
        getChargeTypeLabel,
        getChargeStatusLabel,
        ChargeStatus,
    } = useChargesTab();

    const getStatusClass = useCallback((status: string) => {
        switch (status) {
            case CHARGE_STATUS.PAID:
                return styles.statusActive;
            case CHARGE_STATUS.OPEN:
            case CHARGE_STATUS.PARTIAL:
                return styles.statusWarning;
            case CHARGE_STATUS.CANCELLED:
                return styles.statusDanger;
            default:
                return styles.statusInactive;
        }
    }, []);

    const handleOpenCreateModal = useCallback(() => {
        setIsCreateModalOpen(true);
    }, [setIsCreateModalOpen]);

    const handleCloseCreateModal = useCallback(() => {
        setIsCreateModalOpen(false);
    }, [setIsCreateModalOpen]);

    const handleEditItem = useCallback(
        (item: ChargeRead) => {
            setEditingItem(item);
        },
        [setEditingItem],
    );

    const handleCloseEditModal = useCallback(() => {
        setEditingItem(null);
    }, [setEditingItem]);

    const handleDeleteItem = useCallback(
        (item: ChargeRead) => {
            setDeletingItem(item);
        },
        [setDeletingItem],
    );

    const handleCloseDeleteModal = useCallback(() => {
        setDeletingItem(null);
    }, [setDeletingItem]);

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <Spinner size={30} />
            </div>
        );
    }

    return (
        <>
            <div className={styles.header}>
                <h3 className={styles.sectionTitle}>{t("admin.charges")}</h3>
                <div className={styles.headerActions}>
                    <div className={styles.searchContainer}>
                        <StudentSearchInput
                            value={selectedStudentId}
                            onChange={setSelectedStudentId}
                            allowAll={true}
                            placeholder={t("admin.allStudents")}
                        />
                    </div>
                    <button className={styles.addButton} onClick={handleOpenCreateModal} disabled={!selectedStudentId}>
                        <Plus size={16} />
                        <span>{t("admin.addCharge")}</span>
                    </button>
                </div>
            </div>

            {items.length === 0 ? (
                <div className={styles.empty}>{t("admin.noCharges")}</div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>{t("admin.student")}</th>
                                <th className={styles.th}>{t("admin.amountDue")}</th>
                                <th className={styles.th}>{t("admin.dueDate")}</th>
                                <th className={styles.th}>{t("admin.type")}</th>
                                <th className={styles.th}>{t("admin.status")}</th>
                                <th className={styles.th}>{t("admin.actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className={styles.tr}>
                                    <td className={styles.td}>{getStudentName(item.studentId)}</td>
                                    <td className={styles.td}>
                                        {parseFloat(item.amountDue).toFixed(2)} {t("admin.currency")}
                                    </td>
                                    <td className={styles.td}>{new Date(item.dueDate).toLocaleDateString()}</td>
                                    <td className={styles.td}>{getChargeTypeLabel(item.type)}</td>
                                    <td className={styles.td}>
                                        <span className={getStatusClass(item.status)}>
                                            {getChargeStatusLabel(item.status)}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.actions}>
                                            {item.status !== ChargeStatus.CANCELLED && (
                                                <>
                                                    <button
                                                        className={styles.actionButton}
                                                        onClick={() => handleEditItem(item)}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        className={styles.actionButton}
                                                        onClick={() => handleDeleteItem(item)}
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isCreateModalOpen && selectedStudentId && (
                <ChargeModal
                    isOpen={isCreateModalOpen}
                    onClose={handleCloseCreateModal}
                    onSubmit={handleCreate}
                    isLoading={isCreating}
                    studentId={selectedStudentId}
                />
            )}

            {editingItem && (
                <ChargeModal
                    isOpen={!!editingItem}
                    onClose={handleCloseEditModal}
                    onSubmit={handleUpdate}
                    isLoading={isUpdating}
                    initialData={editingItem}
                    studentId={editingItem.studentId}
                />
            )}

            {deletingItem && (
                <DeleteChargeModal
                    isOpen={!!deletingItem}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleCancel}
                    isLoading={isCancelling}
                    charge={deletingItem}
                />
            )}
        </>
    );
};
