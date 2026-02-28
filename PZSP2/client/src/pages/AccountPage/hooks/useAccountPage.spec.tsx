import { renderHook, waitFor, act } from "@testing-library/react";
import { useAccountPage } from "./useAccountPage";
import * as useGetUser from "../../../store/auth/api/useGetUser";
import * as useUpdateUser from "../../../store/auth/api/useUpdateUser";
import * as useLogout from "../../../store/auth/api/useLogout";
import * as alertContext from "../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";
import * as reactRouterDom from "react-router-dom";
import { UserRole } from "../../../store/auth/types";

jest.mock("../../../store/auth/api/useGetUser");
jest.mock("../../../store/auth/api/useUpdateUser");
jest.mock("../../../store/auth/api/useLogout");
jest.mock("../../../components/Alert/AlertContext");
jest.mock("react-i18next");
jest.mock("react-router-dom");

describe("useAccountPage", () => {
    const mockUser = {
        id: "123",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        isActive: true,
        isSuperuser: false,
        isVerified: true,
        role: UserRole.STUDENT,
    };

    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockUpdateUser = jest.fn();
    const mockLogout = jest.fn();
    const mockNavigate = jest.fn();
    const mockRefetch = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(reactRouterDom.useNavigate).mockReturnValue(mockNavigate);
        jest.mocked(useGetUser.useGetUser).mockReturnValue({
            user: mockUser,
            isLoading: false,
            isSuccess: true,
            isError: false,
            refetch: mockRefetch,
        });
        jest.mocked(useUpdateUser.useUpdateUser).mockReturnValue({
            updateUser: mockUpdateUser,
            isLoading: false,
            isSuccess: false,
            isError: false,
        });
        jest.mocked(useLogout.useLogout).mockReturnValue({
            logout: mockLogout,
            isLoading: false,
        });
        jest.mocked(alertContext.useAlert).mockReturnValue({
            publish: mockPublish,
            message: "",
            alertType: undefined,
        });
        jest.mocked(reactI18next.useTranslation).mockReturnValue({
            t: mockT,
        } as unknown as ReturnType<typeof reactI18next.useTranslation>);
    });

    it("should return user data and initial values", () => {
        const { result } = renderHook(() => useAccountPage());

        expect(result.current.user).toEqual(mockUser);
        expect(result.current.fullName).toBe("John Doe");
        expect(result.current.isLoadingUser).toBe(false);
    });

    it("should call logout", async () => {
        const { result } = renderHook(() => useAccountPage());

        await result.current.handleLogout();

        expect(mockLogout).toHaveBeenCalled();
    });

    it("should return correct role label", () => {
        renderHook(() => useAccountPage());

        expect(mockT).toHaveBeenCalledWith("roles.student");
    });

    it("should set activeView to changePassword when handleChangePassword is called", async () => {
        const { result } = renderHook(() => useAccountPage());

        expect(result.current.activeView).toBe("details");

        act(() => {
            result.current.handleChangePassword();
        });

        await waitFor(() => {
            expect(result.current.activeView).toBe("changePassword");
        });
    });

    it("should set activeView to changeEmail when handleChangeEmail is called", async () => {
        const { result } = renderHook(() => useAccountPage());

        expect(result.current.activeView).toBe("details");

        act(() => {
            result.current.handleChangeEmail();
        });

        await waitFor(() => {
            expect(result.current.activeView).toBe("changeEmail");
        });
    });

    it("should set activeView to details when handleCancelForm is called", async () => {
        const { result } = renderHook(() => useAccountPage());

        act(() => {
            result.current.handleChangePassword();
        });
        await waitFor(() => {
            expect(result.current.activeView).toBe("changePassword");
        });

        act(() => {
            result.current.handleCancelForm();
        });

        await waitFor(() => {
            expect(result.current.activeView).toBe("details");
        });
    });

    it("should call updateUser with password and currentPassword when handleChangePasswordSubmit is called", async () => {
        mockUpdateUser.mockResolvedValue(mockUser);

        const { result } = renderHook(() => useAccountPage());

        await result.current.handleChangePasswordSubmit({
            currentPassword: "OldPass123",
            password: "NewPass123",
            confirmPassword: "NewPass123",
        });

        await waitFor(() => {
            expect(mockUpdateUser).toHaveBeenCalledWith({
                password: "NewPass123",
                currentPassword: "OldPass123",
            });
        });
    });

    it("should publish success message and reset view when password change succeeds", async () => {
        mockUpdateUser.mockResolvedValue(mockUser);

        const { result } = renderHook(() => useAccountPage());

        act(() => {
            result.current.handleChangePassword();
        });

        await waitFor(() => {
            expect(result.current.activeView).toBe("changePassword");
        });

        await act(async () => {
            await result.current.handleChangePasswordSubmit({
                currentPassword: "OldPass123",
                password: "NewPass123",
                confirmPassword: "NewPass123",
            });
        });

        await waitFor(() => {
            expect(mockPublish).toHaveBeenCalledWith("translated.account.updateSuccess", "success");
            expect(result.current.activeView).toBe("details");
        });
    });

    it("should call updateUser with email and currentPassword when handleChangeEmailSubmit is called", async () => {
        mockUpdateUser.mockResolvedValue(mockUser);

        const { result } = renderHook(() => useAccountPage());

        await result.current.handleChangeEmailSubmit({
            email: "new@example.com",
            currentPassword: "Password123",
        });

        await waitFor(() => {
            expect(mockUpdateUser).toHaveBeenCalledWith({
                email: "new@example.com",
                currentPassword: "Password123",
            });
        });
    });

    it("should publish email change verification message and reset view when email change succeeds", async () => {
        mockUpdateUser.mockResolvedValue(mockUser);
        mockRefetch.mockResolvedValue(undefined);

        const { result } = renderHook(() => useAccountPage());

        act(() => {
            result.current.handleChangeEmail();
        });

        await waitFor(() => {
            expect(result.current.activeView).toBe("changeEmail");
        });

        await act(async () => {
            await result.current.handleChangeEmailSubmit({
                email: "new@example.com",
                currentPassword: "Password123",
            });
        });

        await waitFor(() => {
            expect(mockRefetch).toHaveBeenCalled();
            expect(mockPublish).toHaveBeenCalledWith("translated.account.emailChangeVerification", "success");
        });
    });

    it("should not call updateUser if user is not available", async () => {
        jest.mocked(useGetUser.useGetUser).mockReturnValue({
            user: undefined,
            isLoading: false,
            isSuccess: false,
            isError: false,
            refetch: jest.fn(),
        });

        const { result } = renderHook(() => useAccountPage());

        await result.current.handleChangePasswordSubmit({
            currentPassword: "OldPass123",
            password: "NewPass123",
            confirmPassword: "NewPass123",
        });

        await waitFor(() => {
            expect(mockUpdateUser).not.toHaveBeenCalled();
        });
    });
});
