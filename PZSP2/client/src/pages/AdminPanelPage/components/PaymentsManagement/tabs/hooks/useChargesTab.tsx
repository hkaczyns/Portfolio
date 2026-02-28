import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
    useListChargesQuery,
    useCreateChargeMutation,
    useUpdateChargeMutation,
    useCancelChargeMutation,
    useListUsersQuery,
    type ChargeRead,
    type ChargeCreate,
    type ChargeUpdate,
    ChargeStatus,
} from "../../../../../../store/admin/api";
import { UserRole } from "../../../../../../store/auth/types";
import { useAlert } from "../../../../../../components/Alert/AlertContext";
import { getStudentNameById } from "../../../../../../utils/studentUtils";
import { CHARGE_STATUS, CHARGE_TYPE } from "../../../../../../constants/constants";

export const useChargesTab = () => {
    const { t } = useTranslation("common");
    const { publish } = useAlert();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ChargeRead | null>(null);
    const [deletingItem, setDeletingItem] = useState<ChargeRead | null>(null);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    const { data: items = [], isLoading } = useListChargesQuery({
        studentId: selectedStudentId || undefined,
    });
    const { data: students = [] } = useListUsersQuery({ role: UserRole.STUDENT });
    const [createItem, { isLoading: isCreating }] = useCreateChargeMutation();
    const [updateItem, { isLoading: isUpdating }] = useUpdateChargeMutation();
    const [cancelCharge, { isLoading: isCancelling }] = useCancelChargeMutation();

    const handleCreate = useCallback(
        async (data: ChargeCreate | ChargeUpdate) => {
            if (!selectedStudentId) {
                publish(t("admin.selectStudentFirst"), "error");
                return;
            }
            try {
                await createItem({ studentId: selectedStudentId, data: data as ChargeCreate }).unwrap();
                publish(t("admin.chargeCreateSuccess"), "success");
                setIsCreateModalOpen(false);
            } catch {
                publish(t("admin.chargeCreateError"), "error");
            }
        },
        [selectedStudentId, createItem, publish, t],
    );

    const handleUpdate = useCallback(
        async (data: ChargeUpdate) => {
            if (!editingItem) return;
            try {
                await updateItem({ chargeId: editingItem.id, data }).unwrap();
                publish(t("admin.chargeUpdateSuccess"), "success");
                setEditingItem(null);
            } catch {
                publish(t("admin.chargeUpdateError"), "error");
            }
        },
        [editingItem, updateItem, publish, t],
    );

    const handleCancel = useCallback(async () => {
        if (!deletingItem) return;
        try {
            await cancelCharge(deletingItem.id).unwrap();
            publish(t("admin.chargeCancelSuccess"), "success");
            setDeletingItem(null);
        } catch {
            publish(t("admin.chargeCancelError"), "error");
        }
    }, [deletingItem, cancelCharge, publish, t]);

    const getStudentName = useCallback((userId: string) => getStudentNameById(userId, students), [students]);

    const getChargeTypeLabel = useCallback(
        (type: string) => {
            switch (type) {
                case CHARGE_TYPE.MONTHLY_FEE:
                    return t("admin.chargeTypeMonthlyFee");
                case CHARGE_TYPE.ADDITIONAL_CLASSES:
                    return t("admin.chargeTypeAdditionalClasses");
                case CHARGE_TYPE.ADJUSTMENT:
                    return t("admin.chargeTypeAdjustment");
                default:
                    return type;
            }
        },
        [t],
    );

    const getChargeStatusLabel = useCallback(
        (status: string) => {
            switch (status) {
                case CHARGE_STATUS.OPEN:
                    return t("admin.chargeStatusOpen");
                case CHARGE_STATUS.PAID:
                    return t("admin.chargeStatusPaid");
                case CHARGE_STATUS.PARTIAL:
                    return t("admin.chargeStatusPartial");
                case CHARGE_STATUS.CANCELLED:
                    return t("admin.chargeStatusCancelled");
                default:
                    return status;
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
        isCancelling,
        handleCreate,
        handleUpdate,
        handleCancel,
        getStudentName,
        getChargeTypeLabel,
        getChargeStatusLabel,
        ChargeStatus,
    };
};
