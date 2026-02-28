import { renderHook } from "@testing-library/react";
import { useVerificationPage } from "./useVerificationPage";
import * as reactRouterDom from "react-router-dom";
import * as reactI18next from "react-i18next";
import * as alertContext from "../../../components/Alert/AlertContext";
import * as store from "../../../store/store";
import * as selectors from "../../../store/auth/selectors";
import * as useVerifyUserHook from "../../../store/auth/api/useVerifyUser";

jest.mock("react-router-dom");
jest.mock("react-i18next");
jest.mock("../../../components/Alert/AlertContext");
jest.mock("../../../store/store");
jest.mock("../../../store/auth/selectors");
jest.mock("../../../store/auth/api/useVerifyUser");

describe("useVerificationPage", () => {
    const mockNavigate = jest.fn();
    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockVerifyUser = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(reactRouterDom.useNavigate).mockReturnValue(mockNavigate);
        jest.mocked(reactRouterDom.useParams).mockReturnValue({ verificationToken: "test-token-123" });
        jest.mocked(reactI18next.useTranslation).mockReturnValue({ t: mockT } as unknown as ReturnType<
            typeof reactI18next.useTranslation
        >);
        jest.mocked(alertContext.useAlert).mockReturnValue({ publish: mockPublish, message: "", alertType: undefined });
        jest.mocked(store.useAppSelector).mockImplementation((selector) => {
            if (selector === selectors.selectIsNotVerified) {
                return true;
            }
            return false;
        });
        jest.mocked(useVerifyUserHook.useVerifyUser).mockReturnValue({
            verifyUser: mockVerifyUser,
            isLoading: false,
            isSuccess: false,
            isError: false,
        });
    });

    it("should return isSuccess and isError", () => {
        const { result } = renderHook(() => useVerificationPage());

        expect(result.current.isSuccess).toBe(false);
        expect(result.current.isError).toBe(false);
    });

    it("should call verifyUser when user is not verified and token is provided", () => {
        renderHook(() => useVerificationPage());

        expect(mockVerifyUser).toHaveBeenCalledWith("test-token-123");
    });

    it("should not call verifyUser when user is already verified", () => {
        jest.mocked(store.useAppSelector).mockImplementation((selector) => {
            if (selector === selectors.selectIsNotVerified) {
                return false;
            }
            return false;
        });

        renderHook(() => useVerificationPage());

        expect(mockNavigate).toHaveBeenCalledWith("/login");
        expect(mockVerifyUser).not.toHaveBeenCalled();
    });

    it("should call verifyUser only once even on re-renders", () => {
        const { rerender } = renderHook(() => useVerificationPage());

        expect(mockVerifyUser).toHaveBeenCalledTimes(1);

        rerender();

        expect(mockVerifyUser).toHaveBeenCalledTimes(1);
    });

    it("should call publish and navigate when verification is successful", () => {
        jest.mocked(useVerifyUserHook.useVerifyUser).mockReturnValue({
            verifyUser: mockVerifyUser,
            isLoading: false,
            isSuccess: true,
            isError: false,
        });

        renderHook(() => useVerificationPage());

        expect(mockPublish).toHaveBeenCalledWith("translated.verificationSuccess", "success");
        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    it("should call navigate when verification fails", () => {
        jest.mocked(useVerifyUserHook.useVerifyUser).mockReturnValue({
            verifyUser: mockVerifyUser,
            isLoading: false,
            isSuccess: false,
            isError: true,
        });

        renderHook(() => useVerificationPage());

        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    it("should return success state when verification succeeds", () => {
        jest.mocked(useVerifyUserHook.useVerifyUser).mockReturnValue({
            verifyUser: mockVerifyUser,
            isLoading: false,
            isSuccess: true,
            isError: false,
        });

        const { result } = renderHook(() => useVerificationPage());

        expect(result.current.isSuccess).toBe(true);
        expect(result.current.isError).toBe(false);
    });

    it("should return error state when verification fails", () => {
        jest.mocked(useVerifyUserHook.useVerifyUser).mockReturnValue({
            verifyUser: mockVerifyUser,
            isLoading: false,
            isSuccess: false,
            isError: true,
        });

        const { result } = renderHook(() => useVerificationPage());

        expect(result.current.isSuccess).toBe(false);
        expect(result.current.isError).toBe(true);
    });
});
