import { renderHook, waitFor, act } from "@testing-library/react";
import { useAccountDetails } from "./useAccountDetails";
import * as useUpdateUser from "../../../store/auth/api/useUpdateUser";
import * as alertContext from "../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";
import { UserRole } from "../../../store/auth/types";

jest.mock("../../../store/auth/api/useUpdateUser");
jest.mock("../../../components/Alert/AlertContext");
jest.mock("react-i18next");

describe("useAccountDetails", () => {
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
        jest.mocked(useUpdateUser.useUpdateUser).mockReturnValue({
            updateUser: mockUpdateUser,
            isLoading: false,
            isSuccess: false,
            isError: false,
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

    it("should initialize with user data", () => {
        const { result } = renderHook(() => useAccountDetails(mockUser));

        expect(result.current.firstNameFormik.values.firstName).toBe("John");
        expect(result.current.lastNameFormik.values.lastName).toBe("Doe");
        expect(result.current.editingField).toBe(null);
        expect(result.current.canSaveFirstName).toBe(false);
        expect(result.current.canSaveLastName).toBe(false);
    });

    it("should initialize with empty strings when user is undefined", () => {
        const { result } = renderHook(() => useAccountDetails(undefined));

        expect(result.current.firstNameFormik.values.firstName).toBe("");
        expect(result.current.lastNameFormik.values.lastName).toBe("");
    });

    it("should set editingField when handleEditField is called", () => {
        const { result } = renderHook(() => useAccountDetails(mockUser));

        act(() => {
            result.current.handleEditField("firstName");
        });

        expect(result.current.editingField).toBe("firstName");

        act(() => {
            result.current.handleEditField("lastName");
        });

        expect(result.current.editingField).toBe("lastName");
    });

    it("should reset editingField when handleCancelEdit is called", () => {
        const { result } = renderHook(() => useAccountDetails(mockUser));

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
        const { result } = renderHook(() => useAccountDetails(mockUser));

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
        mockUpdateUser.mockResolvedValue(true);

        const { result } = renderHook(() => useAccountDetails(mockUser));

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
            expect(mockUpdateUser).toHaveBeenCalledWith({ firstName: "Jane" });
            expect(mockPublish).toHaveBeenCalledWith("translated.account.updateSuccess", "success");
            expect(result.current.editingField).toBe(null);
        });
    });

    it("should call updateUser and publish success when lastName is changed", async () => {
        mockUpdateUser.mockResolvedValue(true);

        const { result } = renderHook(() => useAccountDetails(mockUser));

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
            expect(mockUpdateUser).toHaveBeenCalledWith({ lastName: "Smith" });
            expect(mockPublish).toHaveBeenCalledWith("translated.account.updateSuccess", "success");
            expect(result.current.editingField).toBe(null);
        });
    });

    it("should not update editingField when updateUser fails", async () => {
        mockUpdateUser.mockResolvedValue(false);

        const { result } = renderHook(() => useAccountDetails(mockUser));

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
            expect(mockUpdateUser).toHaveBeenCalled();
            expect(mockPublish).not.toHaveBeenCalled();
            expect(result.current.editingField).toBe("firstName");
        });
    });

    it("should return isLoading from useUpdateUser", () => {
        jest.mocked(useUpdateUser.useUpdateUser).mockReturnValue({
            updateUser: mockUpdateUser,
            isLoading: true,
            isSuccess: false,
            isError: false,
        });

        const { result } = renderHook(() => useAccountDetails(mockUser));

        expect(result.current.isLoading).toBe(true);
    });

    it("should calculate canSaveFirstName correctly", async () => {
        const { result } = renderHook(() => useAccountDetails(mockUser));

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
            expect(result.current.canSaveLastName).toBe(false);
        });
    });

    it("should calculate canSaveLastName correctly", async () => {
        const { result } = renderHook(() => useAccountDetails(mockUser));

        expect(result.current.canSaveLastName).toBe(false);

        act(() => {
            result.current.handleEditField("lastName");
        });

        expect(result.current.canSaveLastName).toBe(false);

        act(() => {
            result.current.lastNameFormik.setFieldValue("lastName", "Smith", true);
            result.current.lastNameFormik.setFieldTouched("lastName", true);
        });

        await waitFor(() => {
            expect(result.current.canSaveLastName).toBe(true);
            expect(result.current.canSaveFirstName).toBe(false);
        });
    });
});
