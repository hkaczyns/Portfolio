import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompleteSessionModal } from "./CompleteSessionModal";

describe("CompleteSessionModal", () => {
    const renderComponent = (overrideProps = {}) => {
        const props = {
            sessionName: "Zajęcia 1",
            onConfirm: jest.fn(),
            onCancel: jest.fn(),
            isLoading: false,
            ...overrideProps,
        };

        render(<CompleteSessionModal {...props} />);
        return props;
    };

    it("renders modal title and textarea", () => {
        renderComponent();

        expect(screen.getByText("Oznacz zajęcia jako wykonane")).toBeInTheDocument();
        expect(screen.getByText("Zajęcia:")).toBeInTheDocument();
        expect(screen.getByLabelText("Notatka (opcjonalnie):")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Anuluj/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Potwierdź/i })).toBeInTheDocument();
    });

    it("calls onCancel when cancel button is clicked", async () => {
        const user = userEvent.setup();
        const { onCancel } = renderComponent();

        const cancelButton = screen.getByRole("button", { name: /Anuluj/i });
        await user.click(cancelButton);

        expect(onCancel).toHaveBeenCalled();
    });

    it("submits entered notes through onConfirm", async () => {
        const user = userEvent.setup();
        const { onConfirm } = renderComponent();

        const textarea = screen.getByLabelText("Notatka (opcjonalnie):") as HTMLTextAreaElement;
        await user.type(textarea, "Uwagi do zajęć");

        const confirmButton = screen.getByRole("button", { name: /Potwierdź/i });
        await user.click(confirmButton);

        expect(onConfirm).toHaveBeenCalledWith("Uwagi do zajęć");
    });

    it("disables inputs and shows loading text when isLoading is true", () => {
        renderComponent({ isLoading: true });

        expect(screen.getByLabelText("Notatka (opcjonalnie):")).toBeDisabled();
        expect(screen.getByRole("button", { name: /Zapisywanie\.\.\./i })).toBeDisabled();
        expect(screen.getByRole("button", { name: /Anuluj/i })).toBeDisabled();
    });
});
