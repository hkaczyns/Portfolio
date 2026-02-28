import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubstitutionModal } from "./SubstitutionModal";

describe("SubstitutionModal", () => {
    const instructors = [
        {
            id: "instr-1",
            email: "ala@example.com",
            isActive: true,
            isSuperuser: false,
            isVerified: true,
            firstName: "Ala",
            lastName: "Kowalska",
            role: "instructor",
        },
        {
            id: "instr-2",
            email: "ola@example.com",
            isActive: true,
            isSuperuser: false,
            isVerified: true,
            firstName: "Ola",
            lastName: "Nowak",
            role: "instructor",
        },
    ];

    const renderComponent = (overrideProps = {}) => {
        const props = {
            sessionName: "Testowe zajęcia",
            instructors,
            onConfirm: jest.fn(),
            onCancel: jest.fn(),
            isLoading: false,
            ...overrideProps,
        };

        render(<SubstitutionModal {...props} />);
        return props;
    };

    it("renders modal with form fields", () => {
        renderComponent();

        expect(screen.getByText("Dodaj zastępstwo")).toBeInTheDocument();
        expect(screen.getByText("Zajęcia:")).toBeInTheDocument();
        expect(screen.getByLabelText("Instruktor zastępujący:")).toBeInTheDocument();
        expect(screen.getByLabelText("Powód zastępstwa:")).toBeInTheDocument();
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

    it("shows alert and does not call onConfirm when instructor is not selected", async () => {
        const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
        const user = userEvent.setup();
        const { onConfirm } = renderComponent();

        const form = document.querySelector("form") as HTMLFormElement | null;
        if (form) {
            form.noValidate = true;
        }

        const confirmButton = screen.getByRole("button", { name: /Potwierdź/i });
        await user.click(confirmButton);

        expect(alertSpy).toHaveBeenCalledWith("Wybierz instruktora zastępującego");
        expect(onConfirm).not.toHaveBeenCalled();
        alertSpy.mockRestore();
    });

    it("calls onConfirm with selected instructor and reason", async () => {
        const user = userEvent.setup();
        const { onConfirm } = renderComponent();

        const select = screen.getByLabelText("Instruktor zastępujący:") as HTMLSelectElement;
        await user.selectOptions(select, instructors[1].id);

        const textarea = screen.getByLabelText("Powód zastępstwa:") as HTMLTextAreaElement;
        await user.type(textarea, "Choroba instruktora");

        const confirmButton = screen.getByRole("button", { name: /Potwierdź/i });
        await user.click(confirmButton);

        expect(onConfirm).toHaveBeenCalledWith(instructors[1].id, "Choroba instruktora");
    });

    it("disables inputs and changes button text when loading", () => {
        renderComponent({ isLoading: true });

        expect(screen.getByLabelText("Instruktor zastępujący:")).toBeDisabled();
        expect(screen.getByLabelText("Powód zastępstwa:")).toBeDisabled();
        expect(screen.getByRole("button", { name: /Zapisywanie\.\.\./i })).toBeDisabled();
    });
});
