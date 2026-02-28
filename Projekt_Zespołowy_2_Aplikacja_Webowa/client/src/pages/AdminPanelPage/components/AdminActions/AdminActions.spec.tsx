import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminActions } from "./AdminActions";

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("AdminActions", () => {
    const defaultProps = {
        activeView: "users" as const,
        onShowUsers: jest.fn(),
        onShowSchedule: jest.fn(),
        onShowPayments: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render users button", () => {
        render(<AdminActions {...defaultProps} />);

        expect(screen.getByText("admin.users")).toBeInTheDocument();
    });

    it("should apply active class to users button when activeView is users", () => {
        render(<AdminActions {...defaultProps} />);

        const usersButton = screen.getByText("admin.users").closest("button");
        expect(usersButton?.className).toContain("actionButtonActive");
    });

    it("should render schedule button", () => {
        render(<AdminActions {...defaultProps} />);

        expect(screen.getByText("admin.schedule")).toBeInTheDocument();
    });

    it("should apply active class to schedule button when activeView is schedule", () => {
        render(<AdminActions {...defaultProps} activeView="schedule" />);

        const scheduleButton = screen.getByText("admin.schedule").closest("button");
        expect(scheduleButton?.className).toContain("actionButtonActive");
    });

    it("should call onShowUsers when users button is clicked", async () => {
        const onShowUsers = jest.fn();
        const user = userEvent.setup();
        render(<AdminActions {...defaultProps} onShowUsers={onShowUsers} />);

        const usersButton = screen.getByText("admin.users");
        await user.click(usersButton);

        expect(onShowUsers).toHaveBeenCalledTimes(1);
    });

    it("should call onShowSchedule when schedule button is clicked", async () => {
        const onShowSchedule = jest.fn();
        const user = userEvent.setup();
        render(<AdminActions {...defaultProps} onShowSchedule={onShowSchedule} />);

        const scheduleButton = screen.getByText("admin.schedule");
        await user.click(scheduleButton);

        expect(onShowSchedule).toHaveBeenCalledTimes(1);
    });
});
