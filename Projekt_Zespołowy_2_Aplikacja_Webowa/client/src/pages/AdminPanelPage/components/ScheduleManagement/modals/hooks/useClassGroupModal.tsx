import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { ClassGroupRead, ClassGroupCreate } from "../../../../../../store/admin/api";
import { CLASS_GROUP_STATUS } from "../../../../../../constants/constants";

export const useClassGroupModal = (initialData?: ClassGroupRead) => {
    const { t } = useTranslation("common");

    const isEdit = !!initialData;

    const initialValues: ClassGroupCreate = useMemo(
        () => ({
            semesterId: initialData?.semesterId || 0,
            name: initialData?.name || "",
            description: initialData?.description || null,
            levelId: initialData?.levelId || 0,
            topicId: initialData?.topicId || 0,
            roomId: initialData?.roomId || null,
            capacity: initialData?.capacity || 1,
            dayOfWeek: initialData?.dayOfWeek ?? 0,
            startTime: initialData?.startTime || "",
            endTime: initialData?.endTime || "",
            instructorId: initialData?.instructorId || null,
            isPublic: initialData?.isPublic ?? false,
            status: initialData?.status || CLASS_GROUP_STATUS.DRAFT,
        }),
        [initialData],
    );

    const daysOfWeek = useMemo(
        () => [
            t("admin.monday"),
            t("admin.tuesday"),
            t("admin.wednesday"),
            t("admin.thursday"),
            t("admin.friday"),
            t("admin.saturday"),
            t("admin.sunday"),
        ],
        [t],
    );

    const handleSubmit = useCallback(
        async (values: ClassGroupCreate, onSubmit: (data: ClassGroupCreate) => Promise<void>) => {
            const cleanedData: ClassGroupCreate = {
                ...values,
                instructorId: values.instructorId && values.instructorId.trim() !== "" ? values.instructorId : null,
                description: values.description && values.description.trim() !== "" ? values.description : null,
                roomId: values.roomId || null,
            };
            await onSubmit(cleanedData);
        },
        [],
    );

    return {
        isEdit,
        initialValues,
        daysOfWeek,
        handleSubmit,
    };
};
