import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountActions } from "./AccountActions";

const mockChangeLanguage = jest.fn();

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: "pl",
            changeLanguage: mockChangeLanguage,
        },
    }),
}));

describe("AccountActions", () => {
    const defaultProps = {
        fullName: "John Doe",
        roleLabel: "Student",
        activeView: "details" as "details" | "changePassword" | "changeEmail",
        onShowDetails: jest.fn(),
        onLogout: jest.fn(),
        onDeleteAccount: jest.fn(),
        onChangePassword: jest.fn(),
        onChangeEmail: jest.fn(),
    };

    it("should render user information", () => {
        render(<AccountActions {...defaultProps} />);

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Student")).toBeInTheDocument();
    });

    it("should render all action buttons", () => {
        render(<AccountActions {...defaultProps} />);

        expect(screen.getByText("account.title")).toBeInTheDocument();
        expect(screen.getByText("account.changeEmail")).toBeInTheDocument();
        expect(screen.getByText("account.changePassword")).toBeInTheDocument();
        expect(screen.getByText("settings.language")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "PL" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "ENG" })).toBeInTheDocument();
        expect(screen.getByText("sidebar.logout")).toBeInTheDocument();
        expect(screen.getByText("account.deleteAccount")).toBeInTheDocument();
    });

    it("should call onShowDetails when details button is clicked", async () => {
        const onShowDetails = jest.fn();
        render(<AccountActions {...defaultProps} onShowDetails={onShowDetails} />);

        const detailsButton = screen.getByText("account.title");
        await userEvent.click(detailsButton);

        expect(onShowDetails).toHaveBeenCalled();
    });

    it("should call onLogout when logout button is clicked", async () => {
        const onLogout = jest.fn();
        render(<AccountActions {...defaultProps} onLogout={onLogout} />);

        const logoutButton = screen.getByText("sidebar.logout");
        await userEvent.click(logoutButton);

        expect(onLogout).toHaveBeenCalled();
    });

    it("should call onDeleteAccount when delete button is clicked", async () => {
        const onDeleteAccount = jest.fn();
        render(<AccountActions {...defaultProps} onDeleteAccount={onDeleteAccount} />);

        const deleteButton = screen.getByText("account.deleteAccount");
        await userEvent.click(deleteButton);

        expect(onDeleteAccount).toHaveBeenCalled();
    });

    it("should call onChangePassword when change password button is clicked", async () => {
        const onChangePassword = jest.fn();
        render(<AccountActions {...defaultProps} onChangePassword={onChangePassword} />);

        const changePasswordButton = screen.getByText("account.changePassword");
        await userEvent.click(changePasswordButton);

        expect(onChangePassword).toHaveBeenCalled();
    });

    it("should call onChangeEmail when change email button is clicked", async () => {
        const onChangeEmail = jest.fn();
        render(<AccountActions {...defaultProps} onChangeEmail={onChangeEmail} />);

        const changeEmailButton = screen.getByText("account.changeEmail");
        await userEvent.click(changeEmailButton);

        expect(onChangeEmail).toHaveBeenCalled();
    });

    it("should call changeLanguage when language button is clicked", async () => {
        render(<AccountActions {...defaultProps} />);

        await userEvent.click(screen.getByRole("button", { name: "ENG" }));
        expect(mockChangeLanguage).toHaveBeenCalledWith("en");
    });

    it("should highlight active view when changePassword", () => {
        const { container } = render(
            <AccountActions
                {...defaultProps}
                activeView={"changePassword" as "details" | "changePassword" | "changeEmail"}
            />,
        );

        const buttons = container.querySelectorAll("button");
        const changePasswordButton = Array.from(buttons).find((btn) =>
            btn.textContent?.includes("account.changePassword"),
        );

        expect(changePasswordButton).toBeTruthy();
        expect(changePasswordButton?.className).toContain("actionButtonActive");
    });

    it("should highlight active view when changeEmail", () => {
        const { container } = render(
            <AccountActions
                {...defaultProps}
                activeView={"changeEmail" as "details" | "changePassword" | "changeEmail"}
            />,
        );

        const buttons = container.querySelectorAll("button");
        const changeEmailButton = Array.from(buttons).find((btn) => btn.textContent?.includes("account.changeEmail"));

        expect(changeEmailButton).toBeTruthy();
        expect(changeEmailButton?.className).toContain("actionButtonActive");
    });

    it("should highlight active view when details", () => {
        const { container } = render(
            <AccountActions {...defaultProps} activeView={"details" as "details" | "changePassword" | "changeEmail"} />,
        );

        const buttons = container.querySelectorAll("button");
        const detailsButton = Array.from(buttons).find((btn) => btn.textContent?.includes("account.title"));

        expect(detailsButton).toBeTruthy();
        expect(detailsButton?.className).toContain("actionButtonActive");
    });
});
