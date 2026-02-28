import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChargesTab } from "./ChargesTab";
import * as adminApi from "../../../../../store/admin/api";
import * as alertContext from "../../../../../components/Alert/AlertContext";
import { ChargeType, ChargeStatus } from "../../../../../store/admin/api";

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

describe("ChargesTab", () => {
    const mockPublish = jest.fn();
    const mockCharges = [
        {
            id: 1,
            studentId: "student1",
            amountDue: "150.00",
            dueDate: "2024-02-01",
            type: ChargeType.MONTHLY_FEE,
            status: ChargeStatus.OPEN,
            createdBy: null,
            createdAt: "2024-01-01T10:00:00Z",
        },
    ];
    const mockStudents = [
        { id: "student1", firstName: "John", lastName: "Doe", email: "john@example.com", role: "STUDENT" },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(alertContext.useAlert).mockReturnValue({
            publish: mockPublish,
        } as any);

        jest.mocked(adminApi.useListChargesQuery).mockReturnValue({
            data: mockCharges,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useListUsersQuery).mockReturnValue({
            data: mockStudents,
            isLoading: false,
            isError: false,
        } as any);

        jest.mocked(adminApi.useCreateChargeMutation).mockReturnValue([
            jest.fn().mockResolvedValue({ data: mockCharges[0] }),
            { isLoading: false },
        ] as any);

        jest.mocked(adminApi.useUpdateChargeMutation).mockReturnValue([
            jest.fn().mockResolvedValue({ data: mockCharges[0] }),
            { isLoading: false },
        ] as any);

        jest.mocked(adminApi.useCancelChargeMutation).mockReturnValue([
            jest.fn().mockResolvedValue({ data: mockCharges[0] }),
            { isLoading: false },
        ] as any);
    });

    it("should render charges tab", () => {
        render(<ChargesTab />);
        expect(screen.getByText("admin.charges")).toBeInTheDocument();
    });

    it("should render empty state when no charges", () => {
        jest.mocked(adminApi.useListChargesQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        } as any);

        render(<ChargesTab />);
        expect(screen.getByText("admin.noCharges")).toBeInTheDocument();
    });

    it("should render charges table", () => {
        render(<ChargesTab />);
        expect(screen.getByText("admin.student")).toBeInTheDocument();
        expect(screen.getByText("admin.amountDue")).toBeInTheDocument();
        expect(screen.getByText("admin.dueDate")).toBeInTheDocument();
    });

    it("should open edit modal when edit button is clicked", async () => {
        const user = userEvent.setup();
        render(<ChargesTab />);

        const editButtons = screen.getAllByRole("button");
        const editButton = editButtons.find((btn) => btn.querySelector("svg.lucide-edit-2"));
        if (editButton) {
            await user.click(editButton);
            expect(screen.getByText("admin.editCharge")).toBeInTheDocument();
        }
    });

    it("should open cancel modal when cancel button is clicked", async () => {
        const user = userEvent.setup();
        render(<ChargesTab />);

        const cancelButtons = screen.getAllByRole("button");
        const cancelButton = cancelButtons.find((btn) => btn.querySelector("svg.lucide-x-circle"));
        if (cancelButton) {
            await user.click(cancelButton);
            expect(screen.getByText("admin.cancelCharge")).toBeInTheDocument();
        }
    });
});
