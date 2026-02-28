import { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAlert } from "../../../components/Alert/AlertContext";
import { useResetPassword } from "../../../store/auth/api/useResetPassword";

export const useResetPasswordPage = () => {
    const { resetToken } = useParams<{ resetToken: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation("common");
    const { resetPassword, isLoading, isSuccess } = useResetPassword();
    const { publish } = useAlert();

    const navigateToLogin = useCallback(() => {
        navigate("/login");
    }, [navigate]);

    useEffect(() => {
        if (!resetToken) {
            publish(t("resetPassword.invalidToken"), "error");
            navigateToLogin();
        }
    }, [resetToken, publish, navigateToLogin, t]);

    useEffect(() => {
        if (isSuccess) {
            publish(t("resetPassword.successMessage"), "success");
            navigateToLogin();
        }
    }, [isSuccess, publish, navigateToLogin, t]);

    const handleSubmit = useCallback(
        (password: string) => {
            if (resetToken) {
                resetPassword({ token: resetToken, password });
            }
        },
        [resetToken, resetPassword],
    );

    return {
        resetToken,
        isLoading,
        navigateToLogin,
        handleSubmit,
    };
};
