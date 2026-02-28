import { useCallback } from "react";
import { User, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EditableField } from "../../../../components/EditableField/EditableField";
import { useAccountDetails } from "../../hooks/useAccountDetails";
import type { UserResponse } from "../../../../store/auth/types";
import styles from "./AccountDetailsSection.module.css";

export interface AccountDetailsSectionProps {
    user: UserResponse;
}

export const AccountDetailsSection = ({ user }: AccountDetailsSectionProps) => {
    const { t } = useTranslation("common");
    const {
        firstNameFormik,
        lastNameFormik,
        editingField,
        handleEditField,
        handleCancelEdit,
        handleSaveField,
        canSaveFirstName,
        canSaveLastName,
        isLoading,
    } = useAccountDetails(user);

    const handleFirstNameChange = useCallback(
        (value: string) => {
            firstNameFormik.setFieldValue("firstName", value, true);
            firstNameFormik.setFieldTouched("firstName", true, true);
        },
        [firstNameFormik],
    );

    const handleFirstNameBlur = useCallback(() => {
        firstNameFormik.setFieldTouched("firstName", true, true);
    }, [firstNameFormik]);

    const handleLastNameChange = useCallback(
        (value: string) => {
            lastNameFormik.setFieldValue("lastName", value, true);
            lastNameFormik.setFieldTouched("lastName", true, true);
        },
        [lastNameFormik],
    );

    const handleLastNameBlur = useCallback(() => {
        lastNameFormik.setFieldTouched("lastName", true, true);
    }, [lastNameFormik]);

    const handleEditFirstName = useCallback(() => {
        handleEditField("firstName");
    }, [handleEditField]);

    const handleEditLastName = useCallback(() => {
        handleEditField("lastName");
    }, [handleEditField]);

    return (
        <div className={styles.section}>
            <h2 className={styles.title}>{t("account.title")}</h2>
            <div className={styles.fields}>
                <EditableField
                    label={t("firstName")}
                    value={firstNameFormik.values.firstName}
                    onChange={handleFirstNameChange}
                    onBlur={handleFirstNameBlur}
                    error={firstNameFormik.errors.firstName}
                    touched={Boolean(firstNameFormik.touched.firstName)}
                    icon={<User />}
                    isEditing={editingField === "firstName"}
                    onEdit={handleEditFirstName}
                    onSave={handleSaveField}
                    onCancel={handleCancelEdit}
                    canSave={canSaveFirstName}
                    isLoading={isLoading}
                />
                <EditableField
                    label={t("lastName")}
                    value={lastNameFormik.values.lastName}
                    onChange={handleLastNameChange}
                    onBlur={handleLastNameBlur}
                    error={lastNameFormik.errors.lastName}
                    touched={Boolean(lastNameFormik.touched.lastName)}
                    icon={<User />}
                    isEditing={editingField === "lastName"}
                    onEdit={handleEditLastName}
                    onSave={handleSaveField}
                    onCancel={handleCancelEdit}
                    canSave={canSaveLastName}
                    isLoading={isLoading}
                />
                <div className={styles.fieldContainer}>
                    <label className={styles.label}>{t("email")}</label>
                    <div className={styles.inputWrapper}>
                        <div className={styles.inputContainer}>
                            <div className={styles.icon}>
                                <Mail />
                            </div>
                            <input className={styles.input} type="text" value={user.email} readOnly disabled />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
