import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../api";

export interface EnrollmentResponse {
    enrollment: {
        id: number;
        studentId: string;
        classGroupId: number;
        status: "ACTIVE" | "WAITLISTED" | "CANCELLED" | "COMPLETED";
        joinedAt: string;
        cancelledAt: string | null;
    };
    availability: {
        capacity: number;
        enrolledCount: number;
        availableSpots: number;
        waitlistCount: number;
        isFull: boolean;
        canJoinWaitlist: boolean;
    };
}

export interface EnrollmentRead {
    id: number;
    studentId: string;
    classGroupId: number;
    status: "ACTIVE" | "WAITLISTED" | "CANCELLED" | "COMPLETED";
    joinedAt: string;
    cancelledAt: string | null;
}

export interface CreateEnrollmentRequest {
    classGroupId: number;
}

export const enrollmentApi = createApi({
    reducerPath: "enrollmentApi",
    baseQuery: baseApiQuery,
    tagTypes: ["Enrollments", "ClassGroups"],
    endpoints: (builder) => ({
        getEnrollments: builder.query<EnrollmentRead[], void>({
            query: () => ({
                url: "/v1/me/enrollments",
                method: "GET",
            }),
            providesTags: ["Enrollments"],
        }),
        createEnrollment: builder.mutation<EnrollmentResponse, CreateEnrollmentRequest>({
            query: (body) => ({
                url: "/v1/me/enrollments",
                method: "POST",
                body: {
                    class_group_id: body.classGroupId,
                },
            }),
            invalidatesTags: ["Enrollments", "ClassGroups"],
        }),
        cancelEnrollment: builder.mutation<EnrollmentRead, number>({
            query: (enrollmentId) => ({
                url: `/v1/me/enrollments/${enrollmentId}/cancel`,
                method: "POST",
            }),
            invalidatesTags: ["Enrollments", "ClassGroups"],
        }),
    }),
});

export const { useGetEnrollmentsQuery, useCreateEnrollmentMutation, useCancelEnrollmentMutation } = enrollmentApi;
