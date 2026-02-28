import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardPage } from "./DashboardPage";
import * as scheduleApi from "../../store/schedule/api";
import * as billingApi from "../../store/billing/api";
import * as attendanceApi from "../../store/attendance/api";
import * as authApi from "../../store/auth/api";
import * as store from "../../store/store";
import * as selectors from "../../store/auth/selectors";
import * as alertContext from "../../components/Alert/AlertContext";
import * as reactRouterDom from "react-router-dom";

jest.mock("../../store/schedule/api");
jest.mock("../../store/billing/api");
jest.mock("../../store/attendance/api");
jest.mock("../../store/auth/api");
jest.mock("../../store/store", () => ({
    useAppSelector: jest.fn(),
}));
jest.mock("../../store/auth/selectors");
jest.mock("../../components/Alert/AlertContext");
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

describe("DashboardPage", () => {
    const mockUser = {
        id: "user-uuid-1",
        email: "user@example.com",
        isActive: true,
        isSuperuser: false,
        isVerified: true,
        firstName: "Jan",
        lastName: "Kowalski",
        role: "student" as const,
    };

    const mockCalendarSessions = [
        {
            classSessionId: 1,
            classGroupId: 101,
            classGroupName: "Grupa Taniec Początkujący",
            date: "2025-01-25",
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
            date: "2025-01-26",
            startTime: "14:00:00",
            endTime: "15:30:00",
            status: "scheduled" as const,
            roomId: 2,
            instructorId: "instructor-uuid-1",
            topicId: 2,
            levelId: 3,
        },
    ];

    const mockBillingSummary = {
        currentMonthDue: "500.00",
        totalOverdue: "200.00",
        openCharges: [
            {
                id: 1,
                studentId: "user-uuid-1",
                dueDate: "2025-01-30",
                amountDue: "500.00",
                type: "MONTHLY_FEE",
                status: "OPEN" as const,
                createdBy: "admin-uuid-1",
                createdAt: "2025-01-01T00:00:00Z",
            },
        ],
        lastPaymentAt: "2025-01-15T10:00:00Z",
        recommendedTransferTitle: "Opłata za zajęcia - Jan Kowalski",
    };

    const mockAttendanceSummary = {
        totalCount: 20,
        presentCount: 15,
        absentCount: 3,
        excusedCount: 2,
        makeupCount: 1,
        attendanceRate: 0.85,
    };

    const mockNavigate = jest.fn();
    const mockPublish = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(reactRouterDom.useNavigate).mockReturnValue(mockNavigate);
        jest.mocked(alertContext.useAlert).mockReturnValue({
            publish: mockPublish,
            message: "",
            alertType: undefined,
        });
        jest.mocked(store.useAppSelector).mockImplementation((selector) => {
            if (selector === selectors.selectIsStudent) {
                return true;
            }
            if (selector === selectors.selectIsInstructor) {
                return false;
            }
            if (selector === selectors.selectIsAdmin) {
                return false;
            }
            return false;
        });
        jest.mocked(authApi.useGetUserQuery).mockReturnValue({
            data: mockUser,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(scheduleApi.useGetStudentCalendarQuery).mockReturnValue({
            data: mockCalendarSessions,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(scheduleApi.useGetInstructorCalendarQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(scheduleApi.useGetInstructorsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(scheduleApi.useCompleteSessionMutation).mockReturnValue([jest.fn(), { isLoading: false }] as any);
        jest.mocked(scheduleApi.useCreateSubstitutionMutation).mockReturnValue([
            jest.fn(),
            { isLoading: false },
        ] as any);
        jest.mocked(billingApi.useGetBillingSummaryQuery).mockReturnValue({
            data: mockBillingSummary,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(attendanceApi.useGetAttendanceSummaryQuery).mockReturnValue({
            data: mockAttendanceSummary,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(scheduleApi.useGetInstructorCalendarQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
    });

    it("should render welcome section with user name", () => {
        render(<DashboardPage />);

        const welcomeTitle = screen.getByRole("heading", { level: 1 });
        expect(welcomeTitle).toBeInTheDocument();
        expect(welcomeTitle).toHaveTextContent(/Jan Kowalski/);
    });

    it("should render loading state", () => {
        jest.mocked(authApi.useGetUserQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<DashboardPage />);

        expect(screen.getByText("Ładowanie...")).toBeInTheDocument();
    });

    it("should render upcoming classes section", () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        const futureDateStr = futureDate.toISOString().split("T")[0];

        const futureSessions = [
            {
                classSessionId: 1,
                classGroupId: 101,
                classGroupName: "Grupa Taniec Początkujący",
                date: futureDateStr,
                startTime: "10:00:00",
                endTime: "11:00:00",
                status: "scheduled" as const,
                roomId: 1,
                instructorId: "instructor-uuid-1",
                topicId: 1,
                levelId: 1,
            },
        ];

        jest.mocked(scheduleApi.useGetStudentCalendarQuery).mockReturnValue({
            data: futureSessions,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<DashboardPage />);

        const upcomingClassesTitle = screen.getByText("Najbliższe zajęcia");
        expect(upcomingClassesTitle).toBeInTheDocument();

        expect(screen.getByText("Grupa Taniec Początkujący")).toBeInTheDocument();
    });

    it("should render billing summary section", () => {
        render(<DashboardPage />);

        const billingTitle = screen.getByText("Saldo płatności");
        expect(billingTitle).toBeInTheDocument();

        expect(screen.getByText(/Do zapłaty w tym miesiącu:/)).toBeInTheDocument();
        expect(screen.getByText(/Zaległości:/)).toBeInTheDocument();
    });

    it("should display 'Nie jesteś zapisany na żadne zajęcia' when no classes", () => {
        jest.mocked(scheduleApi.useGetStudentCalendarQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<DashboardPage />);

        expect(screen.getByText("Nie jesteś zapisany na żadne zajęcia.")).toBeInTheDocument();
    });

    it("should display formatted amounts in billing section", () => {
        render(<DashboardPage />);

        const amounts = screen.getAllByText(/500,00 zł|200,00 zł/);
        expect(amounts.length).toBeGreaterThanOrEqual(1);
    });

    it("should display class dates and times", () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        const futureDateStr = futureDate.toISOString().split("T")[0];

        const futureSessions = [
            {
                classSessionId: 1,
                classGroupId: 101,
                classGroupName: "Grupa Testowa",
                date: futureDateStr,
                startTime: "10:00:00",
                endTime: "11:00:00",
                status: "scheduled" as const,
                roomId: 1,
                instructorId: "instructor-uuid-1",
                topicId: 1,
                levelId: 1,
            },
        ];

        jest.mocked(scheduleApi.useGetStudentCalendarQuery).mockReturnValue({
            data: futureSessions,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<DashboardPage />);

        expect(screen.getByText("Grupa Testowa")).toBeInTheDocument();
    });

    it("should filter out past classes", () => {
        const pastSession = {
            classSessionId: 3,
            classGroupId: 103,
            classGroupName: "Grupa Przeszła",
            date: "2020-01-01",
            startTime: "10:00:00",
            endTime: "11:00:00",
            status: "scheduled" as const,
            roomId: 1,
            instructorId: "instructor-uuid-1",
            topicId: 1,
            levelId: 1,
        };

        jest.mocked(scheduleApi.useGetStudentCalendarQuery).mockReturnValue({
            data: [...mockCalendarSessions, pastSession],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<DashboardPage />);

        expect(screen.queryByText("Grupa Przeszła")).not.toBeInTheDocument();
    });

    it("should filter out non-scheduled classes", () => {
        const cancelledSession = {
            classSessionId: 4,
            classGroupId: 104,
            classGroupName: "Grupa Anulowana",
            date: "2025-01-27",
            startTime: "10:00:00",
            endTime: "11:00:00",
            status: "cancelled" as const,
            roomId: 1,
            instructorId: "instructor-uuid-1",
            topicId: 1,
            levelId: 1,
        };

        jest.mocked(scheduleApi.useGetStudentCalendarQuery).mockReturnValue({
            data: [...mockCalendarSessions, cancelledSession],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<DashboardPage />);

        expect(screen.queryByText("Grupa Anulowana")).not.toBeInTheDocument();
    });

    it("should limit displayed classes to 5", () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);

        const manySessions = Array.from({ length: 10 }, (_, i) => {
            const date = new Date(futureDate);
            date.setDate(date.getDate() + i);
            return {
                classSessionId: i + 10,
                classGroupId: 200 + i,
                classGroupName: `Grupa ${i + 1}`,
                date: date.toISOString().split("T")[0],
                startTime: "10:00:00",
                endTime: "11:00:00",
                status: "scheduled" as const,
                roomId: 1,
                instructorId: "instructor-uuid-1",
                topicId: 1,
                levelId: 1,
            };
        });

        jest.mocked(scheduleApi.useGetStudentCalendarQuery).mockReturnValue({
            data: manySessions,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<DashboardPage />);

        const classItems = screen.queryAllByText(/Grupa \d+/);
        expect(classItems.length).toBeLessThanOrEqual(5);
    });

    it("should display greeting based on time of day", () => {
        render(<DashboardPage />);

        const greeting = screen.getByRole("heading", { level: 1 });
        expect(greeting.textContent).toMatch(/Dzień dobry|Dobry wieczór/);
    });

    it("should handle missing user data gracefully", () => {
        jest.mocked(authApi.useGetUserQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<DashboardPage />);

        const welcomeTitle = screen.getByRole("heading", { level: 1 });
        expect(welcomeTitle).toHaveTextContent(/Użytkowniku/);
    });

    it("should call refetch on mount", () => {
        const mockRefetchUser = jest.fn();
        const mockRefetchCalendar = jest.fn();
        const mockRefetchBilling = jest.fn();
        const mockRefetchAttendance = jest.fn();

        jest.mocked(authApi.useGetUserQuery).mockReturnValue({
            data: mockUser,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: mockRefetchUser,
        } as any);
        jest.mocked(scheduleApi.useGetStudentCalendarQuery).mockReturnValue({
            data: mockCalendarSessions,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: mockRefetchCalendar,
        } as any);
        jest.mocked(billingApi.useGetBillingSummaryQuery).mockReturnValue({
            data: mockBillingSummary,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: mockRefetchBilling,
        } as any);
        jest.mocked(attendanceApi.useGetAttendanceSummaryQuery).mockReturnValue({
            data: mockAttendanceSummary,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: mockRefetchAttendance,
        } as any);

        render(<DashboardPage />);

        expect(mockRefetchUser).toHaveBeenCalled();
        expect(mockRefetchCalendar).toHaveBeenCalled();
        expect(mockRefetchBilling).toHaveBeenCalled();
        expect(mockRefetchAttendance).toHaveBeenCalled();
    });

    it("should render attendance summary section for students", () => {
        render(<DashboardPage />);

        const attendanceTitle = screen.getByText("Podsumowanie obecności");
        expect(attendanceTitle).toBeInTheDocument();

        expect(screen.getByText(/Liczba zajęć:/)).toBeInTheDocument();
        expect(screen.getByText("20")).toBeInTheDocument();
        expect(screen.getByText(/Obecny:/)).toBeInTheDocument();
        expect(screen.getByText("15")).toBeInTheDocument();
        expect(screen.getByText(/Nieobecny:/)).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText(/Frekwencja:/)).toBeInTheDocument();
        expect(screen.getByText("85.0%")).toBeInTheDocument();
    });

    it("should calculate attendance rate correctly (multiply by 100)", () => {
        const customAttendanceSummary = {
            ...mockAttendanceSummary,
            attendanceRate: 0.75,
        };

        jest.mocked(attendanceApi.useGetAttendanceSummaryQuery).mockReturnValue({
            data: customAttendanceSummary,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<DashboardPage />);

        expect(screen.getByText("75.0%")).toBeInTheDocument();
    });

    it("should not render attendance summary for instructors", () => {
        jest.mocked(store.useAppSelector).mockImplementation((selector) => {
            if (selector === selectors.selectIsStudent) return false;
            if (selector === selectors.selectIsInstructor) return true;
            if (selector === selectors.selectIsAdmin) return false;
            return false;
        });

        jest.mocked(attendanceApi.useGetAttendanceSummaryQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<DashboardPage />);

        expect(screen.queryByText("Podsumowanie obecności")).not.toBeInTheDocument();
    });

    describe("Instructor unfinished classes section", () => {
        const mockInstructorUser = {
            ...mockUser,
            role: "instructor" as const,
        };

        const mockUnfinishedSessions = [
            {
                classSessionId: 10,
                classGroupId: 201,
                classGroupName: "Grupa Niezakończona 1",
                date: "2024-12-20",
                startTime: "10:00:00",
                endTime: "11:00:00",
                status: "scheduled" as const,
                roomId: 1,
                instructorId: "instructor-uuid-1",
                topicId: 1,
                levelId: 1,
            },
            {
                classSessionId: 11,
                classGroupId: 202,
                classGroupName: "Grupa Niezakończona 2",
                date: "2024-12-25",
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
            jest.mocked(store.useAppSelector).mockImplementation((selector) => {
                if (selector === selectors.selectIsStudent) {
                    return false;
                }
                if (selector === selectors.selectIsInstructor) {
                    return true;
                }
                if (selector === selectors.selectIsAdmin) {
                    return false;
                }
                return false;
            });
            jest.mocked(authApi.useGetUserQuery).mockReturnValue({
                data: mockInstructorUser,
                isLoading: false,
                isError: false,
                error: undefined,
                refetch: jest.fn(),
            } as any);
            jest.mocked(scheduleApi.useGetInstructorCalendarQuery).mockImplementation((params: any) => {
                if (params && params.fromDate && params.toDate) {
                    const today = new Date().toISOString().split("T")[0];
                    if (params.toDate <= today) {
                        return {
                            data: mockUnfinishedSessions,
                            isLoading: false,
                            isError: false,
                            error: undefined,
                            refetch: jest.fn(),
                        } as any;
                    }
                }
                return {
                    data: [],
                    isLoading: false,
                    isError: false,
                    error: undefined,
                    refetch: jest.fn(),
                } as any;
            });
        });

        it("should render unfinished classes section for instructor", () => {
            render(<DashboardPage />);

            const unfinishedTitle = screen.getByText("Niezakończone zajęcia");
            expect(unfinishedTitle).toBeInTheDocument();
        });

        it("should display unfinished classes", () => {
            render(<DashboardPage />);

            expect(screen.getByText("Grupa Niezakończona 1")).toBeInTheDocument();
            expect(screen.getByText("Grupa Niezakończona 2")).toBeInTheDocument();
        });

        it("should display empty message when no unfinished classes", () => {
            jest.mocked(scheduleApi.useGetInstructorCalendarQuery).mockReturnValue({
                data: [],
                isLoading: false,
                isError: false,
                error: undefined,
                refetch: jest.fn(),
            } as any);

            render(<DashboardPage />);

            expect(screen.getByText("Brak niezakończonych zajęć.")).toBeInTheDocument();
        });

        it("should show action buttons for unfinished classes", async () => {
            render(<DashboardPage />);

            await waitFor(() => {
                const attendanceButtons = screen.getAllByTitle("Zarządzaj obecnością");
                expect(attendanceButtons.length).toBeGreaterThan(0);
            });

            const substitutionButtons = screen.getAllByTitle("Dodaj zastępstwo");
            const completeButtons = screen.getAllByTitle("Oznacz jako wykonane");

            expect(substitutionButtons.length).toBeGreaterThan(0);
            expect(completeButtons.length).toBeGreaterThan(0);
        });

        it("should navigate to attendance page when attendance button is clicked", async () => {
            const user = userEvent.setup();
            render(<DashboardPage />);

            await waitFor(() => {
                const attendanceButtons = screen.getAllByTitle("Zarządzaj obecnością");
                expect(attendanceButtons.length).toBeGreaterThan(0);
            });

            const attendanceButton = screen.getAllByTitle("Zarządzaj obecnością")[0];
            await user.click(attendanceButton);

            expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/^\/attendance\/\d+$/));
        });

        it("should open substitution modal when substitution button is clicked", async () => {
            const user = userEvent.setup();
            const mockInstructors = [
                {
                    id: "instructor-uuid-2",
                    email: "instructor2@example.com",
                    isActive: true,
                    isSuperuser: false,
                    isVerified: true,
                    firstName: "Anna",
                    lastName: "Nowak",
                    role: "instructor" as const,
                },
            ];

            jest.mocked(scheduleApi.useGetInstructorsQuery).mockReturnValue({
                data: mockInstructors,
                isLoading: false,
                isError: false,
                error: undefined,
                refetch: jest.fn(),
            } as any);

            render(<DashboardPage />);

            await waitFor(() => {
                const substitutionButtons = screen.getAllByTitle("Dodaj zastępstwo");
                expect(substitutionButtons.length).toBeGreaterThan(0);
            });

            const substitutionButton = screen.getAllByTitle("Dodaj zastępstwo")[0];
            await user.click(substitutionButton);

            await waitFor(() => {
                expect(screen.getByText(/Dodaj zastępstwo/)).toBeInTheDocument();
            });
        });

        it("should open complete session modal when complete button is clicked", async () => {
            const user = userEvent.setup();
            render(<DashboardPage />);

            await waitFor(() => {
                const completeButtons = screen.getAllByTitle("Oznacz jako wykonane");
                expect(completeButtons.length).toBeGreaterThan(0);
            });

            const completeButton = screen.getAllByTitle("Oznacz jako wykonane")[0];
            await user.click(completeButton);

            await waitFor(() => {
                expect(screen.getByText(/Oznacz zajęcia jako wykonane/)).toBeInTheDocument();
            });
        });

        it("should filter unfinished classes correctly (past scheduled sessions)", () => {
            const today = new Date();
            const pastDate = new Date(today);
            pastDate.setDate(today.getDate() - 5);
            const pastDateStr = pastDate.toISOString().split("T")[0];

            const pastScheduledSession = {
                classSessionId: 12,
                classGroupId: 203,
                classGroupName: "Grupa Przeszła",
                date: pastDateStr,
                startTime: "10:00:00",
                endTime: "11:00:00",
                status: "scheduled" as const,
                roomId: 1,
                instructorId: "instructor-uuid-1",
                topicId: 1,
                levelId: 1,
            };

            jest.mocked(scheduleApi.useGetInstructorCalendarQuery).mockImplementation((params: any) => {
                if (params && params.fromDate && params.toDate) {
                    const todayStr = new Date().toISOString().split("T")[0];
                    if (params.toDate <= todayStr) {
                        return {
                            data: [pastScheduledSession],
                            isLoading: false,
                            isError: false,
                            error: undefined,
                            refetch: jest.fn(),
                        } as any;
                    }
                }
                return {
                    data: [],
                    isLoading: false,
                    isError: false,
                    error: undefined,
                    refetch: jest.fn(),
                } as any;
            });

            render(<DashboardPage />);

            expect(screen.getByText("Grupa Przeszła")).toBeInTheDocument();
        });

        it("should not show unfinished classes section for students", () => {
            jest.mocked(store.useAppSelector).mockImplementation((selector) => {
                if (selector === selectors.selectIsStudent) {
                    return true;
                }
                if (selector === selectors.selectIsInstructor) {
                    return false;
                }
                if (selector === selectors.selectIsAdmin) {
                    return false;
                }
                return false;
            });

            render(<DashboardPage />);

            expect(screen.queryByText("Niezakończone zajęcia")).not.toBeInTheDocument();
        });
    });
});
