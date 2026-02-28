import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditableField } from "./EditableField";
import { User } from "lucide-react";

describe("EditableField", () => {
    const defaultProps = {
        label: "First Name",
        value: "John",
        onChange: jest.fn(),
        onBlur: jest.fn(),
        isEditing: false,
        onEdit: jest.fn(),
        onSave: jest.fn(),
        onCancel: jest.fn(),
        canSave: false,
        icon: <User />,
    };

    it("should render label and value", () => {
        render(<EditableField {...defaultProps} />);

        expect(screen.getByText("First Name")).toBeInTheDocument();
        expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    });

    it("should show edit button when not editing", () => {
        render(<EditableField {...defaultProps} />);

        const editButton = screen.getByLabelText("Edytuj");
        expect(editButton).toBeInTheDocument();
    });

    it("should call onEdit when edit button is clicked", async () => {
        const onEdit = jest.fn();
        render(<EditableField {...defaultProps} onEdit={onEdit} />);

        const editButton = screen.getByLabelText("Edytuj");
        await userEvent.click(editButton);

        expect(onEdit).toHaveBeenCalled();
    });

    it("should show save and cancel buttons when editing", () => {
        render(<EditableField {...defaultProps} isEditing={true} />);

        expect(screen.getByLabelText("Zapisz")).toBeInTheDocument();
        expect(screen.getByLabelText("Anuluj")).toBeInTheDocument();
    });

    it("should call onSave when save button is clicked", async () => {
        const onSave = jest.fn();
        render(<EditableField {...defaultProps} isEditing={true} canSave={true} onSave={onSave} />);

        const saveButton = screen.getByLabelText("Zapisz");
        await userEvent.click(saveButton);

        expect(onSave).toHaveBeenCalled();
    });

    it("should call onCancel when cancel button is clicked", async () => {
        const onCancel = jest.fn();
        render(<EditableField {...defaultProps} isEditing={true} onCancel={onCancel} />);

        const cancelButton = screen.getByLabelText("Anuluj");
        await userEvent.click(cancelButton);

        expect(onCancel).toHaveBeenCalled();
    });

    it("should disable save button when canSave is false", () => {
        render(<EditableField {...defaultProps} isEditing={true} canSave={false} />);

        const saveButton = screen.getByLabelText("Zapisz");
        expect(saveButton).toBeDisabled();
    });

    it("should show error message when error and touched", () => {
        render(<EditableField {...defaultProps} error="Required field" touched={true} />);

        expect(screen.getByText("Required field")).toBeInTheDocument();
    });

    it("should disable input when not editing", () => {
        render(<EditableField {...defaultProps} />);

        const input = screen.getByDisplayValue("John");
        expect(input).toBeDisabled();
    });

    it("should enable input when editing", () => {
        render(<EditableField {...defaultProps} isEditing={true} />);

        const input = screen.getByDisplayValue("John");
        expect(input).not.toBeDisabled();
    });
});
