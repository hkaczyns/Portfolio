import { render, screen } from "@testing-library/react";
import { AccountPage } from "./AccountPage";
import * as useAccountPage from "./hooks/useAccountPage";
import * as useAccountDetails from "./hooks/useAccountDetails";
import * as alertContext from "../../components/Alert/AlertContext";
import { UserRole } from "../../store/auth/types";

jest.mock("./hooks/useAccountPage");
jest.mock("./hooks/useAccountDetails");
jest.mock("../../components/Alert/AlertContext");
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: "pl",
            changeLanguage: jest.fn(),
        },
    }),
}));

describe("AccountPage", () => {
    const mockShowModal = jest.fn();
    const mockClose = jest.fn();

    beforeAll(() => {
        HTMLDialogElement.prototype.showModal = mockShowModal;
        HTMLDialogElement.prototype.close = mockClose;
    });
    const mockUser = {
        id: "123",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        isActive: true,
        isSuperuser: false,
        isVerified: true,
        role: UserRole.STUDENT,
    };

    const mockUseAccountPage = {
        user: mockUser,
        isLoadingUser: false,
        isUpdating: false,
        handleLogout: jest.fn(),
        handleChangePassword: jest.fn(),
        handleChangeEmail: jest.fn(),
        handleCancelForm: jest.fn(),
        handleChangePasswordSubmit: jest.fn(),
        handleChangeEmailSubmit: jest.fn(),
        activeView: "details" as "details" | "changePassword" | "changeEmail",
        fullName: "John Doe",
        roleLabel: "Student",
        isDeleteModalOpen: false,
        handleOpenDeleteModal: jest.fn(),
        handleCloseDeleteModal: jest.fn(),
    };

    const mockFormik = {
        values: { firstName: "John", lastName: "Doe" },
        setFieldValue: jest.fn(),
        setFieldTouched: jest.fn(),
        errors: {},
        touched: {},
        isValid: true,
        dirty: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useAccountPage.useAccountPage).mockReturnValue(
            mockUseAccountPage as ReturnType<typeof useAccountPage.useAccountPage>,
        );
        jest.mocked(useAccountDetails.useAccountDetails).mockReturnValue({
            firstNameFormik: mockFormik,
            lastNameFormik: mockFormik,
            editingField: null,
            handleEditField: jest.fn(),
            handleCancelEdit: jest.fn(),
            handleSaveField: jest.fn(),
            canSaveFirstName: false,
            canSaveLastName: false,
            isLoading: false,
        } as unknown as ReturnType<typeof useAccountDetails.useAccountDetails>);
        jest.mocked(alertContext.useAlert).mockReturnValue({
            publish: jest.fn(),
            message: "",
            alertType: undefined,
        });
    });

    it("should render loading spinner when loading", () => {
        jest.mocked(useAccountPage.useAccountPage).mockReturnValue({
            ...mockUseAccountPage,
            isLoadingUser: true,
        } as ReturnType<typeof useAccountPage.useAccountPage>);

        render(<AccountPage />);

        expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });

    it("should render user information when loaded", () => {
        render(<AccountPage />);

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Student")).toBeInTheDocument();
    });

    it("should render account details section", () => {
        render(<AccountPage />);

        expect(screen.getByDisplayValue("John")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
        expect(screen.getByDisplayValue("john.doe@example.com")).toBeInTheDocument();
    });

    it("should render spinner when user is not available", () => {
        jest.mocked(useAccountPage.useAccountPage).mockReturnValue({
            ...mockUseAccountPage,
            user: undefined,
            isLoadingUser: false,
        } as ReturnType<typeof useAccountPage.useAccountPage>);

        const { container } = render(<AccountPage />);

        const spinner = container.querySelector(".spinner");
        expect(spinner).toBeInTheDocument();
    });
});
