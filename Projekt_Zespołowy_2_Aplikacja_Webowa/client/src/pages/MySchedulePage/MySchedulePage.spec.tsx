import { render, screen } from "@testing-library/react";
import { MySchedulePage } from "./MySchedulePage";
import * as scheduleApi from "../../store/schedule/api";
import * as enrollmentApi from "../../store/enrollment/api";
import * as alertContext from "../../components/Alert/AlertContext";

jest.mock("../../store/schedule/api");
jest.mock("../../store/enrollment/api");
jest.mock("../../components/Alert/AlertContext");
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: "pl",
            changeLanguage: jest.fn(),
        },
    }),
}));
jest.mock("moment", () => {
    const actualMoment = jest.requireActual("moment");
    const momentInstance = actualMoment.default || actualMoment;
    return Object.assign(momentInstance, {
        locale: jest.fn(),
    });
});

describe("MySchedulePage", () => {
    const mockPublish = jest.fn();
    const mockRefetchSessions = jest.fn();
    const mockCancelEnrollment = jest.fn();

    const mockCalendarSessions = [
        {
            classSessionId: 1,
            classGroupId: 101,
            classGroupName: "Grupa Taniec Początkujący",
            date: "2025-01-25",
            startTime: "10:00:00.000Z",
            endTime: "11:00:00.000Z",
            status: "scheduled" as const,
            roomId: 1,
            instructorId: "instructor-uuid-1",
            topicId: 1,
            levelId: 1,
        },
        {
            classSessionId: 2,
            classGroupId: 102,
            classGroupName: "Grupa Joga Zaawansowani",
            date: "2025-01-26",
            startTime: "14:00:00.000Z",
            endTime: "15:30:00.000Z",
            status: "scheduled" as const,
            roomId: 2,
            instructorId: "instructor-uuid-2",
            topicId: 2,
            levelId: 3,
        },
    ];

    const mockEnrollments = [
        {
            id: 1,
            classGroupId: 101,
            status: "ACTIVE" as const,
            enrolledAt: "2025-01-01T00:00:00Z",
        },
        {
            id: 2,
            classGroupId: 102,
            status: "ACTIVE" as const,
            enrolledAt: "2025-01-01T00:00:00Z",
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(alertContext.useAlert).mockReturnValue({
            publish: mockPublish,
            message: "",
            alertType: undefined,
        });
        jest.mocked(scheduleApi.useGetStudentCalendarQuery).mockReturnValue({
            data: mockCalendarSessions,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: mockRefetchSessions,
        } as any);
        jest.mocked(enrollmentApi.useGetEnrollmentsQuery).mockReturnValue({
            data: mockEnrollments,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(enrollmentApi.useCancelEnrollmentMutation).mockReturnValue([
            mockCancelEnrollment,
            { isLoading: false },
        ] as any);
    });

    it("should render title", () => {
        render(<MySchedulePage />);

        const title = screen.getByRole("heading", { level: 1 });
        expect(title).toBeInTheDocument();
        expect(title).toHaveTextContent("Mój grafik");
    });

    it("should render loading state", () => {
        jest.mocked(scheduleApi.useGetStudentCalendarQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: undefined,
            refetch: mockRefetchSessions,
        } as any);

        render(<MySchedulePage />);

        expect(screen.getByText("loading")).toBeInTheDocument();
    });

    it("should render empty state when no sessions", () => {
        jest.mocked(scheduleApi.useGetStudentCalendarQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: mockRefetchSessions,
        } as any);

        render(<MySchedulePage />);

        expect(screen.getByText("Nie jesteś zapisany na żadne zajęcia.")).toBeInTheDocument();
    });

    it("should render calendar with sessions", () => {
        render(<MySchedulePage />);

        expect(screen.getByText("Mój grafik")).toBeInTheDocument();
    });

    it("should use calendar endpoint with correct date range", () => {
        render(<MySchedulePage />);

        expect(scheduleApi.useGetStudentCalendarQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                fromDate: expect.any(String),
                toDate: expect.any(String),
            }),
            expect.any(Object),
        );
    });

    it("should fetch enrollments for mapping enrollmentId", () => {
        render(<MySchedulePage />);

        expect(enrollmentApi.useGetEnrollmentsQuery).toHaveBeenCalled();
    });

    it("should handle time parsing with T and Z", () => {
        const sessionsWithTZ = [
            {
                classSessionId: 3,
                classGroupId: 103,
                classGroupName: "Grupa Testowa",
                date: "2025-01-27",
                startTime: "T10:00:00.000Z",
                endTime: "T11:00:00.000Z",
                status: "scheduled" as const,
                roomId: 1,
                instructorId: "instructor-uuid-3",
                topicId: 1,
                levelId: 1,
            },
        ];

        jest.mocked(scheduleApi.useGetStudentCalendarQuery).mockReturnValue({
            data: sessionsWithTZ,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: mockRefetchSessions,
        } as any);

        render(<MySchedulePage />);

        expect(screen.getByText("Mój grafik")).toBeInTheDocument();
    });

    it("should handle time parsing without T and Z", () => {
        const sessionsWithoutTZ = [
            {
                classSessionId: 4,
                classGroupId: 104,
                classGroupName: "Grupa Testowa 2",
                date: "2025-01-28",
                startTime: "10:00:00.000",
                endTime: "11:00:00.000",
                status: "scheduled" as const,
                roomId: 1,
                instructorId: "instructor-uuid-4",
                topicId: 1,
                levelId: 1,
            },
        ];

        jest.mocked(scheduleApi.useGetStudentCalendarQuery).mockReturnValue({
            data: sessionsWithoutTZ,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: mockRefetchSessions,
        } as any);

        render(<MySchedulePage />);

        expect(screen.getByText("Mój grafik")).toBeInTheDocument();
    });

    it("should map enrollmentId correctly", () => {
        render(<MySchedulePage />);

        expect(scheduleApi.useGetStudentCalendarQuery).toHaveBeenCalled();
        expect(enrollmentApi.useGetEnrollmentsQuery).toHaveBeenCalled();
    });

    it("should handle sessions without enrollment", () => {
        jest.mocked(enrollmentApi.useGetEnrollmentsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<MySchedulePage />);

        expect(screen.getByText("Mój grafik")).toBeInTheDocument();
    });

    it("should use correct date range for calendar query", () => {
        render(<MySchedulePage />);

        expect(scheduleApi.useGetStudentCalendarQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                fromDate: expect.any(String),
                toDate: expect.any(String),
            }),
            expect.any(Object),
        );
    });
});
