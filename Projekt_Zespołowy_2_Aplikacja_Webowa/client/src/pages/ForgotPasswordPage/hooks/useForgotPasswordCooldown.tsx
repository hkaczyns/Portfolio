import { useAppSelector } from "../../../store/store";
import { selectForgotPasswordRequestedAt } from "../../../store/auth/selectors";
import { useCooldown } from "../../../hooks/useCooldown";
import { FORGOT_PASSWORD_COOLDOWN_SECONDS } from "../../../constants/constants";

export const useForgotPasswordCooldown = () => {
    const requestedAt = useAppSelector(selectForgotPasswordRequestedAt);
    return useCooldown({ cooldownSeconds: FORGOT_PASSWORD_COOLDOWN_SECONDS, requestedAt });
};
