import { renderHook, waitFor } from "@testing-library/react";
import { useLogin } from "./useLogin";
import * as api from "../api";
import * as alertContext from "../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";
import * as helpers from "../../helpers";

jest.mock("../api");
jest.mock("../../../components/Alert/AlertContext");
jest.mock("react-i18next");
jest.mock("../../helpers");

describe("useLogin", () => {
    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockTCommon = jest.fn((key: string) => `translated.common.${key}`);
    const mockHandleError = jest.fn();
    const mockLoginMutation = jest.fn();
    const mockUserQuery = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(alertContext.useAlert).mockReturnValue({ publish: mockPublish, message: "", alertType: undefined });
        jest.mocked(reactI18next.useTranslation)
            .mockReturnValueOnce({ t: mockT } as unknown as ReturnType<typeof reactI18next.useTranslation>)
            .mockReturnValueOnce({ t: mockTCommon } as unknown as ReturnType<typeof reactI18next.useTranslation>);
        jest.mocked(helpers.handleError).mockImplementation(mockHandleError);
        jest.mocked(api.useLoginMutation).mockReturnValue([
            mockLoginMutation,
            { isLoading: false, isSuccess: false, isError: false, reset: jest.fn() },
        ]);
        jest.mocked(api.useLazyGetUserQuery).mockReturnValue([
            mockUserQuery,
            { isLoading: false, isSuccess: false, isError: false, reset: jest.fn() },
            { lastArg: undefined },
        ] as ReturnType<typeof api.useLazyGetUserQuery>);
    });

    it("should call loginMutation and userQuery on successful login", async () => {
        mockLoginMutation.mockResolvedValue({ data: undefined, error: undefined });
        mockUserQuery.mockResolvedValue({ data: undefined, error: undefined });

        const { result } = renderHook(() => useLogin());

        result.current.login({ username: "test@test.com", password: "password123" });

        await waitFor(() => {
            expect(mockLoginMutation).toHaveBeenCalledWith({ username: "test@test.com", password: "password123" });
        });

        await waitFor(() => {
            expect(mockUserQuery).toHaveBeenCalled();
        });
    });

    it("should handle login error and call handleError", async () => {
        const mockError = { status: 401, data: { detail: "INVALID_CREDENTIALS" } };
        mockLoginMutation.mockResolvedValue({ data: undefined, error: mockError });

        const { result } = renderHook(() => useLogin());

        result.current.login({ username: "test@test.com", password: "wrongpassword" });

        await waitFor(() => {
            expect(mockHandleError).toHaveBeenCalledWith(mockError, mockPublish, mockT);
        });

        expect(mockUserQuery).not.toHaveBeenCalled();
    });

    it("should handle userQuery error and call handleError", async () => {
        const mockError = { status: 500, data: { detail: "SERVER_ERROR" } };
        mockLoginMutation.mockResolvedValue({ data: undefined, error: undefined });
        mockUserQuery.mockResolvedValue({ data: undefined, error: mockError });

        const { result } = renderHook(() => useLogin());

        result.current.login({ username: "test@test.com", password: "password123" });

        await waitFor(() => {
            expect(mockLoginMutation).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(mockHandleError).toHaveBeenCalledWith(
                mockError,
                mockPublish,
                mockTCommon,
                "UNKNOWN_ERROR",
                mockTCommon,
            );
        });
    });

    it("should return loading state when loginMutation is loading", () => {
        jest.mocked(api.useLoginMutation).mockReturnValue([
            mockLoginMutation,
            { isLoading: true, isSuccess: false, isError: false, reset: jest.fn() },
        ]);

        const { result } = renderHook(() => useLogin());

        expect(result.current.isLoading).toBe(true);
    });

    it("should return loading state when userQuery is loading", () => {
        jest.mocked(api.useLazyGetUserQuery).mockReturnValue([
            mockUserQuery,
            { isLoading: true, isSuccess: false, isError: false, reset: jest.fn() },
            { lastArg: undefined },
        ] as ReturnType<typeof api.useLazyGetUserQuery>);

        const { result } = renderHook(() => useLogin());

        expect(result.current.isLoading).toBe(true);
    });

    it("should return success state when both mutations succeed", () => {
        jest.mocked(api.useLoginMutation).mockReturnValue([
            mockLoginMutation,
            { isLoading: false, isSuccess: true, isError: false, reset: jest.fn() },
        ]);
        jest.mocked(api.useLazyGetUserQuery).mockReturnValue([
            mockUserQuery,
            { isLoading: false, isSuccess: true, isError: false, reset: jest.fn() },
            { lastArg: undefined },
        ] as ReturnType<typeof api.useLazyGetUserQuery>);

        const { result } = renderHook(() => useLogin());

        expect(result.current.isSuccess).toBe(true);
    });

    it("should return error state when loginMutation has error", () => {
        jest.mocked(api.useLoginMutation).mockReturnValue([
            mockLoginMutation,
            { isLoading: false, isSuccess: false, isError: true, reset: jest.fn() },
        ]);

        const { result } = renderHook(() => useLogin());

        expect(result.current.isError).toBe(true);
    });

    it("should return error state when userQuery has error", () => {
        jest.mocked(api.useLazyGetUserQuery).mockReturnValue([
            mockUserQuery,
            { isLoading: false, isSuccess: false, isError: true, reset: jest.fn() },
            { lastArg: undefined },
        ] as ReturnType<typeof api.useLazyGetUserQuery>);

        const { result } = renderHook(() => useLogin());

        expect(result.current.isError).toBe(true);
    });
});
