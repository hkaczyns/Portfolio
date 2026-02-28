import { useVerifyUserMutation } from "../api";
import { useTranslation } from "react-i18next";
import { useAlert } from "../../../components/Alert/AlertContext";
import { handleError } from "../../helpers";

export const useVerifyUser = () => {
    const [verifyUserMutation, { isLoading, isSuccess, isError }] = useVerifyUserMutation();
    const { t } = useTranslation("errors", { keyPrefix: "auth" });
    const { publish } = useAlert();

    const verifyUser = async (verificationToken?: string) => {
        if (!verificationToken) {
            publish(t("VERIFICATION_TOKEN_NOT_PROVIDED"), "error");
            return;
        }

        const result = await verifyUserMutation({ token: verificationToken });

        if (result.error) {
            handleError(result.error, publish, t, "VERIFICATION_TOKEN_INVALID");
        }
    };

    return { verifyUser, isLoading, isSuccess, isError };
};
