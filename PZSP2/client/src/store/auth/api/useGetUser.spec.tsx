import { renderHook } from "@testing-library/react";
import { useGetUser } from "./useGetUser";
import * as api from "../api";
import * as alertContext from "../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";
import * as helpers from "../../helpers";
import * as store from "../../store";
import * as slice from "../slice";

jest.mock("../api");
jest.mock("../../../components/Alert/AlertContext");
jest.mock("react-i18next");
jest.mock("../../helpers");
jest.mock("../../store", () => ({
    useAppSelector: jest.fn(),
    useAppDispatch: jest.fn(() => jest.fn()),
}));
jest.mock("../slice");

describe("useGetUser", () => {
    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockHandleError = jest.fn();
    const mockDispatch = jest.fn();

    const mockUserData = {
        id: "123",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        isVerified: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(alertContext.useAlert).mockReturnValue({ publish: mockPublish, message: "", alertType: undefined });
        jest.mocked(reactI18next.useTranslation).mockReturnValue({ t: mockT } as unknown as ReturnType<
            typeof reactI18next.useTranslation
        >);
        jest.mocked(helpers.handleError).mockImplementation(mockHandleError);
        jest.mocked(store.useAppSelector).mockReturnValue(true);
        jest.mocked(store.useAppDispatch).mockReturnValue(mockDispatch);
        mockDispatch.mockClear();
    });

    it("should return user data when query succeeds", () => {
        jest.mocked(api.useGetUserQuery).mockReturnValue({
            isLoading: false,
            isSuccess: true,
            isError: false,
            data: mockUserData,
            error: undefined,
            refetch: jest.fn(),
        } as ReturnType<typeof api.useGetUserQuery>);

        const { result } = renderHook(() => useGetUser());

        expect(result.current.user).toEqual(mockUserData);
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.isError).toBe(false);
    });

    it("should return loading state when query is loading", () => {
        jest.mocked(api.useGetUserQuery).mockReturnValue({
            isLoading: true,
            isSuccess: false,
            isError: false,
            data: undefined,
            error: undefined,
            refetch: jest.fn(),
        } as ReturnType<typeof api.useGetUserQuery>);

        const { result } = renderHook(() => useGetUser());

        expect(result.current.isLoading).toBe(true);
        expect(result.current.user).toBeUndefined();
    });

    it("should call handleError when query has error (non-401)", () => {
        const mockTFallback = jest.fn((key: string) => `translated.common.${key}`);
        jest.mocked(reactI18next.useTranslation).mockReturnValue({
            t: mockTFallback,
        } as unknown as ReturnType<typeof reactI18next.useTranslation>);

        const mockError = { status: 500, data: { detail: "SERVER_ERROR" } };
        jest.mocked(api.useGetUserQuery).mockReturnValue({
            isLoading: false,
            isSuccess: false,
            isError: true,
            data: undefined,
            error: mockError,
            refetch: jest.fn(),
        } as ReturnType<typeof api.useGetUserQuery>);

        renderHook(() => useGetUser());

        expect(mockHandleError).toHaveBeenCalledWith(
            mockError,
            mockPublish,
            mockTFallback,
            "UNKNOWN_ERROR",
            mockTFallback,
        );
    });

    it("should not call handleError when there is no error", () => {
        jest.mocked(api.useGetUserQuery).mockReturnValue({
            isLoading: false,
            isSuccess: true,
            isError: false,
            data: mockUserData,
            error: undefined,
            refetch: jest.fn(),
        } as ReturnType<typeof api.useGetUserQuery>);

        renderHook(() => useGetUser());

        expect(mockHandleError).not.toHaveBeenCalled();
    });

    it("should call clearUserCredentials when query has 401 error", () => {
        const mockError = { status: 401, data: { detail: "UNAUTHORIZED" } };
        jest.mocked(api.useGetUserQuery).mockReturnValue({
            isLoading: false,
            isSuccess: false,
            isError: true,
            data: undefined,
            error: mockError,
            refetch: jest.fn(),
        } as ReturnType<typeof api.useGetUserQuery>);

        renderHook(() => useGetUser());

        expect(mockDispatch).toHaveBeenCalledWith(slice.clearUserCredentials());
        expect(mockHandleError).not.toHaveBeenCalled();
    });

    it("should return error state when query has error", () => {
        const mockError = { status: 500, data: { detail: "SERVER_ERROR" } };
        jest.mocked(api.useGetUserQuery).mockReturnValue({
            isLoading: false,
            isSuccess: false,
            isError: true,
            data: undefined,
            error: mockError,
            refetch: jest.fn(),
        } as ReturnType<typeof api.useGetUserQuery>);

        const { result } = renderHook(() => useGetUser());

        expect(result.current.isError).toBe(true);
        expect(result.current.user).toBeUndefined();
    });
});
