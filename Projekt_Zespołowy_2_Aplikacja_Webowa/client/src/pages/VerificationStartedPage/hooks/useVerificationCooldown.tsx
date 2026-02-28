import { useAppSelector } from "../../../store/store";
import { selectResendVerificationEmailCooldownRequestedAt } from "../../../store/auth/selectors";
import { useCooldown } from "../../../hooks/useCooldown";
import { RESEND_VERIFICATION_COOLDOWN_SECONDS } from "../../../constants/constants";

export const useVerificationCooldown = () => {
    const requestedAt = useAppSelector(selectResendVerificationEmailCooldownRequestedAt);
    return useCooldown({ cooldownSeconds: RESEND_VERIFICATION_COOLDOWN_SECONDS, requestedAt });
};
