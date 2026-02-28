import { renderHook, act } from "@testing-library/react";
import { usePaymentsTab } from "./usePaymentsTab";
import * as adminApi from "../../../../../../store/admin/api";
import * as alertContext from "../../../../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";
import { UserRole } from "../../../../../../store/auth/types";
import { PaymentMethod } from "../../../../../../store/admin/api";

jest.mock("../../../../../../store/admin/api");
jest.mock("../../../../../../components/Alert/AlertContext");
jest.mock("react-i18next");

describe("usePaymentsTab", () => {
    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockCreateItem = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
    });
    const mockUpdateItem = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
    });
    const mockDeleteItem = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
    });

    const mockStudents = [
        {
            id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            isActive: true,
            isSuperuser: false,
            isVerified: true,
            role: UserRole.STUDENT,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(adminApi.useListPaymentsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(adminApi.useListUsersQuery).mockReturnValue({
            data: mockStudents,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(adminApi.useCreatePaymentMutation).mockReturnValue([mockCreateItem, { isLoading: false }] as any);
        jest.mocked(adminApi.useUpdatePaymentMutation).mockReturnValue([mockUpdateItem, { isLoading: false }] as any);
        jest.mocked(adminApi.useDeletePaymentMutation).mockReturnValue([mockDeleteItem, { isLoading: false }] as any);
        jest.mocked(alertContext.useAlert).mockReturnValue({
            publish: mockPublish,
            message: "",
            alertType: undefined,
        });
        jest.mocked(reactI18next.useTranslation).mockReturnValue({
            t: mockT,
        } as unknown as ReturnType<typeof reactI18next.useTranslation>);
    });

    it("should return initial state", () => {
        const { result } = renderHook(() => usePaymentsTab());

        expect(result.current.items).toEqual([]);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.selectedStudentId).toBe(null);
    });

    it("should create payment when student is selected", async () => {
        const { result } = renderHook(() => usePaymentsTab());

        act(() => {
            result.current.setSelectedStudentId("1");
        });

        const data = {
            amount: "100.00",
            paidAt: "2024-01-01T10:00:00Z",
            paymentMethod: PaymentMethod.CASH,
            notes: null,
        };

        await act(async () => {
            await result.current.handleCreate(data);
        });

        expect(mockCreateItem).toHaveBeenCalledWith({
            studentId: "1",
            data,
        });
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.paymentCreateSuccess", "success");
    });

    it("should not create payment when student is not selected", async () => {
        const { result } = renderHook(() => usePaymentsTab());

        const data = {
            amount: "100.00",
            paidAt: "2024-01-01T10:00:00Z",
            paymentMethod: PaymentMethod.CASH,
            notes: null,
        };

        await act(async () => {
            await result.current.handleCreate(data);
        });

        expect(mockCreateItem).not.toHaveBeenCalled();
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.selectStudentFirst", "error");
    });

    it("should get student name", () => {
        const { result } = renderHook(() => usePaymentsTab());

        const name = result.current.getStudentName("1");
        expect(name).toBe("John Doe");
    });
});
