import type { ResetPasswordFormValues } from "./ResetPasswordPage";

export const isFormButtonDisabled = (
    isLoading: boolean,
    values: ResetPasswordFormValues,
    errors: Partial<Record<keyof ResetPasswordFormValues, string>>,
) => {
    return isLoading || !values.password || !values.confirmPassword || !!errors.password || !!errors.confirmPassword;
};
