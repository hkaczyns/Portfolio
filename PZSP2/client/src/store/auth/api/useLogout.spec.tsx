import { renderHook, waitFor } from "@testing-library/react";
import { useLogout } from "./useLogout";
import * as api from "../api";
import * as reactRouterDom from "react-router-dom";

jest.mock("../api");
jest.mock("react-router-dom");

describe("useLogout", () => {
    const mockNavigate = jest.fn();
    const mockLogoutMutation = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(reactRouterDom.useNavigate).mockReturnValue(mockNavigate);
        jest.mocked(api.useLogoutMutation).mockReturnValue([
            mockLogoutMutation,
            { isLoading: false, isSuccess: false, isError: false, reset: jest.fn() },
        ]);
    });

    it("should call logoutMutation and navigate to login on successful logout", async () => {
        mockLogoutMutation.mockResolvedValue({ data: undefined, error: undefined });

        const { result } = renderHook(() => useLogout());

        result.current.logout();

        await waitFor(() => {
            expect(mockLogoutMutation).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });
    });

    it("should navigate to login even if logoutMutation fails", async () => {
        const mockError = { status: 500, data: { detail: "SERVER_ERROR" } };
        mockLogoutMutation.mockResolvedValue({ data: undefined, error: mockError });

        const { result } = renderHook(() => useLogout());

        result.current.logout();

        await waitFor(() => {
            expect(mockLogoutMutation).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });
    });

    it("should return loading state when logoutMutation is loading", () => {
        jest.mocked(api.useLogoutMutation).mockReturnValue([
            mockLogoutMutation,
            { isLoading: true, isSuccess: false, isError: false, reset: jest.fn() },
        ]);

        const { result } = renderHook(() => useLogout());

        expect(result.current.isLoading).toBe(true);
    });
});
