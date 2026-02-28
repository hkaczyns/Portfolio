import { renderHook, waitFor } from "@testing-library/react";
import { useSemester } from "./useSemester";
import * as api from "../api";
import * as alertContext from "../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";
import * as helpers from "../../helpers";

jest.mock("../api");
jest.mock("../../../components/Alert/AlertContext");
jest.mock("react-i18next");
jest.mock("../../helpers");

describe("useSemester", () => {
    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockTErrors = jest.fn((key: string) => `translated.errors.${key}`);
    const mockHandleError = jest.fn();
    const mockCreateSemesterMutation = jest.fn();
    const mockUpdateSemesterMutation = jest.fn();
    const mockDeleteSemesterMutation = jest.fn();

    const mockSemester: api.SemesterRead = {
        id: 1,
        name: "Fall 2024",
        startDate: "2024-09-01",
        endDate: "2024-12-31",
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
        createdBy: "admin",
        updatedAt: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(alertContext.useAlert).mockReturnValue({ publish: mockPublish, message: "", alertType: undefined });
        jest.mocked(reactI18next.useTranslation)
            .mockReturnValueOnce({ t: mockT } as unknown as ReturnType<typeof reactI18next.useTranslation>)
            .mockReturnValueOnce({ t: mockTErrors } as unknown as ReturnType<typeof reactI18next.useTranslation>);
        jest.mocked(helpers.handleError).mockImplementation(mockHandleError);
        jest.mocked(api.useCreateSemesterMutation).mockReturnValue([
            mockCreateSemesterMutation,
            { isLoading: false },
        ] as any);
        jest.mocked(api.useUpdateSemesterMutation).mockReturnValue([
            mockUpdateSemesterMutation,
            { isLoading: false },
        ] as any);
        jest.mocked(api.useDeleteSemesterMutation).mockReturnValue([
            mockDeleteSemesterMutation,
            { isLoading: false },
        ] as any);
    });

    it("should create semester successfully", async () => {
        mockCreateSemesterMutation.mockResolvedValue({ data: mockSemester, error: undefined });

        const { result } = renderHook(() => useSemester());

        const semesterData: api.SemesterCreate = {
            name: "Fall 2024",
            startDate: "2024-09-01",
            endDate: "2024-12-31",
            isActive: true,
        };

        const createdSemester = await result.current.createSemester(semesterData);

        await waitFor(() => {
            expect(mockCreateSemesterMutation).toHaveBeenCalledWith(semesterData);
        });

        expect(createdSemester).toEqual(mockSemester);
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.semesterCreateSuccess", "success");
    });

    it("should handle create semester error", async () => {
        const mockError = { status: 400, data: { detail: "SEMESTER_OVERLAP" } };
        mockCreateSemesterMutation.mockResolvedValue({ data: undefined, error: mockError });

        const { result } = renderHook(() => useSemester());

        const semesterData: api.SemesterCreate = {
            name: "Fall 2024",
            startDate: "2024-09-01",
            endDate: "2024-12-31",
        };

        const createdSemester = await result.current.createSemester(semesterData);

        await waitFor(() => {
            expect(mockHandleError).toHaveBeenCalledWith(
                mockError,
                mockPublish,
                mockTErrors,
                "UNKNOWN_ERROR",
                mockTErrors,
            );
        });

        expect(createdSemester).toBeUndefined();
    });

    it("should update semester successfully", async () => {
        mockUpdateSemesterMutation.mockResolvedValue({ data: mockSemester, error: undefined });

        const { result } = renderHook(() => useSemester());

        const updateData: api.SemesterUpdate = {
            name: "Updated Semester",
        };

        const updatedSemester = await result.current.updateSemester(1, updateData);

        await waitFor(() => {
            expect(mockUpdateSemesterMutation).toHaveBeenCalledWith({ semesterId: 1, data: updateData });
        });

        expect(updatedSemester).toEqual(mockSemester);
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.semesterUpdateSuccess", "success");
    });

    it("should handle update semester error", async () => {
        const mockError = { status: 404, data: { detail: "SEMESTER_NOT_FOUND" } };
        mockUpdateSemesterMutation.mockResolvedValue({ data: undefined, error: mockError });

        const { result } = renderHook(() => useSemester());

        const updateData: api.SemesterUpdate = {
            name: "Updated Semester",
        };

        const updatedSemester = await result.current.updateSemester(1, updateData);

        await waitFor(() => {
            expect(mockHandleError).toHaveBeenCalledWith(
                mockError,
                mockPublish,
                mockTErrors,
                "UNKNOWN_ERROR",
                mockTErrors,
            );
        });

        expect(updatedSemester).toBeUndefined();
    });

    it("should delete semester successfully", async () => {
        mockDeleteSemesterMutation.mockResolvedValue({ data: undefined, error: undefined });

        const { result } = renderHook(() => useSemester());

        const deleted = await result.current.deleteSemester(1);

        await waitFor(() => {
            expect(mockDeleteSemesterMutation).toHaveBeenCalledWith(1);
        });

        expect(deleted).toBe(true);
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.semesterDeleteSuccess", "success");
    });

    it("should handle delete semester error", async () => {
        const mockError = { status: 404, data: { detail: "SEMESTER_NOT_FOUND" } };
        mockDeleteSemesterMutation.mockResolvedValue({ data: undefined, error: mockError });

        const { result } = renderHook(() => useSemester());

        const deleted = await result.current.deleteSemester(1);

        await waitFor(() => {
            expect(mockHandleError).toHaveBeenCalledWith(
                mockError,
                mockPublish,
                mockTErrors,
                "UNKNOWN_ERROR",
                mockTErrors,
            );
        });

        expect(deleted).toBe(false);
    });

    it("should return loading states", () => {
        jest.mocked(api.useCreateSemesterMutation).mockReturnValue([
            mockCreateSemesterMutation,
            { isLoading: true },
        ] as any);
        jest.mocked(api.useUpdateSemesterMutation).mockReturnValue([
            mockUpdateSemesterMutation,
            { isLoading: true },
        ] as any);
        jest.mocked(api.useDeleteSemesterMutation).mockReturnValue([
            mockDeleteSemesterMutation,
            { isLoading: true },
        ] as any);

        const { result } = renderHook(() => useSemester());

        expect(result.current.isCreating).toBe(true);
        expect(result.current.isUpdating).toBe(true);
        expect(result.current.isDeleting).toBe(true);
    });
});
