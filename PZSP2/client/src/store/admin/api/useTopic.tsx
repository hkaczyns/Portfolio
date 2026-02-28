import {
    useCreateTopicMutation,
    useUpdateTopicMutation,
    useDeleteTopicMutation,
    type TopicRead,
    type TopicCreate,
    type TopicUpdate,
} from "../api";
import { useAlert } from "../../../components/Alert/AlertContext";
import { useTranslation } from "react-i18next";
import { handleError } from "../../helpers";

export const useTopic = () => {
    const [createTopicMutation, { isLoading: isCreating }] = useCreateTopicMutation();
    const [updateTopicMutation, { isLoading: isUpdating }] = useUpdateTopicMutation();
    const [deleteTopicMutation, { isLoading: isDeleting }] = useDeleteTopicMutation();
    const { publish } = useAlert();
    const { t } = useTranslation("common");
    const { t: tErrors } = useTranslation("errors", { keyPrefix: "common" });

    const createTopic = async (data: TopicCreate): Promise<TopicRead | undefined> => {
        const result = await createTopicMutation(data);

        if (result.error) {
            handleError(result.error, publish, tErrors, "UNKNOWN_ERROR", tErrors);
            return undefined;
        }

        publish(t("admin.topicCreateSuccess"), "success");
        return result.data;
    };

    const updateTopic = async (topicId: number, data: TopicUpdate): Promise<TopicRead | undefined> => {
        const result = await updateTopicMutation({ topicId, data });

        if (result.error) {
            handleError(result.error, publish, tErrors, "UNKNOWN_ERROR", tErrors);
            return undefined;
        }

        publish(t("admin.topicUpdateSuccess"), "success");
        return result.data;
    };

    const deleteTopic = async (topicId: number): Promise<boolean> => {
        const result = await deleteTopicMutation(topicId);

        if (result.error) {
            handleError(result.error, publish, tErrors, "UNKNOWN_ERROR", tErrors);
            return false;
        }

        publish(t("admin.topicDeleteSuccess"), "success");
        return true;
    };

    return {
        createTopic,
        updateTopic,
        deleteTopic,
        isCreating,
        isUpdating,
        isDeleting,
    };
};
