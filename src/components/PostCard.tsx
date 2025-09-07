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
import Cookies, { set } from "js-cookie";
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
  adPost?: boolean;
}

const PostCard = memo(({ postId, disableComments, adPost=false }: PostCardProps) => {
  const post = useSelector((state: RootState) => FindPost(state, postId));
  const dispatch = useAppDispatch();
  // we are loading skeleton until post summary fetch and then do all logic as maintained

  const userId = useCallback(() => {
    const id = Cookies.get("id");
    if (!id) {
      window.location.reload();
    }
    return id;
  }, []);
  userId();
  useEffect(() => {
    dispatch(
      postSummaryFetch({
        postId,
        dispatch: () => {
          dispatch(deletePreload(postId));
        },
      })
    );
  }, []);

  if (!post) {
    return <PostCardSkeleton />;
  }

  if (adPost) {
    return (
      <>
        <LoadedAdPostCard />
        <PostUIProvider>
          <LoadedPostCard disableComments={disableComments} postId={postId} />
        </PostUIProvider>
      </>
    );
  }
  
  return (
    <PostUIProvider>
      <LoadedPostCard disableComments={disableComments} postId={postId} />
    </PostUIProvider>
  );
});

PostCard.displayName = 'PostCard';

export default PostCard;
