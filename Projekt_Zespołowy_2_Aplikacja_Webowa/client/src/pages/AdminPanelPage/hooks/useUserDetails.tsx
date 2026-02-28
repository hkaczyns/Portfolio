import { useFormik } from "formik";
import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { useUpdateUserMutation } from "../../../store/admin/api";
import { useAlert } from "../../../components/Alert/AlertContext";
import { firstNameSchema, lastNameSchema } from "../../AccountPage/helpers";
import { EMAIL_REGEX, SPACE_REGEX } from "../../../constants/constants";
import { UserRole, type UserResponse } from "../../../store/auth/types";

export const useUserDetails = (user: UserResponse | undefined, onUserUpdate?: (updatedUser: UserResponse) => void) => {
    const { t } = useTranslation("common");
    const [updateUser, { isLoading }] = useUpdateUserMutation();
    const { publish } = useAlert();
    const [editingField, setEditingField] = useState<"firstName" | "lastName" | "email" | "role" | null>(null);

    const firstNameInitialValue = user?.firstName || "";
    const lastNameInitialValue = user?.lastName || "";
    const emailInitialValue = user?.email || "";
    const roleInitialValue = user?.role || UserRole.STUDENT;

    const firstNameFormik = useFormik<{ firstName: string }>({
        initialValues: { firstName: firstNameInitialValue },
        validationSchema: firstNameSchema,
        validateOnChange: true,
        validateOnBlur: true,
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (!user) return;
            if (values.firstName === user.firstName) {
                setEditingField(null);
                firstNameFormik.resetForm();
                return;
            }

            try {
                const updatedUser = await updateUser({ userId: user.id, firstName: values.firstName }).unwrap();
                publish(t("admin.userUpdateSuccess"), "success");
                setEditingField(null);
                if (updatedUser && onUserUpdate) {
                    onUserUpdate(updatedUser);
                }
            } catch {
                publish(t("admin.userUpdateError"), "error");
            }
        },
    });

    const lastNameFormik = useFormik<{ lastName: string }>({
        initialValues: { lastName: lastNameInitialValue },
        validationSchema: lastNameSchema,
        validateOnChange: true,
        validateOnBlur: true,
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (!user) return;
            if (values.lastName === user.lastName) {
                setEditingField(null);
                lastNameFormik.resetForm();
                return;
            }

            try {
                const updatedUser = await updateUser({ userId: user.id, lastName: values.lastName }).unwrap();
                publish(t("admin.userUpdateSuccess"), "success");
                setEditingField(null);
                if (updatedUser && onUserUpdate) {
                    onUserUpdate(updatedUser);
                }
            } catch {
                publish(t("admin.userUpdateError"), "error");
            }
        },
    });

    const emailSchema = useMemo(
        () =>
            Yup.object({
                email: Yup.string()
                    .required("email.required")
                    .matches(EMAIL_REGEX, "email.invalid")
                    .min(6, "email.minLength")
                    .max(254, "email.maxLength")
                    .matches(SPACE_REGEX, "email.noSpaces")
                    .notOneOf([user?.email || ""], "email.same"),
            }),
        [user?.email],
    );

    const emailFormik = useFormik<{ email: string }>({
        initialValues: { email: emailInitialValue },
        validationSchema: emailSchema,
        validateOnChange: true,
        validateOnBlur: true,
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (!user) return;
            if (values.email === user.email) {
                setEditingField(null);
                emailFormik.resetForm();
                return;
            }

            try {
                const updatedUser = await updateUser({ userId: user.id, email: values.email }).unwrap();
                publish(t("admin.userUpdateSuccess"), "success");
                setEditingField(null);
                if (updatedUser && onUserUpdate) {
                    onUserUpdate(updatedUser);
                }
            } catch {
                publish(t("admin.userUpdateError"), "error");
            }
        },
    });

    const roleFormik = useFormik<{ role: UserRole }>({
        initialValues: { role: roleInitialValue },
        validateOnChange: true,
        validateOnBlur: true,
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (!user) return;
            if (values.role === user.role) {
                setEditingField(null);
                roleFormik.resetForm();
                return;
            }

            try {
                const updatedUser = await updateUser({ userId: user.id, role: values.role }).unwrap();
                publish(t("admin.userUpdateSuccess"), "success");
                setEditingField(null);
                if (updatedUser && onUserUpdate) {
                    onUserUpdate(updatedUser);
                }
            } catch {
                publish(t("admin.userUpdateError"), "error");
            }
        },
    });

    const handleEditField = useCallback((field: "firstName" | "lastName" | "email" | "role") => {
        setEditingField(field);
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingField(null);
        firstNameFormik.resetForm();
        lastNameFormik.resetForm();
        emailFormik.resetForm();
        roleFormik.resetForm();
    }, [firstNameFormik, lastNameFormik, emailFormik, roleFormik]);

    const handleSaveField = useCallback(async () => {
        if (editingField === "firstName") {
            await firstNameFormik.submitForm();
        } else if (editingField === "lastName") {
            await lastNameFormik.submitForm();
        } else if (editingField === "email") {
            await emailFormik.submitForm();
        } else if (editingField === "role") {
            await roleFormik.submitForm();
        }
    }, [editingField, firstNameFormik, lastNameFormik, emailFormik, roleFormik]);

    const canSaveFirstName = editingField === "firstName" && firstNameFormik.isValid && firstNameFormik.dirty;
    const canSaveLastName = editingField === "lastName" && lastNameFormik.isValid && lastNameFormik.dirty;
    const canSaveEmail = editingField === "email" && emailFormik.isValid && emailFormik.dirty;
    const canSaveRole = editingField === "role" && roleFormik.isValid && roleFormik.dirty;

    return {
        firstNameFormik,
        lastNameFormik,
        emailFormik,
        roleFormik,
        editingField,
        handleEditField,
        handleCancelEdit,
        handleSaveField,
        canSaveFirstName,
        canSaveLastName,
        canSaveEmail,
        canSaveRole,
        isLoading,
    };
};
