import { useCallback, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAlert } from "../../../components/Alert/AlertContext";
import { useAppSelector } from "../../../store/store";
import { selectIsNotVerified } from "../../../store/auth/selectors";
import { useVerifyUser } from "../../../store/auth/api/useVerifyUser";

export const useVerificationPage = () => {
    const { verificationToken } = useParams<{ verificationToken: string }>();
    const { verifyUser, isSuccess, isError } = useVerifyUser();
    const navigate = useNavigate();
    const { publish } = useAlert();
    const { t } = useTranslation("common", { keyPrefix: "verification" });

    const isNotVerified = useAppSelector(selectIsNotVerified);

    const navigateToLogin = useCallback(() => {
        navigate("/login");
    }, [navigate]);

    const verificationSent = useRef<boolean>(false);

    useEffect(() => {
        if (!isNotVerified) {
            navigateToLogin();
            return;
        }

        if (verificationSent.current) return;

        verifyUser(verificationToken);
        verificationSent.current = true;
    }, [verificationToken, verifyUser, isNotVerified, navigateToLogin]);

    useEffect(() => {
        if (isSuccess) {
            publish(t("verificationSuccess"), "success");
            navigateToLogin();
        }
    }, [isSuccess, publish, navigateToLogin, t]);

    useEffect(() => {
        if (isError) {
            navigateToLogin();
        }
    }, [isError, navigateToLogin]);

    return {
        isSuccess,
        isError,
    };
};
