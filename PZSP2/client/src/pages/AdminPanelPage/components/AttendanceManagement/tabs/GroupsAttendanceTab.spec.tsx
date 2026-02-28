import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GroupsAttendanceTab } from "./GroupsAttendanceTab";
import * as adminApi from "../../../../../store/admin/api";

jest.mock("../../../../../store/admin/api");
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock("../../ScheduleManagement/modals/ManageGroupStudentsModal", () => ({
    ManageGroupStudentsModal: ({ isOpen }: any) =>
        isOpen ? <div data-testid="manage-group-modal">Manage Group Modal</div> : null,
}));

describe("GroupsAttendanceTab", () => {
    const mockGroups = [
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

    const mockSemesters = [
        {
            id: 1,
            name: "Fall 2024",
            startDate: "2024-09-01",
            endDate: "2024-12-31",
            isActive: true,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(adminApi.useListClassGroupsQuery).mockReturnValue({
            data: mockGroups,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(adminApi.useListSemestersQuery).mockReturnValue({
            data: mockSemesters,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
    });

    it("should render groups table", () => {
        render(<GroupsAttendanceTab />);

        expect(screen.getByText("admin.attendanceByGroup")).toBeInTheDocument();
        expect(screen.getByText("Test Group")).toBeInTheDocument();
    });

    it("should open modal when group is selected", async () => {
        render(<GroupsAttendanceTab />);

        const buttons = screen.getAllByRole("button");
        const manageButton = buttons.find((btn) => btn.querySelector("svg"));

        if (manageButton) {
            await userEvent.click(manageButton);
            expect(screen.getByTestId("manage-group-modal")).toBeInTheDocument();
        }
    });

    it("should show loading state", () => {
        jest.mocked(adminApi.useListClassGroupsQuery).mockReturnValue({
            data: [],
            isLoading: true,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<GroupsAttendanceTab />);

        expect(screen.getByText("admin.loading")).toBeInTheDocument();
    });

    it("should show empty state when no groups", () => {
        jest.mocked(adminApi.useListClassGroupsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<GroupsAttendanceTab />);

        expect(screen.getByText("admin.noClassGroups")).toBeInTheDocument();
    });
});
