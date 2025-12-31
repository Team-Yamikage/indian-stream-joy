import { useState, useEffect } from "react";

const TV_MODE_KEY = "stream-india-tv-mode";

export function useTVMode() {
  const [isTVMode, setIsTVMode] = useState(() => {
    try {
      return localStorage.getItem(TV_MODE_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(TV_MODE_KEY, String(isTVMode));
    } catch {
      // Ignore storage errors
    }
    
    // Add/remove TV mode class on body for global styling
    if (isTVMode) {
      document.body.classList.add("tv-mode");
    } else {
      document.body.classList.remove("tv-mode");
    }
  }, [isTVMode]);

  const toggleTVMode = () => setIsTVMode((prev) => !prev);

  return { isTVMode, setIsTVMode, toggleTVMode };
}
