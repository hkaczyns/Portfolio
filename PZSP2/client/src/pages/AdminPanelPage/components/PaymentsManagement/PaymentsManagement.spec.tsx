import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentsManagement } from "./PaymentsManagement";

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock("./tabs/PaymentsTab", () => ({
    PaymentsTab: () => <div>PaymentsTab</div>,
}));

jest.mock("./tabs/ChargesTab", () => ({
    ChargesTab: () => <div>ChargesTab</div>,
}));

jest.mock("./tabs/AllocationsTab", () => ({
    AllocationsTab: () => <div>AllocationsTab</div>,
}));

describe("PaymentsManagement", () => {
    it("should render payments management", () => {
        render(<PaymentsManagement />);
        expect(screen.getByText("admin.paymentsManagement")).toBeInTheDocument();
    });

    it("should render tabs", () => {
        render(<PaymentsManagement />);
        expect(screen.getByText("admin.payments")).toBeInTheDocument();
        expect(screen.getByText("admin.charges")).toBeInTheDocument();
        expect(screen.getByText("admin.allocations")).toBeInTheDocument();
    });

    it("should render PaymentsTab by default", () => {
        render(<PaymentsManagement />);
        expect(screen.getByText("PaymentsTab")).toBeInTheDocument();
    });

    it("should switch to ChargesTab when clicked", async () => {
        const user = userEvent.setup();
        render(<PaymentsManagement />);

        const chargesTab = screen.getByText("admin.charges").closest("button");
        if (chargesTab) {
            await user.click(chargesTab);
            expect(screen.getByText("ChargesTab")).toBeInTheDocument();
        }
    });

    it("should switch to AllocationsTab when clicked", async () => {
        const user = userEvent.setup();
        render(<PaymentsManagement />);

        const allocationsTab = screen.getByText("admin.allocations").closest("button");
        if (allocationsTab) {
            await user.click(allocationsTab);
            expect(screen.getByText("AllocationsTab")).toBeInTheDocument();
        }
    });

    it("should apply active class to selected tab", async () => {
        const user = userEvent.setup();
        render(<PaymentsManagement />);

        const chargesTab = screen.getByText("admin.charges").closest("button");
        if (chargesTab) {
            await user.click(chargesTab);
            expect(chargesTab.className).toContain("tabActive");
        }
    });
});
