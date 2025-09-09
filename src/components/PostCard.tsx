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
  onMediaDetected?: (hasMedia: boolean) => void;
  adPost?: boolean;
}

const PostCard = memo(
  ({ postId, disableComments, onHeightMeasured }: PostCardProps) => {
    const post = useSelector((state: RootState) => FindPost(state, postId));
    const dispatch = useAppDispatch();
    const containerRef = useRef<HTMLDivElement>(null);
    const [measured, setMeasured] = useState(false);
    const resizeObserverRef = useRef<ResizeObserver>();
    const [isVisible, setIsVisible] = useState(false);
    const [isInViewport, setIsInViewport] = useState(false);
    const observerRef = useRef<IntersectionObserver>();

    const userId = useCallback(() => {
      const id = Cookies.get("id");
      if (!id) window.location.reload();
      return id;
    }, []);
    userId();

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInViewport(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
  
      if (containerRef.current) {
        observer.observe(containerRef.current);
      }
  
      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      dispatch(
        postSummaryFetch({
          postId,
          dispatch: () => dispatch(deletePreload(postId)),
        })
      );
    }, [dispatch, postId]);

    useEffect(() => {
      if (!containerRef.current || !onHeightMeasured || !post) return;
    
      const updateHeight = () => {
        if (containerRef.current) {
          const height = containerRef.current.getBoundingClientRect().height;
          onHeightMeasured(postId, height);
          setMeasured(true);
        }
      };
    
      if (!resizeObserverRef.current) {
        resizeObserverRef.current = new ResizeObserver(updateHeight);
      }
    
      if (containerRef.current) {
        resizeObserverRef.current.observe(containerRef.current);
      }

      const rafId = requestAnimationFrame(updateHeight);
    
      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        if (resizeObserverRef.current && containerRef.current) {
          resizeObserverRef.current.unobserve(containerRef.current);
        }
      };
    }, [post, postId, onHeightMeasured]);

    return (
      <div
        ref={containerRef}>
        {!post ? (
          <PostCardSkeleton />
        ) : (
          <PostUIProvider>
            <LoadedPostCard disableComments={disableComments} postId={postId} />
          </PostUIProvider>
        )}
      </div>
    );
  }
);

PostCard.displayName = "PostCard";

export default PostCard;
