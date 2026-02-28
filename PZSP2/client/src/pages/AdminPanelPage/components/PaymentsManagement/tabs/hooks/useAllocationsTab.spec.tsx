import { renderHook, act } from "@testing-library/react";
import { useAllocationsTab } from "./useAllocationsTab";
import * as adminApi from "../../../../../../store/admin/api";
import * as alertContext from "../../../../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";
import { UserRole } from "../../../../../../store/auth/types";
import { PaymentMethod, ChargeType, ChargeStatus } from "../../../../../../store/admin/api";

jest.mock("../../../../../../store/admin/api");
jest.mock("../../../../../../components/Alert/AlertContext");
jest.mock("react-i18next");

describe("useAllocationsTab", () => {
    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string, params?: any) => {
        if (params) {
            return `translated.${key}.${JSON.stringify(params)}`;
        }
        return `translated.${key}`;
    });
    const mockDeleteItem = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
    });

    const mockPayments = [
        {
            id: 1,
            userId: "1",
            amount: "100.00",
            paidAt: "2024-01-01",
            paymentMethod: PaymentMethod.CASH,
            notes: null,
        },
    ];

    const mockCharges = [
        {
            id: 1,
            studentId: "1",
            amountDue: "50.00",
            dueDate: "2024-01-01",
            type: ChargeType.MONTHLY_FEE,
            status: ChargeStatus.OPEN,
            createdBy: null,
            createdAt: "2024-01-01T10:00:00Z",
        },
    ];

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
        jest.mocked(adminApi.useListPaymentAllocationsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(adminApi.useListPaymentsQuery).mockReturnValue({
            data: mockPayments,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(adminApi.useListChargesQuery).mockReturnValue({
            data: mockCharges,
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
        jest.mocked(adminApi.useDeletePaymentAllocationMutation).mockReturnValue([
            mockDeleteItem,
            { isLoading: false },
        ] as any);
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
        const { result } = renderHook(() => useAllocationsTab());

        expect(result.current.allocations).toEqual([]);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.selectedPaymentId).toBe(null);
    });

    it("should delete allocation", async () => {
        const mockAllocation = {
            paymentId: 1,
            chargeId: 2,
            amountAllocated: "50.00",
        };
        const { result } = renderHook(() => useAllocationsTab());

        act(() => {
            result.current.setDeletingItem(mockAllocation);
        });

        await act(async () => {
            await result.current.handleDelete();
        });

        expect(mockDeleteItem).toHaveBeenCalledWith({
            paymentId: 1,
            chargeId: 2,
        });
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.allocationDeleteSuccess", "success");
    });

    it("should get payment info", () => {
        const { result } = renderHook(() => useAllocationsTab());

        const info = result.current.getPaymentInfo(1);
        expect(info).toContain("John Doe");
        expect(info).toContain("100.00");
    });

    it("should get charge info", () => {
        const { result } = renderHook(() => useAllocationsTab());

        const info = result.current.getChargeInfo(1);
        expect(info).toContain("50.00");
    });
});
