import { getErrorStatus, getErrorType, handleError } from "./helpers";

const mockFetchQueryError = {
    data: {
        detail: "Error occurred",
    },
    status: 404,
};

const mockFetchQueryErrorNoDetailMessage = {
    data: {
        detail: {
            type: "missing",
            loc: ["body", "username"],
            msg: "field required",
            input: null,
        },
    },
    status: 422,
};

const mockSerializedError = {
    name: "SerializedError",
    message: "A serialized error occurred",
    code: "SERIALIZED_ERROR",
};

describe("getErrorType", () => {
    it("should return detail string from FetchBaseQueryError", () => {
        const result = getErrorType(mockFetchQueryError);
        expect(result).toBe(mockFetchQueryError.data.detail);
    });

    it("should return undefined if detail is not a string", () => {
        const result = getErrorType(mockFetchQueryErrorNoDetailMessage);
        expect(result).toBeUndefined();
    });

    it("should return message from SerializedError", () => {
        const result = getErrorType(mockSerializedError);
        expect(result).toBe(mockSerializedError.message);
    });
});

describe("getErrorStatus", () => {
    it("should return status from FetchBaseQueryError", () => {
        const result = getErrorStatus(mockFetchQueryError);
        expect(result).toBe(mockFetchQueryError.status);
    });

    it("should return code for SerializedError", () => {
        const result = getErrorStatus(mockSerializedError);
        expect(result).toBe(mockSerializedError.code);
    });
});

describe("handleError", () => {
    const mockPublish = jest.fn();
    const mockT = jest.fn((key: string) => `translated.${key}`);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should do nothing when error is undefined", () => {
        handleError(undefined, mockPublish, mockT);

        expect(mockPublish).not.toHaveBeenCalled();
        expect(mockT).not.toHaveBeenCalled();
    });

    it("should call publish with translated error from FetchBaseQueryError", () => {
        handleError(mockFetchQueryError, mockPublish, mockT);

        expect(mockT).toHaveBeenCalledWith("Error occurred");
        expect(mockPublish).toHaveBeenCalledWith("translated.Error occurred", "error");
    });

    it("should call publish with translated error from SerializedError", () => {
        handleError(mockSerializedError, mockPublish, mockT);

        expect(mockT).toHaveBeenCalledWith("A serialized error occurred");
        expect(mockPublish).toHaveBeenCalledWith("translated.A serialized error occurred", "error");
    });

    it("should use fallbackKey when error type cannot be parsed", () => {
        handleError(mockFetchQueryErrorNoDetailMessage, mockPublish, mockT, "CUSTOM_FALLBACK");

        expect(mockT).toHaveBeenCalledWith("CUSTOM_FALLBACK");
        expect(mockPublish).toHaveBeenCalledWith("translated.CUSTOM_FALLBACK", "error");
    });

    it("should use UNKNOWN_ERROR as default fallback when error type cannot be parsed and no fallbackKey provided", () => {
        const mockTFallback = jest.fn((key: string) => `translated.${key}`);
        handleError(mockFetchQueryErrorNoDetailMessage, mockPublish, mockT, undefined, mockTFallback);

        expect(mockTFallback).toHaveBeenCalledWith("UNKNOWN_ERROR");
        expect(mockPublish).toHaveBeenCalledWith("translated.UNKNOWN_ERROR", "error");
    });

    it("should use fallbackKey when detail is empty string (empty string is falsy)", () => {
        const mockErrorWithEmptyDetail = {
            data: {
                detail: "",
            },
            status: 400,
        };

        handleError(mockErrorWithEmptyDetail, mockPublish, mockT, "CUSTOM_FALLBACK");

        expect(mockT).toHaveBeenCalledWith("CUSTOM_FALLBACK");
        expect(mockPublish).toHaveBeenCalledWith("translated.CUSTOM_FALLBACK", "error");
    });
});
