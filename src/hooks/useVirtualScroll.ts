import { useState, useEffect, useCallback, useMemo } from 'react';

interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualScrollResult<T> {
  virtualItems: T[];
  totalHeight: number;
  startIndex: number;
  endIndex: number;
  scrollTop: number;
  setScrollTop: (scrollTop: number) => void;
  handleScroll: (event: React.UIEvent<HTMLDivElement>) => void;
}

export function useVirtualScroll<T>(
  items: T[],
  options: VirtualScrollOptions
): VirtualScrollResult<T> {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  
  const [scrollTop, setScrollTop] = useState(0);
  
  const totalHeight = useMemo(() => items.length * itemHeight, [items.length, itemHeight]);
  
  const startIndex = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    return Math.max(0, start - overscan);
  }, [scrollTop, itemHeight, overscan]);
  
  const endIndex = useMemo(() => {
    const end = Math.ceil((scrollTop + containerHeight) / itemHeight);
    return Math.min(items.length - 1, end + overscan);
  }, [scrollTop, containerHeight, itemHeight, overscan, items.length]);
  
  const virtualItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1);
  }, [items, startIndex, endIndex]);
  
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);
  
  return {
    virtualItems,
    totalHeight,
    startIndex,
    endIndex,
    scrollTop,
    setScrollTop,
    handleScroll
  };
} 