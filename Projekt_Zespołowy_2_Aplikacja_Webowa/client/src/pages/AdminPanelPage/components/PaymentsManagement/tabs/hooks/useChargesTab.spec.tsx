import { renderHook, act } from "@testing-library/react";
import { useChargesTab } from "./useChargesTab";
import * as adminApi from "../../../../../../store/admin/api";
import * as alertContext from "../../../../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";
import { UserRole } from "../../../../../../store/auth/types";
import { ChargeType } from "../../../../../../store/admin/api";

jest.mock("../../../../../../store/admin/api");
jest.mock("../../../../../../components/Alert/AlertContext");
jest.mock("react-i18next");

describe("useChargesTab", () => {
    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockCreateItem = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
    });
    const mockUpdateItem = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
    });
    const mockCancelCharge = jest.fn().mockReturnValue({
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
        jest.mocked(adminApi.useListChargesQuery).mockReturnValue({
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
        jest.mocked(adminApi.useCreateChargeMutation).mockReturnValue([mockCreateItem, { isLoading: false }] as any);
        jest.mocked(adminApi.useUpdateChargeMutation).mockReturnValue([mockUpdateItem, { isLoading: false }] as any);
        jest.mocked(adminApi.useCancelChargeMutation).mockReturnValue([mockCancelCharge, { isLoading: false }] as any);
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
        const { result } = renderHook(() => useChargesTab());

        expect(result.current.items).toEqual([]);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.selectedStudentId).toBe(null);
    });

    it("should create charge when student is selected", async () => {
        const { result } = renderHook(() => useChargesTab());

        act(() => {
            result.current.setSelectedStudentId("1");
        });

        const data = {
            amountDue: "100.00",
            dueDate: "2024-01-01",
            type: ChargeType.MONTHLY_FEE,
        };

        await act(async () => {
            await result.current.handleCreate(data);
        });

        expect(mockCreateItem).toHaveBeenCalledWith({
            studentId: "1",
            data,
        });
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.chargeCreateSuccess", "success");
    });

    it("should not create charge when student is not selected", async () => {
        const { result } = renderHook(() => useChargesTab());

        const data = {
            amountDue: "100.00",
            dueDate: "2024-01-01",
            type: ChargeType.MONTHLY_FEE,
        };

        await act(async () => {
            await result.current.handleCreate(data);
        });

        expect(mockCreateItem).not.toHaveBeenCalled();
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.selectStudentFirst", "error");
    });

    it("should get student name", () => {
        const { result } = renderHook(() => useChargesTab());

        const name = result.current.getStudentName("1");
        expect(name).toBe("John Doe");
    });
});
