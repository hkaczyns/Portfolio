import type { ForgotPasswordRequest } from "../../store/auth/types";

export const isFormButtonDisabled = (
    isLoading: boolean,
    values: ForgotPasswordRequest,
    errors: Partial<Record<keyof ForgotPasswordRequest, string>>,
) => {
    return isLoading || !values.email || !!errors.email;
};
