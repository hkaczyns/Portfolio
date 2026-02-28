export enum UserRole {
    STUDENT = "student",
    INSTRUCTOR = "instructor",
    ADMIN = "admin",
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface UserResponse {
    id: string;
    email: string;
    isActive: boolean;
    isSuperuser: boolean;
    isVerified: boolean;
    firstName: string;
    lastName: string;
    role: UserRole;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
}

export interface FirstNameFormValues {
    firstName: string;
}

export interface LastNameFormValues {
    lastName: string;
}

export interface ChangeEmailFormValues {
    email: string;
    currentPassword: string;
}

export interface ChangePasswordFormValues {
    currentPassword: string;
    password: string;
    confirmPassword: string;
}
