import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PublicCalendarPage } from "./PublicCalendarPage";
import * as scheduleApi from "../../store/schedule/api";

jest.mock("../../store/schedule/api");
jest.mock("react-i18next", () => ({
    useTranslation: (ns?: string, options?: { keyPrefix?: string }) => {
        const prefix = options?.keyPrefix ? `${options.keyPrefix}.` : "";
        return {
            t: (key: string) => `${prefix}${key}`,
            i18n: {
                language: "pl",
                changeLanguage: jest.fn(),
            },
        };
    },
}));

describe("PublicCalendarPage", () => {
    const mockSkillLevels = [
        { id: 1, name: "Początkujący" },
        { id: 2, name: "Średniozaawansowany" },
        { id: 3, name: "Zaawansowany" },
    ];

    const mockTopics = [
        { id: 1, name: "Taniec" },
        { id: 2, name: "Joga" },
        { id: 3, name: "Fitness" },
    ];

    const mockScheduleData = {
        range: {
            from: "2025-01-18",
            to: "2026-01-18",
        },
        groups: [
            {
                groupId: 1,
                name: "Grupa 1",
                level: "Początkujący",
                topic: "Taniec",
                room: {
                    id: 1,
                    name: "Sala A",
                },
                capacity: 20,
                enrolledCount: 15,
                availableSpots: 5,
                waitlistCount: 2,
                canJoinWaitlist: true,
                occurrences: [
                    {
                        startAt: "2025-01-20T10:00:00Z",
                        endAt: "2025-01-20T11:00:00Z",
                        isCancelled: false,
                    },
                    {
                        startAt: "2025-01-27T10:00:00Z",
                        endAt: "2025-01-27T11:00:00Z",
                        isCancelled: false,
                    },
                ],
            },
            {
                groupId: 2,
                name: "Grupa 2",
                level: "Zaawansowany",
                topic: "Joga",
                room: null,
                capacity: 15,
                enrolledCount: 15,
                availableSpots: 0,
                waitlistCount: 0,
                canJoinWaitlist: false,
                occurrences: [
                    {
                        startAt: "2025-01-21T14:00:00Z",
                        endAt: "2025-01-21T15:30:00Z",
                        isCancelled: false,
                    },
                ],
            },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(scheduleApi.useGetPublicScheduleQuery).mockReturnValue({
            data: mockScheduleData,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        jest.mocked(scheduleApi.useGetSkillLevelsQuery).mockReturnValue({
            data: mockSkillLevels,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        jest.mocked(scheduleApi.useGetTopicsQuery).mockReturnValue({
            data: mockTopics,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
    });

    it("should render title", () => {
        render(<PublicCalendarPage />);

        const title = screen.getByRole("heading", { level: 1 });
        expect(title).toBeInTheDocument();
        expect(title).toHaveTextContent("calendar.title");
    });

    it("should render loading state", () => {
        jest.mocked(scheduleApi.useGetPublicScheduleQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<PublicCalendarPage />);

        expect(screen.getByText("calendar.loading")).toBeInTheDocument();
        expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    });

    it("should render filters", () => {
        render(<PublicCalendarPage />);

        expect(screen.getByLabelText("Poziom zaawansowania:")).toBeInTheDocument();
        expect(screen.getByLabelText("Temat:")).toBeInTheDocument();
        expect(screen.getByText("Wyczyść filtry")).toBeInTheDocument();
    });

    it("should render skill level options", () => {
        render(<PublicCalendarPage />);

        const skillLevelSelect = screen.getByLabelText("Poziom zaawansowania:") as HTMLSelectElement;
        expect(skillLevelSelect.options.length).toBe(4);
        expect(skillLevelSelect.options[0].text).toBe("Wszystkie poziomy");
        expect(skillLevelSelect.options[1].text).toBe("Początkujący");
        expect(skillLevelSelect.options[2].text).toBe("Średniozaawansowany");
        expect(skillLevelSelect.options[3].text).toBe("Zaawansowany");
    });

    it("should render topic options", () => {
        render(<PublicCalendarPage />);

        const topicSelect = screen.getByLabelText("Temat:") as HTMLSelectElement;
        expect(topicSelect.options.length).toBe(4);
        expect(topicSelect.options[0].text).toBe("Wszystkie tematy");
        expect(topicSelect.options[1].text).toBe("Taniec");
        expect(topicSelect.options[2].text).toBe("Joga");
        expect(topicSelect.options[3].text).toBe("Fitness");
    });

    it("should render schedule groups", () => {
        render(<PublicCalendarPage />);

        expect(screen.getByText("Grupa 1")).toBeInTheDocument();
        expect(screen.getByText("Grupa 2")).toBeInTheDocument();
        expect(screen.getByText("Dostępne")).toBeInTheDocument();
        expect(screen.getByText("Pełne")).toBeInTheDocument();
    });

    it("should render group details", () => {
        render(<PublicCalendarPage />);

        const group1Title = screen.getByText("Grupa 1");
        expect(group1Title).toBeInTheDocument();

        const poziomTexts = screen.getAllByText(/Początkujący/);
        expect(poziomTexts.length).toBeGreaterThan(0);

        const taniecTexts = screen.getAllByText(/Taniec/);
        expect(taniecTexts.length).toBeGreaterThan(0);

        expect(screen.getByText("Sala A")).toBeInTheDocument();
        expect(screen.getByText("15 / 20")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("should render occurrences", () => {
        render(<PublicCalendarPage />);

        const time10 = screen.getAllByText(/10:00/);
        const time11 = screen.getAllByText(/11:00/);
        const time14 = screen.getAllByText(/14:00/);
        const time15 = screen.getAllByText(/15:30/);

        expect(time10.length).toBeGreaterThan(0);
        expect(time11.length).toBeGreaterThan(0);
        expect(time14.length).toBeGreaterThan(0);
        expect(time15.length).toBeGreaterThan(0);
    });

    it("should filter by skill level", async () => {
        const user = userEvent.setup();
        render(<PublicCalendarPage />);

        const skillLevelSelect = screen.getByLabelText("Poziom zaawansowania:") as HTMLSelectElement;
        await user.selectOptions(skillLevelSelect, "Początkujący");

        expect(skillLevelSelect.value).toBe("Początkujący");
    });

    it("should filter by topic", async () => {
        const user = userEvent.setup();
        render(<PublicCalendarPage />);

        const topicSelect = screen.getByLabelText("Temat:") as HTMLSelectElement;
        await user.selectOptions(topicSelect, "Joga");

        expect(topicSelect.value).toBe("Joga");
    });

    it("should clear filters", async () => {
        const user = userEvent.setup();
        render(<PublicCalendarPage />);

        const skillLevelSelect = screen.getByLabelText("Poziom zaawansowania:") as HTMLSelectElement;
        const topicSelect = screen.getByLabelText("Temat:") as HTMLSelectElement;
        const clearButton = screen.getByText("Wyczyść filtry");

        await user.selectOptions(skillLevelSelect, "Początkujący");
        await user.selectOptions(topicSelect, "Taniec");
        await user.click(clearButton);

        expect(skillLevelSelect.value).toBe("");
        expect(topicSelect.value).toBe("");
    });

    it("should display empty state when no groups", () => {
        jest.mocked(scheduleApi.useGetPublicScheduleQuery).mockReturnValue({
            data: {
                range: {
                    from: "2025-01-18",
                    to: "2026-01-18",
                },
                groups: [],
            },
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<PublicCalendarPage />);

        expect(screen.getByText("Brak grup zajęciowych do wyświetlenia.")).toBeInTheDocument();
    });

    it("should display empty state when scheduleData is undefined", () => {
        jest.mocked(scheduleApi.useGetPublicScheduleQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<PublicCalendarPage />);

        expect(screen.getByText("Brak grup zajęciowych do wyświetlenia.")).toBeInTheDocument();
    });

    it("should not render cancelled occurrences", () => {
        const scheduleDataWithCancelled = {
            ...mockScheduleData,
            groups: [
                {
                    ...mockScheduleData.groups[0],
                    occurrences: [
                        {
                            startAt: "2025-01-20T10:00:00Z",
                            endAt: "2025-01-20T11:00:00Z",
                            isCancelled: true,
                        },
                        {
                            startAt: "2025-01-27T10:00:00Z",
                            endAt: "2025-01-27T11:00:00Z",
                            isCancelled: false,
                        },
                    ],
                },
            ],
        };

        jest.mocked(scheduleApi.useGetPublicScheduleQuery).mockReturnValue({
            data: scheduleDataWithCancelled,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<PublicCalendarPage />);

        expect(screen.getByText(/11:00/)).toBeInTheDocument();
        const allOccurrences = screen.queryAllByText(/10:00/);
        expect(allOccurrences.length).toBeGreaterThanOrEqual(1);
    });

    it("should not render room when room is null", () => {
        render(<PublicCalendarPage />);

        const roomLabels = screen.queryAllByText("Sala:");
        expect(roomLabels.length).toBe(1);
    });

    it("should not render waitlist count when waitlistCount is 0", () => {
        render(<PublicCalendarPage />);

        const waitlistLabels = screen.queryAllByText("Lista oczekujących:");
        expect(waitlistLabels.length).toBe(1);
    });

    it("should display 'Dostępne' badge when availableSpots > 0", () => {
        render(<PublicCalendarPage />);

        const badges = screen.getAllByText("Dostępne");
        expect(badges.length).toBe(1);
    });

    it("should display 'Pełne' badge when availableSpots is 0", () => {
        render(<PublicCalendarPage />);

        const badges = screen.getAllByText("Pełne");
        expect(badges.length).toBe(1);
    });
});
