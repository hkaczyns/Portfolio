import { useFormik } from "formik";
import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useUpdateUser } from "../../../store/auth/api/useUpdateUser";
import { useAlert } from "../../../components/Alert/AlertContext";
import { firstNameSchema, lastNameSchema } from "../helpers";
import type { FirstNameFormValues, LastNameFormValues, UserResponse } from "../../../store/auth/types";

export const useAccountDetails = (user: UserResponse | undefined) => {
    const { t } = useTranslation("common");
    const { updateUser, isLoading } = useUpdateUser();
    const { publish } = useAlert();
    const [editingField, setEditingField] = useState<"firstName" | "lastName" | null>(null);

    const firstNameInitialValue = useMemo(() => user?.firstName || "", [user?.firstName]);
    const lastNameInitialValue = useMemo(() => user?.lastName || "", [user?.lastName]);

    const firstNameFormik = useFormik<FirstNameFormValues>({
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

            const result = await updateUser({ firstName: values.firstName });
            if (result) {
                publish(t("account.updateSuccess"), "success");
                setEditingField(null);
            }
        },
    });

    const lastNameFormik = useFormik<LastNameFormValues>({
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

            const result = await updateUser({ lastName: values.lastName });
            if (result) {
                publish(t("account.updateSuccess"), "success");
                setEditingField(null);
            }
        },
    });

    const handleEditField = useCallback((field: "firstName" | "lastName") => {
        setEditingField(field);
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingField(null);
        firstNameFormik.resetForm();
        lastNameFormik.resetForm();
    }, [firstNameFormik, lastNameFormik]);

    const handleSaveField = useCallback(async () => {
        if (editingField === "firstName") {
            await firstNameFormik.submitForm();
        } else if (editingField === "lastName") {
            await lastNameFormik.submitForm();
        }
    }, [editingField, firstNameFormik, lastNameFormik]);

    const canSaveFirstName = useMemo(
        () => editingField === "firstName" && firstNameFormik.isValid && firstNameFormik.dirty,
        [editingField, firstNameFormik.isValid, firstNameFormik.dirty],
    );
    const canSaveLastName = useMemo(
        () => editingField === "lastName" && lastNameFormik.isValid && lastNameFormik.dirty,
        [editingField, lastNameFormik.isValid, lastNameFormik.dirty],
    );

    return {
        firstNameFormik,
        lastNameFormik,
        editingField,
        handleEditField,
        handleCancelEdit,
        handleSaveField,
        canSaveFirstName,
        canSaveLastName,
        isLoading,
    };
};
