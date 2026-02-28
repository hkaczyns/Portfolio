import { renderHook, waitFor, act } from "@testing-library/react";
import { useCooldown } from "./useCooldown";
import { DateTime } from "luxon";

jest.useFakeTimers();

describe("useCooldown", () => {
    beforeEach(() => {
        jest.clearAllTimers();
        jest.setSystemTime(new Date("2024-01-01T12:00:00Z"));
    });

    afterEach(() => {
        act(() => {
            jest.runOnlyPendingTimers();
        });
        jest.useRealTimers();
        jest.useFakeTimers();
    });

    it("should return inactive cooldown when requestedAt is undefined", () => {
        const { result } = renderHook(() => useCooldown({ cooldownSeconds: 300, requestedAt: undefined }));

        expect(result.current.isCooldownActive).toBe(false);
        expect(result.current.cooldown).toBe("0:00");
    });

    it("should return inactive cooldown when requestedAt is empty string", () => {
        const { result } = renderHook(() => useCooldown({ cooldownSeconds: 300, requestedAt: "" }));

        expect(result.current.isCooldownActive).toBe(false);
        expect(result.current.cooldown).toBe("0:00");
    });

    it("should calculate remaining cooldown correctly when requestedAt is in the past", () => {
        const pastTime = DateTime.now().minus({ seconds: 100 }).toISO();
        const { result } = renderHook(() => useCooldown({ cooldownSeconds: 300, requestedAt: pastTime || undefined }));

        expect(result.current.isCooldownActive).toBe(true);
        expect(result.current.cooldown).toBe("3:20");
    });

    it("should return inactive cooldown when cooldown has expired", () => {
        const pastTime = DateTime.now().minus({ seconds: 400 }).toISO();
        const { result } = renderHook(() => useCooldown({ cooldownSeconds: 300, requestedAt: pastTime || undefined }));

        expect(result.current.isCooldownActive).toBe(false);
        expect(result.current.cooldown).toBe("0:00");
    });

    it("should countdown cooldown every second", async () => {
        const pastTime = DateTime.now().minus({ seconds: 50 }).toISO();
        const { result } = renderHook(() => useCooldown({ cooldownSeconds: 300, requestedAt: pastTime || undefined }));

        expect(result.current.isCooldownActive).toBe(true);
        expect(result.current.cooldown).toBe("4:10");

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        await waitFor(() => {
            expect(result.current.cooldown).toBe("4:09");
        });

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        await waitFor(() => {
            expect(result.current.cooldown).toBe("4:08");
        });
    });

    it("should stop countdown when cooldown reaches zero", async () => {
        const pastTime = DateTime.now().minus({ seconds: 299 }).toISO();
        const { result } = renderHook(() => useCooldown({ cooldownSeconds: 300, requestedAt: pastTime || undefined }));

        expect(result.current.isCooldownActive).toBe(true);
        expect(result.current.cooldown).toBe("0:01");

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        await waitFor(() => {
            expect(result.current.isCooldownActive).toBe(false);
            expect(result.current.cooldown).toBe("0:00");
        });

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        await waitFor(() => {
            expect(result.current.isCooldownActive).toBe(false);
            expect(result.current.cooldown).toBe("0:00");
        });
    });

    it("should format cooldown correctly for different values", () => {
        const testCases = [
            { elapsed: 0, expected: "5:00" },
            { elapsed: 60, expected: "4:00" },
            { elapsed: 150, expected: "2:30" },
            { elapsed: 200, expected: "1:40" },
            { elapsed: 290, expected: "0:10" },
            { elapsed: 295, expected: "0:05" },
            { elapsed: 299, expected: "0:01" },
        ];

        testCases.forEach(({ elapsed, expected }) => {
            const pastTime = DateTime.now().minus({ seconds: elapsed }).toISO();
            const { result } = renderHook(() =>
                useCooldown({ cooldownSeconds: 300, requestedAt: pastTime || undefined }),
            );

            expect(result.current.cooldown).toBe(expected);
        });
    });

    it("should handle different cooldownSeconds values", () => {
        const pastTime = DateTime.now().minus({ seconds: 60 }).toISO();
        const { result } = renderHook(() => useCooldown({ cooldownSeconds: 120, requestedAt: pastTime || undefined }));

        expect(result.current.isCooldownActive).toBe(true);
        expect(result.current.cooldown).toBe("1:00");
    });

    it("should update cooldown when requestedAt changes", () => {
        const pastTime1 = DateTime.now().minus({ seconds: 100 }).toISO();
        const { result, rerender } = renderHook(
            ({ requestedAt }) => useCooldown({ cooldownSeconds: 300, requestedAt }),
            {
                initialProps: { requestedAt: pastTime1 || undefined },
            },
        );

        expect(result.current.isCooldownActive).toBe(true);
        expect(result.current.cooldown).toBe("3:20");

        const pastTime2 = DateTime.now().minus({ seconds: 200 }).toISO();
        rerender({ requestedAt: pastTime2 || undefined });

        expect(result.current.isCooldownActive).toBe(true);
        expect(result.current.cooldown).toBe("1:40");
    });

    it("should update cooldown when cooldownSeconds changes", () => {
        const pastTime = DateTime.now().minus({ seconds: 100 }).toISO();
        const { result, rerender } = renderHook(
            ({ cooldownSeconds }) => useCooldown({ cooldownSeconds, requestedAt: pastTime || undefined }),
            {
                initialProps: { cooldownSeconds: 300 },
            },
        );

        expect(result.current.cooldown).toBe("3:20");

        rerender({ cooldownSeconds: 500 });

        expect(result.current.cooldown).toBe("6:40");
    });

    it("should handle requestedAt in the future (edge case)", () => {
        const futureTime = DateTime.now().plus({ seconds: 100 }).toISO();
        const { result } = renderHook(() =>
            useCooldown({ cooldownSeconds: 300, requestedAt: futureTime || undefined }),
        );

        expect(result.current.isCooldownActive).toBe(false);
        expect(result.current.cooldown).toBe("0:00");
    });
});
