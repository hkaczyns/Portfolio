import { Duration, DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";

const COOLDOWN_FORMAT = "m:ss";

interface UseCooldownProps {
    cooldownSeconds: number;
    requestedAt: string | undefined;
}

export const useCooldown = ({ cooldownSeconds, requestedAt }: UseCooldownProps) => {
    const [cooldown, setCooldown] = useState<number>(0);

    useEffect(() => {
        if (!requestedAt) {
            setCooldown(0);
            return;
        }

        const requestedAtDateTime = DateTime.fromISO(requestedAt);
        const now = DateTime.now();
        const elapsedSeconds = Math.floor(now.diff(requestedAtDateTime, "seconds").seconds);

        if (elapsedSeconds < 0) {
            setCooldown(0);
            return;
        }

        const remaining = cooldownSeconds - elapsedSeconds;
        setCooldown(remaining > 0 ? remaining : 0);
    }, [requestedAt, cooldownSeconds]);

    useEffect(() => {
        if (cooldown <= 0) return;

        const cooldownInterval = setInterval(() => {
            setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(cooldownInterval);
    }, [cooldown]);

    const formattedCooldown = useMemo(() => {
        if (cooldown <= 0) return Duration.fromObject({ seconds: 0 }).toFormat(COOLDOWN_FORMAT);

        return Duration.fromObject({ seconds: cooldown }).toFormat(COOLDOWN_FORMAT);
    }, [cooldown]);

    return { isCooldownActive: cooldown > 0, cooldown: formattedCooldown };
};
