import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StudentsAttendanceTab } from "./StudentsAttendanceTab";
import * as adminApi from "../../../../../store/admin/api";
import { UserRole } from "../../../../../store/auth/types";

jest.mock("../../../../../store/admin/api");
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("StudentsAttendanceTab", () => {
    const mockStudents = [
        {
            id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            isActive: true,
            isSuperuser: false,
            isVerified: true,
            role: UserRole.STUDENT,
        },
    ];

    const mockAttendance = [
        {
            id: 1,
            studentId: "1",
            classSessionId: 1,
            status: "PRESENT",
            isMakeup: false,
        },
    ];

    const mockSessions = [
        {
            id: 1,
            classGroupId: 1,
            date: "2024-01-01",
            startTime: "10:00",
            endTime: "11:00",
            roomId: null,
            instructorId: null,
            notes: null,
            status: "completed",
        },
    ];

    const mockClassGroups = [
        {
            id: 1,
            name: "Test Group",
            semesterId: 1,
            levelId: 1,
            topicId: 1,
            roomId: null,
            capacity: 20,
            dayOfWeek: 1,
            startTime: "10:00",
            endTime: "11:00",
            instructorId: null,
            isPublic: true,
            status: "active",
            description: null,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(adminApi.useListUsersQuery).mockReturnValue({
            data: mockStudents,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(adminApi.useListAttendanceQuery).mockReturnValue({
            data: mockAttendance,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(adminApi.useListClassSessionsQuery).mockReturnValue({
            data: mockSessions,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(adminApi.useListClassGroupsQuery).mockReturnValue({
            data: mockClassGroups,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
    });

    it("should display attendance when student is selected", async () => {
        render(<StudentsAttendanceTab />);

        const select = screen.getByRole("combobox");
        await userEvent.selectOptions(select, "1");

        await waitFor(() => {
            expect(screen.getByText("admin.present")).toBeInTheDocument();
        });
    });

    it("should show loading state", () => {
        jest.mocked(adminApi.useListUsersQuery).mockReturnValue({
            data: [],
            isLoading: true,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<StudentsAttendanceTab />);

        expect(screen.getByText("admin.loading")).toBeInTheDocument();
    });
});
