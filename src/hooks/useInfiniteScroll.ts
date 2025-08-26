import {
  modeType,
  pagePostIdsFetch,
} from "@/redux/slices/preloadslice/asyncActions";
import {
  SelectPostIds,
  SelectPreloadState,
} from "@/redux/slices/preloadslice/selectors";
import { useAppDispatch } from "@/redux/store";
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";

interface UseInfiniteScrollProps {
  fetchMore: () => void;
  loading: boolean;
}

export const useInfiniteScroll = ({
  fetchMore,
  loading,
}: UseInfiniteScrollProps) => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop !==
          document.documentElement.offsetHeight ||
        isFetching ||
        loading
      ) {
        return;
      }
      setIsFetching(true);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFetching, loading]);

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

export const useInfiniteScrollContainer = (
  mode: modeType,
  subsLimit: number
) => {
  const dispatch = useAppDispatch();
  const postIds = useSelector(SelectPostIds);
  const status = useSelector(SelectPreloadState);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      console.log(mode + subsLimit);
      if (mode === "subs" && postIds.length >= subsLimit) {
        console.log(1);
        return;
      }
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

      if (scrollHeight - scrollTop <= clientHeight * 4 && status != "loading") {
        dispatch(pagePostIdsFetch({ mode, skip: postIds.length }));
      }
    },
    [status, postIds, mode, subsLimit]
  );

  return handleScroll;
};
