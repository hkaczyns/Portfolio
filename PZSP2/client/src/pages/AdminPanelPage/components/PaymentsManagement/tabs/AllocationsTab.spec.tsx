import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AllocationsTab } from "./AllocationsTab";
import * as adminApi from "../../../../../store/admin/api";
import * as alertContext from "../../../../../components/Alert/AlertContext";
import { PaymentMethod, ChargeType, ChargeStatus } from "../../../../../store/admin/api";

jest.mock("../../../../../store/admin/api");
jest.mock("../../../../../components/Alert/AlertContext");
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock("@radix-ui/react-dialog", () => ({
    Root: ({ children, open }: any) => (open ? <div>{children}</div> : null),
    Portal: ({ children }: any) => <div>{children}</div>,
    Overlay: () => <div />,
    Content: ({ children }: any) => <div>{children}</div>,
    Title: ({ children }: any) => <h2>{children}</h2>,
    Close: ({ children, asChild }: any) => (asChild ? children : <button>{children}</button>),
}));

describe("AllocationsTab", () => {
    const mockPublish = jest.fn();
    const mockAllocations = [
        {
            paymentId: 1,
            chargeId: 1,
            amountAllocated: "100.00",
        },
    ];
    const mockPayments = [
        {
            id: 1,
            userId: "student1",
            amount: "100.00",
            paidAt: "2024-01-15T10:00:00Z",
            paymentMethod: PaymentMethod.CASH,
            notes: null,
        },
    ];
    const mockCharges = [
        {
            id: 1,
            studentId: "student1",
            amountDue: "150.00",
            dueDate: "2024-02-01",
            type: ChargeType.MONTHLY_FEE,
            status: ChargeStatus.OPEN,
            createdBy: null,
            createdAt: "2024-01-01T10:00:00Z",
        },
    ];
    const mockStudents = [
        { id: "student1", firstName: "John", lastName: "Doe", email: "john@example.com", role: "STUDENT" },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(alertContext.useAlert).mockReturnValue({
            publish: mockPublish,
        } as any);

        jest.mocked(adminApi.useListPaymentAllocationsQuery).mockReturnValue({
            data: mockAllocations,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListPaymentsQuery).mockReturnValue({
            data: mockPayments,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListChargesQuery).mockReturnValue({
            data: mockCharges,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListUsersQuery).mockReturnValue({
            data: mockStudents,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useCreatePaymentAllocationMutation).mockReturnValue([
            jest.fn().mockResolvedValue({ data: mockAllocations[0] }),
            { isLoading: false },
        ] as any);

        jest.mocked(adminApi.useUpdatePaymentAllocationMutation).mockReturnValue([
            jest.fn().mockResolvedValue({ data: mockAllocations[0] }),
            { isLoading: false },
        ] as any);

        jest.mocked(adminApi.useDeletePaymentAllocationMutation).mockReturnValue([
            jest.fn().mockResolvedValue({}),
            { isLoading: false },
        ] as any);
    });

    it("should render allocations tab", () => {
        render(<AllocationsTab />);
        expect(screen.getByText("admin.allocations")).toBeInTheDocument();
    });

    it("should render empty state when no payment selected", () => {
        render(<AllocationsTab />);
        expect(screen.getByText("admin.selectPaymentToViewAllocations")).toBeInTheDocument();
    });

    it("should render allocations table when payment is selected", async () => {
        const user = userEvent.setup();
        render(<AllocationsTab />);

        const paymentSelect = screen.getByDisplayValue("admin.selectPayment");
        await user.selectOptions(paymentSelect, "1");

        await waitFor(() => {
            expect(screen.getByText("admin.charge")).toBeInTheDocument();
            expect(screen.getByText("admin.amountAllocated")).toBeInTheDocument();
        });
    });

    it("should open create modal when add button is clicked", async () => {
        const user = userEvent.setup();
        render(<AllocationsTab />);

        const paymentSelect = screen.getByDisplayValue("admin.selectPayment");
        await user.selectOptions(paymentSelect, "1");

        await waitFor(() => {
            const addButtons = screen.getAllByText("admin.addAllocation");
            const addButton = addButtons.find((btn) => btn.closest("button"));
            if (addButton) {
                user.click(addButton);
            }
        });

        await waitFor(() => {
            const modalTitles = screen.getAllByText("admin.addAllocation");
            expect(modalTitles.length).toBeGreaterThan(1);
        });
    });
});
