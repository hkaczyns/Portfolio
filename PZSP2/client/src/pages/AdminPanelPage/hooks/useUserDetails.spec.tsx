import { renderHook, waitFor, act } from "@testing-library/react";
import { useUserDetails } from "./useUserDetails";
import * as adminApi from "../../../store/admin/api";
import * as alertContext from "../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";
import { UserRole } from "../../../store/auth/types";

jest.mock("../../../store/admin/api");
jest.mock("../../../components/Alert/AlertContext");
jest.mock("react-i18next");

describe("useUserDetails", () => {
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

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(adminApi.useUpdateUserMutation).mockReturnValue([
            mockUpdateUser,
            { isLoading: false, isError: false, isSuccess: false, reset: jest.fn() },
        ]);
        jest.mocked(alertContext.useAlert).mockReturnValue({
            publish: mockPublish,
            message: "",
            alertType: undefined,
        });
        jest.mocked(reactI18next.useTranslation).mockReturnValue({
            t: mockT,
        } as unknown as ReturnType<typeof reactI18next.useTranslation>);
    });

    it("should initialize with user data", () => {
        const { result } = renderHook(() => useUserDetails(mockUser));

        expect(result.current.firstNameFormik.values.firstName).toBe("John");
        expect(result.current.lastNameFormik.values.lastName).toBe("Doe");
        expect(result.current.emailFormik.values.email).toBe("john.doe@example.com");
        expect(result.current.editingField).toBe(null);
    });

    it("should initialize with empty strings when user is undefined", () => {
        const { result } = renderHook(() => useUserDetails(undefined));

        expect(result.current.firstNameFormik.values.firstName).toBe("");
        expect(result.current.lastNameFormik.values.lastName).toBe("");
        expect(result.current.emailFormik.values.email).toBe("");
    });

    it("should set editingField when handleEditField is called", () => {
        const { result } = renderHook(() => useUserDetails(mockUser));

        act(() => {
            result.current.handleEditField("firstName");
        });

        expect(result.current.editingField).toBe("firstName");

        act(() => {
            result.current.handleEditField("email");
        });

        expect(result.current.editingField).toBe("email");
    });

    it("should reset editingField when handleCancelEdit is called", () => {
        const { result } = renderHook(() => useUserDetails(mockUser));

        act(() => {
            result.current.handleEditField("firstName");
        });

        expect(result.current.editingField).toBe("firstName");

        act(() => {
            result.current.handleCancelEdit();
        });

        expect(result.current.editingField).toBe(null);
    });

    it("should not call updateUser when value is unchanged", async () => {
        const { result } = renderHook(() => useUserDetails(mockUser));

        act(() => {
            result.current.handleEditField("firstName");
        });

        await act(async () => {
            await result.current.handleSaveField();
        });

        expect(mockUpdateUser).not.toHaveBeenCalled();
        expect(result.current.editingField).toBe(null);
    });

    it("should call updateUser and publish success when firstName is changed", async () => {
        mockUpdateUser.mockReturnValue({
            unwrap: jest.fn().mockResolvedValue({}),
        });

        const { result } = renderHook(() => useUserDetails(mockUser));

        act(() => {
            result.current.handleEditField("firstName");
        });

        act(() => {
            result.current.firstNameFormik.setFieldValue("firstName", "Jane", true);
        });

        await act(async () => {
            await result.current.handleSaveField();
        });

        await waitFor(() => {
            expect(mockUpdateUser).toHaveBeenCalledWith({ userId: "123", firstName: "Jane" });
            expect(mockPublish).toHaveBeenCalledWith("translated.admin.userUpdateSuccess", "success");
            expect(result.current.editingField).toBe(null);
        });
    });

    it("should call updateUser and publish success when lastName is changed", async () => {
        mockUpdateUser.mockReturnValue({
            unwrap: jest.fn().mockResolvedValue({}),
        });

        const { result } = renderHook(() => useUserDetails(mockUser));

        act(() => {
            result.current.handleEditField("lastName");
        });

        act(() => {
            result.current.lastNameFormik.setFieldValue("lastName", "Smith", true);
        });

        await act(async () => {
            await result.current.handleSaveField();
        });

        await waitFor(() => {
            expect(mockUpdateUser).toHaveBeenCalledWith({ userId: "123", lastName: "Smith" });
            expect(mockPublish).toHaveBeenCalledWith("translated.admin.userUpdateSuccess", "success");
            expect(result.current.editingField).toBe(null);
        });
    });

    it("should call updateUser and publish success when email is changed", async () => {
        mockUpdateUser.mockReturnValue({
            unwrap: jest.fn().mockResolvedValue({}),
        });

        const { result } = renderHook(() => useUserDetails(mockUser));

        act(() => {
            result.current.handleEditField("email");
        });

        act(() => {
            result.current.emailFormik.setFieldValue("email", "newemail@example.com", true);
        });

        await act(async () => {
            await result.current.handleSaveField();
        });

        await waitFor(() => {
            expect(mockUpdateUser).toHaveBeenCalledWith({ userId: "123", email: "newemail@example.com" });
            expect(mockPublish).toHaveBeenCalledWith("translated.admin.userUpdateSuccess", "success");
            expect(result.current.editingField).toBe(null);
        });
    });

    it("should publish error when updateUser fails", async () => {
        mockUpdateUser.mockReturnValue({
            unwrap: jest.fn().mockRejectedValue(new Error("Update failed")),
        });

        const { result } = renderHook(() => useUserDetails(mockUser));

        act(() => {
            result.current.handleEditField("firstName");
        });

        act(() => {
            result.current.firstNameFormik.setFieldValue("firstName", "Jane", true);
        });

        await act(async () => {
            await result.current.handleSaveField();
        });

        await waitFor(() => {
            expect(mockPublish).toHaveBeenCalledWith("translated.admin.userUpdateError", "error");
        });
    });

    it("should return isLoading from useUpdateUserMutation", () => {
        jest.mocked(adminApi.useUpdateUserMutation).mockReturnValue([
            mockUpdateUser,
            { isLoading: true, isError: false, isSuccess: false, reset: jest.fn() },
        ]);

        const { result } = renderHook(() => useUserDetails(mockUser));

        expect(result.current.isLoading).toBe(true);
    });

    it("should calculate canSaveFirstName correctly", async () => {
        const { result } = renderHook(() => useUserDetails(mockUser));

        expect(result.current.canSaveFirstName).toBe(false);

        act(() => {
            result.current.handleEditField("firstName");
        });

        expect(result.current.canSaveFirstName).toBe(false);

        act(() => {
            result.current.firstNameFormik.setFieldValue("firstName", "Jane", true);
            result.current.firstNameFormik.setFieldTouched("firstName", true);
        });

        await waitFor(() => {
            expect(result.current.canSaveFirstName).toBe(true);
        });
    });

    it("should calculate canSaveEmail correctly", async () => {
        const { result } = renderHook(() => useUserDetails(mockUser));

        expect(result.current.canSaveEmail).toBe(false);

        act(() => {
            result.current.handleEditField("email");
        });

        expect(result.current.canSaveEmail).toBe(false);

        act(() => {
            result.current.emailFormik.setFieldValue("email", "newemail@example.com", true);
            result.current.emailFormik.setFieldTouched("email", true);
        });

        await waitFor(() => {
            expect(result.current.canSaveEmail).toBe(true);
        });
    });
});
