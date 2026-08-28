import { useEffect, useMemo, useState } from "react";
import styles from "./CountdownTimer.module.css";

interface CountdownTimerProps {
  expiresAt?: number;
  onExpired: () => void;
}

function formatTime(totalSeconds: number): string {
  const safeSeconds = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

export function CountdownTimer({ expiresAt, onExpired }: CountdownTimerProps) {
  const [now, setNow] = useState(Date.now());
  const remainingSeconds = useMemo(() => {
    if (!expiresAt) {
      return 0;
    }

    return Math.ceil((expiresAt - now) / 1000);
  }, [expiresAt, now]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (expiresAt && remainingSeconds <= 0) {
      onExpired();
    }
  }, [expiresAt, onExpired, remainingSeconds]);

  return <div className={styles.timer}>{formatTime(remainingSeconds)}</div>;
}
