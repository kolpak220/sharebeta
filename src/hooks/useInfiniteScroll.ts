import { useState, useEffect, useCallback } from "react";

interface UseInfiniteScrollProps {
  fetchMore: () => void;
  hasMore: boolean;
  loading: boolean;
}

export const useInfiniteScroll = ({
  fetchMore,
  hasMore,
  loading,
}: UseInfiniteScrollProps) => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop !==
          document.documentElement.offsetHeight ||
        isFetching ||
        loading ||
        !hasMore
      ) {
        return;
      }
      setIsFetching(true);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFetching, loading, hasMore]);

  useEffect(() => {
    if (!isFetching) return;

    const timer = setTimeout(() => {
      fetchMore();
      setIsFetching(false);
    }, 500); // Small delay to prevent too rapid requests

    return () => clearTimeout(timer);
  }, [isFetching, fetchMore]);

  return [isFetching, setIsFetching] as const;
};

export const useInfiniteScrollContainer = ({
  fetchMore,
  hasMore,
  loading,
}: UseInfiniteScrollProps) => {
  const [isFetching, setIsFetching] = useState(false);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

      if (
        scrollHeight - scrollTop <= clientHeight * 4 &&
        !isFetching &&
        !loading &&
        hasMore
      ) {
        setIsFetching(true);

        setTimeout(() => {
          fetchMore();
          setIsFetching(false);
        }, 500);
      }
    },
    [fetchMore, hasMore, loading, isFetching]
  );

  return { handleScroll, isFetching };
};
