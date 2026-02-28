import { render, screen } from "@testing-library/react";
import { TopicModal } from "./TopicModal";

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
    FormField: ({ label, children, error }: any) => (
        <div>
            {label && <label htmlFor={label}>{label}</label>}
            {children}
            {error && <div>{error}</div>}
        </div>
    ),
}));

describe("TopicModal", () => {
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
        if (mockOnOpenChange) {
            mockOnOpenChange.mockClear();
        }
    });

    it("should not render when isOpen is false", () => {
        render(<TopicModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText("admin.addTopic")).not.toBeInTheDocument();
    });
});
