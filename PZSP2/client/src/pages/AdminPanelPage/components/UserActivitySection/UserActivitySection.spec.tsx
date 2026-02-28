import { render, screen } from "@testing-library/react";
import { UserActivitySection } from "./UserActivitySection";
import * as adminApi from "../../../../store/admin/api";
import { UserRole } from "../../../../store/auth/types";

jest.mock("../../../../store/admin/api");
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("UserActivitySection", () => {
    const mockUser = {
        id: "123",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        isActive: true,
        isSuperuser: false,
        isVerified: true,
        role: UserRole.STUDENT,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render loading state", () => {
        jest.mocked(adminApi.useGetUserDetailsQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: undefined,
        } as any);

        render(<UserActivitySection user={mockUser} />);

        expect(screen.getByText("admin.loading")).toBeInTheDocument();
    });

    it("should render enrollments for student", () => {
        const mockUserDetails = {
            ...mockUser,
            classGroups: [],
            enrollments: [
                {
                    id: 1,
                    studentId: "123",
                    classGroupId: 1,
                    status: "ACTIVE",
                    joinedAt: "2024-01-01T00:00:00Z",
                    cancelledAt: null,
                },
            ],
            activityStats: {
                enrollmentsTotal: 1,
                enrollmentsActive: 1,
                attendanceSummary: {
                    totalCount: 10,
                    presentCount: 8,
                    absentCount: 1,
                    excusedCount: 1,
                    makeupCount: 0,
                    attendanceRate: 0.8,
                },
            },
        };

        jest.mocked(adminApi.useGetUserDetailsQuery).mockReturnValue({
            data: mockUserDetails,
            isLoading: false,
            isError: false,
            error: undefined,
        } as any);

        render(<UserActivitySection user={mockUser} />);

        expect(screen.getByText("admin.enrollments")).toBeInTheDocument();
        expect(screen.getByText("admin.attendance")).toBeInTheDocument();
    });

    it("should render class groups for instructor", () => {
        const instructorUser = {
            ...mockUser,
            role: UserRole.INSTRUCTOR,
        };

        const mockUserDetails = {
            ...instructorUser,
            classGroups: [
                {
                    id: 1,
                    semesterId: 1,
                    name: "Test Group",
                    description: "Test Description",
                    levelId: 1,
                    topicId: 1,
                    roomId: 1,
                    capacity: 10,
                    dayOfWeek: 1,
                    startTime: "10:00",
                    endTime: "11:00",
                    instructorId: "123",
                    isPublic: true,
                    status: "ACTIVE",
                    createdAt: "2024-01-01T00:00:00Z",
                    updatedAt: null,
                },
            ],
            enrollments: [],
            activityStats: {
                classGroupsTotal: 1,
                classSessionsTotal: 10,
            },
        };

        jest.mocked(adminApi.useGetUserDetailsQuery).mockReturnValue({
            data: mockUserDetails,
            isLoading: false,
            isError: false,
            error: undefined,
        } as any);

        render(<UserActivitySection user={instructorUser} />);

        expect(screen.getByText("admin.classGroups")).toBeInTheDocument();
        expect(screen.getByText("Test Group")).toBeInTheDocument();
    });

    it("should render empty state when no enrollments", () => {
        const mockUserDetails = {
            ...mockUser,
            classGroups: [],
            enrollments: [],
            activityStats: {
                enrollmentsTotal: 0,
                enrollmentsActive: 0,
            },
        };

        jest.mocked(adminApi.useGetUserDetailsQuery).mockReturnValue({
            data: mockUserDetails,
            isLoading: false,
            isError: false,
            error: undefined,
        } as any);

        render(<UserActivitySection user={mockUser} />);

        expect(screen.getByText("admin.noEnrollments")).toBeInTheDocument();
    });
});
