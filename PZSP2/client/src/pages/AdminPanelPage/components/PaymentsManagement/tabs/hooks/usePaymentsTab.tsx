import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
    useListPaymentsQuery,
    useCreatePaymentMutation,
    useUpdatePaymentMutation,
    useDeletePaymentMutation,
    useListUsersQuery,
    type PaymentRead,
    type PaymentCreate,
    type PaymentUpdate,
} from "../../../../../../store/admin/api";
import { UserRole } from "../../../../../../store/auth/types";
import { useAlert } from "../../../../../../components/Alert/AlertContext";
import { getStudentNameById } from "../../../../../../utils/studentUtils";

export const usePaymentsTab = () => {
    const { t } = useTranslation("common");
    const { publish } = useAlert();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PaymentRead | null>(null);
    const [deletingItem, setDeletingItem] = useState<PaymentRead | null>(null);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    const { data: items = [], isLoading } = useListPaymentsQuery({
        studentId: selectedStudentId || undefined,
    });
    const { data: students = [] } = useListUsersQuery({ role: UserRole.STUDENT });
    const [createItem, { isLoading: isCreating }] = useCreatePaymentMutation();
    const [updateItem, { isLoading: isUpdating }] = useUpdatePaymentMutation();
    const [deleteItem, { isLoading: isDeleting }] = useDeletePaymentMutation();

    const handleCreate = useCallback(
        async (data: PaymentCreate | PaymentUpdate) => {
            if (!selectedStudentId) {
                publish(t("admin.selectStudentFirst"), "error");
                return;
            }
            try {
                await createItem({ studentId: selectedStudentId, data: data as PaymentCreate }).unwrap();
                publish(t("admin.paymentCreateSuccess"), "success");
                setIsCreateModalOpen(false);
            } catch {
                publish(t("admin.paymentCreateError"), "error");
            }
        },
        [selectedStudentId, createItem, publish, t],
    );

    const handleUpdate = useCallback(
        async (data: PaymentUpdate) => {
            if (!editingItem) return;
            try {
                await updateItem({ paymentId: editingItem.id, data }).unwrap();
                publish(t("admin.paymentUpdateSuccess"), "success");
                setEditingItem(null);
            } catch {
                publish(t("admin.paymentUpdateError"), "error");
            }
        },
        [editingItem, updateItem, publish, t],
    );

    const handleDelete = useCallback(async () => {
        if (!deletingItem) return;
        try {
            await deleteItem(deletingItem.id).unwrap();
            publish(t("admin.paymentDeleteSuccess"), "success");
            setDeletingItem(null);
        } catch {
            publish(t("admin.paymentDeleteError"), "error");
        }
    }, [deletingItem, deleteItem, publish, t]);

    const getStudentName = useCallback((userId: string) => getStudentNameById(userId, students), [students]);

    const getPaymentMethodLabel = useCallback(
        (method: string) => {
            switch (method) {
                case "cash":
                    return t("admin.paymentMethodCash");
                case "transfer":
                    return t("admin.paymentMethodTransfer");
                case "card":
                    return t("admin.paymentMethodCard");
                default:
                    return method;
            }
        },
        [t],
    );

    return {
        items,
        isLoading,
        students,
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
    };
};
