import {
  modeType,
  pagePostIdsFetch,
} from "@/redux/slices/preloadslice/asyncActions";
import {
  SelectPostIds,
  SelectPreloadState,
} from "@/redux/slices/preloadslice/selectors";
import { useAppDispatch } from "@/redux/store";
import { useCallback } from "react";
import { useSelector } from "react-redux";

export const useInfiniteScrollContainer = (
  mode: modeType,
  subsLimit: number
) => {
  const dispatch = useAppDispatch();
  const postIds = useSelector(SelectPostIds);
  const status = useSelector(SelectPreloadState);

  const loadMore = useCallback(() => {
    if (status === "loading" || (mode === "subs" && postIds.length >= subsLimit)) {
      return;
    }
    
    dispatch(pagePostIdsFetch({ mode, skip: postIds.length }));
  }, [dispatch, mode, postIds.length, status, subsLimit]);

  return loadMore;
};