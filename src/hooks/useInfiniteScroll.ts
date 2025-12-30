import { useState, useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions<T> {
  items: T[];
  batchSize?: number;
  threshold?: number;
}

export function useInfiniteScroll<T>({
  items,
  batchSize = 20,
  threshold = 300,
}: UseInfiniteScrollOptions<T>) {
  const [displayCount, setDisplayCount] = useState(batchSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const displayedItems = items.slice(0, displayCount);
  const hasMore = displayCount < items.length;

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    // Small delay to prevent UI freeze on low-power devices
    requestAnimationFrame(() => {
      setDisplayCount(prev => Math.min(prev + batchSize, items.length));
      setIsLoadingMore(false);
    });
  }, [batchSize, hasMore, isLoadingMore, items.length]);

  // Reset when items change (new filter/search)
  useEffect(() => {
    setDisplayCount(batchSize);
  }, [items.length, batchSize]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { rootMargin: `${threshold}px` }
    );

    const current = loadMoreRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [hasMore, isLoadingMore, loadMore, threshold]);

  return {
    displayedItems,
    hasMore,
    isLoadingMore,
    loadMoreRef,
    loadMore,
    totalCount: items.length,
    displayCount,
  };
}
