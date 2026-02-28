import {
    useCreateSkillLevelMutation,
    useUpdateSkillLevelMutation,
    useDeleteSkillLevelMutation,
    type SkillLevelRead,
    type SkillLevelCreate,
    type SkillLevelUpdate,
} from "../api";
import { useAlert } from "../../../components/Alert/AlertContext";
import { useTranslation } from "react-i18next";
import { handleError } from "../../helpers";

export const useSkillLevel = () => {
    const [createSkillLevelMutation, { isLoading: isCreating }] = useCreateSkillLevelMutation();
    const [updateSkillLevelMutation, { isLoading: isUpdating }] = useUpdateSkillLevelMutation();
    const [deleteSkillLevelMutation, { isLoading: isDeleting }] = useDeleteSkillLevelMutation();
    const { publish } = useAlert();
    const { t } = useTranslation("common");
    const { t: tErrors } = useTranslation("errors", { keyPrefix: "common" });

    const createSkillLevel = async (data: SkillLevelCreate): Promise<SkillLevelRead | undefined> => {
        const result = await createSkillLevelMutation(data);

        if (result.error) {
            handleError(result.error, publish, tErrors, "UNKNOWN_ERROR", tErrors);
            return undefined;
        }

        publish(t("admin.skillLevelCreateSuccess"), "success");
        return result.data;
    };

    const updateSkillLevel = async (levelId: number, data: SkillLevelUpdate): Promise<SkillLevelRead | undefined> => {
        const result = await updateSkillLevelMutation({ levelId, data });

        if (result.error) {
            handleError(result.error, publish, tErrors, "UNKNOWN_ERROR", tErrors);
            return undefined;
        }

        publish(t("admin.skillLevelUpdateSuccess"), "success");
        return result.data;
    };

    const deleteSkillLevel = async (levelId: number): Promise<boolean> => {
        const result = await deleteSkillLevelMutation(levelId);

        if (result.error) {
            handleError(result.error, publish, tErrors, "UNKNOWN_ERROR", tErrors);
            return false;
        }

        publish(t("admin.skillLevelDeleteSuccess"), "success");
        return true;
    };

    return {
        createSkillLevel,
        updateSkillLevel,
        deleteSkillLevel,
        isCreating,
        isUpdating,
        isDeleting,
    };
};
