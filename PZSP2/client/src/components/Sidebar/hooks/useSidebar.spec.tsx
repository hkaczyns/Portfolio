import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { useSidebar } from "./useSidebar";
import * as reactRouterDom from "react-router-dom";
import * as reactI18next from "react-i18next";
import * as useLogoutHook from "../../../store/auth/api/useLogout";
import * as useGetUserHook from "../../../store/auth/api/useGetUser";
import { adminApi } from "../../../store/admin/api";
import { scheduleApi } from "../../../store/schedule/api";
import { enrollmentApi } from "../../../store/enrollment/api";
import authReducer from "../../../store/auth/slice";
import { authApi } from "../../../store/auth/api";

jest.mock("react-router-dom");
jest.mock("react-i18next");
jest.mock("../../../store/auth/api/useLogout");
jest.mock("../../../store/auth/api/useGetUser");

const createMockStore = () => {
    return configureStore({
        reducer: {
            auth: authReducer,
            [authApi.reducerPath]: authApi.reducer,
            [adminApi.reducerPath]: adminApi.reducer,
            [scheduleApi.reducerPath]: scheduleApi.reducer,
            [enrollmentApi.reducerPath]: enrollmentApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
                },
            }).concat(authApi.middleware, adminApi.middleware, scheduleApi.middleware, enrollmentApi.middleware),
    });
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={createMockStore()}>{children}</Provider>
);

describe("useSidebar", () => {
    const mockNavigate = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockLogout = jest.fn();
    const mockLocation = { pathname: "/account" };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(reactRouterDom.useNavigate).mockReturnValue(mockNavigate);
        jest.mocked(reactRouterDom.useLocation).mockReturnValue(mockLocation as any);
        jest.mocked(reactI18next.useTranslation).mockReturnValue({ t: mockT } as unknown as ReturnType<
            typeof reactI18next.useTranslation
        >);
        jest.mocked(useLogoutHook.useLogout).mockReturnValue({
            logout: mockLogout,
            isLoading: false,
        });
        jest.mocked(useGetUserHook.useGetUser).mockReturnValue({
            user: undefined,
            isLoading: false,
            isSuccess: false,
            isError: false,
            refetch: jest.fn(),
        });
    });

    it("should return all required properties", () => {
        const { result } = renderHook(() => useSidebar(), { wrapper });

        expect(result.current).toHaveProperty("fullName");
        expect(result.current).toHaveProperty("roleLabel");
        expect(result.current).toHaveProperty("handleLogout");
        expect(result.current).toHaveProperty("isActive");
        expect(result.current).toHaveProperty("handleNavClick");
        expect(result.current).toHaveProperty("t");
    });

    it("should return handleNavClick function", () => {
        const { result } = renderHook(() => useSidebar(), { wrapper });

        expect(result.current.handleNavClick).toBeDefined();
        expect(typeof result.current.handleNavClick).toBe("function");

        result.current.handleNavClick("/account");
        expect(mockNavigate).toHaveBeenCalledWith("/account");
    });
});
