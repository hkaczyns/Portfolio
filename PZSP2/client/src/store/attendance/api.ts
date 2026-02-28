import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../api";

export interface AttendanceRecord {
    id: number;
    sessionId: number;
    studentId: string;
    status: "PRESENT" | "ABSENT" | "EXCUSED";
    isMakeup: boolean;
    date: string;
    classGroupId: number;
    classGroupName: string;
    semesterId: number | null;
    semesterName: string | null;
}

export interface GetAttendanceParams {
    semesterId?: number | null;
    classGroupId?: number | null;
    from?: string | null;
    to?: string | null;
    status?: "PRESENT" | "ABSENT" | "EXCUSED" | null;
    isMakeup?: boolean | null;
}

export interface AttendanceSummary {
    totalCount: number;
    presentCount: number;
    absentCount: number;
    excusedCount: number;
    makeupCount: number;
    attendanceRate: number;
}

export const attendanceApi = createApi({
    reducerPath: "attendanceApi",
    baseQuery: baseApiQuery,
    tagTypes: ["Attendance", "AttendanceSummary"],
    endpoints: (builder) => ({
        getAttendance: builder.query<AttendanceRecord[], GetAttendanceParams | void>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params) {
                    if (params.semesterId !== undefined && params.semesterId !== null) {
                        searchParams.append("semester_id", params.semesterId.toString());
                    }
                    if (params.classGroupId !== undefined && params.classGroupId !== null) {
                        searchParams.append("class_group_id", params.classGroupId.toString());
                    }
                    if (params.from) {
                        searchParams.append("from", params.from);
                    }
                    if (params.to) {
                        searchParams.append("to", params.to);
                    }
                    if (params.status) {
                        searchParams.append("status", params.status);
                    }
                    if (params.isMakeup !== undefined && params.isMakeup !== null) {
                        searchParams.append("is_makeup", params.isMakeup.toString());
                    }
                }
                const queryString = searchParams.toString();
                return {
                    url: `/v1/me/attendance${queryString ? `?${queryString}` : ""}`,
                    method: "GET",
                };
            },
            providesTags: ["Attendance"],
        }),
        getAttendanceSummary: builder.query<AttendanceSummary, void>({
            query: () => ({
                url: "/v1/me/attendance/summary",
                method: "GET",
            }),
            providesTags: ["AttendanceSummary"],
        }),
    }),
});

export const { useGetAttendanceQuery, useGetAttendanceSummaryQuery } = attendanceApi;
