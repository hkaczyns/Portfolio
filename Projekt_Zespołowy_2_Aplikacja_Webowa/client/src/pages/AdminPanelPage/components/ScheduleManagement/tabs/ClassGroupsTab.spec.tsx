import { render, screen } from "@testing-library/react";
import { ClassGroupsTab } from "./ClassGroupsTab";
import * as adminApi from "../../../../../store/admin/api";
import * as alertContext from "../../../../../components/Alert/AlertContext";

jest.mock("../../../../../store/admin/api");
jest.mock("../../../../../components/Alert/AlertContext");
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === "admin.classGroupDeleteConfirm" && options?.name) {
                return `Czy na pewno chcesz usunąć grupę zajęciową "${options.name}"?`;
            }
            return key;
        },
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

jest.mock("../../../../../components/FormField/FormField", () => ({
    FormField: ({ placeholder, value, onChangeText, onBlur, error, touched, icon }: any) => (
        <div>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChangeText && onChangeText(e.target.value)}
                onBlur={onBlur}
            />
            {icon}
            {error && touched && <div>{error}</div>}
        </div>
    ),
}));

describe("ClassGroupsTab", () => {
    const mockPublish = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(alertContext.useAlert).mockReturnValue({
            publish: mockPublish,
        } as any);

        jest.mocked(adminApi.useListClassGroupsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListSemestersQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListSkillLevelsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListTopicsQuery).mockReturnValue({
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

        jest.mocked(adminApi.useCreateClassGroupMutation).mockReturnValue([
            jest.fn().mockResolvedValue({ unwrap: jest.fn() }),
            { isLoading: false },
        ] as any);

        jest.mocked(adminApi.useUpdateClassGroupMutation).mockReturnValue([
            jest.fn().mockResolvedValue({ unwrap: jest.fn() }),
            { isLoading: false },
        ] as any);

        jest.mocked(adminApi.useDeleteClassGroupMutation).mockReturnValue([
            jest.fn().mockResolvedValue({ unwrap: jest.fn() }),
            { isLoading: false },
        ] as any);

        jest.mocked(adminApi.useGenerateClassGroupSessionsMutation).mockReturnValue([
            jest.fn().mockReturnValue({
                unwrap: jest.fn().mockResolvedValue({}),
            }),
            { isLoading: false },
        ] as any);
    });

    it("should render class groups tab", () => {
        render(<ClassGroupsTab />);

        expect(screen.getByText("admin.classGroups")).toBeInTheDocument();
        expect(screen.getByText("admin.addClassGroup")).toBeInTheDocument();
    });

    it("should render loading state", () => {
        jest.mocked(adminApi.useListClassGroupsQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        } as any);

        render(<ClassGroupsTab />);

        expect(screen.getByText("admin.loading")).toBeInTheDocument();
    });

    it("should render empty state when no class groups", () => {
        render(<ClassGroupsTab />);

        expect(screen.getByText("admin.noClassGroups")).toBeInTheDocument();
    });

    it("should render class groups list", () => {
        const mockClassGroups = [
            {
                id: 1,
                semesterId: 1,
                name: "Group 1",
                description: null,
                levelId: 1,
                topicId: 1,
                roomId: null,
                capacity: 10,
                dayOfWeek: 0,
                startTime: "10:00",
                endTime: "11:00",
                instructorId: null,
                isPublic: false,
                status: "draft",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: null,
            },
        ];

        const mockSemesters = [{ id: 1, name: "Semester 1" }];
        const mockSkillLevels = [{ id: 1, name: "Beginner" }];
        const mockTopics = [{ id: 1, name: "Topic 1" }];

        jest.mocked(adminApi.useListClassGroupsQuery).mockReturnValue({
            data: mockClassGroups,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListSemestersQuery).mockReturnValue({
            data: mockSemesters,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListSkillLevelsQuery).mockReturnValue({
            data: mockSkillLevels,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListTopicsQuery).mockReturnValue({
            data: mockTopics,
            isLoading: false,
            isError: false,
        } as any);

        render(<ClassGroupsTab />);

        expect(screen.getByText("Group 1")).toBeInTheDocument();
    });
});
