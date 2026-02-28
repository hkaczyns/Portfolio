import * as Yup from "yup";
import type { FormikErrors } from "formik";
import {
    EMAIL_REGEX,
    LOWERCASE_LETTER_REGEX,
    NUMBER_REGEX,
    SPACE_REGEX,
    UPPERCASE_LETTER_REGEX,
} from "../../constants/constants";
import type { ChangePasswordFormValues, ChangeEmailFormValues } from "../../store/auth/types";

export const firstNameSchema = Yup.object({
    firstName: Yup.string()
        .required("firstName.required")
        .min(2, "firstName.minLength")
        .max(64, "firstName.maxLength")
        .matches(SPACE_REGEX, "firstName.noSpaces"),
});

export const lastNameSchema = Yup.object({
    lastName: Yup.string()
        .required("lastName.required")
        .min(2, "lastName.minLength")
        .max(128, "lastName.maxLength")
        .matches(SPACE_REGEX, "lastName.noSpaces"),
});

export const changePasswordSchema = Yup.object({
    currentPassword: Yup.string().required("password.required"),
    password: Yup.string()
        .required("password.required")
        .min(8, "password.minLength")
        .max(128, "password.maxLength")
        .matches(LOWERCASE_LETTER_REGEX, "password.lowercase")
        .matches(UPPERCASE_LETTER_REGEX, "password.uppercase")
        .matches(NUMBER_REGEX, "password.number")
        .matches(SPACE_REGEX, "password.noSpaces"),
    confirmPassword: Yup.string()
        .required("confirmPassword.required")
        .oneOf([Yup.ref("password")], "confirmPassword.mismatch"),
});

export const changeEmailSchema = (currentEmail: string) =>
    Yup.object({
        email: Yup.string()
            .required("email.required")
            .matches(EMAIL_REGEX, "email.invalid")
            .min(6, "email.minLength")
            .max(254, "email.maxLength")
            .matches(SPACE_REGEX, "email.noSpaces")
            .notOneOf([currentEmail], "email.same"),
        currentPassword: Yup.string().required("password.required"),
    });

export const isChangePasswordFormButtonDisabled = (
    isLoading: boolean,
    values: ChangePasswordFormValues,
    errors: FormikErrors<ChangePasswordFormValues>,
) => {
    const hasErrors = !!errors.currentPassword || !!errors.password || !!errors.confirmPassword;
    const hasEmptyFields = !values.currentPassword.length || !values.password.length || !values.confirmPassword.length;
    return isLoading || hasEmptyFields || hasErrors;
};

export const isChangeEmailFormButtonDisabled = (
    isLoading: boolean,
    values: ChangeEmailFormValues,
    errors: FormikErrors<ChangeEmailFormValues>,
) => {
    const hasErrors = !!errors.email || !!errors.currentPassword;
    const hasEmptyFields = !values.email.length || !values.currentPassword.length;
    return isLoading || hasEmptyFields || hasErrors;
};
