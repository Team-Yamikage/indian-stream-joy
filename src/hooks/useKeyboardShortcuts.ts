import { useEffect, useCallback } from "react";

interface KeyboardShortcutHandlers {
  videoRef: React.RefObject<HTMLVideoElement>;
  onClose?: () => void;
}

export function useKeyboardShortcuts({ videoRef, onClose }: KeyboardShortcutHandlers) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const video = videoRef.current;
    if (!video) return;

    // Prevent default for handled keys
    const handledKeys = [" ", "f", "m", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Escape", "Enter", "k"];
    if (handledKeys.includes(e.key.toLowerCase()) || handledKeys.includes(e.key)) {
      e.preventDefault();
    }

    switch (e.key.toLowerCase()) {
      case " ":
      case "k":
        // Play/Pause (Space or K)
        if (video.paused) {
          video.play().catch(console.error);
        } else {
          video.pause();
        }
        break;

      case "f":
        // Toggle Fullscreen
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(console.error);
        } else {
          video.requestFullscreen().catch(console.error);
        }
        break;

      case "m":
        // Mute/Unmute
        video.muted = !video.muted;
        break;

      case "arrowleft":
        // Seek backward 10 seconds
        video.currentTime = Math.max(0, video.currentTime - 10);
        break;

      case "arrowright":
        // Seek forward 10 seconds
        video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
        break;

      case "arrowup":
        // Volume up 10%
        video.volume = Math.min(1, video.volume + 0.1);
        break;

      case "arrowdown":
        // Volume down 10%
        video.volume = Math.max(0, video.volume - 0.1);
        break;

      case "escape":
        onClose?.();
        break;
    }
  }, [videoRef, onClose]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
