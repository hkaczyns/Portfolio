import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../api";
import type { UserResponse } from "../auth/types";
import { UserRole } from "../auth/types";
import { DEFAULT_CACHE_TIME } from "../../constants/constants";

export interface ListUsersParams {
    role?: UserRole;
    is_active?: boolean;
    search?: string;
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: "asc" | "desc";
}

export interface UpdateUserParams {
    userId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    role?: string;
}

export interface EnrollmentRead {
    id: number;
    studentId: string;
    classGroupId: number;
    status: string;
    joinedAt: string;
    cancelledAt: string | null;
}

export interface EnrollmentCreate {
    studentId: string;
    classGroupId: number;
    status?: string;
}

export interface EnrollmentUpdate {
    status?: string;
}

export interface ListEnrollmentsParams {
    classGroupId?: number;
    studentId?: string;
    status?: string;
    semesterId?: number;
}

export interface AttendanceRead {
    id: number;
    classSessionId: number;
    studentId: string;
    status: string;
    markedBy: string | null;
    markedAt: string | null;
    isMakeup: boolean;
}

export interface AttendanceCreate {
    classSessionId: number;
    studentId: string;
    status: string;
    isMakeup?: boolean;
    markedBy?: string | null;
}

export interface AttendanceUpdate {
    status?: string;
    isMakeup?: boolean;
    markedBy?: string | null;
}

export interface AttendanceBulkItem {
    studentId: string;
    status: string;
    isMakeup?: boolean;
}

export interface AttendanceBulkCreate {
    items: AttendanceBulkItem[];
}

export interface ListAttendanceParams {
    studentId?: string;
    classGroupId?: number;
    sessionId?: number;
    instructorId?: string;
    semesterId?: number;
    fromDate?: string;
    toDate?: string;
    status?: string;
    isMakeup?: boolean;
    limit?: number;
    offset?: number;
}

export interface SessionAttendanceStudent {
    studentId: string;
    firstName: string;
    lastName: string;
    enrollmentStatus: string;
    attendanceId: number | null;
    status: string | null;
    isMakeup: boolean | null;
}

export enum PaymentMethod {
    CASH = "cash",
    TRANSFER = "transfer",
    CARD = "card",
}

export enum ChargeType {
    MONTHLY_FEE = "MONTHLY_FEE",
    ADDITIONAL_CLASSES = "ADDITIONAL_CLASSES",
    ADJUSTMENT = "ADJUSTMENT",
}

export enum ChargeStatus {
    OPEN = "OPEN",
    PAID = "PAID",
    PARTIAL = "PARTIAL",
    CANCELLED = "CANCELLED",
}

export interface PaymentRead {
    id: number;
    userId: string;
    amount: string;
    paidAt: string;
    paymentMethod: PaymentMethod;
    notes: string | null;
}

export interface PaymentCreate {
    amount: string;
    paidAt: string;
    paymentMethod: PaymentMethod;
    notes?: string | null;
}

export interface PaymentUpdate {
    amount?: string;
    paidAt?: string;
    paymentMethod?: PaymentMethod;
    notes?: string | null;
}

export interface ListPaymentsParams {
    studentId?: string;
    paidFrom?: string;
    paidTo?: string;
    method?: PaymentMethod;
}

export interface ChargeRead {
    id: number;
    studentId: string;
    dueDate: string;
    amountDue: string;
    type: ChargeType;
    status: ChargeStatus;
    createdBy: string | null;
    createdAt: string;
}

export interface ChargeCreate {
    dueDate: string;
    amountDue: string;
    type: ChargeType;
}

export interface ChargeUpdate {
    dueDate?: string;
    amountDue?: string;
    type?: ChargeType;
    status?: ChargeStatus;
}

export interface ListChargesParams {
    studentId?: string;
    status?: ChargeStatus;
    type?: ChargeType;
    dueFrom?: string;
    dueTo?: string;
    overdue?: boolean;
}

export interface PaymentAllocationRead {
    paymentId: number;
    chargeId: number;
    amountAllocated: string;
}

export interface PaymentAllocationCreate {
    chargeId: number;
    amountAllocated: string;
}

export interface PaymentAllocationUpdate {
    amountAllocated: string;
}

export interface BillingSummary {
    totalOpen: string;
    totalOverdue: string;
    nextDueDate: string | null;
    openCharges: ChargeRead[];
}

export interface ClassGroupRead {
    id: number;
    semesterId: number;
    name: string;
    description: string | null;
    levelId: number;
    topicId: number;
    roomId: number | null;
    capacity: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    instructorId: string | null;
    isPublic: boolean;
    status: string;
    createdAt: string;
    updatedAt: string | null;
}

export interface AttendanceSummary {
    totalCount: number;
    presentCount: number;
    absentCount: number;
    excusedCount: number;
    makeupCount: number;
    attendanceRate: number | null;
}

export interface AdminUserActivityStats {
    enrollmentsTotal?: number;
    enrollmentsActive?: number;
    attendanceSummary?: AttendanceSummary;
    classGroupsTotal?: number;
    classSessionsTotal?: number;
}

export interface AdminUserDetail extends UserResponse {
    classGroups: ClassGroupRead[];
    enrollments: EnrollmentRead[];
    activityStats: AdminUserActivityStats | null;
}

export interface RoomRead {
    id: number;
    name: string;
    capacity: number | null;
    description: string | null;
    isAvailableForRental: boolean;
    hourlyRate: string | null;
    isActive: boolean;
    createdAt: string;
}

export interface RoomCreate {
    name: string;
    capacity?: number | null;
    description?: string | null;
    isAvailableForRental?: boolean;
    hourlyRate?: string | null;
    isActive?: boolean;
}

export interface RoomUpdate {
    name?: string;
    capacity?: number | null;
    description?: string | null;
    isAvailableForRental?: boolean;
    hourlyRate?: string | null;
    isActive?: boolean;
}

export interface ClassSessionRead {
    id: number;
    classGroupId: number;
    date: string;
    startTime: string;
    endTime: string;
    instructorId: string | null;
    roomId: number | null;
    notes: string | null;
    status: string;
    cancellationReason: string | null;
    rescheduledFromId: number | null;
    createdAt: string;
}

export interface ClassSessionCreate {
    classGroupId: number;
    date: string;
    startTime: string;
    endTime: string;
    instructorId?: string | null;
    roomId?: number | null;
    notes?: string | null;
    status?: string;
}

export interface ClassSessionUpdate {
    classGroupId?: number;
    date?: string;
    startTime?: string;
    endTime?: string;
    instructorId?: string | null;
    roomId?: number | null;
    notes?: string | null;
    status?: string;
    cancellationReason?: string | null;
}

export interface ClassSessionCancel {
    reason?: string | null;
}

export interface ClassSessionComplete {
    notes?: string | null;
}

export interface ClassSessionReschedule {
    newDate: string;
    newStartTime: string;
    newEndTime: string;
    reason?: string | null;
}

export interface ListClassSessionsParams {
    fromDate?: string;
    toDate?: string;
    classGroupId?: number;
    status?: string;
    roomId?: number;
}

export interface SemesterRead {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
    createdBy: string | null;
    updatedAt: string | null;
}

export interface SemesterCreate {
    name: string;
    startDate: string;
    endDate: string;
    isActive?: boolean;
}

export interface SemesterUpdate {
    name?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
}

export interface SkillLevelRead {
    id: number;
    name: string;
    description: string | null;
}

export interface SkillLevelCreate {
    name: string;
    description?: string | null;
}

export interface SkillLevelUpdate {
    name?: string;
    description?: string | null;
}

export interface TopicRead {
    id: number;
    name: string;
    description: string | null;
}

export interface TopicCreate {
    name: string;
    description?: string | null;
}

export interface TopicUpdate {
    name?: string;
    description?: string | null;
}

export interface ClassGroupCreate {
    semesterId: number;
    name: string;
    description?: string | null;
    levelId: number;
    topicId: number;
    roomId?: number | null;
    capacity: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    instructorId?: string | null;
    isPublic?: boolean;
    status?: string;
}

export interface ClassGroupUpdate {
    semesterId?: number;
    name?: string;
    description?: string | null;
    levelId?: number;
    topicId?: number;
    roomId?: number | null;
    capacity?: number;
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    instructorId?: string | null;
    isPublic?: boolean;
    status?: string;
}

export interface ClassGroupGenerateSessions {
    startDate: string;
    endDate: string;
    skipDates?: string[];
}

export const adminApi = createApi({
    reducerPath: "adminApi",
    baseQuery: baseApiQuery,
    tagTypes: [
        "Users",
        "Rooms",
        "ClassSessions",
        "ClassGroups",
        "Semesters",
        "SkillLevels",
        "Topics",
        "Enrollments",
        "Attendance",
        "Payments",
        "Charges",
        "PaymentAllocations",
    ],
    endpoints: (builder) => ({
        listUsers: builder.query<UserResponse[], ListUsersParams>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params.role) searchParams.append("role", params.role);
                if (params.is_active !== undefined) searchParams.append("is_active", String(params.is_active));
                if (params.search) searchParams.append("search", params.search);
                if (params.page) searchParams.append("page", String(params.page));
                if (params.page_size) searchParams.append("page_size", String(params.page_size));
                if (params.sort_by) searchParams.append("sort_by", params.sort_by);
                if (params.sort_order) searchParams.append("sort_order", params.sort_order);

                return {
                    url: `/v1/admin/users?${searchParams.toString()}`,
                    method: "GET",
                };
            },
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["Users"],
        }),
        getUserDetails: builder.query<AdminUserDetail, string>({
            query: (userId) => ({
                url: `/v1/admin/users/${userId}`,
                method: "GET",
            }),
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["Users"],
        }),
        listInstructors: builder.query<UserResponse[], void>({
            query: () => ({
                url: `/v1/admin/users/instructors`,
                method: "GET",
            }),
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["Users"],
        }),
        updateUser: builder.mutation<UserResponse, UpdateUserParams>({
            query: ({ userId, ...body }) => ({
                url: `/v1/users/${userId}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["Users"],
        }),
        deleteUser: builder.mutation<void, string>({
            query: (userId) => ({
                url: `/v1/users/${userId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Users"],
        }),
        listRooms: builder.query<RoomRead[], void>({
            query: () => ({
                url: `/v1/admin/schedule/rooms`,
                method: "GET",
            }),
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["Rooms"],
        }),
        createRoom: builder.mutation<RoomRead, RoomCreate>({
            query: (body) => ({
                url: `/v1/admin/schedule/rooms`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["Rooms"],
        }),
        updateRoom: builder.mutation<RoomRead, { roomId: number; data: RoomUpdate }>({
            query: ({ roomId, data }) => ({
                url: `/v1/admin/schedule/rooms/${roomId}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Rooms"],
        }),
        deleteRoom: builder.mutation<void, number>({
            query: (roomId) => ({
                url: `/v1/admin/schedule/rooms/${roomId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Rooms"],
        }),
        listClassSessions: builder.query<ClassSessionRead[], ListClassSessionsParams>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params.fromDate) searchParams.append("from_date", params.fromDate);
                if (params.toDate) searchParams.append("to_date", params.toDate);
                if (params.classGroupId) searchParams.append("class_group_id", String(params.classGroupId));
                if (params.status) searchParams.append("status", params.status);
                if (params.roomId) searchParams.append("room_id", String(params.roomId));

                return {
                    url: `/v1/admin/schedule/class-sessions?${searchParams.toString()}`,
                    method: "GET",
                };
            },
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["ClassSessions"],
        }),
        createClassSession: builder.mutation<ClassSessionRead, ClassSessionCreate>({
            query: (body) => ({
                url: `/v1/admin/schedule/class-sessions`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["ClassSessions"],
        }),
        updateClassSession: builder.mutation<ClassSessionRead, { sessionId: number; data: ClassSessionUpdate }>({
            query: ({ sessionId, data }) => ({
                url: `/v1/admin/schedule/class-sessions/${sessionId}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["ClassSessions"],
        }),
        deleteClassSession: builder.mutation<void, number>({
            query: (sessionId) => ({
                url: `/v1/admin/schedule/class-sessions/${sessionId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ClassSessions"],
        }),
        cancelClassSession: builder.mutation<ClassSessionRead, { sessionId: number; data: ClassSessionCancel }>({
            query: ({ sessionId, data }) => ({
                url: `/v1/admin/schedule/class-sessions/${sessionId}/cancel`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["ClassSessions"],
        }),
        completeClassSession: builder.mutation<ClassSessionRead, { sessionId: number; data: ClassSessionComplete }>({
            query: ({ sessionId, data }) => ({
                url: `/v1/admin/schedule/class-sessions/${sessionId}/complete`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["ClassSessions"],
        }),
        rescheduleClassSession: builder.mutation<ClassSessionRead, { sessionId: number; data: ClassSessionReschedule }>(
            {
                query: ({ sessionId, data }) => ({
                    url: `/v1/admin/schedule/class-sessions/${sessionId}/reschedule`,
                    method: "POST",
                    body: data,
                }),
                invalidatesTags: ["ClassSessions"],
            },
        ),
        listClassGroups: builder.query<ClassGroupRead[], void>({
            query: () => ({
                url: `/v1/admin/schedule/class-groups`,
                method: "GET",
            }),
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["ClassGroups"],
        }),
        createClassGroup: builder.mutation<ClassGroupRead, ClassGroupCreate>({
            query: (body) => ({
                url: `/v1/admin/schedule/class-groups`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["ClassGroups"],
        }),
        updateClassGroup: builder.mutation<ClassGroupRead, { classGroupId: number; data: ClassGroupUpdate }>({
            query: ({ classGroupId, data }) => ({
                url: `/v1/admin/schedule/class-groups/${classGroupId}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["ClassGroups"],
        }),
        deleteClassGroup: builder.mutation<void, number>({
            query: (classGroupId) => ({
                url: `/v1/admin/schedule/class-groups/${classGroupId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ClassGroups"],
        }),
        generateClassGroupSessions: builder.mutation<
            ClassSessionRead[],
            { classGroupId: number; data: ClassGroupGenerateSessions }
        >({
            query: ({ classGroupId, data }) => ({
                url: `/v1/admin/schedule/class-groups/${classGroupId}/generate-sessions`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["ClassSessions", "ClassGroups"],
        }),
        listSemesters: builder.query<SemesterRead[], void>({
            query: () => ({
                url: `/v1/admin/schedule/semesters`,
                method: "GET",
            }),
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["Semesters"],
        }),
        createSemester: builder.mutation<SemesterRead, SemesterCreate>({
            query: (body) => ({
                url: `/v1/admin/schedule/semesters`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["Semesters"],
        }),
        updateSemester: builder.mutation<SemesterRead, { semesterId: number; data: SemesterUpdate }>({
            query: ({ semesterId, data }) => ({
                url: `/v1/admin/schedule/semesters/${semesterId}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Semesters"],
        }),
        deleteSemester: builder.mutation<void, number>({
            query: (semesterId) => ({
                url: `/v1/admin/schedule/semesters/${semesterId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Semesters"],
        }),
        listSkillLevels: builder.query<SkillLevelRead[], void>({
            query: () => ({
                url: `/v1/admin/schedule/skill-levels`,
                method: "GET",
            }),
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["SkillLevels"],
        }),
        createSkillLevel: builder.mutation<SkillLevelRead, SkillLevelCreate>({
            query: (body) => ({
                url: `/v1/admin/schedule/skill-levels`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["SkillLevels"],
        }),
        updateSkillLevel: builder.mutation<SkillLevelRead, { levelId: number; data: SkillLevelUpdate }>({
            query: ({ levelId, data }) => ({
                url: `/v1/admin/schedule/skill-levels/${levelId}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["SkillLevels"],
        }),
        deleteSkillLevel: builder.mutation<void, number>({
            query: (levelId) => ({
                url: `/v1/admin/schedule/skill-levels/${levelId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["SkillLevels"],
        }),
        listTopics: builder.query<TopicRead[], void>({
            query: () => ({
                url: `/v1/admin/schedule/topics`,
                method: "GET",
            }),
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["Topics"],
        }),
        createTopic: builder.mutation<TopicRead, TopicCreate>({
            query: (body) => ({
                url: `/v1/admin/schedule/topics`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["Topics"],
        }),
        updateTopic: builder.mutation<TopicRead, { topicId: number; data: TopicUpdate }>({
            query: ({ topicId, data }) => ({
                url: `/v1/admin/schedule/topics/${topicId}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Topics"],
        }),
        deleteTopic: builder.mutation<void, number>({
            query: (topicId) => ({
                url: `/v1/admin/schedule/topics/${topicId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Topics"],
        }),
        listEnrollments: builder.query<EnrollmentRead[], ListEnrollmentsParams>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params.classGroupId) searchParams.append("class_group_id", String(params.classGroupId));
                if (params.studentId) searchParams.append("student_id", params.studentId);
                if (params.status) searchParams.append("status", params.status);
                if (params.semesterId) searchParams.append("semester_id", String(params.semesterId));
                return {
                    url: `/v1/admin/enrollments?${searchParams.toString()}`,
                    method: "GET",
                };
            },
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["Enrollments"],
        }),
        createEnrollment: builder.mutation<EnrollmentRead, EnrollmentCreate>({
            query: (body) => ({
                url: `/v1/admin/enrollments`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["Enrollments", "ClassGroups"],
        }),
        updateEnrollment: builder.mutation<EnrollmentRead, { enrollmentId: number; data: EnrollmentUpdate }>({
            query: ({ enrollmentId, data }) => ({
                url: `/v1/admin/enrollments/${enrollmentId}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Enrollments", "ClassGroups"],
        }),
        deleteEnrollment: builder.mutation<void, number>({
            query: (enrollmentId) => ({
                url: `/v1/admin/enrollments/${enrollmentId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Enrollments", "ClassGroups"],
        }),
        promoteWaitlist: builder.mutation<EnrollmentRead, number>({
            query: (enrollmentId) => ({
                url: `/v1/admin/enrollments/${enrollmentId}/promote`,
                method: "POST",
            }),
            invalidatesTags: ["Enrollments", "ClassGroups"],
        }),
        listAttendance: builder.query<AttendanceRead[], ListAttendanceParams>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params.studentId) searchParams.append("student_id", params.studentId);
                if (params.classGroupId) searchParams.append("class_group_id", String(params.classGroupId));
                if (params.sessionId) searchParams.append("session_id", String(params.sessionId));
                if (params.instructorId) searchParams.append("instructor_id", params.instructorId);
                if (params.semesterId) searchParams.append("semester_id", String(params.semesterId));
                if (params.fromDate) searchParams.append("from", params.fromDate);
                if (params.toDate) searchParams.append("to", params.toDate);
                if (params.status) searchParams.append("status", params.status);
                if (params.isMakeup !== undefined) searchParams.append("is_makeup", String(params.isMakeup));
                if (params.limit) searchParams.append("limit", String(params.limit));
                if (params.offset) searchParams.append("offset", String(params.offset));
                return {
                    url: `/v1/admin/attendance?${searchParams.toString()}`,
                    method: "GET",
                };
            },
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["Attendance"],
        }),
        getAttendance: builder.query<AttendanceRead, number>({
            query: (attendanceId) => ({
                url: `/v1/admin/attendance/${attendanceId}`,
                method: "GET",
            }),
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["Attendance"],
        }),
        createAttendance: builder.mutation<AttendanceRead, AttendanceCreate>({
            query: (body) => ({
                url: `/v1/admin/attendance`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["Attendance", "ClassSessions"],
        }),
        updateAttendance: builder.mutation<AttendanceRead, { attendanceId: number; data: AttendanceUpdate }>({
            query: ({ attendanceId, data }) => ({
                url: `/v1/admin/attendance/${attendanceId}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Attendance", "ClassSessions"],
        }),
        deleteAttendance: builder.mutation<void, number>({
            query: (attendanceId) => ({
                url: `/v1/admin/attendance/${attendanceId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Attendance", "ClassSessions"],
        }),
        listSessionAttendance: builder.query<SessionAttendanceStudent[], number>({
            query: (sessionId) => ({
                url: `/v1/instructor/sessions/${sessionId}/attendance`,
                method: "GET",
            }),
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["Attendance"],
        }),
        bulkUpdateAttendance: builder.mutation<AttendanceRead[], { sessionId: number; data: AttendanceBulkCreate }>({
            query: ({ sessionId, data }) => ({
                url: `/v1/instructor/sessions/${sessionId}/attendance`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Attendance", "ClassSessions"],
        }),
        listPayments: builder.query<PaymentRead[], ListPaymentsParams>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params.studentId) searchParams.append("student_id", params.studentId);
                if (params.paidFrom) searchParams.append("paid_from", params.paidFrom);
                if (params.paidTo) searchParams.append("paid_to", params.paidTo);
                if (params.method) searchParams.append("method", params.method);
                return {
                    url: `/v1/admin/payments?${searchParams.toString()}`,
                    method: "GET",
                };
            },
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["Payments"],
        }),
        getPayment: builder.query<PaymentRead, number>({
            query: (paymentId) => ({
                url: `/v1/admin/payments/${paymentId}`,
                method: "GET",
            }),
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["Payments"],
        }),
        listStudentPayments: builder.query<PaymentRead[], string>({
            query: (studentId) => ({
                url: `/v1/admin/students/${studentId}/payments`,
                method: "GET",
            }),
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["Payments"],
        }),
        createPayment: builder.mutation<PaymentRead, { studentId: string; data: PaymentCreate }>({
            query: ({ studentId, data }) => ({
                url: `/v1/admin/students/${studentId}/payments`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Payments", "Charges"],
        }),
        updatePayment: builder.mutation<PaymentRead, { paymentId: number; data: PaymentUpdate }>({
            query: ({ paymentId, data }) => ({
                url: `/v1/admin/payments/${paymentId}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Payments", "Charges"],
        }),
        deletePayment: builder.mutation<void, number>({
            query: (paymentId) => ({
                url: `/v1/admin/payments/${paymentId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Payments", "Charges", "PaymentAllocations"],
        }),
        listCharges: builder.query<ChargeRead[], ListChargesParams>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params.studentId) searchParams.append("student_id", params.studentId);
                if (params.status) searchParams.append("status", params.status);
                if (params.type) searchParams.append("type", params.type);
                if (params.dueFrom) searchParams.append("due_from", params.dueFrom);
                if (params.dueTo) searchParams.append("due_to", params.dueTo);
                if (params.overdue !== undefined) searchParams.append("overdue", String(params.overdue));
                return {
                    url: `/v1/admin/charges?${searchParams.toString()}`,
                    method: "GET",
                };
            },
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["Charges"],
        }),
        getCharge: builder.query<ChargeRead, number>({
            query: (chargeId) => ({
                url: `/v1/admin/charges/${chargeId}`,
                method: "GET",
            }),
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["Charges"],
        }),
        listStudentCharges: builder.query<ChargeRead[], string>({
            query: (studentId) => ({
                url: `/v1/admin/students/${studentId}/charges`,
                method: "GET",
            }),
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["Charges"],
        }),
        createCharge: builder.mutation<ChargeRead, { studentId: string; data: ChargeCreate }>({
            query: ({ studentId, data }) => ({
                url: `/v1/admin/students/${studentId}/charges`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Charges"],
        }),
        updateCharge: builder.mutation<ChargeRead, { chargeId: number; data: ChargeUpdate }>({
            query: ({ chargeId, data }) => ({
                url: `/v1/admin/charges/${chargeId}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Charges"],
        }),
        cancelCharge: builder.mutation<ChargeRead, number>({
            query: (chargeId) => ({
                url: `/v1/admin/charges/${chargeId}/cancel`,
                method: "POST",
            }),
            invalidatesTags: ["Charges", "PaymentAllocations"],
        }),
        listPaymentAllocations: builder.query<PaymentAllocationRead[], number>({
            query: (paymentId) => ({
                url: `/v1/admin/payments/${paymentId}/allocations`,
                method: "GET",
            }),
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["PaymentAllocations"],
        }),
        listChargeAllocations: builder.query<PaymentAllocationRead[], number>({
            query: (chargeId) => ({
                url: `/v1/admin/charges/${chargeId}/allocations`,
                method: "GET",
            }),
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["PaymentAllocations"],
        }),
        createPaymentAllocation: builder.mutation<
            PaymentAllocationRead,
            { paymentId: number; data: PaymentAllocationCreate }
        >({
            query: ({ paymentId, data }) => ({
                url: `/v1/admin/payments/${paymentId}/allocations`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["PaymentAllocations", "Charges", "Payments"],
        }),
        updatePaymentAllocation: builder.mutation<
            PaymentAllocationRead,
            { paymentId: number; chargeId: number; data: PaymentAllocationUpdate }
        >({
            query: ({ paymentId, chargeId, data }) => ({
                url: `/v1/admin/payments/${paymentId}/allocations/${chargeId}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["PaymentAllocations", "Charges", "Payments"],
        }),
        deletePaymentAllocation: builder.mutation<void, { paymentId: number; chargeId: number }>({
            query: ({ paymentId, chargeId }) => ({
                url: `/v1/admin/payments/${paymentId}/allocations/${chargeId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["PaymentAllocations", "Charges", "Payments"],
        }),
        getBillingSummary: builder.query<BillingSummary, string>({
            query: (studentId) => ({
                url: `/v1/admin/students/${studentId}/billing/summary`,
                method: "GET",
            }),
            keepUnusedDataFor: DEFAULT_CACHE_TIME,
            providesTags: ["Charges", "Payments", "PaymentAllocations"],
        }),
    }),
});

export const {
    useListUsersQuery,
    useLazyListUsersQuery,
    useGetUserDetailsQuery,
    useListInstructorsQuery,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useListRoomsQuery,
    useCreateRoomMutation,
    useUpdateRoomMutation,
    useDeleteRoomMutation,
    useListClassSessionsQuery,
    useCreateClassSessionMutation,
    useUpdateClassSessionMutation,
    useDeleteClassSessionMutation,
    useCancelClassSessionMutation,
    useCompleteClassSessionMutation,
    useRescheduleClassSessionMutation,
    useListClassGroupsQuery,
    useCreateClassGroupMutation,
    useUpdateClassGroupMutation,
    useDeleteClassGroupMutation,
    useGenerateClassGroupSessionsMutation,
    useListSemestersQuery,
    useCreateSemesterMutation,
    useUpdateSemesterMutation,
    useDeleteSemesterMutation,
    useListSkillLevelsQuery,
    useCreateSkillLevelMutation,
    useUpdateSkillLevelMutation,
    useDeleteSkillLevelMutation,
    useListTopicsQuery,
    useCreateTopicMutation,
    useUpdateTopicMutation,
    useDeleteTopicMutation,
    useListEnrollmentsQuery,
    useCreateEnrollmentMutation,
    useUpdateEnrollmentMutation,
    useDeleteEnrollmentMutation,
    usePromoteWaitlistMutation,
    useListAttendanceQuery,
    useGetAttendanceQuery,
    useCreateAttendanceMutation,
    useUpdateAttendanceMutation,
    useDeleteAttendanceMutation,
    useListSessionAttendanceQuery,
    useBulkUpdateAttendanceMutation,
    useListPaymentsQuery,
    useGetPaymentQuery,
    useListStudentPaymentsQuery,
    useCreatePaymentMutation,
    useUpdatePaymentMutation,
    useDeletePaymentMutation,
    useListChargesQuery,
    useGetChargeQuery,
    useListStudentChargesQuery,
    useCreateChargeMutation,
    useUpdateChargeMutation,
    useCancelChargeMutation,
    useListPaymentAllocationsQuery,
    useListChargeAllocationsQuery,
    useCreatePaymentAllocationMutation,
    useUpdatePaymentAllocationMutation,
    useDeletePaymentAllocationMutation,
    useGetBillingSummaryQuery,
} = adminApi;
