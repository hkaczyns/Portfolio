import { renderHook } from "@testing-library/react";
import { useClassGroupModal } from "./useClassGroupModal";
import * as reactI18next from "react-i18next";

jest.mock("react-i18next");

describe("useClassGroupModal", () => {
    const mockT = jest.fn((key: string) => `translated.${key}`);

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(reactI18next.useTranslation).mockReturnValue({
            t: mockT,
        } as unknown as ReturnType<typeof reactI18next.useTranslation>);
    });

    it("should return initial values when no initialData", () => {
        const { result } = renderHook(() => useClassGroupModal());

        expect(result.current.isEdit).toBe(false);
        expect(result.current.initialValues.semesterId).toBe(0);
        expect(result.current.initialValues.name).toBe("");
        expect(result.current.initialValues.capacity).toBe(1);
        expect(result.current.initialValues.status).toBe("draft");
    });

    it("should return initial values from initialData", () => {
        const initialData = {
            id: 1,
            semesterId: 2,
            name: "Test Group",
            description: "Test Description",
            levelId: 3,
            topicId: 4,
            roomId: 5,
            capacity: 20,
            dayOfWeek: 1,
            startTime: "10:00",
            endTime: "11:00",
            instructorId: "instructor-1",
            isPublic: true,
            status: "active",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
        };

        const { result } = renderHook(() => useClassGroupModal(initialData));

        expect(result.current.isEdit).toBe(true);
        expect(result.current.initialValues.semesterId).toBe(2);
        expect(result.current.initialValues.name).toBe("Test Group");
        expect(result.current.initialValues.capacity).toBe(20);
    });

    it("should return days of week", () => {
        const { result } = renderHook(() => useClassGroupModal());

        expect(result.current.daysOfWeek).toHaveLength(7);
        expect(mockT).toHaveBeenCalledWith("admin.monday");
    });

    it("should call onSubmit when handleSubmit is called", async () => {
        const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
        const { result } = renderHook(() => useClassGroupModal());

        const values = {
            semesterId: 1,
            name: "Test",
            levelId: 1,
            topicId: 1,
            capacity: 10,
            dayOfWeek: 0,
            startTime: "10:00",
            endTime: "11:00",
            description: null,
            roomId: null,
            instructorId: null,
            isPublic: false,
            status: "draft",
        };

        await result.current.handleSubmit(values, mockOnSubmit);

        expect(mockOnSubmit).toHaveBeenCalledWith(values);
    });
});
