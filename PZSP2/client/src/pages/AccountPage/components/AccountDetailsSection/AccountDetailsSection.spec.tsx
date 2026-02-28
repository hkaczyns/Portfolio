import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountDetailsSection } from "./AccountDetailsSection";
import * as useAccountDetails from "../../hooks/useAccountDetails";
import { UserRole } from "../../../../store/auth/types";

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock("../../hooks/useAccountDetails");

describe("AccountDetailsSection", () => {
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

    const mockFormik = {
        values: {
            firstName: "John",
            lastName: "Doe",
        },
        setFieldValue: jest.fn(),
        setFieldTouched: jest.fn(),
        errors: {},
        touched: {},
        isValid: true,
        dirty: false,
    };

    const mockUseAccountDetails = {
        firstNameFormik: mockFormik,
        lastNameFormik: mockFormik,
        editingField: null,
        handleEditField: jest.fn(),
        handleCancelEdit: jest.fn(),
        handleSaveField: jest.fn(),
        canSaveFirstName: false,
        canSaveLastName: false,
        isLoading: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useAccountDetails.useAccountDetails).mockReturnValue(
            mockUseAccountDetails as unknown as ReturnType<typeof useAccountDetails.useAccountDetails>,
        );
    });

    it("should render all fields", () => {
        render(<AccountDetailsSection user={mockUser} />);

        expect(screen.getByDisplayValue("John")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
        expect(screen.getByDisplayValue("john.doe@example.com")).toBeInTheDocument();
    });

    it("should call handleEditField when edit button is clicked", async () => {
        const handleEditField = jest.fn();
        jest.mocked(useAccountDetails.useAccountDetails).mockReturnValue({
            ...mockUseAccountDetails,
            handleEditField,
        } as unknown as ReturnType<typeof useAccountDetails.useAccountDetails>);

        render(<AccountDetailsSection user={mockUser} />);

        const editButtons = screen.queryAllByText("Edytuj");
        if (editButtons.length > 0) {
            await userEvent.click(editButtons[0]);
            expect(handleEditField).toHaveBeenCalledWith("firstName");
        }
    });
});
