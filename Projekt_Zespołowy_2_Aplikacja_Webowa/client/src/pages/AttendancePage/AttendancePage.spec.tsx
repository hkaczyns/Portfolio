import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AttendancePage } from "./AttendancePage";
import * as attendanceApi from "../../store/attendance/api";
import * as scheduleApi from "../../store/schedule/api";
import * as enrollmentApi from "../../store/enrollment/api";

jest.mock("../../store/attendance/api");
jest.mock("../../store/schedule/api");
jest.mock("../../store/enrollment/api");

describe("AttendancePage", () => {
    const mockAttendanceRecords = [
        {
            id: 1,
            sessionId: 101,
            studentId: "student-uuid-1",
            status: "PRESENT" as const,
            isMakeup: false,
            date: "2025-01-15",
            classGroupId: 1,
            classGroupName: "Grupa Taniec Początkujący",
            semesterId: 1,
            semesterName: "Semestr Zimowy 2025",
        },
        {
            id: 2,
            sessionId: 102,
            studentId: "student-uuid-1",
            status: "ABSENT" as const,
            isMakeup: false,
            date: "2025-01-20",
            classGroupId: 1,
            classGroupName: "Grupa Taniec Początkujący",
            semesterId: 1,
            semesterName: "Semestr Zimowy 2025",
        },
        {
            id: 3,
            sessionId: 103,
            studentId: "student-uuid-1",
            status: "EXCUSED" as const,
            isMakeup: true,
            date: "2025-01-25",
            classGroupId: 2,
            classGroupName: "Grupa Joga Zaawansowani",
            semesterId: 1,
            semesterName: "Semestr Zimowy 2025",
        },
    ];

    const mockSummary = {
        totalCount: 20,
        presentCount: 15,
        absentCount: 3,
        excusedCount: 2,
        makeupCount: 1,
        attendanceRate: 0.85,
    };

    const mockSemesters = [
        { id: 1, name: "Semestr Zimowy 2025" },
        { id: 2, name: "Semestr Letni 2025" },
    ];

    const mockEnrollments = [
        {
            id: 1,
            studentId: "student-uuid-1",
            classGroupId: 1,
            status: "ACTIVE" as const,
            joinedAt: "2025-01-01T00:00:00Z",
            cancelledAt: null,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(attendanceApi.useGetAttendanceQuery).mockReturnValue({
            data: mockAttendanceRecords,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(attendanceApi.useGetAttendanceSummaryQuery).mockReturnValue({
            data: mockSummary,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(scheduleApi.useGetSemestersQuery).mockReturnValue({
            data: mockSemesters,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(enrollmentApi.useGetEnrollmentsQuery).mockReturnValue({
            data: mockEnrollments,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
    });

    it("should render title", () => {
        render(<AttendancePage />);

        expect(screen.getByText("Obecności")).toBeInTheDocument();
    });

    it("should render loading state", () => {
        jest.mocked(attendanceApi.useGetAttendanceQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<AttendancePage />);

        expect(screen.getByText("Ładowanie...")).toBeInTheDocument();
    });

    it("should render error state", () => {
        jest.mocked(attendanceApi.useGetAttendanceQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<AttendancePage />);

        expect(screen.getByText("Wystąpił błąd podczas ładowania danych.")).toBeInTheDocument();
    });

    it("should render attendance summary section", () => {
        render(<AttendancePage />);

        expect(screen.getByText("Statystyki obecności")).toBeInTheDocument();
        expect(screen.getByText(/Łączna liczba zajęć:/)).toBeInTheDocument();
        expect(screen.getByText("20")).toBeInTheDocument();
        expect(screen.getByText(/Obecny:/)).toBeInTheDocument();
        expect(screen.getByText("15")).toBeInTheDocument();
        expect(screen.getByText(/Nieobecny:/)).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText(/Usprawiedliwiony:/)).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        const makeupLabels = screen.getAllByText(/Odrabianie:/);
        expect(makeupLabels.length).toBeGreaterThan(0);
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText(/Frekwencja:/)).toBeInTheDocument();
        expect(screen.getByText("85.0%")).toBeInTheDocument();
    });

    it("should calculate attendance rate correctly (multiply by 100)", () => {
        const customSummary = {
            ...mockSummary,
            attendanceRate: 0.75,
        };

        jest.mocked(attendanceApi.useGetAttendanceSummaryQuery).mockReturnValue({
            data: customSummary,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<AttendancePage />);

        expect(screen.getByText("75.0%")).toBeInTheDocument();
    });

    it("should render attendance table", () => {
        render(<AttendancePage />);

        expect(screen.getByText("Lista obecności")).toBeInTheDocument();
        expect(screen.getByText("Data")).toBeInTheDocument();
        expect(screen.getByText("Grupa zajęć")).toBeInTheDocument();
        expect(screen.getByText("Semestr")).toBeInTheDocument();
        expect(screen.getByText("Status")).toBeInTheDocument();
        expect(screen.getByText("Odrabianie")).toBeInTheDocument();
    });

    it("should render attendance records in table", () => {
        render(<AttendancePage />);

        const groupNames = screen.getAllByText("Grupa Taniec Początkujący");
        expect(groupNames.length).toBeGreaterThan(0);
        const groupNames2 = screen.getAllByText("Grupa Joga Zaawansowani");
        expect(groupNames2.length).toBeGreaterThan(0);
        const semesterNames = screen.getAllByText("Semestr Zimowy 2025");
        expect(semesterNames.length).toBeGreaterThan(0);
    });

    it("should render status badges correctly", () => {
        render(<AttendancePage />);

        const presentBadges = screen.getAllByText("Obecny");
        const absentBadges = screen.getAllByText("Nieobecny");
        const excusedBadges = screen.getAllByText("Usprawiedliwiony");

        expect(presentBadges.length).toBeGreaterThan(0);
        expect(absentBadges.length).toBeGreaterThan(0);
        expect(excusedBadges.length).toBeGreaterThan(0);
    });

    it("should display makeup status correctly", () => {
        render(<AttendancePage />);

        const makeupCells = screen.getAllByText("Tak");
        const notMakeupCells = screen.getAllByText("Nie");

        expect(makeupCells.length).toBeGreaterThan(0);
        expect(notMakeupCells.length).toBeGreaterThan(0);
    });

    it("should render filters section", () => {
        render(<AttendancePage />);

        expect(screen.getByLabelText("Semestr:")).toBeInTheDocument();
        expect(screen.getByLabelText("Grupa zajęć:")).toBeInTheDocument();
        expect(screen.getByLabelText("Status:")).toBeInTheDocument();
        expect(screen.getByLabelText("Od:")).toBeInTheDocument();
        expect(screen.getByLabelText("Do:")).toBeInTheDocument();
        expect(screen.getByLabelText("Odrabianie:")).toBeInTheDocument();
    });

    it("should filter by semester", async () => {
        const user = userEvent.setup();
        const mockUseGetAttendanceQuery = jest.mocked(attendanceApi.useGetAttendanceQuery);

        render(<AttendancePage />);

        const semesterSelect = screen.getByLabelText("Semestr:");
        await user.selectOptions(semesterSelect, "1");

        expect(mockUseGetAttendanceQuery).toHaveBeenCalled();
    });

    it("should filter by class group", async () => {
        const user = userEvent.setup();
        render(<AttendancePage />);

        const classGroupSelect = screen.getByLabelText("Grupa zajęć:");
        await user.selectOptions(classGroupSelect, "1");

        // Filter should be applied
        expect(classGroupSelect).toHaveValue("1");
    });

    it("should filter by status", async () => {
        const user = userEvent.setup();
        render(<AttendancePage />);

        const statusSelect = screen.getByLabelText("Status:");
        await user.selectOptions(statusSelect, "PRESENT");

        expect(statusSelect).toHaveValue("PRESENT");
    });

    it("should filter by date range", async () => {
        const user = userEvent.setup();
        render(<AttendancePage />);

        const fromInput = screen.getByLabelText("Od:");
        const toInput = screen.getByLabelText("Do:");

        await user.type(fromInput, "2025-01-01");
        await user.type(toInput, "2025-01-31");

        expect(fromInput).toHaveValue("2025-01-01");
        expect(toInput).toHaveValue("2025-01-31");
    });

    it("should filter by makeup status", async () => {
        const user = userEvent.setup();
        render(<AttendancePage />);

        const makeupSelect = screen.getByLabelText("Odrabianie:");
        await user.selectOptions(makeupSelect, "true");

        expect(makeupSelect).toHaveValue("true");
    });

    it("should show clear filters button when filters are active", async () => {
        const user = userEvent.setup();
        render(<AttendancePage />);

        const statusSelect = screen.getByLabelText("Status:");
        await user.selectOptions(statusSelect, "PRESENT");

        expect(screen.getByText("Wyczyść filtry")).toBeInTheDocument();
    });

    it("should clear filters when clear button is clicked", async () => {
        const user = userEvent.setup();
        render(<AttendancePage />);

        const statusSelect = screen.getByLabelText("Status:");
        await user.selectOptions(statusSelect, "PRESENT");

        const clearButton = screen.getByText("Wyczyść filtry");
        await user.click(clearButton);

        expect(statusSelect).toHaveValue("");
    });

    it("should display empty state when no attendance records match filters", () => {
        jest.mocked(attendanceApi.useGetAttendanceQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<AttendancePage />);

        expect(screen.getByText("Brak obecności spełniających wybrane kryteria.")).toBeInTheDocument();
    });

    it("should format dates correctly", () => {
        render(<AttendancePage />);

        // Check if dates are formatted (should contain dots or slashes)
        const dateCells = screen.getAllByText(/\d{2}[./]\d{2}[./]\d{4}/);
        expect(dateCells.length).toBeGreaterThan(0);
    });

    it("should populate class group dropdown from attendance records", () => {
        render(<AttendancePage />);

        const classGroupSelect = screen.getByLabelText("Grupa zajęć:");
        const options = Array.from(classGroupSelect.querySelectorAll("option")).map((opt) => opt.textContent);

        expect(options).toContain("Wszystkie");
        expect(options).toContain("Grupa Taniec Początkujący");
        expect(options).toContain("Grupa Joga Zaawansowani");
    });

    it("should populate semester dropdown from API", () => {
        render(<AttendancePage />);

        const semesterSelect = screen.getByLabelText("Semestr:");
        const options = Array.from(semesterSelect.querySelectorAll("option")).map((opt) => opt.textContent);

        expect(options).toContain("Wszystkie");
        expect(options).toContain("Semestr Zimowy 2025");
        expect(options).toContain("Semestr Letni 2025");
    });

    it("should handle missing summary data gracefully", () => {
        jest.mocked(attendanceApi.useGetAttendanceSummaryQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<AttendancePage />);

        expect(screen.queryByText("Statystyki obecności")).not.toBeInTheDocument();
        expect(screen.getByText("Lista obecności")).toBeInTheDocument();
    });

    it("should handle missing attendance data gracefully", () => {
        jest.mocked(attendanceApi.useGetAttendanceQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<AttendancePage />);

        expect(screen.getByText("Brak obecności spełniających wybrane kryteria.")).toBeInTheDocument();
    });
});
