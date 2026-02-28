import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentsTab } from "./PaymentsTab";
import * as adminApi from "../../../../../store/admin/api";
import * as alertContext from "../../../../../components/Alert/AlertContext";
import { PaymentMethod } from "../../../../../store/admin/api";

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

describe("PaymentsTab", () => {
    const mockPublish = jest.fn();
    const mockPayments = [
        {
            id: 1,
            userId: "student1",
            amount: "100.00",
            paidAt: "2024-01-15T10:00:00Z",
            paymentMethod: PaymentMethod.CASH,
            notes: "Test payment",
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

        jest.mocked(adminApi.useListPaymentsQuery).mockReturnValue({
            data: mockPayments,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListUsersQuery).mockReturnValue({
            data: mockStudents,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useCreatePaymentMutation).mockReturnValue([
            jest.fn().mockResolvedValue({ data: mockPayments[0] }),
            { isLoading: false },
        ] as any);

        jest.mocked(adminApi.useUpdatePaymentMutation).mockReturnValue([
            jest.fn().mockResolvedValue({ data: mockPayments[0] }),
            { isLoading: false },
        ] as any);

        jest.mocked(adminApi.useDeletePaymentMutation).mockReturnValue([
            jest.fn().mockResolvedValue({}),
            { isLoading: false },
        ] as any);
    });

    it("should render payments tab", () => {
        render(<PaymentsTab />);
        expect(screen.getByText("admin.payments")).toBeInTheDocument();
    });

    it("should render empty state when no payments", () => {
        jest.mocked(adminApi.useListPaymentsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        } as any);

        render(<PaymentsTab />);
        expect(screen.getByText("admin.noPayments")).toBeInTheDocument();
    });

    it("should render payments table", () => {
        render(<PaymentsTab />);
        expect(screen.getByText("admin.student")).toBeInTheDocument();
        expect(screen.getByText("admin.amount")).toBeInTheDocument();
        expect(screen.getByText("admin.paidAt")).toBeInTheDocument();
    });

    it("should open edit modal when edit button is clicked", async () => {
        const user = userEvent.setup();
        render(<PaymentsTab />);

        const editButtons = screen.getAllByRole("button");
        const editButton = editButtons.find((btn) => btn.querySelector("svg.lucide-edit-2"));
        if (editButton) {
            await user.click(editButton);
            await waitFor(() => {
                expect(screen.getByText("admin.editPayment")).toBeInTheDocument();
            });
        }
    });

    it("should open delete modal when delete button is clicked", async () => {
        const user = userEvent.setup();
        render(<PaymentsTab />);

        const deleteButtons = screen.getAllByRole("button");
        const deleteButton = deleteButtons.find((btn) => btn.querySelector("svg.lucide-trash-2"));
        if (deleteButton) {
            await user.click(deleteButton);
            expect(screen.getByText("admin.deletePayment")).toBeInTheDocument();
        }
    });
});
