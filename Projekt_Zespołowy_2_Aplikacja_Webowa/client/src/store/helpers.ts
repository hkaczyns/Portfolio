import { type SerializedError } from "@reduxjs/toolkit";
import { type FetchBaseQueryError } from "@reduxjs/toolkit/query";

export const getErrorStatus = (queryError?: FetchBaseQueryError | SerializedError) => {
    if (queryError && "status" in queryError) return queryError.status;
    if (queryError && "code" in queryError) return queryError.code;
    return undefined;
};

export const getErrorType = (queryError?: FetchBaseQueryError | SerializedError): string | undefined => {
    if (queryError && "data" in queryError) {
        const errorBody = queryError.data as { detail?: unknown };
        if (typeof errorBody.detail === "string") {
            return errorBody.detail;
        }
        return undefined;
    }

    if (queryError && "message" in queryError) {
        return typeof queryError.message === "string" ? queryError.message : undefined;
    }

    return undefined;
};

export const parseApiError = (error: unknown, fallbackMessage: string): string => {
    if (!error || typeof error !== "object" || !("data" in error)) {
        return fallbackMessage;
    }

    const errorData = error.data as { detail?: unknown };

    if (errorData.detail && typeof errorData.detail === "string") {
        return errorData.detail;
    }

    if (Array.isArray(errorData.detail)) {
        const validationErrors = errorData.detail
            .map((err: unknown) => {
                if (err && typeof err === "object" && "msg" in err && typeof err.msg === "string") {
                    return err.msg;
                }
                return null;
            })
            .filter((msg: string | null): msg is string => msg !== null);

        if (validationErrors.length > 0) {
            return validationErrors.join(", ");
        }
    }

    return fallbackMessage;
};

export const handleError = (
    error: FetchBaseQueryError | SerializedError | undefined,
    publish: (message: string, alertType: "error" | "success", durationMs?: number) => void,
    t: (key: string) => string,
    fallbackKey?: string,
    tFallback?: (key: string) => string,
) => {
    if (!error) return;

    const parsedError = getErrorType(error);
    let translatedError: string;

    if (parsedError) {
        translatedError = t(parsedError);
    } else if (fallbackKey && tFallback) {
        translatedError = tFallback(fallbackKey);
    } else if (fallbackKey) {
        translatedError = t(fallbackKey);
    } else if (tFallback) {
        translatedError = tFallback("UNKNOWN_ERROR");
    } else {
        translatedError = "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.";
    }

    publish(translatedError, "error");
};
