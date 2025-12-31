import { useState, useEffect, useCallback } from "react";

const FAILED_STREAMS_KEY = "stream-india-failed-streams";
const FAILURE_THRESHOLD = 3;
const FAILURE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface FailedStream {
  count: number;
  lastFailed: number;
}

interface FailedStreamsRecord {
  [channelId: string]: FailedStream;
}

export function useStreamCheck() {
  const [failedStreams, setFailedStreams] = useState<FailedStreamsRecord>({});
  const [showHidden, setShowHidden] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAILED_STREAMS_KEY);
      if (stored) {
        const parsed: FailedStreamsRecord = JSON.parse(stored);
        // Clean up expired entries
        const now = Date.now();
        const cleaned: FailedStreamsRecord = {};
        for (const [id, data] of Object.entries(parsed)) {
          if (now - data.lastFailed < FAILURE_EXPIRY_MS) {
            cleaned[id] = data;
          }
        }
        setFailedStreams(cleaned);
        localStorage.setItem(FAILED_STREAMS_KEY, JSON.stringify(cleaned));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Record a stream failure
  const recordFailure = useCallback((channelId: string) => {
    setFailedStreams((prev) => {
      const existing = prev[channelId];
      const updated = {
        ...prev,
        [channelId]: {
          count: (existing?.count || 0) + 1,
          lastFailed: Date.now(),
        },
      };
      localStorage.setItem(FAILED_STREAMS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear failure for a channel
  const clearFailure = useCallback((channelId: string) => {
    setFailedStreams((prev) => {
      const { [channelId]: _, ...rest } = prev;
      localStorage.setItem(FAILED_STREAMS_KEY, JSON.stringify(rest));
      return rest;
    });
  }, []);

  // Check if channel should be hidden
  const isHidden = useCallback(
    (channelId: string): boolean => {
      const data = failedStreams[channelId];
      return data ? data.count >= FAILURE_THRESHOLD : false;
    },
    [failedStreams]
  );

  // Get hidden count
  const hiddenCount = Object.values(failedStreams).filter(
    (f) => f.count >= FAILURE_THRESHOLD
  ).length;

  // Preflight check a stream URL (HEAD request)
  const preflightCheck = useCallback(
    async (url: string): Promise<boolean> => {
      try {
        // Use a short timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, {
          method: "HEAD",
          mode: "no-cors", // Many streams don't have CORS headers
          signal: controller.signal,
        });

        clearTimeout(timeout);
        // In no-cors mode, we can't read status, but if fetch didn't throw, it's reachable
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  return {
    recordFailure,
    clearFailure,
    isHidden,
    hiddenCount,
    showHidden,
    setShowHidden,
    preflightCheck,
  };
}
