import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../api";

export interface ContactInfo {
    contact_email: string;
    phone_number: string;
    address: string;
    open_hours: string;
}

export const publicApi = createApi({
    reducerPath: "publicApi",
    baseQuery: baseApiQuery,
    tagTypes: ["Contact"],
    endpoints: (builder) => ({
        getContact: builder.query<ContactInfo, void>({
            query: () => ({ url: "/v1/public/contact", method: "GET" }),
            providesTags: ["Contact"],
        }),
    }),
});

export const { useGetContactQuery } = publicApi;
