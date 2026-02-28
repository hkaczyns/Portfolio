import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { ClassSessionRead, ClassSessionCreate } from "../../../../../../store/admin/api";
import { CLASS_SESSION_STATUS } from "../../../../../../constants/constants";

const getDateValue = (dateString: string | undefined): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
};

export const useClassSessionModal = (initialData?: ClassSessionRead) => {
    useTranslation("common");

    const isEdit = !!initialData;

    const initialValues: ClassSessionCreate = useMemo(
        () => ({
            classGroupId: initialData?.classGroupId || 0,
            date: getDateValue(initialData?.date),
            startTime: initialData?.startTime || "",
            endTime: initialData?.endTime || "",
            roomId: initialData?.roomId || null,
            instructorId: initialData?.instructorId || null,
            notes: initialData?.notes || null,
            status: initialData?.status || CLASS_SESSION_STATUS.SCHEDULED,
        }),
        [initialData],
    );

    const handleSubmit = useCallback(
        async (values: ClassSessionCreate, onSubmit: (data: ClassSessionCreate) => Promise<void>) => {
            await onSubmit(values);
        },
        [],
    );

    return {
        isEdit,
        initialValues,
        handleSubmit,
    };
};
