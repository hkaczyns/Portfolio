import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAlert } from "../../../components/Alert/AlertContext";
import { useForgotPassword } from "../../../store/auth/api/useForgotPassword";

export const useForgotPasswordPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation("common");
    const { forgotPassword, isLoading, isSuccess } = useForgotPassword();
    const { publish } = useAlert();

    const navigateToLogin = useCallback(() => {
        navigate("/login");
    }, [navigate]);

    useEffect(() => {
        if (isSuccess) {
            publish(t("forgotPassword.successMessage"), "success");
            navigateToLogin();
        }
    }, [isSuccess, publish, navigateToLogin, t]);

    const handleSubmit = useCallback(
        (email: string) => {
            forgotPassword({ email });
        },
        [forgotPassword],
    );

    return {
        isLoading,
        navigateToLogin,
        handleSubmit,
    };
};
