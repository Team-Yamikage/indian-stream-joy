import { useState, useEffect, useCallback } from "react";

const FAVORITES_KEY = "streamIndia_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error("Failed to save favorites:", e);
    }
  }, [favorites]);

  const addFavorite = useCallback((channelId: string) => {
    setFavorites((prev) => {
      if (prev.includes(channelId)) return prev;
      return [...prev, channelId];
    });
  }, []);

  const removeFavorite = useCallback((channelId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== channelId));
  }, []);

  const toggleFavorite = useCallback((channelId: string) => {
    setFavorites((prev) => {
      if (prev.includes(channelId)) {
        return prev.filter((id) => id !== channelId);
      }
      return [...prev, channelId];
    });
  }, []);

  const isFavorite = useCallback(
    (channelId: string) => favorites.includes(channelId),
    [favorites]
  );

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}
