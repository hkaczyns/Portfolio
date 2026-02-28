import {
    useCreateSemesterMutation,
    useUpdateSemesterMutation,
    useDeleteSemesterMutation,
    type SemesterRead,
    type SemesterCreate,
    type SemesterUpdate,
} from "../api";
import { useAlert } from "../../../components/Alert/AlertContext";
import { useTranslation } from "react-i18next";
import { handleError } from "../../helpers";

export const useSemester = () => {
    const [createSemesterMutation, { isLoading: isCreating }] = useCreateSemesterMutation();
    const [updateSemesterMutation, { isLoading: isUpdating }] = useUpdateSemesterMutation();
    const [deleteSemesterMutation, { isLoading: isDeleting }] = useDeleteSemesterMutation();
    const { publish } = useAlert();
    const { t } = useTranslation("common");
    const { t: tErrors } = useTranslation("errors", { keyPrefix: "common" });

    const createSemester = async (data: SemesterCreate): Promise<SemesterRead | undefined> => {
        const result = await createSemesterMutation(data);

        if (result.error) {
            handleError(result.error, publish, tErrors, "UNKNOWN_ERROR", tErrors);
            return undefined;
        }

        publish(t("admin.semesterCreateSuccess"), "success");
        return result.data;
    };

    const updateSemester = async (semesterId: number, data: SemesterUpdate): Promise<SemesterRead | undefined> => {
        const result = await updateSemesterMutation({ semesterId, data });

        if (result.error) {
            handleError(result.error, publish, tErrors, "UNKNOWN_ERROR", tErrors);
            return undefined;
        }

        publish(t("admin.semesterUpdateSuccess"), "success");
        return result.data;
    };

    const deleteSemester = async (semesterId: number): Promise<boolean> => {
        const result = await deleteSemesterMutation(semesterId);

        if (result.error) {
            handleError(result.error, publish, tErrors, "UNKNOWN_ERROR", tErrors);
            return false;
        }

        publish(t("admin.semesterDeleteSuccess"), "success");
        return true;
    };

    return {
        createSemester,
        updateSemester,
        deleteSemester,
        isCreating,
        isUpdating,
        isDeleting,
    };
};
