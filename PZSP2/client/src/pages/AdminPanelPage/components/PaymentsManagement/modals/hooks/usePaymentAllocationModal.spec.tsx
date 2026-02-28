import { renderHook, act } from "@testing-library/react";
import { usePaymentAllocationModal } from "./usePaymentAllocationModal";
import * as adminApi from "../../../../../../store/admin/api";
import * as alertContext from "../../../../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";

jest.mock("../../../../../../store/admin/api");
jest.mock("../../../../../../components/Alert/AlertContext");
jest.mock("react-i18next");

describe("usePaymentAllocationModal", () => {
    const mockCharges = [
        {
            id: 1,
            studentId: "1",
            amountDue: "100.00",
            dueDate: "2024-01-01",
            type: "MONTHLY_FEE",
            status: "OPEN",
        },
        {
            id: 2,
            studentId: "1",
            amountDue: "50.00",
            dueDate: "2024-02-01",
            type: "ADDITIONAL_CLASSES",
            status: "CANCELLED",
        },
    ];

    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockCreateAllocation = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
    });
    const mockUpdateAllocation = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(adminApi.useListChargesQuery).mockReturnValue({
            data: mockCharges,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(adminApi.useCreatePaymentAllocationMutation).mockReturnValue([
            mockCreateAllocation,
            { isLoading: false },
        ] as any);
        jest.mocked(adminApi.useUpdatePaymentAllocationMutation).mockReturnValue([
            mockUpdateAllocation,
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

    it("should return initial values when no initialData", () => {
        const { result } = renderHook(() => usePaymentAllocationModal(1));

        expect(result.current.isEdit).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.initialValues.chargeId).toBe(0);
        expect(result.current.initialValues.amountAllocated).toBe("");
    });

    it("should return initial values from initialData", () => {
        const initialData = {
            paymentId: 1,
            chargeId: 2,
            amountAllocated: "75.50",
        };

        const { result } = renderHook(() => usePaymentAllocationModal(1, initialData));

        expect(result.current.isEdit).toBe(true);
        expect(result.current.initialValues.chargeId).toBe(2);
        expect(result.current.initialValues.amountAllocated).toBe("75.50");
    });

    it("should filter out cancelled charges", () => {
        const { result } = renderHook(() => usePaymentAllocationModal(1));

        expect(result.current.availableCharges).toHaveLength(1);
        expect(result.current.availableCharges[0].id).toBe(1);
    });

    it("should create allocation when not in edit mode", async () => {
        const mockOnClose = jest.fn();
        const { result } = renderHook(() => usePaymentAllocationModal(1));

        const values = {
            chargeId: 1,
            amountAllocated: "100.00",
        };

        await act(async () => {
            await result.current.handleSubmit(values, mockOnClose);
        });

        expect(mockCreateAllocation).toHaveBeenCalledWith({
            paymentId: 1,
            data: values,
        });
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.allocationCreateSuccess", "success");
        expect(mockOnClose).toHaveBeenCalled();
    });

    it("should update allocation when in edit mode", async () => {
        const mockOnClose = jest.fn();
        const initialData = {
            paymentId: 1,
            chargeId: 2,
            amountAllocated: "75.50",
        };
        const { result } = renderHook(() => usePaymentAllocationModal(1, initialData));

        const values = {
            chargeId: 2,
            amountAllocated: "100.00",
        };

        await act(async () => {
            await result.current.handleSubmit(values, mockOnClose);
        });

        expect(mockUpdateAllocation).toHaveBeenCalledWith({
            paymentId: 1,
            chargeId: 2,
            data: { amountAllocated: "100.00" },
        });
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.allocationUpdateSuccess", "success");
        expect(mockOnClose).toHaveBeenCalled();
    });

    it("should handle error", async () => {
        const mockOnClose = jest.fn();
        const mockCreateAllocationWithError = jest.fn().mockReturnValue({
            unwrap: jest.fn().mockRejectedValue(new Error("Error")),
        });
        jest.mocked(adminApi.useCreatePaymentAllocationMutation).mockReturnValue([
            mockCreateAllocationWithError,
            { isLoading: false },
        ] as any);
        const { result } = renderHook(() => usePaymentAllocationModal(1));

        const values = {
            chargeId: 1,
            amountAllocated: "100.00",
        };

        await act(async () => {
            await result.current.handleSubmit(values, mockOnClose);
        });

        expect(mockPublish).toHaveBeenCalledWith("translated.admin.allocationCreateError", "error");
        expect(mockOnClose).not.toHaveBeenCalled();
    });
});
