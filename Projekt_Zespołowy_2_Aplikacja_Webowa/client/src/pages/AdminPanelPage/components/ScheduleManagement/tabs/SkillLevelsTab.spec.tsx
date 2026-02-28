import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillLevelsTab } from "./SkillLevelsTab";
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

describe("SkillLevelsTab", () => {
    const mockPublish = jest.fn();
    const mockCreateSkillLevel = jest.fn();
    const mockUpdateSkillLevel = jest.fn();
    const mockDeleteSkillLevel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(alertContext.useAlert).mockReturnValue({
            publish: mockPublish,
        } as any);

        jest.mocked(adminApi.useListSkillLevelsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useCreateSkillLevelMutation).mockReturnValue([
            mockCreateSkillLevel,
            { isLoading: false },
        ] as any);
        jest.mocked(adminApi.useUpdateSkillLevelMutation).mockReturnValue([
            mockUpdateSkillLevel,
            { isLoading: false },
        ] as any);
        jest.mocked(adminApi.useDeleteSkillLevelMutation).mockReturnValue([
            mockDeleteSkillLevel,
            { isLoading: false },
        ] as any);
    });

    it("should render skill levels tab", () => {
        render(<SkillLevelsTab />);

        expect(screen.getByText("admin.skillLevels")).toBeInTheDocument();
        expect(screen.getByText("admin.addSkillLevel")).toBeInTheDocument();
    });

    it("should render loading state", () => {
        jest.mocked(adminApi.useListSkillLevelsQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        } as any);

        render(<SkillLevelsTab />);

        expect(screen.getByText("admin.loading")).toBeInTheDocument();
    });

    it("should render empty state when no skill levels", () => {
        render(<SkillLevelsTab />);

        expect(screen.getByText("admin.noSkillLevels")).toBeInTheDocument();
    });

    it("should render skill levels list", () => {
        const mockSkillLevels = [
            { id: 1, name: "Beginner", description: "Description 1" },
            { id: 2, name: "Advanced", description: null },
        ];

        jest.mocked(adminApi.useListSkillLevelsQuery).mockReturnValue({
            data: mockSkillLevels,
            isLoading: false,
            isError: false,
        } as any);

        render(<SkillLevelsTab />);

        expect(screen.getByText("Beginner")).toBeInTheDocument();
        expect(screen.getByText("Advanced")).toBeInTheDocument();
    });

    it("should open create modal when add button is clicked", async () => {
        const user = userEvent.setup();
        render(<SkillLevelsTab />);

        const addButtons = screen.getAllByRole("button", { name: /admin\.addSkillLevel/i });
        const addButton = addButtons.find(
            (btn) => (btn as HTMLButtonElement).type === "button" || !(btn as HTMLButtonElement).type,
        );
        if (addButton) {
            await user.click(addButton);
            const modalTitles = screen.getAllByText("admin.addSkillLevel");
            expect(modalTitles.length).toBeGreaterThan(1);
        }
    });
});
