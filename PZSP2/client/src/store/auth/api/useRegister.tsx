import { useRegisterMutation } from "../api";
import type { RegisterFormValues } from "../../../pages/RegisterPage/RegisterPage";
import { useAlert } from "../../../components/Alert/AlertContext";
import { useTranslation } from "react-i18next";
import { handleError } from "../../helpers";

export const useRegister = () => {
    const [registerMutation, { isLoading, isSuccess, isError, data }] = useRegisterMutation();
    const { publish } = useAlert();
    const { t } = useTranslation("errors", { keyPrefix: "auth" });
    const { t: tCommon } = useTranslation("errors", { keyPrefix: "common" });

    const register = async (values: RegisterFormValues) => {
        const { firstName, lastName, email, password } = values;
        const result = await registerMutation({ firstName, lastName, email, password });

        if (result.error) {
            handleError(result.error, publish, t, "UNKNOWN_ERROR", tCommon);
        }
    };

    return { register, isLoading, isSuccess, isError, user: data };
};
