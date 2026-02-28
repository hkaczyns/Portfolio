import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompleteSessionModal } from "./CompleteSessionModal";

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === "admin.completeSessionMessage" && options) {
                return `Zakończ sesję z dnia ${options.date} o godzinie ${options.time}`;
            }
            return key;
        },
    }),
}));

const mockOnOpenChange = jest.fn();

jest.mock("@radix-ui/react-dialog", () => {
    return {
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
            if (asChild && React.isValidElement(children)) {
                return React.cloneElement(children, { ...props, onClick: handleClick });
            }
            return (
                <button {...props} onClick={handleClick} disabled={props.disabled}>
                    {children}
                </button>
            );
        },
    };
});

describe("CompleteSessionModal", () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onSubmit: mockOnSubmit,
        isLoading: false,
        sessionDate: "2024-01-15",
        sessionTime: "10:00 - 11:00",
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnSubmit.mockResolvedValue(undefined);
        mockOnOpenChange.mockClear();
    });

    it("should not render when isOpen is false", () => {
        render(<CompleteSessionModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText("admin.completeSession")).not.toBeInTheDocument();
    });

    it("should render modal content when isOpen is true", () => {
        render(<CompleteSessionModal {...defaultProps} />);

        expect(screen.getByText("admin.completeSession")).toBeInTheDocument();
        expect(screen.getByText(/Zakończ sesję z dnia 2024-01-15 o godzinie 10:00 - 11:00/)).toBeInTheDocument();
        expect(screen.getByPlaceholderText("admin.notes")).toBeInTheDocument();
    });

    it("should call onClose when cancel button is clicked", async () => {
        const user = userEvent.setup();
        render(<CompleteSessionModal {...defaultProps} />);

        const cancelButton = screen.getByRole("button", { name: "account.cancel" });
        await user.click(cancelButton);

        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });

    it("should call onSubmit with form data when form is submitted", async () => {
        const user = userEvent.setup();
        render(<CompleteSessionModal {...defaultProps} />);

        const notesInput = screen.getByPlaceholderText("admin.notes");
        const submitButton = screen.getByRole("button", { name: /admin\.complete/i });

        await user.type(notesInput, "Test notes");
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                notes: "Test notes",
            });
        });
    });

    it("should call onSubmit with null notes when form is submitted without notes", async () => {
        const user = userEvent.setup();
        render(<CompleteSessionModal {...defaultProps} />);

        const submitButton = screen.getByText("admin.complete");
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                notes: null,
            });
        });
    });

    it("should disable submit button when isLoading is true", () => {
        render(<CompleteSessionModal {...defaultProps} isLoading={true} />);

        const buttons = screen.getAllByRole("button");
        const submitButtons = buttons.filter((btn) => {
            const button = btn as HTMLButtonElement;
            return button.type === "submit" && !button.className.includes("headerCloseButton");
        });
        expect(submitButtons.length).toBeGreaterThan(0);
        const submitButton = submitButtons[0] as HTMLButtonElement;
        expect(submitButton.hasAttribute("disabled")).toBe(true);
    });
});
