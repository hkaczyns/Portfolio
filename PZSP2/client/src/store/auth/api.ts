import { createApi } from "@reduxjs/toolkit/query/react";
import { DateTime } from "luxon";
import type { LoginRequest, RegisterRequest, UserResponse } from "./types";
import { baseApiQuery } from "../api";
import {
    clearUserCredentials,
    setResendVerificationRequestedAt,
    setForgotPasswordRequestedAt,
    setUserCredentials,
} from "./slice";
import { DEFAULT_CACHE_TIME } from "../../constants/constants";

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: baseApiQuery,
    tagTypes: ["User"],
    endpoints: (builder) => ({
        register: builder.mutation<UserResponse, RegisterRequest>({
            query: (body) => ({
                url: "/v1/auth/register",
                method: "POST",
                body,
            }),
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setUserCredentials(data));
                    dispatch(setResendVerificationRequestedAt(""));
                } catch {
                    return;
                }
            },
            invalidatesTags: ["User"],
        }),
        login: builder.mutation<void, LoginRequest>({
            query: (body) => ({
                url: "/v1/auth/login",
                method: "POST",
                body: new URLSearchParams({
                    username: body.username,
                    password: body.password,
                }).toString(),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }),
            invalidatesTags: ["User"],
        }),
        getUser: builder.query<UserResponse, void>({
            query: () => ({
                url: "/v1/users/me",
                method: "GET",
            }),
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setUserCredentials(data));
                } catch {
                    return;
                }
            },
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["User"],
        }),
        resendVerificationEmail: builder.mutation<void, { email: string }>({
            query: (body) => ({
                url: "/v1/auth/request-verify-token",
                method: "POST",
                body,
            }),
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(setResendVerificationRequestedAt(DateTime.now().toISO()));
                } catch {
                    return;
                }
            },
        }),
        verifyUser: builder.mutation<void, { token: string }>({
            query: (body) => ({
                url: "/v1/auth/verify",
                method: "POST",
                body,
            }),
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(clearUserCredentials());
                } catch {
                    return;
                }
            },
            invalidatesTags: ["User"],
        }),
        logout: builder.mutation<void, void>({
            query: () => ({
                url: "/v1/auth/logout",
                method: "POST",
            }),
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(clearUserCredentials());
                } catch {
                    return;
                }
            },
            invalidatesTags: ["User"],
        }),
        forgotPassword: builder.mutation<void, { email: string }>({
            query: (body) => ({
                url: "/v1/auth/forgot-password",
                method: "POST",
                body,
            }),
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(setForgotPasswordRequestedAt(DateTime.now().toISO()));
                } catch {
                    return;
                }
            },
        }),
        resetPassword: builder.mutation<void, { token: string; password: string }>({
            query: (body) => ({
                url: "/v1/auth/reset-password",
                method: "POST",
                body,
            }),
        }),
        updateUser: builder.mutation<
            UserResponse,
            Partial<UserResponse> & { currentPassword?: string; password?: string }
        >({
            query: (body) => ({
                url: "/v1/users/me",
                method: "PATCH",
                body,
            }),
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setUserCredentials(data));
                } catch {
                    return;
                }
            },
            invalidatesTags: ["User"],
        }),
    }),
});

export const {
    useRegisterMutation,
    useLoginMutation,
    useGetUserQuery,
    useLazyGetUserQuery,
    useResendVerificationEmailMutation,
    useVerifyUserMutation,
    useLogoutMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useUpdateUserMutation,
} = authApi;
