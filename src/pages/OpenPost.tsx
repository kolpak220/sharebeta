import React, { useCallback, useContext, useEffect, useState } from "react";
import { X } from "lucide-react";
import styles from "./Home.module.css";
import { useParams } from "react-router-dom";
import { postSummaryFetch } from "@/redux/slices/postsSlice/asyncActions";
import { FindPost } from "@/redux/slices/postsSlice/selectors";
import { RootState, useAppDispatch } from "@/redux/store";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import PostCard from "@/components/PostCard";
import ViewPost from "@/components/ViewPost";
import { cn } from "@/lib/utils";
import { UIContext } from "@/contexts/UIContext";

const OpenPost: React.FC = () => {
  const { id } = useParams();
  const postId = Number(id);
  const post = useSelector((state: RootState) => FindPost(state, postId));
  const dispatch = useAppDispatch();
  const ui = useContext(UIContext);

  useEffect(() => {
    if (post) {
      ui?.setScrollState("down", 50);
    } else {
      ui?.setScrollState("up", 50);
    }
  }, [post]);

  const userId = useCallback(() => {
    const id = Cookies.get("id");
    if (!id) {
      window.location.reload();
    }
    return id;
  }, []);
  userId();

  if (!id || !postId) {
    return (
      <div className={styles.shortsPage}>
        <div className={styles.shortsBlank}>
          <X size={48} />
          <h2>Wrong argument</h2>
          <p>Post id is none or not number</p>
        </div>
      </div>
    );
  }

  if (!post) {
    dispatch(postSummaryFetch({ postId }));
    return (
      <div className={cn("space-y-4", styles.loadingIndicator)}>
        <div className={styles.spinner}></div>
        <p>Loading post "{id}"...</p>
      </div>
    );
  }
  return (
    <div className={styles.postsContainer}>
      <ViewPost postId={Number(id)} />
    </div>
  );
};

export default OpenPost;
