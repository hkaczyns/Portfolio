import { useCallback } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PaymentModal } from "../modals/PaymentModal";
import { DeletePaymentModal } from "../modals/DeletePaymentModal";
import { Spinner } from "../../../../../components/Spinner/Spinner";
import { StudentSearchInput } from "../../../../../components/StudentSearchInput/StudentSearchInput";
import { usePaymentsTab } from "./hooks/usePaymentsTab";
import type { PaymentRead } from "../../../../../store/admin/api";
import styles from "./TabContent.module.css";

export const PaymentsTab = () => {
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
        isDeleting,
        handleCreate,
        handleUpdate,
        handleDelete,
        getStudentName,
        getPaymentMethodLabel,
    } = usePaymentsTab();

    const handleOpenCreateModal = useCallback(() => {
        setIsCreateModalOpen(true);
    }, [setIsCreateModalOpen]);

    const handleCloseCreateModal = useCallback(() => {
        setIsCreateModalOpen(false);
    }, [setIsCreateModalOpen]);

    const handleEditItem = useCallback(
        (item: PaymentRead) => {
            setEditingItem(item);
        },
        [setEditingItem],
    );

    const handleCloseEditModal = useCallback(() => {
        setEditingItem(null);
    }, [setEditingItem]);

    const handleDeleteItem = useCallback(
        (item: PaymentRead) => {
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
                <h3 className={styles.sectionTitle}>{t("admin.payments")}</h3>
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
                        <span>{t("admin.addPayment")}</span>
                    </button>
                </div>
            </div>

            {items.length === 0 ? (
                <div className={styles.empty}>{t("admin.noPayments")}</div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>{t("admin.student")}</th>
                                <th className={styles.th}>{t("admin.amount")}</th>
                                <th className={styles.th}>{t("admin.paidAt")}</th>
                                <th className={styles.th}>{t("admin.paymentMethod")}</th>
                                <th className={styles.th}>{t("admin.notes")}</th>
                                <th className={styles.th}>{t("admin.actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className={styles.tr}>
                                    <td className={styles.td}>{getStudentName(item.userId)}</td>
                                    <td className={styles.td}>
                                        {parseFloat(item.amount).toFixed(2)} {t("admin.currency")}
                                    </td>
                                    <td className={styles.td}>{new Date(item.paidAt).toLocaleDateString()}</td>
                                    <td className={styles.td}>{getPaymentMethodLabel(item.paymentMethod)}</td>
                                    <td className={styles.td}>{item.notes || "-"}</td>
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

            {isCreateModalOpen && selectedStudentId && (
                <PaymentModal
                    isOpen={isCreateModalOpen}
                    onClose={handleCloseCreateModal}
                    onSubmit={handleCreate}
                    isLoading={isCreating}
                    studentId={selectedStudentId}
                />
            )}

            {editingItem && (
                <PaymentModal
                    isOpen={!!editingItem}
                    onClose={handleCloseEditModal}
                    onSubmit={handleUpdate}
                    isLoading={isUpdating}
                    initialData={editingItem}
                    studentId={editingItem.userId}
                />
            )}

            {deletingItem && (
                <DeletePaymentModal
                    isOpen={!!deletingItem}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleDelete}
                    isLoading={isDeleting}
                    payment={deletingItem}
                />
            )}
        </>
    );
};
