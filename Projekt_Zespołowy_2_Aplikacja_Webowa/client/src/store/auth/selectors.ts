import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { DateTime } from "luxon";
import { RESEND_VERIFICATION_COOLDOWN_SECONDS, FORGOT_PASSWORD_COOLDOWN_SECONDS } from "../../constants/constants";
import { UserRole } from "./types";
import { authApi } from "./api";

const selectAuthState = createSelector(
    (state: RootState) => state.auth,
    (auth) => auth,
);

export const selectIsAuthenticated = createSelector(selectAuthState, (auth) => {
    return !!auth.userId && auth.userId !== "" && auth.isVerified === true;
});

export const selectIsNotVerified = createSelector(selectAuthState, (auth) => {
    return !!auth.userId && !auth.isVerified;
});

export const selectEmail = createSelector(selectAuthState, (auth) => {
    return auth.email;
});

export const selectResendVerificationEmailCooldownRequestedAt = createSelector(
    selectAuthState,
    (auth) => auth.resendVerificationRequestedAt,
);

export const selectResendVerificationEmailCooldown = createSelector(selectAuthState, (auth) => {
    if (!auth.resendVerificationRequestedAt) return 0;

    const requestedAt = DateTime.fromISO(auth.resendVerificationRequestedAt);
    const now = DateTime.now();

    const elapsedSeconds = Math.floor(now.diff(requestedAt, "seconds").seconds);
    const remaining = RESEND_VERIFICATION_COOLDOWN_SECONDS - elapsedSeconds;
    return remaining > 0 ? remaining : 0;
});

export const selectForgotPasswordRequestedAt = createSelector(
    selectAuthState,
    (auth) => auth.forgotPasswordRequestedAt,
);

export const selectForgotPasswordCooldown = createSelector(selectAuthState, (auth) => {
    if (!auth.forgotPasswordRequestedAt) return 0;

    const requestedAt = DateTime.fromISO(auth.forgotPasswordRequestedAt);
    const now = DateTime.now();

    const elapsedSeconds = Math.floor(now.diff(requestedAt, "seconds").seconds);
    const remaining = FORGOT_PASSWORD_COOLDOWN_SECONDS - elapsedSeconds;
    return remaining > 0 ? remaining : 0;
});

const selectGetUserQueryResult = createSelector(
    (state: RootState) => authApi.endpoints.getUser.select()(state),
    (queryResult) => queryResult.data,
);

export const selectUserRole = createSelector(selectGetUserQueryResult, (user) => {
    return user?.role;
});

export const selectIsStudent = createSelector(selectUserRole, (role) => {
    return role === UserRole.STUDENT;
});

export const selectIsInstructor = createSelector(selectUserRole, (role) => {
    return role === UserRole.INSTRUCTOR;
});

export const selectIsAdmin = createSelector(selectUserRole, (role) => {
    return role === UserRole.ADMIN;
});

export const selectIsAdminOrInstructor = createSelector(selectUserRole, (role) => {
    return role === UserRole.ADMIN || role === UserRole.INSTRUCTOR;
});

export const selectFirstName = createSelector(selectGetUserQueryResult, (user) => {
    return user?.firstName;
});

export const selectLastName = createSelector(selectGetUserQueryResult, (user) => {
    return user?.lastName;
});

export const selectFullName = createSelector(selectFirstName, selectLastName, (firstName, lastName) => {
    if (!firstName && !lastName) return undefined;
    return [firstName, lastName].filter(Boolean).join(" ") || undefined;
});

export const selectUserId = createSelector(selectGetUserQueryResult, (user) => {
    return user?.id;
});
