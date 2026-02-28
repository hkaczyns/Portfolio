import {
    useCreateRoomMutation,
    useUpdateRoomMutation,
    useDeleteRoomMutation,
    type RoomRead,
    type RoomCreate,
    type RoomUpdate,
} from "../api";
import { useAlert } from "../../../components/Alert/AlertContext";
import { useTranslation } from "react-i18next";
import { handleError } from "../../helpers";

export const useRoom = () => {
    const [createRoomMutation, { isLoading: isCreating }] = useCreateRoomMutation();
    const [updateRoomMutation, { isLoading: isUpdating }] = useUpdateRoomMutation();
    const [deleteRoomMutation, { isLoading: isDeleting }] = useDeleteRoomMutation();
    const { publish } = useAlert();
    const { t } = useTranslation("common");
    const { t: tErrors } = useTranslation("errors", { keyPrefix: "common" });

    const createRoom = async (data: RoomCreate): Promise<RoomRead | undefined> => {
        const result = await createRoomMutation(data);

        if (result.error) {
            handleError(result.error, publish, tErrors, "UNKNOWN_ERROR", tErrors);
            return undefined;
        }

        publish(t("admin.roomCreateSuccess"), "success");
        return result.data;
    };

    const updateRoom = async (roomId: number, data: RoomUpdate): Promise<RoomRead | undefined> => {
        const result = await updateRoomMutation({ roomId, data });

        if (result.error) {
            handleError(result.error, publish, tErrors, "UNKNOWN_ERROR", tErrors);
            return undefined;
        }

        publish(t("admin.roomUpdateSuccess"), "success");
        return result.data;
    };

    const deleteRoom = async (roomId: number): Promise<boolean> => {
        const result = await deleteRoomMutation(roomId);

        if (result.error) {
            handleError(result.error, publish, tErrors, "UNKNOWN_ERROR", tErrors);
            return false;
        }

        publish(t("admin.roomDeleteSuccess"), "success");
        return true;
    };

    return {
        createRoom,
        updateRoom,
        deleteRoom,
        isCreating,
        isUpdating,
        isDeleting,
    };
};
