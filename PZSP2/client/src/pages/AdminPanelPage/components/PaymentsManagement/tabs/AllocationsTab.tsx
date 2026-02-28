import { useCallback } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PaymentAllocationModal } from "../modals/PaymentAllocationModal";
import { DeletePaymentAllocationModal } from "../modals/DeletePaymentAllocationModal";
import { Spinner } from "../../../../../components/Spinner/Spinner";
import { useAllocationsTab } from "./hooks/useAllocationsTab";
import type { PaymentAllocationRead } from "../../../../../store/admin/api";
import styles from "./TabContent.module.css";

export const AllocationsTab = () => {
    const { t } = useTranslation("common");
    const {
        allocations,
        isLoading,
        payments,
        selectedPaymentId,
        setSelectedPaymentId,
        isCreateModalOpen,
        setIsCreateModalOpen,
        editingItem,
        setEditingItem,
        deletingItem,
        setDeletingItem,
        isDeleting,
        handleDelete,
        getPaymentInfo,
        getChargeInfo,
    } = useAllocationsTab();

    const handlePaymentChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setSelectedPaymentId(e.target.value ? parseInt(e.target.value) : null);
        },
        [setSelectedPaymentId],
    );

    const handleOpenCreateModal = useCallback(() => {
        setIsCreateModalOpen(true);
    }, [setIsCreateModalOpen]);

    const handleCloseCreateModal = useCallback(() => {
        setIsCreateModalOpen(false);
    }, [setIsCreateModalOpen]);

    const handleEditItem = useCallback(
        (item: PaymentAllocationRead) => {
            setEditingItem(item);
        },
        [setEditingItem],
    );

    const handleCloseEditModal = useCallback(() => {
        setEditingItem(null);
    }, [setEditingItem]);

    const handleDeleteItem = useCallback(
        (item: PaymentAllocationRead) => {
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
                <div>
                    <h3 className={styles.sectionTitle}>{t("admin.allocations")}</h3>
                    <p className={styles.description}>{t("admin.allocationsDescription")}</p>
                </div>
                <div className={styles.headerActions}>
                    <select className={styles.select} value={selectedPaymentId || ""} onChange={handlePaymentChange}>
                        <option value="">{t("admin.selectPayment")}</option>
                        {payments.map((payment) => (
                            <option key={payment.id} value={payment.id}>
                                {getPaymentInfo(payment.id)}
                            </option>
                        ))}
                    </select>
                    <button className={styles.addButton} onClick={handleOpenCreateModal} disabled={!selectedPaymentId}>
                        <Plus size={16} />
                        <span>{t("admin.addAllocation")}</span>
                    </button>
                </div>
            </div>

            {!selectedPaymentId ? (
                <div className={styles.empty}>{t("admin.selectPaymentToViewAllocations")}</div>
            ) : allocations.length === 0 ? (
                <div className={styles.empty}>{t("admin.noAllocations")}</div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>{t("admin.charge")}</th>
                                <th className={styles.th}>{t("admin.amountAllocated")}</th>
                                <th className={styles.th}>{t("admin.actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allocations.map((item) => (
                                <tr key={`${item.paymentId}-${item.chargeId}`} className={styles.tr}>
                                    <td className={styles.td}>{getChargeInfo(item.chargeId)}</td>
                                    <td className={styles.td}>
                                        {parseFloat(item.amountAllocated).toFixed(2)} {t("admin.currency")}
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

            {isCreateModalOpen && selectedPaymentId && (
                <PaymentAllocationModal
                    isOpen={isCreateModalOpen}
                    onClose={handleCloseCreateModal}
                    paymentId={selectedPaymentId}
                />
            )}

            {editingItem && (
                <PaymentAllocationModal
                    isOpen={!!editingItem}
                    onClose={handleCloseEditModal}
                    paymentId={editingItem.paymentId}
                    initialData={editingItem}
                />
            )}

            {deletingItem && (
                <DeletePaymentAllocationModal
                    isOpen={!!deletingItem}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleDelete}
                    isLoading={isDeleting}
                    allocation={deletingItem}
                />
            )}
        </>
    );
};
