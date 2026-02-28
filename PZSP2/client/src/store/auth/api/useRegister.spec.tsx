import { renderHook, waitFor } from "@testing-library/react";
import { useRegister } from "./useRegister";
import * as api from "../api";
import * as alertContext from "../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";
import * as helpers from "../../helpers";
import type { RegisterFormValues } from "../../../pages/RegisterPage/RegisterPage";

jest.mock("../api");
jest.mock("../../../components/Alert/AlertContext");
jest.mock("react-i18next");
jest.mock("../../helpers");

describe("useRegister", () => {
    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockTCommon = jest.fn((key: string) => `translated.common.${key}`);
    const mockHandleError = jest.fn();
    const mockRegisterMutation = jest.fn();

    const mockRegisterValues: RegisterFormValues = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        confirmPassword: "password123",
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(alertContext.useAlert).mockReturnValue({ publish: mockPublish, message: "", alertType: undefined });
        jest.mocked(reactI18next.useTranslation)
            .mockReturnValueOnce({ t: mockT } as unknown as ReturnType<typeof reactI18next.useTranslation>)
            .mockReturnValueOnce({ t: mockTCommon } as unknown as ReturnType<typeof reactI18next.useTranslation>);
        jest.mocked(helpers.handleError).mockImplementation(mockHandleError);
        jest.mocked(api.useRegisterMutation).mockReturnValue([
            mockRegisterMutation,
            { isLoading: false, isSuccess: false, isError: false, data: undefined, reset: jest.fn() },
        ]);
    });

    it("should call registerMutation with correct values", async () => {
        mockRegisterMutation.mockResolvedValue({ data: undefined, error: undefined });

        const { result } = renderHook(() => useRegister());

        result.current.register(mockRegisterValues);

        await waitFor(() => {
            expect(mockRegisterMutation).toHaveBeenCalledWith({
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                password: "password123",
            });
        });
    });

    it("should handle error and call handleError when mutation fails", async () => {
        const mockError = { status: 400, data: { detail: "EMAIL_ALREADY_EXISTS" } };
        mockRegisterMutation.mockResolvedValue({ data: undefined, error: mockError });

        const { result } = renderHook(() => useRegister());

        result.current.register(mockRegisterValues);

        await waitFor(() => {
            expect(mockHandleError).toHaveBeenCalledWith(mockError, mockPublish, mockT, "UNKNOWN_ERROR", mockTCommon);
        });
    });

    it("should return loading state when mutation is loading", () => {
        jest.mocked(api.useRegisterMutation).mockReturnValue([
            mockRegisterMutation,
            { isLoading: true, isSuccess: false, isError: false, data: undefined, reset: jest.fn() },
        ]);

        const { result } = renderHook(() => useRegister());

        expect(result.current.isLoading).toBe(true);
    });

    it("should return success state when mutation succeeds", () => {
        const mockUserData = {
            id: "123",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            isVerified: false,
        };

        jest.mocked(api.useRegisterMutation).mockReturnValue([
            mockRegisterMutation,
            { isLoading: false, isSuccess: true, isError: false, data: mockUserData, reset: jest.fn() },
        ]);

        const { result } = renderHook(() => useRegister());

        expect(result.current.isSuccess).toBe(true);
        expect(result.current.user).toEqual(mockUserData);
    });

    it("should return error state when mutation has error", () => {
        jest.mocked(api.useRegisterMutation).mockReturnValue([
            mockRegisterMutation,
            { isLoading: false, isSuccess: false, isError: true, data: undefined, reset: jest.fn() },
        ]);

        const { result } = renderHook(() => useRegister());

        expect(result.current.isError).toBe(true);
    });
});
