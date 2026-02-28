import type { FormikErrors } from "formik";
import type { LoginRequest } from "../../store/auth/types";

export const isFormButtonDisabled = (isLoading: boolean, values: LoginRequest, errors: FormikErrors<LoginRequest>) => {
    const hasErrors = !!errors.username || !!errors.password;
    const hasEmptyFields = !values.username.length || !values.password.length;

    return isLoading || hasEmptyFields || hasErrors;
};
