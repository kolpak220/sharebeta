import React, {
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
import LoadedPostCard from "./LoadedPostCard";
import { useSelector } from "react-redux";
import { FindPost } from "@/redux/slices/postsSlice/selectors";
import { RootState, useAppDispatch } from "@/redux/store";
import { postSummaryFetch } from "@/redux/slices/postsSlice/asyncActions";
import { deletePreload } from "@/redux/slices/preloadslice/slice";

interface PostCardProps {
  postId: number;
  disableComments: boolean;
}

const PostCard = ({ postId, disableComments }: PostCardProps) => {
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
  return <LoadedPostCard disableComments={disableComments} postId={postId} />;
};

export default PostCard;
