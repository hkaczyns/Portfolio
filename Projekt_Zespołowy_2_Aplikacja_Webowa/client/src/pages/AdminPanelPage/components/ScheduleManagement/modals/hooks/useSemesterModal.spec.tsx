import { renderHook } from "@testing-library/react";
import { useSemesterModal } from "./useSemesterModal";

describe("useSemesterModal", () => {
    it("should return initial values when no initialData", () => {
        const { result } = renderHook(() => useSemesterModal());

        expect(result.current.isEdit).toBe(false);
        expect(result.current.initialValues.name).toBe("");
        expect(result.current.initialValues.startDate).toBe("");
        expect(result.current.initialValues.endDate).toBe("");
        expect(result.current.initialValues.isActive).toBe(true);
    });

    it("should return initial values from initialData", () => {
        const initialData = {
            id: 1,
            name: "Fall 2024",
            startDate: "2024-09-01T00:00:00Z",
            endDate: "2024-12-31T00:00:00Z",
            isActive: true,
            createdAt: "2024-01-01T00:00:00Z",
            createdBy: "admin",
            updatedAt: null,
        };

        const { result } = renderHook(() => useSemesterModal(initialData));

        expect(result.current.isEdit).toBe(true);
        expect(result.current.initialValues.name).toBe("Fall 2024");
        expect(result.current.initialValues.startDate).toBe("2024-09-01");
        expect(result.current.initialValues.endDate).toBe("2024-12-31");
    });

    it("should transform values when handleSubmit is called", async () => {
        const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
        const { result } = renderHook(() => useSemesterModal());

        const values = {
            name: "Spring 2024",
            startDate: "2024-01-01",
            endDate: "2024-05-31",
            isActive: true,
        };

        await result.current.handleSubmit(values, mockOnSubmit);

        expect(mockOnSubmit).toHaveBeenCalledWith({
            name: "Spring 2024",
            startDate: "2024-01-01",
            endDate: "2024-05-31",
            isActive: true,
        });
    });
});
