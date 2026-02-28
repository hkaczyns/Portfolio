import { useResetPasswordMutation } from "../api";
import { useTranslation } from "react-i18next";
import { useAlert } from "../../../components/Alert/AlertContext";
import { handleError } from "../../helpers";
import type { ResetPasswordRequest } from "../types";

export const useResetPassword = () => {
    const [resetPasswordMutation, { isLoading, isSuccess, isError }] = useResetPasswordMutation();
    const { t } = useTranslation("errors", { keyPrefix: "auth" });
    const { publish } = useAlert();

    const resetPassword = async (values: ResetPasswordRequest) => {
        const result = await resetPasswordMutation(values);
        if (result.error) {
            handleError(result.error, publish, t, "RESET_PASSWORD_BAD_TOKEN");
        }
    };

    return { resetPassword, isLoading, isSuccess, isError };
};
