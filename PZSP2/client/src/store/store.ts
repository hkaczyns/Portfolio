import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/slice";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import persistStore from "redux-persist/lib/persistStore";
import { authApi } from "./auth/api";
import { adminApi } from "./admin/api";
import { scheduleApi } from "./schedule/api";
import { enrollmentApi } from "./enrollment/api";
import { billingApi } from "./billing/api";
import { attendanceApi } from "./attendance/api";
import { publicApi } from "./public/api";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [authApi.reducerPath]: authApi.reducer,
        [adminApi.reducerPath]: adminApi.reducer,
        [scheduleApi.reducerPath]: scheduleApi.reducer,
        [enrollmentApi.reducerPath]: enrollmentApi.reducer,
        [billingApi.reducerPath]: billingApi.reducer,
        [attendanceApi.reducerPath]: attendanceApi.reducer,
        [publicApi.reducerPath]: publicApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
            },
        }).concat(
            authApi.middleware,
            adminApi.middleware,
            scheduleApi.middleware,
            enrollmentApi.middleware,
            billingApi.middleware,
            attendanceApi.middleware,
            publicApi.middleware,
        ),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
