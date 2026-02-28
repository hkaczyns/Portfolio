import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    useListChargesQuery,
    useCreatePaymentAllocationMutation,
    useUpdatePaymentAllocationMutation,
    type PaymentAllocationRead,
    type PaymentAllocationCreate,
    type PaymentAllocationUpdate,
} from "../../../../../../store/admin/api";
import { useAlert } from "../../../../../../components/Alert/AlertContext";
import { CHARGE_STATUS } from "../../../../../../constants/constants";

export const usePaymentAllocationModal = (paymentId: number, initialData?: PaymentAllocationRead) => {
    const { t } = useTranslation("common");
    const { publish } = useAlert();
    const { data: charges = [] } = useListChargesQuery({});
    const [createAllocation, { isLoading: isCreating }] = useCreatePaymentAllocationMutation();
    const [updateAllocation, { isLoading: isUpdating }] = useUpdatePaymentAllocationMutation();

    const isEdit = !!initialData;
    const isLoading = isCreating || isUpdating;

    const initialValues: PaymentAllocationCreate = useMemo(
        () => ({
            chargeId: (initialData?.chargeId || 0) as number,
            amountAllocated: initialData ? parseFloat(initialData.amountAllocated).toFixed(2) : "",
        }),
        [initialData],
    );

    const handleSubmit = useCallback(
        async (values: PaymentAllocationCreate | PaymentAllocationUpdate, onClose: () => void) => {
            try {
                if (isEdit && initialData) {
                    await updateAllocation({
                        paymentId: initialData.paymentId,
                        chargeId: initialData.chargeId,
                        data: { amountAllocated: values.amountAllocated },
                    }).unwrap();
                    publish(t("admin.allocationUpdateSuccess"), "success");
                } else {
                    await createAllocation({
                        paymentId,
                        data: values as PaymentAllocationCreate,
                    }).unwrap();
                    publish(t("admin.allocationCreateSuccess"), "success");
                }
                onClose();
            } catch {
                publish(t("admin.allocationCreateError"), "error");
            }
        },
        [isEdit, initialData, paymentId, createAllocation, updateAllocation, publish, t],
    );

    const availableCharges = useMemo(
        () => charges.filter((charge) => charge.status !== CHARGE_STATUS.CANCELLED),
        [charges],
    );

    return {
        isEdit,
        isLoading,
        initialValues,
        handleSubmit,
        availableCharges,
    };
};
