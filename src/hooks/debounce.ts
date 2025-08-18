import { useState, useEffect, useRef, useCallback } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useDebouncedClick(delay = 1000) {
  const lastClickTime = useRef(0);

  const handleClick = useCallback(
    (action: () => void) => {
      const now = Date.now();
      if (now - lastClickTime.current > delay) {
        lastClickTime.current = now;
        action();
      }
    },
    [delay]
  );

  return handleClick;
}
