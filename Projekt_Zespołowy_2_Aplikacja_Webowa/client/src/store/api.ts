import { fetchBaseQuery } from "@reduxjs/toolkit/query";

export const API_BASE_URL = "http://localhost:8001/api";

export const baseApiQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
});
