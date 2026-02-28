import { useUpdateUserMutation } from "../api";
import { useAlert } from "../../../components/Alert/AlertContext";
import { useTranslation } from "react-i18next";
import { handleError } from "../../helpers";
import type { UserResponse } from "../types";

export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    currentPassword?: string;
}

export const useUpdateUser = () => {
    const [updateUserMutation, { isLoading, isSuccess, isError }] = useUpdateUserMutation();
    const { publish } = useAlert();
    const { t } = useTranslation("errors", { keyPrefix: "common" });

    const updateUser = async (data: UpdateUserRequest): Promise<UserResponse | undefined> => {
        const result = await updateUserMutation(data);

        if (result.error) {
            handleError(result.error, publish, t, "UNKNOWN_ERROR", t);
            return undefined;
        }

        return result.data;
    };

    return {
        updateUser,
        isLoading,
        isSuccess,
        isError,
    };
};
