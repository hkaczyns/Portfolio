import { useCallback } from "react";
import { User, Mail, Shield, Check, X, Edit2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EditableField } from "../../../../components/EditableField/EditableField";
import { useUserDetails } from "../../hooks/useUserDetails";
import { UserRole, type UserResponse } from "../../../../store/auth/types";
import { getRoleLabel } from "../../../../utils/userRole";
import styles from "./UserDetailsSection.module.css";

export interface UserDetailsSectionProps {
    user: UserResponse;
    onUserUpdate?: (updatedUser: UserResponse) => void;
}

export const UserDetailsSection = ({ user, onUserUpdate }: UserDetailsSectionProps) => {
    const { t } = useTranslation("common");
    const {
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
    } = useUserDetails(user, onUserUpdate);

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

    const handleEmailChange = useCallback(
        (value: string) => {
            emailFormik.setFieldValue("email", value, true);
            emailFormik.setFieldTouched("email", true, true);
        },
        [emailFormik],
    );

    const handleEmailBlur = useCallback(() => {
        emailFormik.setFieldTouched("email", true, true);
    }, [emailFormik]);

    const handleEditFirstName = useCallback(() => {
        handleEditField("firstName");
    }, [handleEditField]);

    const handleEditLastName = useCallback(() => {
        handleEditField("lastName");
    }, [handleEditField]);

    const handleEditEmail = useCallback(() => {
        handleEditField("email");
    }, [handleEditField]);

    const handleEditRole = useCallback(() => {
        handleEditField("role");
    }, [handleEditField]);

    const handleRoleChange = useCallback(
        (value: string) => {
            roleFormik.setFieldValue("role", value as UserRole, true);
            roleFormik.setFieldTouched("role", true, true);
        },
        [roleFormik],
    );

    const handleRoleBlur = useCallback(() => {
        roleFormik.setFieldTouched("role", true, true);
    }, [roleFormik]);

    return (
        <div className={styles.section}>
            <h2 className={styles.title}>Dane użytkownika</h2>
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
                <EditableField
                    label={t("email")}
                    value={emailFormik.values.email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    error={emailFormik.errors.email}
                    touched={Boolean(emailFormik.touched.email)}
                    icon={<Mail />}
                    isEditing={editingField === "email"}
                    onEdit={handleEditEmail}
                    onSave={handleSaveField}
                    onCancel={handleCancelEdit}
                    canSave={canSaveEmail}
                    isLoading={isLoading}
                />
                <div className={styles.fieldContainer}>
                    <label className={styles.label}>{t("admin.role")}</label>
                    <div className={styles.inputWrapper}>
                        <div
                            className={`${styles.inputContainer} ${editingField === "role" ? styles.inputContainerEditing : ""}`}
                        >
                            <div className={styles.icon}>
                                <Shield />
                            </div>
                            {editingField === "role" ? (
                                <>
                                    <select
                                        className={styles.select}
                                        value={roleFormik.values.role}
                                        onChange={(e) => handleRoleChange(e.target.value)}
                                        onBlur={handleRoleBlur}
                                    >
                                        <option value={UserRole.STUDENT}>{t("roles.student")}</option>
                                        <option value={UserRole.INSTRUCTOR}>{t("roles.instructor")}</option>
                                        <option value={UserRole.ADMIN}>{t("roles.admin")}</option>
                                    </select>
                                    <div className={styles.actionButtons}>
                                        <button
                                            className={styles.actionButton}
                                            onClick={handleSaveField}
                                            disabled={!canSaveRole || isLoading}
                                            type="button"
                                        >
                                            <Check size={20} />
                                        </button>
                                        <button
                                            className={styles.actionButton}
                                            onClick={handleCancelEdit}
                                            disabled={isLoading}
                                            type="button"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={getRoleLabel(roleFormik.values.role, t)}
                                        readOnly
                                        disabled
                                    />
                                    <button className={styles.editButton} onClick={handleEditRole} type="button">
                                        <Edit2 size={20} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
