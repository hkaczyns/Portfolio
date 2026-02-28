import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import type { UserResponse } from "./types";

export interface AuthState {
    userId?: string;
    email?: string;
    isVerified?: boolean;
    resendVerificationRequestedAt?: string;
    forgotPasswordRequestedAt?: string;
}

export const initialAuthState: AuthState = {
    userId: "",
    email: "",
    isVerified: undefined,
    resendVerificationRequestedAt: undefined,
    forgotPasswordRequestedAt: undefined,
};

export const authSlice = createSlice({
    name: "authSlice",
    initialState: initialAuthState,
    reducers: {
        setUserCredentials(state, action: PayloadAction<UserResponse>) {
            state.userId = action.payload.id;
            state.email = action.payload.email;
            state.isVerified = action.payload.isVerified;
        },
        clearUserCredentials(state) {
            state.userId = "";
            state.email = "";
            state.isVerified = undefined;
        },
        setResendVerificationRequestedAt(state, action: PayloadAction<string>) {
            state.resendVerificationRequestedAt = action.payload;
        },
        setForgotPasswordRequestedAt(state, action: PayloadAction<string>) {
            state.forgotPasswordRequestedAt = action.payload;
        },
    },
});

const persistConfig = {
    key: "auth",
    storage,
    whitelist: ["userId", "isVerified", "email", "resendVerificationRequestedAt", "forgotPasswordRequestedAt"],
};

export const {
    setUserCredentials,
    clearUserCredentials,
    setResendVerificationRequestedAt,
    setForgotPasswordRequestedAt,
} = authSlice.actions;
export default persistReducer(persistConfig, authSlice.reducer);
