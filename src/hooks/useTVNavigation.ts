import { useEffect, useCallback } from "react";

export function useTVNavigation() {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const focusableElements = Array.from(
      document.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => el.offsetParent !== null); // Only visible elements

    const currentIndex = focusableElements.findIndex(el => el === document.activeElement);

    const getGridPosition = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    };

    const findClosestElement = (direction: "up" | "down" | "left" | "right") => {
      if (currentIndex === -1) {
        focusableElements[0]?.focus();
        return;
      }

      const current = focusableElements[currentIndex];
      const currentPos = getGridPosition(current);
      let closest: HTMLElement | null = null;
      let closestDistance = Infinity;

      focusableElements.forEach((el, index) => {
        if (index === currentIndex) return;
        
        const pos = getGridPosition(el);
        const dx = pos.x - currentPos.x;
        const dy = pos.y - currentPos.y;

        let isValidDirection = false;
        switch (direction) {
          case "up":
            isValidDirection = dy < -20;
            break;
          case "down":
            isValidDirection = dy > 20;
            break;
          case "left":
            isValidDirection = dx < -20;
            break;
          case "right":
            isValidDirection = dx > 20;
            break;
        }

        if (isValidDirection) {
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < closestDistance) {
            closestDistance = distance;
            closest = el;
          }
        }
      });

      closest?.focus();
    };

    // Handle TV remote D-pad navigation
    switch (e.key) {
      case "ArrowUp":
        if (!document.querySelector("video:focus")) {
          e.preventDefault();
          findClosestElement("up");
        }
        break;
      case "ArrowDown":
        if (!document.querySelector("video:focus")) {
          e.preventDefault();
          findClosestElement("down");
        }
        break;
      case "ArrowLeft":
        if (!document.querySelector("video:focus")) {
          e.preventDefault();
          findClosestElement("left");
        }
        break;
      case "ArrowRight":
        if (!document.querySelector("video:focus")) {
          e.preventDefault();
          findClosestElement("right");
        }
        break;
      case "Enter":
        // Trigger click on focused element
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.click();
        }
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
