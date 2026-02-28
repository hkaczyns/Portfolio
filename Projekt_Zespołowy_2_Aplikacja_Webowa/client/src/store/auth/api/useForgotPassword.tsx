import { useForgotPasswordMutation } from "../api";
import { useTranslation } from "react-i18next";
import { useAlert } from "../../../components/Alert/AlertContext";
import { handleError } from "../../helpers";
import type { ForgotPasswordRequest } from "../types";

export const useForgotPassword = () => {
    const [forgotPasswordMutation, { isLoading, isSuccess, isError }] = useForgotPasswordMutation();
    const { t } = useTranslation("errors", { keyPrefix: "auth" });
    const { t: tCommon } = useTranslation("errors", { keyPrefix: "common" });
    const { publish } = useAlert();

    const forgotPassword = async (values: ForgotPasswordRequest) => {
        const result = await forgotPasswordMutation(values);
        if (result.error) {
            handleError(result.error, publish, t, "UNKNOWN_ERROR", tCommon);
        }
    };

    return { forgotPassword, isLoading, isSuccess, isError };
};
