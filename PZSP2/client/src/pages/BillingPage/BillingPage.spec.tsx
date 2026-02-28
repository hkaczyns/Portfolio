import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BillingPage } from "./BillingPage";
import * as billingApi from "../../store/billing/api";

jest.mock("../../store/billing/api");

describe("BillingPage", () => {
    const mockCharges = [
        {
            id: 1,
            studentId: "student-uuid-1",
            dueDate: "2025-01-30",
            amountDue: "500.00",
            type: "MONTHLY_FEE",
            status: "OPEN" as const,
            createdBy: "admin-uuid-1",
            createdAt: "2025-01-01T00:00:00Z",
        },
        {
            id: 2,
            studentId: "student-uuid-1",
            dueDate: "2025-02-15",
            amountDue: "300.00",
            type: "ADDITIONAL_CLASSES",
            status: "PAID" as const,
            createdBy: "admin-uuid-1",
            createdAt: "2025-01-10T00:00:00Z",
        },
        {
            id: 3,
            studentId: "student-uuid-1",
            dueDate: "2025-01-20",
            amountDue: "200.00",
            type: "ADJUSTMENT",
            status: "PARTIAL" as const,
            createdBy: "admin-uuid-1",
            createdAt: "2025-01-05T00:00:00Z",
        },
    ];

    const mockPayments = [
        {
            id: 1,
            userId: "student-uuid-1",
            amount: "500.00",
            paidAt: "2025-01-15T10:00:00Z",
            paymentMethod: "cash",
            notes: "Opłata gotówką",
        },
        {
            id: 2,
            userId: "student-uuid-1",
            amount: "300.00",
            paidAt: "2025-01-20T14:30:00Z",
            paymentMethod: "transfer",
            notes: null,
        },
    ];

    const mockSummary = {
        currentMonthDue: "500.00",
        totalOverdue: "200.00",
        openCharges: [
            {
                id: 1,
                studentId: "student-uuid-1",
                dueDate: "2025-01-30",
                amountDue: "500.00",
                type: "MONTHLY_FEE",
                status: "OPEN" as const,
                createdBy: "admin-uuid-1",
                createdAt: "2025-01-01T00:00:00Z",
            },
        ],
        lastPaymentAt: "2025-01-20T14:30:00Z",
        recommendedTransferTitle: "Opłata za zajęcia",
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(billingApi.useGetChargesQuery).mockReturnValue({
            data: mockCharges,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(billingApi.useGetPaymentsQuery).mockReturnValue({
            data: mockPayments,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(billingApi.useGetBillingSummaryQuery).mockReturnValue({
            data: mockSummary,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
    });

    it("should render title", () => {
        render(<BillingPage />);

        const title = screen.getByRole("heading", { level: 1 });
        expect(title).toBeInTheDocument();
        expect(title).toHaveTextContent("Moje rozliczenia");
    });

    it("should render loading state", () => {
        jest.mocked(billingApi.useGetChargesQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<BillingPage />);

        expect(screen.getByText("Ładowanie...")).toBeInTheDocument();
    });

    it("should render error state", () => {
        jest.mocked(billingApi.useGetChargesQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<BillingPage />);

        expect(screen.getByText("Wystąpił błąd podczas ładowania danych.")).toBeInTheDocument();
    });

    it("should render summary section", () => {
        render(<BillingPage />);

        expect(screen.getByText("Podsumowanie")).toBeInTheDocument();
        const currentMonthLabels = screen.getAllByText(/Do zapłaty w tym miesiącu:/);
        expect(currentMonthLabels.length).toBeGreaterThan(0);
        const overdueLabels = screen.getAllByText(/Zaległości:/);
        expect(overdueLabels.length).toBeGreaterThan(0);
    });

    it("should render open charges section", () => {
        render(<BillingPage />);

        expect(screen.getByText("Otwarte należności")).toBeInTheDocument();
        const monthlyFeeLabels = screen.getAllByText("Opłata miesięczna");
        expect(monthlyFeeLabels.length).toBeGreaterThan(0);
    });

    it("should render all charges section with filters", () => {
        render(<BillingPage />);

        expect(screen.getByText("Wszystkie należności")).toBeInTheDocument();
        expect(screen.getByLabelText("Status:")).toBeInTheDocument();
        expect(screen.getByLabelText("Typ:")).toBeInTheDocument();
    });

    it("should render payments section", () => {
        render(<BillingPage />);

        expect(screen.getByText("Historia płatności")).toBeInTheDocument();
        expect(screen.getByText("Gotówka")).toBeInTheDocument();
        expect(screen.getByText("Przelew")).toBeInTheDocument();
    });

    it("should filter charges by status", async () => {
        const user = userEvent.setup();
        render(<BillingPage />);

        const statusFilter = screen.getByLabelText("Status:") as HTMLSelectElement;
        await user.selectOptions(statusFilter, "OPEN");

        expect(statusFilter.value).toBe("OPEN");
    });

    it("should filter charges by type", async () => {
        const user = userEvent.setup();
        render(<BillingPage />);

        const typeFilter = screen.getByLabelText("Typ:") as HTMLSelectElement;
        await user.selectOptions(typeFilter, "MONTHLY_FEE");

        expect(typeFilter.value).toBe("MONTHLY_FEE");
    });

    it("should filter charges by date range", async () => {
        const user = userEvent.setup();
        render(<BillingPage />);

        const dueFromInput = screen.getByLabelText("Termin od:") as HTMLInputElement;
        await user.clear(dueFromInput);
        await user.type(dueFromInput, "2025-01-01");

        expect(dueFromInput.value).toBe("2025-01-01");
    });

    it("should filter charges by overdue status", async () => {
        const user = userEvent.setup();
        render(<BillingPage />);

        const overdueFilter = screen.getByLabelText("Zaległości:") as HTMLSelectElement;
        await user.selectOptions(overdueFilter, "true");

        expect(overdueFilter.value).toBe("true");
    });

    it("should show clear filters button when filters are active", async () => {
        const user = userEvent.setup();
        render(<BillingPage />);

        const statusFilter = screen.getByLabelText("Status:") as HTMLSelectElement;
        await user.selectOptions(statusFilter, "OPEN");

        expect(screen.getByText("Wyczyść filtry")).toBeInTheDocument();
    });

    it("should clear filters when clear button is clicked", async () => {
        const user = userEvent.setup();
        render(<BillingPage />);

        const statusFilter = screen.getByLabelText("Status:") as HTMLSelectElement;
        await user.selectOptions(statusFilter, "OPEN");

        const clearButton = screen.getByText("Wyczyść filtry");
        await user.click(clearButton);

        expect(statusFilter.value).toBe("");
    });

    it("should display formatted amounts", () => {
        render(<BillingPage />);

        const amounts = screen.getAllByText(/500,00 zł|300,00 zł|200,00 zł/);
        expect(amounts.length).toBeGreaterThan(0);
    });

    it("should display formatted dates", () => {
        render(<BillingPage />);

        const dates = screen.getAllByText(/30|01|2025/);
        expect(dates.length).toBeGreaterThan(0);
    });

    it("should display status badges with correct labels", () => {
        render(<BillingPage />);

        const openLabels = screen.getAllByText("Otwarte");
        expect(openLabels.length).toBeGreaterThan(0);

        const paidLabels = screen.getAllByText("Opłacone");
        expect(paidLabels.length).toBeGreaterThan(0);

        const partialLabels = screen.getAllByText("Częściowo opłacone");
        expect(partialLabels.length).toBeGreaterThan(0);
    });

    it("should display type labels correctly", () => {
        render(<BillingPage />);

        const monthlyFeeLabels = screen.getAllByText("Opłata miesięczna");
        expect(monthlyFeeLabels.length).toBeGreaterThan(0);

        const additionalClassesLabels = screen.getAllByText("Dodatkowe zajęcia");
        expect(additionalClassesLabels.length).toBeGreaterThan(0);

        const adjustmentLabels = screen.getAllByText("Korekta");
        expect(adjustmentLabels.length).toBeGreaterThan(0);
    });

    it("should display payment method labels correctly", () => {
        render(<BillingPage />);

        expect(screen.getByText("Gotówka")).toBeInTheDocument();
        expect(screen.getByText("Przelew")).toBeInTheDocument();
    });

    it("should display empty state when no charges or payments", () => {
        jest.mocked(billingApi.useGetChargesQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(billingApi.useGetPaymentsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(billingApi.useGetBillingSummaryQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<BillingPage />);

        expect(screen.getByText("Brak danych do wyświetlenia.")).toBeInTheDocument();
    });

    it("should display empty state when filtered charges return no results", () => {
        jest.mocked(billingApi.useGetChargesQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<BillingPage />);

        expect(screen.getByText("Brak należności spełniających wybrane kryteria.")).toBeInTheDocument();
    });

    it("should display last payment date when available", () => {
        render(<BillingPage />);

        expect(screen.getByText(/Ostatnia płatność:/)).toBeInTheDocument();
    });

    it("should display recommended transfer title when available", () => {
        render(<BillingPage />);

        expect(screen.getByText(/Tytuł przelewu:/)).toBeInTheDocument();
        expect(screen.getByText("Opłata za zajęcia")).toBeInTheDocument();
    });

    it("should display payment notes or dash when null", () => {
        render(<BillingPage />);

        expect(screen.getByText("Opłata gotówką")).toBeInTheDocument();
        expect(screen.getByText("-")).toBeInTheDocument();
    });
});
