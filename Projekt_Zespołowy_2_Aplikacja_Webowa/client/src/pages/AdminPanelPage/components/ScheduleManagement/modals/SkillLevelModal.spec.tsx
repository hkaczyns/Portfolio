import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillLevelModal } from "./SkillLevelModal";

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const mockOnOpenChange = jest.fn();

jest.mock("@radix-ui/react-dialog", () => ({
    Root: ({ children, open, onOpenChange }: any) => {
        if (onOpenChange) {
            mockOnOpenChange.mockImplementation(onOpenChange);
        }
        return (
            <div data-testid="dialog-root" data-open={open}>
                {open && children}
            </div>
        );
    },
    Portal: ({ children }: any) => <div>{children}</div>,
    Overlay: () => <div data-testid="dialog-overlay" />,
    Content: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
    Title: ({ children }: any) => <h2>{children}</h2>,
    Close: ({ children, asChild, ...props }: any) => {
        const handleClick = () => {
            if (props.onClick) {
                props.onClick();
            }
            mockOnOpenChange(false);
        };
        if (asChild) {
            return <div onClick={handleClick}>{children}</div>;
        }
        return <button onClick={handleClick}>{children}</button>;
    },
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

describe("SkillLevelModal", () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onSubmit: mockOnSubmit,
        isLoading: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnSubmit.mockResolvedValue(undefined);
        mockOnOpenChange.mockClear();
    });

    it("should not render when isOpen is false", () => {
        render(<SkillLevelModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText("admin.addSkillLevel")).not.toBeInTheDocument();
    });

    it("should render modal content when isOpen is true", () => {
        render(<SkillLevelModal {...defaultProps} />);

        expect(screen.getByText("admin.addSkillLevel")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("admin.name")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("admin.description")).toBeInTheDocument();
    });

    it("should render edit title when initialData is provided", () => {
        const initialData = {
            id: 1,
            name: "Test Level",
            description: "Test Description",
        };

        render(<SkillLevelModal {...defaultProps} initialData={initialData} />);

        expect(screen.getByText("admin.editSkillLevel")).toBeInTheDocument();
    });

    it("should call onClose when cancel button is clicked", async () => {
        const user = userEvent.setup();
        render(<SkillLevelModal {...defaultProps} />);

        const cancelButton = screen.getByRole("button", { name: /account\.cancel|cancel/i });
        await user.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should call onSubmit with form data when form is submitted", async () => {
        const user = userEvent.setup();
        render(<SkillLevelModal {...defaultProps} />);

        const nameInput = screen.getByPlaceholderText("admin.name");
        const descriptionInput = screen.getByPlaceholderText("admin.description");
        const submitButton = screen.getByText("account.save");

        await user.type(nameInput, "New Level");
        await user.type(descriptionInput, "New Description");
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                name: "New Level",
                description: "New Description",
            });
        });
    });
});
