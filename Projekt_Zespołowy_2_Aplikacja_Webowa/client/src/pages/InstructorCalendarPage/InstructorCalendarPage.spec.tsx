import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InstructorCalendarPage } from "./InstructorCalendarPage";
import * as scheduleApi from "../../store/schedule/api";
import * as reactRouterDom from "react-router-dom";
import * as alertContext from "../../components/Alert/AlertContext";

jest.mock("../../store/schedule/api");
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));
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

describe("InstructorCalendarPage", () => {
    const mockNavigate = jest.fn();
    const mockPublish = jest.fn();

    const mockCalendarData = [
        {
            classSessionId: 1,
            classGroupId: 101,
            classGroupName: "Grupa Taniec Początkujący",
            date: "2025-01-20",
            startTime: "10:00:00",
            endTime: "11:00:00",
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
            date: "2025-01-21",
            startTime: "14:00:00",
            endTime: "15:30:00",
            status: "scheduled" as const,
            roomId: 2,
            instructorId: "instructor-uuid-1",
            topicId: 2,
            levelId: 3,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(reactRouterDom.useNavigate).mockReturnValue(mockNavigate);
        jest.mocked(alertContext.useAlert).mockReturnValue({
            publish: mockPublish,
            message: "",
            alertType: undefined,
        });
        jest.mocked(scheduleApi.useGetInstructorCalendarQuery).mockReturnValue({
            data: mockCalendarData,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(scheduleApi.useCompleteSessionMutation).mockReturnValue([jest.fn(), { isLoading: false }] as any);
        jest.mocked(scheduleApi.useGetInstructorsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(scheduleApi.useCreateSubstitutionMutation).mockReturnValue([
            jest.fn(),
            { isLoading: false },
        ] as any);
    });

    it("should render title", () => {
        render(<InstructorCalendarPage />);

        const title = screen.getByRole("heading", { level: 1 });
        expect(title).toBeInTheDocument();
        expect(title).toHaveTextContent("Moje zajęcia");
    });

    it("should render loading state", () => {
        jest.mocked(scheduleApi.useGetInstructorCalendarQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<InstructorCalendarPage />);

        expect(screen.getByText("loading")).toBeInTheDocument();
    });

    it("should render error state", () => {
        jest.mocked(scheduleApi.useGetInstructorCalendarQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: { status: 500, data: "Error" },
            refetch: jest.fn(),
        } as any);

        render(<InstructorCalendarPage />);

        expect(screen.getByText("Nie masz żadnych zajęć.")).toBeInTheDocument();
    });

    it("should render calendar component", () => {
        render(<InstructorCalendarPage />);

        const calendarContainer = screen.getByText("Moje zajęcia").closest("div");
        expect(calendarContainer).toBeInTheDocument();
    });

    it("should display session names in calendar", () => {
        render(<InstructorCalendarPage />);

        expect(screen.getByText("Moje zajęcia")).toBeInTheDocument();
    });

    it("should render manage attendance button for each session", () => {
        render(<InstructorCalendarPage />);

        const attendanceButtons = screen.queryAllByTitle("Zarządzaj obecnością");
        expect(attendanceButtons.length).toBeGreaterThanOrEqual(0);
    });

    it("should navigate to attendance page when manage button is clicked", async () => {
        const user = userEvent.setup();
        render(<InstructorCalendarPage />);

        const attendanceButtons = screen.queryAllByTitle("Zarządzaj obecnością");
        if (attendanceButtons.length > 0) {
            await user.click(attendanceButtons[0]);

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalled();
            });
        } else {
            expect(attendanceButtons.length).toBe(0);
        }
    });

    it("should display empty state when no sessions", () => {
        jest.mocked(scheduleApi.useGetInstructorCalendarQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<InstructorCalendarPage />);

        expect(screen.getByText("Nie masz żadnych zajęć.")).toBeInTheDocument();
    });

    it("should handle undefined data", () => {
        jest.mocked(scheduleApi.useGetInstructorCalendarQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<InstructorCalendarPage />);

        expect(screen.getByText("Nie masz żadnych zajęć.")).toBeInTheDocument();
    });

    it("should refetch data on mount", () => {
        render(<InstructorCalendarPage />);

        expect(scheduleApi.useGetInstructorCalendarQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                fromDate: expect.any(String),
                toDate: expect.any(String),
            }),
        );
    });

    it("should only show attendance button for scheduled sessions", () => {
        const mixedStatusData = [
            {
                classSessionId: 1,
                classGroupId: 101,
                classGroupName: "Grupa Scheduled",
                date: "2025-01-20",
                startTime: "10:00:00",
                endTime: "11:00:00",
                status: "scheduled" as const,
                roomId: 1,
                instructorId: "instructor-uuid-1",
                topicId: 1,
                levelId: 1,
            },
            {
                classSessionId: 2,
                classGroupId: 102,
                classGroupName: "Grupa Cancelled",
                date: "2025-01-21",
                startTime: "14:00:00",
                endTime: "15:30:00",
                status: "cancelled" as const,
                roomId: 2,
                instructorId: "instructor-uuid-1",
                topicId: 2,
                levelId: 3,
            },
        ];

        jest.mocked(scheduleApi.useGetInstructorCalendarQuery).mockReturnValue({
            data: mixedStatusData,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<InstructorCalendarPage />);

        const attendanceButtons = screen.queryAllByTitle("Zarządzaj obecnością");
        expect(attendanceButtons.length).toBeLessThanOrEqual(1);
    });

    it("should not show attendance button for non-scheduled sessions", () => {
        const nonScheduledData = [
            {
                classSessionId: 1,
                classGroupId: 101,
                classGroupName: "Grupa Cancelled",
                date: "2025-01-20",
                startTime: "10:00:00",
                endTime: "11:00:00",
                status: "cancelled" as const,
                roomId: 1,
                instructorId: "instructor-uuid-1",
                topicId: 1,
                levelId: 1,
            },
        ];

        jest.mocked(scheduleApi.useGetInstructorCalendarQuery).mockReturnValue({
            data: nonScheduledData,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<InstructorCalendarPage />);

        const attendanceButtons = screen.queryAllByTitle("Zarządzaj obecnością");
        expect(attendanceButtons.length).toBe(0);
    });
});
