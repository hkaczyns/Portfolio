import { useLazyGetUserQuery, useLoginMutation } from "../api";
import type { LoginRequest } from "../types";
import { useAlert } from "../../../components/Alert/AlertContext";
import { useTranslation } from "react-i18next";
import { handleError } from "../../helpers";

export const useLogin = () => {
    const [loginMutation, { isLoading: isLoginLoading, isSuccess: isLoginSuccess, isError: isLoginError }] =
        useLoginMutation();
    const [userQuery, { isLoading: isUserLoading, isSuccess: isUserSuccess, isError: isUserError }] =
        useLazyGetUserQuery();
    const { publish } = useAlert();
    const { t } = useTranslation("errors", { keyPrefix: "auth" });
    const { t: tCommon } = useTranslation("errors", { keyPrefix: "common" });

    const login = async (values: LoginRequest) => {
        const loginResult = await loginMutation(values);

        if (loginResult.error) {
            handleError(loginResult.error, publish, t);
            return;
        }

        const userResult = await userQuery();
        if (userResult.error) {
            handleError(userResult.error, publish, tCommon, "UNKNOWN_ERROR", tCommon);
        }
    };

    return {
        login,
        isLoading: isLoginLoading || isUserLoading,
        isSuccess: isLoginSuccess && isUserSuccess,
        isError: isLoginError || isUserError,
    };
};
