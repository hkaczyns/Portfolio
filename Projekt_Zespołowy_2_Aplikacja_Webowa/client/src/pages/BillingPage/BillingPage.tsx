import { useState } from "react";
import {
    useGetChargesQuery,
    useGetPaymentsQuery,
    useGetBillingSummaryQuery,
    type GetChargesParams,
} from "../../store/billing/api";
import styles from "./BillingPage.module.css";

const formatAmount = (amount: string): string => {
    try {
        const num = parseFloat(amount);
        if (isNaN(num)) return amount;
        return new Intl.NumberFormat("pl-PL", {
            style: "currency",
            currency: "PLN",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    } catch {
        return amount;
    }
};

const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("pl-PL", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(date);
    } catch {
        return dateString;
    }
};

const getStatusLabel = (status: string): string => {
    switch (status) {
        case "OPEN":
            return "Otwarte";
        case "PAID":
            return "Opłacone";
        case "PARTIAL":
            return "Częściowo opłacone";
        case "CANCELLED":
            return "Anulowane";
        default:
            return status;
    }
};

const getStatusClassName = (status: string): string => {
    switch (status) {
        case "OPEN":
            return styles.statusOpen;
        case "PAID":
            return styles.statusPaid;
        case "PARTIAL":
            return styles.statusPartial;
        case "CANCELLED":
            return styles.statusCancelled;
        default:
            return "";
    }
};

const getTypeLabel = (type: string): string => {
    switch (type) {
        case "MONTHLY_FEE":
            return "Opłata miesięczna";
        case "ADDITIONAL_CLASSES":
            return "Dodatkowe zajęcia";
        case "ADJUSTMENT":
            return "Korekta";
        default:
            return type;
    }
};

const getPaymentMethodLabel = (method: string): string => {
    switch (method) {
        case "cash":
            return "Gotówka";
        case "transfer":
            return "Przelew";
        case "card":
            return "Karta";
        default:
            return method;
    }
};

export const BillingPage = () => {
    const [filters, setFilters] = useState<GetChargesParams>({});
    const { data: charges, isLoading: isLoadingCharges, isError: isChargesError } = useGetChargesQuery(filters);
    const { data: payments, isLoading: isLoadingPayments, isError: isPaymentsError } = useGetPaymentsQuery();
    const { data: summary, isLoading: isLoadingSummary, isError: isSummaryError } = useGetBillingSummaryQuery();

    const handleFilterChange = (key: keyof GetChargesParams, value: string | boolean | null) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value === "" || value === null ? null : value,
        }));
    };

    const handleClearFilters = () => {
        setFilters({});
    };

    const hasActiveFilters = Object.values(filters).some(
        (value) => value !== null && value !== undefined && value !== "",
    );

    const isLoading = isLoadingCharges || isLoadingPayments || isLoadingSummary;
    const isError = isChargesError || isPaymentsError || isSummaryError;

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Moje rozliczenia</h1>
                    <p className={styles.loading}>Ładowanie...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Moje rozliczenia</h1>
                    <p className={styles.error}>Wystąpił błąd podczas ładowania danych.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>Moje rozliczenia</h1>

                {summary && (
                    <div className={styles.summarySection}>
                        <h2 className={styles.sectionTitle}>Podsumowanie</h2>
                        <div className={styles.summaryGrid}>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryLabel}>Do zapłaty w tym miesiącu:</span>
                                <span className={styles.summaryValue}>{formatAmount(summary.currentMonthDue)}</span>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryLabel}>Zaległości:</span>
                                <span className={`${styles.summaryValue} ${styles.overdue}`}>
                                    {formatAmount(summary.totalOverdue)}
                                </span>
                            </div>
                            {summary.lastPaymentAt && (
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Ostatnia płatność:</span>
                                    <span className={styles.summaryValue}>{formatDate(summary.lastPaymentAt)}</span>
                                </div>
                            )}
                            {summary.recommendedTransferTitle && (
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Tytuł przelewu:</span>
                                    <span className={styles.summaryValue}>{summary.recommendedTransferTitle}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {summary && summary.openCharges && summary.openCharges.length > 0 && (
                    <div className={styles.chargesSection}>
                        <h2 className={styles.sectionTitle}>Otwarte należności</h2>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Typ</th>
                                        <th>Termin płatności</th>
                                        <th>Kwota</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.openCharges.map((charge) => (
                                        <tr key={charge.id}>
                                            <td>{getTypeLabel(charge.type)}</td>
                                            <td>{formatDate(charge.dueDate)}</td>
                                            <td>{formatAmount(charge.amountDue)}</td>
                                            <td>
                                                <span
                                                    className={`${styles.statusBadge} ${getStatusClassName(charge.status)}`}
                                                >
                                                    {getStatusLabel(charge.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className={styles.chargesSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Wszystkie należności</h2>
                        {hasActiveFilters && (
                            <button className={styles.clearFiltersButton} onClick={handleClearFilters}>
                                Wyczyść filtry
                            </button>
                        )}
                    </div>

                    <div className={styles.filtersSection}>
                        <div className={styles.filtersGrid}>
                            <div className={styles.filterGroup}>
                                <label htmlFor="status-filter" className={styles.filterLabel}>
                                    Status:
                                </label>
                                <select
                                    id="status-filter"
                                    className={styles.filterSelect}
                                    value={filters.status || ""}
                                    onChange={(e) => handleFilterChange("status", e.target.value || null)}
                                >
                                    <option value="">Wszystkie</option>
                                    <option value="OPEN">Otwarte</option>
                                    <option value="PAID">Opłacone</option>
                                    <option value="PARTIAL">Częściowo opłacone</option>
                                    <option value="CANCELLED">Anulowane</option>
                                </select>
                            </div>

                            <div className={styles.filterGroup}>
                                <label htmlFor="type-filter" className={styles.filterLabel}>
                                    Typ:
                                </label>
                                <select
                                    id="type-filter"
                                    className={styles.filterSelect}
                                    value={filters.type || ""}
                                    onChange={(e) => handleFilterChange("type", e.target.value || null)}
                                >
                                    <option value="">Wszystkie</option>
                                    <option value="MONTHLY_FEE">Opłata miesięczna</option>
                                    <option value="ADDITIONAL_CLASSES">Dodatkowe zajęcia</option>
                                    <option value="ADJUSTMENT">Korekta</option>
                                </select>
                            </div>

                            <div className={styles.filterGroup}>
                                <label htmlFor="due-from-filter" className={styles.filterLabel}>
                                    Termin od:
                                </label>
                                <input
                                    id="due-from-filter"
                                    type="date"
                                    className={styles.filterInput}
                                    value={filters.dueFrom || ""}
                                    onChange={(e) => handleFilterChange("dueFrom", e.target.value || null)}
                                />
                            </div>

                            <div className={styles.filterGroup}>
                                <label htmlFor="due-to-filter" className={styles.filterLabel}>
                                    Termin do:
                                </label>
                                <input
                                    id="due-to-filter"
                                    type="date"
                                    className={styles.filterInput}
                                    value={filters.dueTo || ""}
                                    onChange={(e) => handleFilterChange("dueTo", e.target.value || null)}
                                />
                            </div>

                            <div className={styles.filterGroup}>
                                <label htmlFor="overdue-filter" className={styles.filterLabel}>
                                    Zaległości:
                                </label>
                                <select
                                    id="overdue-filter"
                                    className={styles.filterSelect}
                                    value={
                                        filters.overdue === undefined || filters.overdue === null
                                            ? ""
                                            : filters.overdue.toString()
                                    }
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        handleFilterChange("overdue", value === "" ? null : value === "true");
                                    }}
                                >
                                    <option value="">Wszystkie</option>
                                    <option value="true">Tak</option>
                                    <option value="false">Nie</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {charges && charges.length > 0 ? (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Typ</th>
                                        <th>Termin płatności</th>
                                        <th>Kwota</th>
                                        <th>Status</th>
                                        <th>Data utworzenia</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {charges.map((charge) => (
                                        <tr key={charge.id}>
                                            <td>{getTypeLabel(charge.type)}</td>
                                            <td>{formatDate(charge.dueDate)}</td>
                                            <td>{formatAmount(charge.amountDue)}</td>
                                            <td>
                                                <span
                                                    className={`${styles.statusBadge} ${getStatusClassName(charge.status)}`}
                                                >
                                                    {getStatusLabel(charge.status)}
                                                </span>
                                            </td>
                                            <td>{formatDate(charge.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className={styles.emptyState}>Brak należności spełniających wybrane kryteria.</p>
                    )}
                </div>

                {payments && payments.length > 0 && (
                    <div className={styles.paymentsSection}>
                        <h2 className={styles.sectionTitle}>Historia płatności</h2>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Kwota</th>
                                        <th>Data płatności</th>
                                        <th>Metoda płatności</th>
                                        <th>Notatki</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td>{formatAmount(payment.amount)}</td>
                                            <td>{formatDate(payment.paidAt)}</td>
                                            <td>{getPaymentMethodLabel(payment.paymentMethod)}</td>
                                            <td>{payment.notes || "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {(!charges || charges.length === 0) && (!payments || payments.length === 0) && (
                    <p className={styles.emptyState}>Brak danych do wyświetlenia.</p>
                )}
            </div>
        </div>
    );
};
