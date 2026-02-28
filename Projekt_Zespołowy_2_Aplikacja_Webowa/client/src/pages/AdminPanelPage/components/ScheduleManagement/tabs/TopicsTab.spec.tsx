import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TopicsTab } from "./TopicsTab";
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

describe("TopicsTab", () => {
    const mockPublish = jest.fn();
    const mockCreateTopic = jest.fn();
    const mockUpdateTopic = jest.fn();
    const mockDeleteTopic = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(alertContext.useAlert).mockReturnValue({
            publish: mockPublish,
        } as any);

        jest.mocked(adminApi.useListTopicsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useCreateTopicMutation).mockReturnValue([mockCreateTopic, { isLoading: false }] as any);
        jest.mocked(adminApi.useUpdateTopicMutation).mockReturnValue([mockUpdateTopic, { isLoading: false }] as any);
        jest.mocked(adminApi.useDeleteTopicMutation).mockReturnValue([mockDeleteTopic, { isLoading: false }] as any);
    });

    it("should render topics tab", () => {
        render(<TopicsTab />);

        expect(screen.getByText("admin.topics")).toBeInTheDocument();
        expect(screen.getByText("admin.addTopic")).toBeInTheDocument();
    });

    it("should render loading state", () => {
        jest.mocked(adminApi.useListTopicsQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        } as any);

        render(<TopicsTab />);

        expect(screen.getByText("admin.loading")).toBeInTheDocument();
    });

    it("should render empty state when no topics", () => {
        render(<TopicsTab />);

        expect(screen.getByText("admin.noTopics")).toBeInTheDocument();
    });

    it("should render topics list", () => {
        const mockTopics = [
            { id: 1, name: "Topic 1", description: "Description 1" },
            { id: 2, name: "Topic 2", description: null },
        ];

        jest.mocked(adminApi.useListTopicsQuery).mockReturnValue({
            data: mockTopics,
            isLoading: false,
            isError: false,
        } as any);

        render(<TopicsTab />);

        expect(screen.getByText("Topic 1")).toBeInTheDocument();
        expect(screen.getByText("Topic 2")).toBeInTheDocument();
    });

    it("should open create modal when add button is clicked", async () => {
        const user = userEvent.setup();
        render(<TopicsTab />);

        const addButtons = screen.getAllByRole("button", { name: /admin\.addTopic/i });
        const addButton = addButtons.find(
            (btn) => (btn as HTMLButtonElement).type === "button" || !(btn as HTMLButtonElement).type,
        );
        if (addButton) {
            await user.click(addButton);
            const modalTitles = screen.getAllByText("admin.addTopic");
            expect(modalTitles.length).toBeGreaterThan(1);
        }
    });
});
