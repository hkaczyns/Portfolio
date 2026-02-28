import { renderHook, waitFor } from "@testing-library/react";
import { useSkillLevel } from "./useSkillLevel";
import * as api from "../api";
import * as alertContext from "../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";
import * as helpers from "../../helpers";

jest.mock("../api");
jest.mock("../../../components/Alert/AlertContext");
jest.mock("react-i18next");
jest.mock("../../helpers");

describe("useSkillLevel", () => {
    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockTErrors = jest.fn((key: string) => `translated.errors.${key}`);
    const mockHandleError = jest.fn();
    const mockCreateSkillLevelMutation = jest.fn();
    const mockUpdateSkillLevelMutation = jest.fn();
    const mockDeleteSkillLevelMutation = jest.fn();

    const mockSkillLevel: api.SkillLevelRead = {
        id: 1,
        name: "Beginner",
        description: "Beginner level",
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(alertContext.useAlert).mockReturnValue({ publish: mockPublish, message: "", alertType: undefined });
        jest.mocked(reactI18next.useTranslation)
            .mockReturnValueOnce({ t: mockT } as unknown as ReturnType<typeof reactI18next.useTranslation>)
            .mockReturnValueOnce({ t: mockTErrors } as unknown as ReturnType<typeof reactI18next.useTranslation>);
        jest.mocked(helpers.handleError).mockImplementation(mockHandleError);
        jest.mocked(api.useCreateSkillLevelMutation).mockReturnValue([
            mockCreateSkillLevelMutation,
            { isLoading: false },
        ] as any);
        jest.mocked(api.useUpdateSkillLevelMutation).mockReturnValue([
            mockUpdateSkillLevelMutation,
            { isLoading: false },
        ] as any);
        jest.mocked(api.useDeleteSkillLevelMutation).mockReturnValue([
            mockDeleteSkillLevelMutation,
            { isLoading: false },
        ] as any);
    });

    it("should create skill level successfully", async () => {
        mockCreateSkillLevelMutation.mockResolvedValue({ data: mockSkillLevel, error: undefined });

        const { result } = renderHook(() => useSkillLevel());

        const skillLevelData: api.SkillLevelCreate = {
            name: "Beginner",
            description: "Beginner level",
        };

        const createdSkillLevel = await result.current.createSkillLevel(skillLevelData);

        await waitFor(() => {
            expect(mockCreateSkillLevelMutation).toHaveBeenCalledWith(skillLevelData);
        });

        expect(createdSkillLevel).toEqual(mockSkillLevel);
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.skillLevelCreateSuccess", "success");
    });

    it("should handle create skill level error", async () => {
        const mockError = { status: 400, data: { detail: "SKILL_LEVEL_NAME_EXISTS" } };
        mockCreateSkillLevelMutation.mockResolvedValue({ data: undefined, error: mockError });

        const { result } = renderHook(() => useSkillLevel());

        const skillLevelData: api.SkillLevelCreate = {
            name: "Beginner",
            description: "Beginner level",
        };

        const createdSkillLevel = await result.current.createSkillLevel(skillLevelData);

        await waitFor(() => {
            expect(mockHandleError).toHaveBeenCalledWith(
                mockError,
                mockPublish,
                mockTErrors,
                "UNKNOWN_ERROR",
                mockTErrors,
            );
        });

        expect(createdSkillLevel).toBeUndefined();
    });

    it("should update skill level successfully", async () => {
        mockUpdateSkillLevelMutation.mockResolvedValue({ data: mockSkillLevel, error: undefined });

        const { result } = renderHook(() => useSkillLevel());

        const updateData: api.SkillLevelUpdate = {
            name: "Advanced",
        };

        const updatedSkillLevel = await result.current.updateSkillLevel(1, updateData);

        await waitFor(() => {
            expect(mockUpdateSkillLevelMutation).toHaveBeenCalledWith({ levelId: 1, data: updateData });
        });

        expect(updatedSkillLevel).toEqual(mockSkillLevel);
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.skillLevelUpdateSuccess", "success");
    });

    it("should handle update skill level error", async () => {
        const mockError = { status: 404, data: { detail: "SKILL_LEVEL_NOT_FOUND" } };
        mockUpdateSkillLevelMutation.mockResolvedValue({ data: undefined, error: mockError });

        const { result } = renderHook(() => useSkillLevel());

        const updateData: api.SkillLevelUpdate = {
            name: "Advanced",
        };

        const updatedSkillLevel = await result.current.updateSkillLevel(1, updateData);

        await waitFor(() => {
            expect(mockHandleError).toHaveBeenCalledWith(
                mockError,
                mockPublish,
                mockTErrors,
                "UNKNOWN_ERROR",
                mockTErrors,
            );
        });

        expect(updatedSkillLevel).toBeUndefined();
    });

    it("should delete skill level successfully", async () => {
        mockDeleteSkillLevelMutation.mockResolvedValue({ data: undefined, error: undefined });

        const { result } = renderHook(() => useSkillLevel());

        const deleted = await result.current.deleteSkillLevel(1);

        await waitFor(() => {
            expect(mockDeleteSkillLevelMutation).toHaveBeenCalledWith(1);
        });

        expect(deleted).toBe(true);
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.skillLevelDeleteSuccess", "success");
    });

    it("should handle delete skill level error", async () => {
        const mockError = { status: 404, data: { detail: "SKILL_LEVEL_NOT_FOUND" } };
        mockDeleteSkillLevelMutation.mockResolvedValue({ data: undefined, error: mockError });

        const { result } = renderHook(() => useSkillLevel());

        const deleted = await result.current.deleteSkillLevel(1);

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
        jest.mocked(api.useCreateSkillLevelMutation).mockReturnValue([
            mockCreateSkillLevelMutation,
            { isLoading: true },
        ] as any);
        jest.mocked(api.useUpdateSkillLevelMutation).mockReturnValue([
            mockUpdateSkillLevelMutation,
            { isLoading: true },
        ] as any);
        jest.mocked(api.useDeleteSkillLevelMutation).mockReturnValue([
            mockDeleteSkillLevelMutation,
            { isLoading: true },
        ] as any);

        const { result } = renderHook(() => useSkillLevel());

        expect(result.current.isCreating).toBe(true);
        expect(result.current.isUpdating).toBe(true);
        expect(result.current.isDeleting).toBe(true);
    });
});
