import { renderHook } from "@testing-library/react";
import { useClassSessionModal } from "./useClassSessionModal";

describe("useClassSessionModal", () => {
    it("should return initial values when no initialData", () => {
        const { result } = renderHook(() => useClassSessionModal());

        expect(result.current.isEdit).toBe(false);
        expect(result.current.initialValues.classGroupId).toBe(0);
        expect(result.current.initialValues.date).toBe("");
        expect(result.current.initialValues.startTime).toBe("");
        expect(result.current.initialValues.status).toBe("scheduled");
    });

    it("should return initial values from initialData", () => {
        const initialData = {
            id: 1,
            classGroupId: 2,
            date: "2024-01-01T10:00:00Z",
            startTime: "10:00",
            endTime: "11:00",
            roomId: 3,
            instructorId: "instructor-1",
            notes: "Test notes",
            status: "completed",
            cancellationReason: null,
            rescheduledFromId: null,
            createdAt: "2024-01-01T00:00:00Z",
        };

        const { result } = renderHook(() => useClassSessionModal(initialData));

        expect(result.current.isEdit).toBe(true);
        expect(result.current.initialValues.classGroupId).toBe(2);
        expect(result.current.initialValues.startTime).toBe("10:00");
        expect(result.current.initialValues.notes).toBe("Test notes");
        expect(result.current.initialValues.date).toBe("2024-01-01");
    });

    it("should call onSubmit when handleSubmit is called", async () => {
        const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
        const { result } = renderHook(() => useClassSessionModal());

        const values = {
            classGroupId: 1,
            date: "2024-01-01",
            startTime: "10:00",
            endTime: "11:00",
            roomId: null,
            instructorId: null,
            notes: null,
            status: "scheduled",
        };

        await result.current.handleSubmit(values, mockOnSubmit);

        expect(mockOnSubmit).toHaveBeenCalledWith(values);
    });
});
