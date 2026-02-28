import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
    useListPaymentAllocationsQuery,
    useListPaymentsQuery,
    useListChargesQuery,
    useDeletePaymentAllocationMutation,
    useListUsersQuery,
    type PaymentAllocationRead,
} from "../../../../../../store/admin/api";
import { UserRole } from "../../../../../../store/auth/types";
import { useAlert } from "../../../../../../components/Alert/AlertContext";
import { getStudentNameById } from "../../../../../../utils/studentUtils";

export const useAllocationsTab = () => {
    const { t } = useTranslation("common");
    const { publish } = useAlert();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PaymentAllocationRead | null>(null);
    const [deletingItem, setDeletingItem] = useState<PaymentAllocationRead | null>(null);
    const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);

    const { data: allocations = [], isLoading } = useListPaymentAllocationsQuery(selectedPaymentId || 0, {
        skip: !selectedPaymentId,
    });
    const { data: payments = [] } = useListPaymentsQuery({});
    const { data: charges = [] } = useListChargesQuery({});
    const { data: students = [] } = useListUsersQuery({ role: UserRole.STUDENT });
    const [deleteItem, { isLoading: isDeleting }] = useDeletePaymentAllocationMutation();

    const handleDelete = useCallback(async () => {
        if (!deletingItem) return;
        try {
            await deleteItem({ paymentId: deletingItem.paymentId, chargeId: deletingItem.chargeId }).unwrap();
            publish(t("admin.allocationDeleteSuccess"), "success");
            setDeletingItem(null);
        } catch {
            publish(t("admin.allocationDeleteError"), "error");
        }
    }, [deletingItem, deleteItem, publish, t]);

    const getPaymentInfo = useCallback(
        (paymentId: number) => {
            const payment = payments.find((p) => p.id === paymentId);
            if (!payment) return t("admin.paymentNumber", { number: paymentId });
            const studentName = getStudentNameById(payment.userId, students);
            return `${studentName} - ${parseFloat(payment.amount).toFixed(2)} ${t("admin.currency")}`;
        },
        [payments, students, t],
    );

    const getChargeInfo = useCallback(
        (chargeId: number) => {
            const charge = charges.find((c) => c.id === chargeId);
            if (!charge) return t("admin.chargeNumber", { number: chargeId });
            return `${parseFloat(charge.amountDue).toFixed(2)} ${t("admin.currency")} (${new Date(charge.dueDate).toLocaleDateString()})`;
        },
        [charges, t],
    );

    return {
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
    };
};
