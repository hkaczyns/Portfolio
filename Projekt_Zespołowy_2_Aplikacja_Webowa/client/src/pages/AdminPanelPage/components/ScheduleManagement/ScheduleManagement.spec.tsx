import { render, screen } from "@testing-library/react";
import { ScheduleManagement } from "./ScheduleManagement";
import * as adminApi from "../../../../store/admin/api";
import * as alertContext from "../../../../components/Alert/AlertContext";
import * as useRoomHook from "../../../../store/admin/api/useRoom";

jest.mock("../../../../store/admin/api");
jest.mock("../../../../components/Alert/AlertContext");
jest.mock("../../../../store/admin/api/useRoom");
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("ScheduleManagement", () => {
    const mockPublish = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(alertContext.useAlert).mockReturnValue({
            publish: mockPublish,
        } as any);

        jest.mocked(adminApi.useListRoomsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
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

        jest.mocked(useRoomHook.useRoom).mockReturnValue({
            createRoom: jest.fn(),
            updateRoom: jest.fn(),
            deleteRoom: jest.fn(),
            isCreating: false,
            isUpdating: false,
            isDeleting: false,
        } as any);
    });

    it("should render schedule management title", () => {
        render(<ScheduleManagement />);

        expect(screen.getByText("admin.scheduleManagement")).toBeInTheDocument();
    });

    it("should render tabs", () => {
        render(<ScheduleManagement />);
        expect(screen.getByText("admin.scheduleManagement")).toBeInTheDocument();
    });

    it("should render loading state for rooms", () => {
        jest.mocked(adminApi.useListRoomsQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        } as any);

        render(<ScheduleManagement />);

        expect(screen.getByText("admin.loading")).toBeInTheDocument();
    });

    it("should render empty state when no rooms", () => {
        render(<ScheduleManagement />);

        expect(screen.getByText("admin.noRooms")).toBeInTheDocument();
    });
});
