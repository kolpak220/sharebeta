import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Post } from "../types";
import FetchPosts from "@/services/fetchposts";
import PostCardSkeleton from "./PostCardSkeleton";
import Cookies from "js-cookie";
import LoadedPostCard, { LoadedAdPostCard } from "./LoadedPostCard";
import { PostUIProvider } from "@/contexts/PostUIContext";
import { useSelector } from "react-redux";
import { FindPost } from "@/redux/slices/postsSlice/selectors";
import { RootState, useAppDispatch } from "@/redux/store";
import { postSummaryFetch } from "@/redux/slices/postsSlice/asyncActions";
import { deletePreload } from "@/redux/slices/preloadslice/slice";

interface PostCardProps {
  postId: number;
  disableComments: boolean;
  onHeightMeasured?: (postId: number, height: number) => void;
  adPost?: boolean;
}

const PostCard = memo(({ postId, disableComments, onHeightMeasured }: PostCardProps) => {
  const post = useSelector((state: RootState) => FindPost(state, postId));
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredOnce, setMeasuredOnce] = useState(false);

  const userId = useCallback(() => {
    const id = Cookies.get("id");
    if (!id) window.location.reload();
    return id;
  }, []);
  userId();

  useEffect(() => {
    dispatch(postSummaryFetch({
      postId,
      dispatch: () => dispatch(deletePreload(postId)),
    }));
  }, [dispatch, postId]);

  useEffect(() => {
    if (post && containerRef.current && onHeightMeasured && !measuredOnce) {
      const height = containerRef.current.getBoundingClientRect().height;
      setMeasuredOnce(true);
      onHeightMeasured(postId, height);
    }
  }, [post, postId, onHeightMeasured, measuredOnce]);

  return (
    <div ref={containerRef} style={{ contain: 'layout' }}>
      {!post ? (
        <PostCardSkeleton />
      ) : (
        <PostUIProvider>
          <LoadedPostCard disableComments={disableComments} postId={postId} />
        </PostUIProvider>
      )}
    </div>
  );
});

PostCard.displayName = 'PostCard';

export default PostCard;