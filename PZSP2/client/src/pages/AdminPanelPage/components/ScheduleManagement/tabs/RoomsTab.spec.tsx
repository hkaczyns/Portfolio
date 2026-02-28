import { render, screen } from "@testing-library/react";
import { RoomsTab } from "./RoomsTab";
import * as adminApi from "../../../../../store/admin/api";
import * as useRoom from "../../../../../store/admin/api/useRoom";

jest.mock("../../../../../store/admin/api");
jest.mock("../../../../../store/admin/api/useRoom");
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock("@radix-ui/react-dialog", () => ({
    Root: ({ children, open }: any) => (
        <div data-testid="dialog-root" data-open={open}>
            {open && children}
        </div>
    ),
    Portal: ({ children }: any) => <div>{children}</div>,
    Overlay: () => <div data-testid="dialog-overlay" />,
    Content: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
    Title: ({ children }: any) => <h2>{children}</h2>,
    Close: ({ children, asChild }: any) => (asChild ? children : <button>{children}</button>),
}));

describe("RoomsTab", () => {
    const mockRooms = [
        {
            id: 1,
            name: "Room 1",
            capacity: 20,
            description: null,
            isAvailableForRental: false,
            hourlyRate: null,
            isActive: true,
        },
    ];

    const mockCreateRoom = jest.fn();
    const mockUpdateRoom = jest.fn();
    const mockDeleteRoom = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(adminApi.useListRoomsQuery).mockReturnValue({
            data: mockRooms,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(useRoom.useRoom).mockReturnValue({
            createRoom: mockCreateRoom,
            updateRoom: mockUpdateRoom,
            deleteRoom: mockDeleteRoom,
            isCreating: false,
            isUpdating: false,
            isDeleting: false,
        } as any);
    });

    it("should render rooms table", () => {
        render(<RoomsTab />);

        expect(screen.getByText("admin.rooms")).toBeInTheDocument();
        expect(screen.getByText("Room 1")).toBeInTheDocument();
    });

    it("should show loading state", () => {
        jest.mocked(adminApi.useListRoomsQuery).mockReturnValue({
            data: [],
            isLoading: true,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<RoomsTab />);

        expect(screen.getByText("admin.loading")).toBeInTheDocument();
    });

    it("should show empty state when no rooms", () => {
        jest.mocked(adminApi.useListRoomsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<RoomsTab />);

        expect(screen.getByText("admin.noRooms")).toBeInTheDocument();
    });
});
