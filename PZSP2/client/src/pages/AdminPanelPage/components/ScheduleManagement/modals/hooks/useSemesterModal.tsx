import { useMemo, useCallback } from "react";
import type { SemesterRead, SemesterCreate } from "../../../../../../store/admin/api";

const getDateValue = (dateString: string | undefined): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
};

export const useSemesterModal = (initialData?: SemesterRead) => {
    const isEdit = !!initialData;

    const initialValues = useMemo(
        () => ({
            name: initialData?.name || "",
            startDate: getDateValue(initialData?.startDate),
            endDate: getDateValue(initialData?.endDate),
            isActive: initialData?.isActive ?? true,
        }),
        [initialData],
    );

    const handleSubmit = useCallback(
        async (values: typeof initialValues, onSubmit: (data: SemesterCreate) => Promise<void>) => {
            const semesterData: SemesterCreate = {
                name: values.name,
                startDate: values.startDate,
                endDate: values.endDate,
                isActive: values.isActive,
            };
            await onSubmit(semesterData);
        },
        [],
    );

    return {
        isEdit,
        initialValues,
        handleSubmit,
    };
};
