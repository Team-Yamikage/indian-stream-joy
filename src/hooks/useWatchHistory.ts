import { useState, useEffect, useCallback } from "react";

const HISTORY_KEY = "streamIndia_watchHistory";
const MAX_HISTORY_ITEMS = 20;

export interface WatchHistoryItem {
  channelId: string;
  watchedAt: number;
}

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save watch history:", e);
    }
  }, [history]);

  const addToHistory = useCallback((channelId: string) => {
    setHistory((prev) => {
      // Remove existing entry for this channel
      const filtered = prev.filter((item) => item.channelId !== channelId);
      // Add to beginning with current timestamp
      const newHistory = [
        { channelId, watchedAt: Date.now() },
        ...filtered,
      ].slice(0, MAX_HISTORY_ITEMS);
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const removeFromHistory = useCallback((channelId: string) => {
    setHistory((prev) => prev.filter((item) => item.channelId !== channelId));
  }, []);

  const getRecentChannelIds = useCallback(() => {
    return history.map((item) => item.channelId);
  }, [history]);

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
    getRecentChannelIds,
  };
}
