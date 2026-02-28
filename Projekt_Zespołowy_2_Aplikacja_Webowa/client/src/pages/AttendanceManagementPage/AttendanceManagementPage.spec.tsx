import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AttendanceManagementPage } from "./AttendanceManagementPage";
import * as scheduleApi from "../../store/schedule/api";
import * as reactRouterDom from "react-router-dom";
import * as alertContext from "../../components/Alert/AlertContext";

jest.mock("../../store/schedule/api");
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
    useParams: jest.fn(),
}));
jest.mock("../../components/Alert/AlertContext");

describe("AttendanceManagementPage", () => {
    const mockNavigate = jest.fn();
    const mockPublish = jest.fn();
    const mockUpdateAttendance = jest.fn();
    const mockMarkMakeup = jest.fn();

    const mockAttendanceData = [
        {
            studentId: "student-uuid-1",
            firstName: "Jan",
            lastName: "Kowalski",
            email: "jan.kowalski@example.com",
            status: "PRESENT" as const,
        },
        {
            studentId: "student-uuid-2",
            firstName: "Anna",
            lastName: "Nowak",
            email: "anna.nowak@example.com",
            status: "ABSENT" as const,
        },
        {
            studentId: "student-uuid-3",
            firstName: "Piotr",
            lastName: "Wiśniewski",
            email: "piotr.wisniewski@example.com",
            status: null,
        },
    ];

    const mockStudentsData = [
        {
            id: "student-uuid-4",
            firstName: "Katarzyna",
            lastName: "Zielińska",
            email: "katarzyna.zielinska@example.com",
            isActive: true,
            isSuperuser: false,
            isVerified: true,
            role: "student",
        },
        {
            id: "student-uuid-5",
            firstName: "Tomasz",
            lastName: "Lewandowski",
            email: "tomasz.lewandowski@example.com",
            isActive: true,
            isSuperuser: false,
            isVerified: true,
            role: "student",
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(reactRouterDom.useNavigate).mockReturnValue(mockNavigate);
        jest.mocked(reactRouterDom.useParams).mockReturnValue({ sessionId: "123" });
        jest.mocked(alertContext.useAlert).mockReturnValue({
            publish: mockPublish,
            message: "",
            alertType: undefined,
        });
        jest.mocked(scheduleApi.useGetSessionAttendanceQuery).mockReturnValue({
            data: mockAttendanceData,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(scheduleApi.useGetStudentsQuery).mockReturnValue({
            data: mockStudentsData,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(scheduleApi.useUpdateSessionAttendanceMutation).mockReturnValue([
            mockUpdateAttendance,
            { isLoading: false },
        ] as any);
        jest.mocked(scheduleApi.useMarkMakeupMutation).mockReturnValue([mockMarkMakeup, { isLoading: false }] as any);
    });

    it("should render title", () => {
        render(<AttendanceManagementPage />);

        const title = screen.getByRole("heading", { level: 1 });
        expect(title).toBeInTheDocument();
        expect(title).toHaveTextContent("Zarządzanie obecnością");
    });

    it("should render loading state", () => {
        jest.mocked(scheduleApi.useGetSessionAttendanceQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<AttendanceManagementPage />);

        expect(screen.getByText("Ładowanie...")).toBeInTheDocument();
    });

    it("should render error state for 404", () => {
        jest.mocked(scheduleApi.useGetSessionAttendanceQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: { status: 404 },
            refetch: jest.fn(),
        } as any);

        render(<AttendanceManagementPage />);

        expect(screen.getByText("Sesja nie została znaleziona.")).toBeInTheDocument();
    });

    it("should render error state for 403", () => {
        jest.mocked(scheduleApi.useGetSessionAttendanceQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: { status: 403 },
            refetch: jest.fn(),
        } as any);

        render(<AttendanceManagementPage />);

        expect(screen.getByText("Brak uprawnień do wyświetlenia obecności.")).toBeInTheDocument();
    });

    it("should render error state for generic error", () => {
        jest.mocked(scheduleApi.useGetSessionAttendanceQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: { status: 500 },
            refetch: jest.fn(),
        } as any);

        render(<AttendanceManagementPage />);

        expect(screen.getByText("Wystąpił błąd podczas pobierania danych o obecności.")).toBeInTheDocument();
    });

    it("should render invalid session id error", () => {
        jest.mocked(reactRouterDom.useParams).mockReturnValue({ sessionId: "invalid" });

        render(<AttendanceManagementPage />);

        expect(screen.getByText("Nieprawidłowy identyfikator sesji.")).toBeInTheDocument();
    });

    it("should render attendance table with students", () => {
        render(<AttendanceManagementPage />);

        expect(screen.getByText("Jan")).toBeInTheDocument();
        expect(screen.getByText("Kowalski")).toBeInTheDocument();
        expect(screen.getByText("jan.kowalski@example.com")).toBeInTheDocument();

        expect(screen.getByText("Anna")).toBeInTheDocument();
        expect(screen.getByText("Nowak")).toBeInTheDocument();
        expect(screen.getByText("anna.nowak@example.com")).toBeInTheDocument();

        expect(screen.getByText("Piotr")).toBeInTheDocument();
        expect(screen.getByText("Wiśniewski")).toBeInTheDocument();
        expect(screen.getByText("piotr.wisniewski@example.com")).toBeInTheDocument();
    });

    it("should render status badges", () => {
        render(<AttendanceManagementPage />);

        const presentBadges = screen.getAllByText("Obecny");
        expect(presentBadges.length).toBeGreaterThan(0);
    });

    it("should render status buttons for each student", () => {
        render(<AttendanceManagementPage />);

        const presentButtons = screen.getAllByText("Obecny");
        const absentButtons = screen.getAllByText("Nieobecny");
        const excusedButtons = screen.getAllByText("Usprawiedliwiony");

        expect(presentButtons.length).toBeGreaterThanOrEqual(3);
        expect(absentButtons.length).toBeGreaterThanOrEqual(3);
        expect(excusedButtons.length).toBeGreaterThanOrEqual(3);
    });

    it("should render save button", () => {
        render(<AttendanceManagementPage />);

        const saveButton = screen.getByRole("button", { name: /Zatwierdź obecność/i });
        expect(saveButton).toBeInTheDocument();
    });

    it("should render back button", () => {
        render(<AttendanceManagementPage />);

        const backButton = screen.getByRole("button", { name: /Powrót/i });
        expect(backButton).toBeInTheDocument();
    });

    it("should disable save button when no changes", () => {
        render(<AttendanceManagementPage />);

        const saveButton = screen.getByRole("button", { name: /Zatwierdź obecność/i });
        expect(saveButton).toBeDisabled();
    });

    it("should enable save button when changes are made", async () => {
        const user = userEvent.setup();
        render(<AttendanceManagementPage />);

        const allPresentButtons = screen.getAllByText("Obecny");
        const statusButtonForPiotr = allPresentButtons.find((button) => {
            const row = button.closest("tr");
            return row && row.textContent?.includes("Piotr");
        });

        expect(statusButtonForPiotr).toBeDefined();
        await user.click(statusButtonForPiotr!);

        const saveButton = screen.getByRole("button", { name: /Zatwierdź obecność/i });
        expect(saveButton).toBeEnabled();
    });

    it("should change status when button is clicked", async () => {
        const user = userEvent.setup();
        render(<AttendanceManagementPage />);

        const allAbsentButtons = screen.getAllByText("Nieobecny");
        const absentButtonForJan = allAbsentButtons.find((button) => {
            const row = button.closest("tr");
            return row && row.textContent?.includes("Jan");
        });

        expect(absentButtonForJan).toBeDefined();
        await user.click(absentButtonForJan!);

        await waitFor(() => {
            const saveButton = screen.getByRole("button", { name: /Zatwierdź obecność/i });
            expect(saveButton).toBeEnabled();
        });
    });

    it("should call navigate on back button click", async () => {
        const user = userEvent.setup();
        render(<AttendanceManagementPage />);

        const backButton = screen.getByRole("button", { name: /Powrót/i });
        await user.click(backButton);

        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it("should save attendance and navigate on success", async () => {
        const user = userEvent.setup();
        const unwrap = jest.fn().mockResolvedValue({});
        mockUpdateAttendance.mockReturnValue({ unwrap });

        render(<AttendanceManagementPage />);

        const allPresentButtons = screen.getAllByText("Obecny");
        const statusButtonForPiotr = allPresentButtons.find((button) => {
            const row = button.closest("tr");
            return row && row.textContent?.includes("Piotr");
        });

        await user.click(statusButtonForPiotr!);

        const saveButton = screen.getByRole("button", { name: /Zatwierdź obecność/i });
        await user.click(saveButton);

        await waitFor(() => {
            expect(unwrap).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(mockPublish).toHaveBeenCalledWith("Obecność została zapisana pomyślnie!", "success");
            expect(mockNavigate).toHaveBeenCalledWith("/my-classes");
        });
    });

    it("should show error message on save failure", async () => {
        const user = userEvent.setup();
        const unwrap = jest.fn().mockRejectedValue(new Error("API Error"));
        mockUpdateAttendance.mockReturnValue({ unwrap });

        render(<AttendanceManagementPage />);

        const allPresentButtons = screen.getAllByText("Obecny");
        const statusButtonForPiotr = allPresentButtons.find((button) => {
            const row = button.closest("tr");
            return row && row.textContent?.includes("Piotr");
        });

        await user.click(statusButtonForPiotr!);

        const saveButton = screen.getByRole("button", { name: /Zatwierdź obecność/i });
        await user.click(saveButton);

        await waitFor(() => {
            expect(mockPublish).toHaveBeenCalledWith("Wystąpił błąd podczas zapisywania obecności.", "error");
            expect(mockNavigate).not.toHaveBeenCalledWith("/my-classes");
        });
    });

    it("should mark makeup students before saving", async () => {
        const user = userEvent.setup();
        const unwrap = jest.fn().mockResolvedValue({});
        mockUpdateAttendance.mockReturnValue({ unwrap });
        const unwrapMakeup = jest.fn().mockResolvedValue({});
        mockMarkMakeup.mockReturnValue({ unwrap: unwrapMakeup });

        render(<AttendanceManagementPage />);

        const select = screen.getByRole("combobox");
        await userEvent.selectOptions(select, mockStudentsData[0].id);

        const saveButton = screen.getByRole("button", { name: /Zatwierdź obecność/i });
        await user.click(saveButton);

        await waitFor(() => {
            expect(mockMarkMakeup).toHaveBeenCalledWith({
                sessionId: 123,
                studentId: mockStudentsData[0].id,
            });
            expect(unwrapMakeup).toHaveBeenCalled();
            expect(unwrap).toHaveBeenCalled();
        });
    });

    it("should display empty state when no students", () => {
        jest.mocked(scheduleApi.useGetSessionAttendanceQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<AttendanceManagementPage />);

        expect(screen.getByText("Brak uczestników do wyświetlenia.")).toBeInTheDocument();
    });

    it("should refetch data on mount", () => {
        render(<AttendanceManagementPage />);

        expect(scheduleApi.useGetSessionAttendanceQuery).toHaveBeenCalledWith(
            123,
            expect.objectContaining({
                refetchOnMountOrArgChange: true,
            }),
        );
    });

    it("should show correct initial status for each student", () => {
        render(<AttendanceManagementPage />);

        const statusBadges = screen.getAllByText(/Obecny|Nieobecny|Nie zaznaczono/);
        expect(statusBadges.length).toBeGreaterThanOrEqual(3);
    });

    it("should handle multiple status changes for same student", async () => {
        const user = userEvent.setup();
        render(<AttendanceManagementPage />);

        const allPresentButtons = screen.getAllByText("Obecny");
        const allAbsentButtons = screen.getAllByText("Nieobecny");

        const presentButtonForPiotr = allPresentButtons.find((button) => {
            const row = button.closest("tr");
            return row && row.textContent?.includes("Piotr");
        });

        const absentButtonForPiotr = allAbsentButtons.find((button) => {
            const row = button.closest("tr");
            return row && row.textContent?.includes("Piotr");
        });

        await user.click(presentButtonForPiotr!);
        await user.click(absentButtonForPiotr!);

        const saveButton = screen.getByRole("button", { name: /Zatwierdź obecność/i });
        expect(saveButton).toBeEnabled();
    });
});
