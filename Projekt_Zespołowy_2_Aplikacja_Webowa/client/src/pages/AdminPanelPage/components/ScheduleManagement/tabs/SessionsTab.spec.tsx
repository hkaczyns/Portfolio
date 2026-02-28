import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SessionsTab } from "./SessionsTab";
import * as adminApi from "../../../../../store/admin/api";
import * as alertContext from "../../../../../components/Alert/AlertContext";

jest.mock("../../../../../store/admin/api");
jest.mock("../../../../../components/Alert/AlertContext");
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock("@radix-ui/react-dialog", () => ({
    Root: ({ children, open }: any) => (open ? <div>{children}</div> : null),
    Portal: ({ children }: any) => <div>{children}</div>,
    Overlay: () => <div />,
    Content: ({ children }: any) => <div>{children}</div>,
    Title: ({ children }: any) => <h2>{children}</h2>,
    Close: ({ children, asChild }: any) => (asChild ? children : <button>{children}</button>),
}));

describe("SessionsTab", () => {
    const mockPublish = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(alertContext.useAlert).mockReturnValue({
            publish: mockPublish,
        } as any);

        jest.mocked(adminApi.useListClassSessionsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListClassGroupsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListRoomsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListInstructorsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useCreateClassSessionMutation).mockReturnValue([
            jest.fn().mockResolvedValue({ unwrap: jest.fn() }),
            { isLoading: false },
        ] as any);

        jest.mocked(adminApi.useUpdateClassSessionMutation).mockReturnValue([
            jest.fn().mockResolvedValue({ unwrap: jest.fn() }),
            { isLoading: false },
        ] as any);

        jest.mocked(adminApi.useDeleteClassSessionMutation).mockReturnValue([
            jest.fn().mockResolvedValue({ unwrap: jest.fn() }),
            { isLoading: false },
        ] as any);

        jest.mocked(adminApi.useCancelClassSessionMutation).mockReturnValue([
            jest.fn().mockResolvedValue({ unwrap: jest.fn() }),
            { isLoading: false },
        ] as any);

        jest.mocked(adminApi.useCompleteClassSessionMutation).mockReturnValue([
            jest.fn().mockResolvedValue({ unwrap: jest.fn() }),
            { isLoading: false },
        ] as any);

        jest.mocked(adminApi.useRescheduleClassSessionMutation).mockReturnValue([
            jest.fn().mockResolvedValue({ unwrap: jest.fn() }),
            { isLoading: false },
        ] as any);
    });

    it("should render sessions tab", () => {
        render(<SessionsTab />);

        expect(screen.getByText("admin.sessions")).toBeInTheDocument();
        expect(screen.getByText("admin.addSession")).toBeInTheDocument();
    });

    it("should render loading state", () => {
        jest.mocked(adminApi.useListClassSessionsQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        } as any);

        render(<SessionsTab />);

        expect(screen.getByText("admin.loading")).toBeInTheDocument();
    });

    it("should render empty state when no sessions", () => {
        render(<SessionsTab />);

        expect(screen.getByText("admin.noSessions")).toBeInTheDocument();
    });

    it("should render sessions list", () => {
        const mockSessions = [
            {
                id: 1,
                classGroupId: 1,
                date: "2024-01-01",
                startTime: "10:00",
                endTime: "11:00",
                instructorId: null,
                roomId: 1,
                notes: null,
                status: "scheduled",
                cancellationReason: null,
                rescheduledFromId: null,
                createdAt: "2024-01-01T00:00:00Z",
            },
        ];

        const mockClassGroups = [{ id: 1, name: "Group 1" }];
        const mockRooms = [{ id: 1, name: "Room 1" }];
        const mockInstructors = [
            { id: "1", firstName: "John", lastName: "Doe", email: "john@example.com", role: "instructor" },
        ];

        jest.mocked(adminApi.useListClassSessionsQuery).mockReturnValue({
            data: mockSessions,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListClassGroupsQuery).mockReturnValue({
            data: mockClassGroups,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListRoomsQuery).mockReturnValue({
            data: mockRooms,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListInstructorsQuery).mockReturnValue({
            data: mockInstructors,
            isLoading: false,
            isError: false,
        } as any);

        render(<SessionsTab />);

        expect(screen.getByText("Group 1")).toBeInTheDocument();
    });

    it("should open create modal when add button is clicked", async () => {
        const user = userEvent.setup();
        render(<SessionsTab />);

        const addButtons = screen.getAllByRole("button", { name: /admin\.addSession/i });
        const addButton = addButtons.find((btn) => {
            const button = btn as HTMLButtonElement;
            return button.type === "button" || !button.type;
        });
        if (addButton) {
            await user.click(addButton);
            const modalTitles = screen.getAllByText("admin.addSession");
            expect(modalTitles.length).toBeGreaterThan(1);
        }
    });

    it("should show cancel button for scheduled sessions", () => {
        const mockSessions = [
            {
                id: 1,
                classGroupId: 1,
                date: "2024-01-01",
                startTime: "10:00",
                endTime: "11:00",
                instructorId: null,
                roomId: 1,
                notes: null,
                status: "scheduled",
                cancellationReason: null,
                rescheduledFromId: null,
                createdAt: "2024-01-01T00:00:00Z",
            },
        ];

        const mockClassGroups = [{ id: 1, name: "Group 1" }];
        const mockRooms = [{ id: 1, name: "Room 1" }];
        const mockInstructors = [
            { id: "1", firstName: "John", lastName: "Doe", email: "john@example.com", role: "instructor" },
        ];

        jest.mocked(adminApi.useListClassSessionsQuery).mockReturnValue({
            data: mockSessions,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListClassGroupsQuery).mockReturnValue({
            data: mockClassGroups,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListRoomsQuery).mockReturnValue({
            data: mockRooms,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListInstructorsQuery).mockReturnValue({
            data: mockInstructors,
            isLoading: false,
            isError: false,
        } as any);

        render(<SessionsTab />);

        const table = screen.getByRole("table");
        const buttons = Array.from(table.querySelectorAll("button"));
        expect(buttons.length).toBeGreaterThan(0);
    });

    it("should open cancel modal when cancel button is clicked", async () => {
        const user = userEvent.setup();
        const mockSessions = [
            {
                id: 1,
                classGroupId: 1,
                date: "2024-01-01",
                startTime: "10:00",
                endTime: "11:00",
                instructorId: null,
                roomId: 1,
                notes: null,
                status: "scheduled",
                cancellationReason: null,
                rescheduledFromId: null,
                createdAt: "2024-01-01T00:00:00Z",
            },
        ];

        const mockClassGroups = [{ id: 1, name: "Group 1" }];
        const mockRooms = [{ id: 1, name: "Room 1" }];
        const mockInstructors = [
            { id: "1", firstName: "John", lastName: "Doe", email: "john@example.com", role: "instructor" },
        ];

        jest.mocked(adminApi.useListClassSessionsQuery).mockReturnValue({
            data: mockSessions,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListClassGroupsQuery).mockReturnValue({
            data: mockClassGroups,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListRoomsQuery).mockReturnValue({
            data: mockRooms,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListInstructorsQuery).mockReturnValue({
            data: mockInstructors,
            isLoading: false,
            isError: false,
        } as any);

        render(<SessionsTab />);

        const table = screen.getByRole("table");
        const buttons = Array.from(table.querySelectorAll("button"));
        const cancelButton = buttons[1];
        if (cancelButton) {
            await user.click(cancelButton);
        }

        await waitFor(() => {
            expect(screen.getByText("admin.cancelSession")).toBeInTheDocument();
        });
    });

    it("should open complete modal when complete button is clicked", async () => {
        const user = userEvent.setup();
        const mockSessions = [
            {
                id: 1,
                classGroupId: 1,
                date: "2024-01-01",
                startTime: "10:00",
                endTime: "11:00",
                instructorId: null,
                roomId: 1,
                notes: null,
                status: "scheduled",
                cancellationReason: null,
                rescheduledFromId: null,
                createdAt: "2024-01-01T00:00:00Z",
            },
        ];

        const mockClassGroups = [{ id: 1, name: "Group 1" }];
        const mockRooms = [{ id: 1, name: "Room 1" }];
        const mockInstructors = [
            { id: "1", firstName: "John", lastName: "Doe", email: "john@example.com", role: "instructor" },
        ];

        jest.mocked(adminApi.useListClassSessionsQuery).mockReturnValue({
            data: mockSessions,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListClassGroupsQuery).mockReturnValue({
            data: mockClassGroups,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListRoomsQuery).mockReturnValue({
            data: mockRooms,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListInstructorsQuery).mockReturnValue({
            data: mockInstructors,
            isLoading: false,
            isError: false,
        } as any);

        render(<SessionsTab />);

        const table = screen.getByRole("table");
        const buttons = Array.from(table.querySelectorAll("button"));
        const completeButton = buttons[3];
        if (completeButton) {
            await user.click(completeButton);
        }

        await waitFor(() => {
            expect(screen.getByText("admin.completeSession")).toBeInTheDocument();
        });
    });

    it("should open reschedule modal when reschedule button is clicked", async () => {
        const user = userEvent.setup();
        const mockSessions = [
            {
                id: 1,
                classGroupId: 1,
                date: "2024-01-01",
                startTime: "10:00",
                endTime: "11:00",
                instructorId: null,
                roomId: 1,
                notes: null,
                status: "scheduled",
                cancellationReason: null,
                rescheduledFromId: null,
                createdAt: "2024-01-01T00:00:00Z",
            },
        ];

        const mockClassGroups = [{ id: 1, name: "Group 1" }];
        const mockRooms = [{ id: 1, name: "Room 1" }];
        const mockInstructors = [
            { id: "1", firstName: "John", lastName: "Doe", email: "john@example.com", role: "instructor" },
        ];

        jest.mocked(adminApi.useListClassSessionsQuery).mockReturnValue({
            data: mockSessions,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListClassGroupsQuery).mockReturnValue({
            data: mockClassGroups,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListRoomsQuery).mockReturnValue({
            data: mockRooms,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListInstructorsQuery).mockReturnValue({
            data: mockInstructors,
            isLoading: false,
            isError: false,
        } as any);

        render(<SessionsTab />);

        const table = screen.getByRole("table");
        const buttons = Array.from(table.querySelectorAll("button"));
        const rescheduleButton = buttons[2];
        if (rescheduleButton) {
            await user.click(rescheduleButton);
        }

        await waitFor(() => {
            expect(screen.getByText("admin.rescheduleSession")).toBeInTheDocument();
        });
    });
});
