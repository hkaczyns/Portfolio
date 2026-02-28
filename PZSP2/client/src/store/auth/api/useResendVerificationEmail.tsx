import { useResendVerificationEmailMutation } from "../api";
import { useAlert } from "../../../components/Alert/AlertContext";
import { useTranslation } from "react-i18next";
import { handleError } from "../../helpers";

export const useResendVerificationEmail = () => {
    const [resendVerificationEmailMutation, { isLoading, isSuccess, isError }] = useResendVerificationEmailMutation();
    const { publish } = useAlert();
    const { t } = useTranslation("errors", { keyPrefix: "auth" });
    const { t: tCommon } = useTranslation("errors", { keyPrefix: "common" });

    const resendVerificationEmail = async (email: string) => {
        const result = await resendVerificationEmailMutation({ email });

        if (result.error) {
            handleError(result.error, publish, t, "UNKNOWN_ERROR", tCommon);
        }
    };

    return { resendVerificationEmail, isLoading, isSuccess, isError };
};
