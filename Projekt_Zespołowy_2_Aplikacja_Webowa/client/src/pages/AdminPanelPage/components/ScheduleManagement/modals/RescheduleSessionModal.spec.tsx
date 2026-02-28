import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RescheduleSessionModal } from "./RescheduleSessionModal";

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === "admin.rescheduleSessionMessage" && options) {
                return `Przełóż sesję z dnia ${options.date} o godzinie ${options.time}`;
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

describe("RescheduleSessionModal", () => {
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
        render(<RescheduleSessionModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText("admin.rescheduleSession")).not.toBeInTheDocument();
    });

    it("should render modal content when isOpen is true", () => {
        render(<RescheduleSessionModal {...defaultProps} />);

        expect(screen.getByText("admin.rescheduleSession")).toBeInTheDocument();
        expect(screen.getByText(/Przełóż sesję z dnia 2024-01-15 o godzinie 10:00 - 11:00/)).toBeInTheDocument();
        const allInputs = screen.getAllByDisplayValue("") as HTMLInputElement[];
        const dateInput = allInputs.find((input) => input.type === "date");
        expect(dateInput).toBeDefined();
        expect(dateInput?.type).toBe("date");
        const timeInputs = allInputs.filter((input) => input.type === "time");
        expect(timeInputs.length).toBeGreaterThanOrEqual(2);
    });

    it("should call onClose when cancel button is clicked", async () => {
        const user = userEvent.setup();
        render(<RescheduleSessionModal {...defaultProps} />);

        const cancelButton = screen.getByRole("button", { name: "account.cancel" });
        await user.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should call onSubmit with form data when form is submitted", async () => {
        const user = userEvent.setup();
        render(<RescheduleSessionModal {...defaultProps} />);

        const dateInputs = screen.getAllByDisplayValue("") as HTMLInputElement[];
        const dateInput = dateInputs.find((input) => input.type === "date");
        const timeInputs = dateInputs.filter((input) => input.type === "time");
        const submitButton = screen.getByRole("button", { name: /admin\.reschedule/i });

        if (dateInput) {
            await user.type(dateInput, "2024-01-20");
        }
        if (timeInputs[0]) {
            await user.type(timeInputs[0], "14:00");
        }
        if (timeInputs[1]) {
            await user.type(timeInputs[1], "15:00");
        }
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalled();
        });
    });

    it("should disable submit button when isLoading is true", () => {
        render(<RescheduleSessionModal {...defaultProps} isLoading={true} />);

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
