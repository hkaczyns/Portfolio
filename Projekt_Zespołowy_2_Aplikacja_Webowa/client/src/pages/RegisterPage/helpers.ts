import type { FormikErrors } from "formik";
import type { RegisterFormValues } from "./RegisterPage";

export const isFormButtonDisabled = (
    isLoading: boolean,
    values: RegisterFormValues,
    errors: FormikErrors<RegisterFormValues>,
) => {
    const hasErrors =
        !!errors.email || !!errors.password || !!errors.firstName || !!errors.lastName || !!errors.confirmPassword;
    const hasEmptyFields =
        !values.email.length ||
        !values.password.length ||
        !values.firstName.length ||
        !values.lastName.length ||
        !values.confirmPassword.length;

    return isLoading || hasEmptyFields || hasErrors;
};
