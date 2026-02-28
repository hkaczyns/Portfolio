import { UserRole } from "../store/auth/types";
import type { TFunction } from "i18next";

export const getRoleLabel = (role: UserRole | undefined, t: TFunction<"common", undefined>): string => {
    switch (role) {
        case UserRole.ADMIN:
            return t("roles.admin");
        case UserRole.INSTRUCTOR:
            return t("roles.instructor");
        case UserRole.STUDENT:
            return t("roles.student");
        default:
            return "";
    }
};
