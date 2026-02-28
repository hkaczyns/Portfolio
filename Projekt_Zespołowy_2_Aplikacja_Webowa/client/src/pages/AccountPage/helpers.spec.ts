import { isChangePasswordFormButtonDisabled, isChangeEmailFormButtonDisabled } from "./helpers";
import type { ChangePasswordFormValues, ChangeEmailFormValues } from "../../store/auth/types";

describe("isChangePasswordFormButtonDisabled", () => {
    it("should return true when isLoading is true", () => {
        const values: ChangePasswordFormValues = {
            currentPassword: "Password123",
            password: "NewPassword123",
            confirmPassword: "NewPassword123",
        };
        const errors = {};

        expect(isChangePasswordFormButtonDisabled(true, values, errors)).toBe(true);
    });

    it("should return true when there are errors", () => {
        const values: ChangePasswordFormValues = {
            currentPassword: "Password123",
            password: "NewPassword123",
            confirmPassword: "NewPassword123",
        };
        const errors = {
            password: "password.required",
        };

        expect(isChangePasswordFormButtonDisabled(false, values, errors)).toBe(true);
    });

    it("should return true when fields are empty", () => {
        const values: ChangePasswordFormValues = {
            currentPassword: "",
            password: "",
            confirmPassword: "",
        };
        const errors = {};

        expect(isChangePasswordFormButtonDisabled(false, values, errors)).toBe(true);
    });

    it("should return false when form is valid and not loading", () => {
        const values: ChangePasswordFormValues = {
            currentPassword: "Password123",
            password: "NewPassword123",
            confirmPassword: "NewPassword123",
        };
        const errors = {};

        expect(isChangePasswordFormButtonDisabled(false, values, errors)).toBe(false);
    });
});

describe("isChangeEmailFormButtonDisabled", () => {
    it("should return true when isLoading is true", () => {
        const values: ChangeEmailFormValues = {
            email: "new@example.com",
            currentPassword: "Password123",
        };
        const errors = {};

        expect(isChangeEmailFormButtonDisabled(true, values, errors)).toBe(true);
    });

    it("should return true when there are errors", () => {
        const values: ChangeEmailFormValues = {
            email: "new@example.com",
            currentPassword: "Password123",
        };
        const errors = {
            email: "email.invalid",
        };

        expect(isChangeEmailFormButtonDisabled(false, values, errors)).toBe(true);
    });

    it("should return true when fields are empty", () => {
        const values: ChangeEmailFormValues = {
            email: "",
            currentPassword: "",
        };
        const errors = {};

        expect(isChangeEmailFormButtonDisabled(false, values, errors)).toBe(true);
    });

    it("should return false when form is valid and not loading", () => {
        const values: ChangeEmailFormValues = {
            email: "new@example.com",
            currentPassword: "Password123",
        };
        const errors = {};

        expect(isChangeEmailFormButtonDisabled(false, values, errors)).toBe(false);
    });
});
