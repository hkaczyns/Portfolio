import { renderHook, waitFor } from "@testing-library/react";
import { useTopic } from "./useTopic";
import * as api from "../api";
import * as alertContext from "../../../components/Alert/AlertContext";
import * as reactI18next from "react-i18next";
import * as helpers from "../../helpers";

jest.mock("../api");
jest.mock("../../../components/Alert/AlertContext");
jest.mock("react-i18next");
jest.mock("../../helpers");

describe("useTopic", () => {
    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);
    const mockTErrors = jest.fn((key: string) => `translated.errors.${key}`);
    const mockHandleError = jest.fn();
    const mockCreateTopicMutation = jest.fn();
    const mockUpdateTopicMutation = jest.fn();
    const mockDeleteTopicMutation = jest.fn();

    const mockTopic: api.TopicRead = {
        id: 1,
        name: "Topic 1",
        description: "Topic description",
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(alertContext.useAlert).mockReturnValue({ publish: mockPublish, message: "", alertType: undefined });
        jest.mocked(reactI18next.useTranslation)
            .mockReturnValueOnce({ t: mockT } as unknown as ReturnType<typeof reactI18next.useTranslation>)
            .mockReturnValueOnce({ t: mockTErrors } as unknown as ReturnType<typeof reactI18next.useTranslation>);
        jest.mocked(helpers.handleError).mockImplementation(mockHandleError);
        jest.mocked(api.useCreateTopicMutation).mockReturnValue([mockCreateTopicMutation, { isLoading: false }] as any);
        jest.mocked(api.useUpdateTopicMutation).mockReturnValue([mockUpdateTopicMutation, { isLoading: false }] as any);
        jest.mocked(api.useDeleteTopicMutation).mockReturnValue([mockDeleteTopicMutation, { isLoading: false }] as any);
    });

    it("should create topic successfully", async () => {
        mockCreateTopicMutation.mockResolvedValue({ data: mockTopic, error: undefined });

        const { result } = renderHook(() => useTopic());

        const topicData: api.TopicCreate = {
            name: "Topic 1",
            description: "Topic description",
        };

        const createdTopic = await result.current.createTopic(topicData);

        await waitFor(() => {
            expect(mockCreateTopicMutation).toHaveBeenCalledWith(topicData);
        });

        expect(createdTopic).toEqual(mockTopic);
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.topicCreateSuccess", "success");
    });

    it("should handle create topic error", async () => {
        const mockError = { status: 400, data: { detail: "TOPIC_NAME_EXISTS" } };
        mockCreateTopicMutation.mockResolvedValue({ data: undefined, error: mockError });

        const { result } = renderHook(() => useTopic());

        const topicData: api.TopicCreate = {
            name: "Topic 1",
            description: "Topic description",
        };

        const createdTopic = await result.current.createTopic(topicData);

        await waitFor(() => {
            expect(mockHandleError).toHaveBeenCalledWith(
                mockError,
                mockPublish,
                mockTErrors,
                "UNKNOWN_ERROR",
                mockTErrors,
            );
        });

        expect(createdTopic).toBeUndefined();
    });

    it("should update topic successfully", async () => {
        mockUpdateTopicMutation.mockResolvedValue({ data: mockTopic, error: undefined });

        const { result } = renderHook(() => useTopic());

        const updateData: api.TopicUpdate = {
            name: "Updated Topic",
        };

        const updatedTopic = await result.current.updateTopic(1, updateData);

        await waitFor(() => {
            expect(mockUpdateTopicMutation).toHaveBeenCalledWith({ topicId: 1, data: updateData });
        });

        expect(updatedTopic).toEqual(mockTopic);
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.topicUpdateSuccess", "success");
    });

    it("should handle update topic error", async () => {
        const mockError = { status: 404, data: { detail: "TOPIC_NOT_FOUND" } };
        mockUpdateTopicMutation.mockResolvedValue({ data: undefined, error: mockError });

        const { result } = renderHook(() => useTopic());

        const updateData: api.TopicUpdate = {
            name: "Updated Topic",
        };

        const updatedTopic = await result.current.updateTopic(1, updateData);

        await waitFor(() => {
            expect(mockHandleError).toHaveBeenCalledWith(
                mockError,
                mockPublish,
                mockTErrors,
                "UNKNOWN_ERROR",
                mockTErrors,
            );
        });

        expect(updatedTopic).toBeUndefined();
    });

    it("should delete topic successfully", async () => {
        mockDeleteTopicMutation.mockResolvedValue({ data: undefined, error: undefined });

        const { result } = renderHook(() => useTopic());

        const deleted = await result.current.deleteTopic(1);

        await waitFor(() => {
            expect(mockDeleteTopicMutation).toHaveBeenCalledWith(1);
        });

        expect(deleted).toBe(true);
        expect(mockPublish).toHaveBeenCalledWith("translated.admin.topicDeleteSuccess", "success");
    });

    it("should handle delete topic error", async () => {
        const mockError = { status: 404, data: { detail: "TOPIC_NOT_FOUND" } };
        mockDeleteTopicMutation.mockResolvedValue({ data: undefined, error: mockError });

        const { result } = renderHook(() => useTopic());

        const deleted = await result.current.deleteTopic(1);

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
        jest.mocked(api.useCreateTopicMutation).mockReturnValue([mockCreateTopicMutation, { isLoading: true }] as any);
        jest.mocked(api.useUpdateTopicMutation).mockReturnValue([mockUpdateTopicMutation, { isLoading: true }] as any);
        jest.mocked(api.useDeleteTopicMutation).mockReturnValue([mockDeleteTopicMutation, { isLoading: true }] as any);

        const { result } = renderHook(() => useTopic());

        expect(result.current.isCreating).toBe(true);
        expect(result.current.isUpdating).toBe(true);
        expect(result.current.isDeleting).toBe(true);
    });
});
