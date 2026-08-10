"use client";

import { useEffect, useState } from "react";

// Returns null until mount (so the first client render matches the server's
// static placeholder, avoiding a hydration mismatch), then ticks every
// second. Shared by every countdown/timer display in the app.
export function useLiveNow(intervalMs = 1000) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const timeout = setTimeout(tick, 0);
    const timer = setInterval(tick, intervalMs);
    return () => {
      clearTimeout(timeout);
      clearInterval(timer);
    };
  }, [intervalMs]);

  return now;
}
