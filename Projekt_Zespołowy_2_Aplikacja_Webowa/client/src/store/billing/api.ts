import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../api";

export interface Charge {
    id: number;
    studentId: string;
    dueDate: string;
    amountDue: string;
    type: "MONTHLY_FEE" | "ADDITIONAL_CLASSES" | "ADJUSTMENT" | string;
    status: "OPEN" | "PAID" | "PARTIAL" | "CANCELLED";
    createdBy: string;
    createdAt: string;
}

export interface GetChargesParams {
    status?: "OPEN" | "PAID" | "PARTIAL" | "CANCELLED" | null;
    type?: "MONTHLY_FEE" | "ADDITIONAL_CLASSES" | "ADJUSTMENT" | null;
    dueFrom?: string | null;
    dueTo?: string | null;
    overdue?: boolean | null;
}

export interface Payment {
    id: number;
    userId: string;
    amount: string;
    paidAt: string;
    paymentMethod: "cash" | "transfer" | "card" | string;
    notes: string | null;
}

export interface BillingSummary {
    currentMonthDue: string;
    totalOverdue: string;
    openCharges: Charge[];
    lastPaymentAt: string | null;
    recommendedTransferTitle: string;
}

export const billingApi = createApi({
    reducerPath: "billingApi",
    baseQuery: baseApiQuery,
    tagTypes: ["Charges", "Payments", "BillingSummary"],
    endpoints: (builder) => ({
        getCharges: builder.query<Charge[], GetChargesParams | void>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params) {
                    if (params.status) {
                        searchParams.append("status", params.status);
                    }
                    if (params.type) {
                        searchParams.append("type", params.type);
                    }
                    if (params.dueFrom) {
                        searchParams.append("due_from", params.dueFrom);
                    }
                    if (params.dueTo) {
                        searchParams.append("due_to", params.dueTo);
                    }
                    if (params.overdue !== undefined && params.overdue !== null) {
                        searchParams.append("overdue", params.overdue.toString());
                    }
                }
                const queryString = searchParams.toString();
                return {
                    url: `/v1/me/charges${queryString ? `?${queryString}` : ""}`,
                    method: "GET",
                };
            },
            providesTags: ["Charges"],
        }),
        getPayments: builder.query<Payment[], void>({
            query: () => ({
                url: "/v1/me/payments",
                method: "GET",
            }),
            providesTags: ["Payments"],
        }),
        getBillingSummary: builder.query<BillingSummary, void>({
            query: () => ({
                url: "/v1/me/billing/summary",
                method: "GET",
            }),
            providesTags: ["BillingSummary"],
        }),
    }),
});

export const { useGetChargesQuery, useGetPaymentsQuery, useGetBillingSummaryQuery } = billingApi;
