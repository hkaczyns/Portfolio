import { render, screen } from "@testing-library/react";
import { SemestersTab } from "./SemestersTab";
import * as adminApi from "../../../../../store/admin/api";
import * as useSemester from "../../../../../store/admin/api/useSemester";

jest.mock("../../../../../store/admin/api");
jest.mock("../../../../../store/admin/api/useSemester");
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

describe("SemestersTab", () => {
    const mockSemesters = [
        {
            id: 1,
            name: "Fall 2024",
            startDate: "2024-09-01",
            endDate: "2024-12-31",
            isActive: true,
        },
    ];

    const mockCreateSemester = jest.fn();
    const mockUpdateSemester = jest.fn();
    const mockDeleteSemester = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(adminApi.useListSemestersQuery).mockReturnValue({
            data: mockSemesters,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
        jest.mocked(useSemester.useSemester).mockReturnValue({
            createSemester: mockCreateSemester,
            updateSemester: mockUpdateSemester,
            deleteSemester: mockDeleteSemester,
            isCreating: false,
            isUpdating: false,
            isDeleting: false,
        } as any);
    });

    it("should render semesters table", () => {
        render(<SemestersTab />);

        expect(screen.getByText("admin.semesters")).toBeInTheDocument();
        expect(screen.getByText("Fall 2024")).toBeInTheDocument();
    });

    it("should show loading state", () => {
        jest.mocked(adminApi.useListSemestersQuery).mockReturnValue({
            data: [],
            isLoading: true,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<SemestersTab />);

        expect(screen.getByText("admin.loading")).toBeInTheDocument();
    });

    it("should show empty state when no semesters", () => {
        jest.mocked(adminApi.useListSemestersQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);

        render(<SemestersTab />);

        expect(screen.getByText("admin.noSemesters")).toBeInTheDocument();
    });
});
