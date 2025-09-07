import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useContext,
} from "react";
import {
  BookOpen,
  BookText,
  Search,
  User,
  X,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import PostCard from "../components/PostCard";
import { useInfiniteScrollContainer } from "../hooks/useInfiniteScroll";
import styles from "./Home.module.css";
import { UIContext } from "../contexts/UIContext";
import SearchModal from "../components/SearchModal";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { useDebounce } from "@/hooks/debounce";
import { useAppDispatch } from "@/redux/store";
import {
  modeType,
  pagePostIdsFetch,
} from "@/redux/slices/preloadslice/asyncActions";
import { useSelector } from "react-redux";
import {
  SelectPostIds,
  SelectPreloadState,
} from "@/redux/slices/preloadslice/selectors";
import { clearPostIds } from "@/redux/slices/preloadslice/slice";
import { clearPosts } from "@/redux/slices/postsSlice/slice";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import FetchPosts from "@/services/fetchposts";

const Home = React.memo(() => {
  const dispatch = useAppDispatch();
  const postIds = useSelector(SelectPostIds);
  const status = useSelector(SelectPreloadState);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [mode, setMode] = useState<modeType>("latest");
  const ui = useContext(UIContext);
  const [subsLimit, setSubsLimit] = useState(100);
  const [arrayAdGap, setArrayAdGap] = useState<number[]>([]);
  const userId = useCallback(() => {
    const id = Cookies.get("id");
    return id;
  }, []);

  useEffect(() => {
    const initialArray: number[] = Array(15)
      .fill(null)
      .map(() => Math.floor(Math.random() * (6 - 3 + 1)) + 3);
    setArrayAdGap(initialArray);
  }, []);

  useEffect(() => {
    dispatch(clearPostIds());
    dispatch(clearPosts());
    dispatch(pagePostIdsFetch({ mode, skip: 0 }));
  }, [mode]);

  useEffect(() => {
    (async () => {
      if (mode === "subs") {
        const res = await FetchPosts.subsLimit();
        if (!res) {
          return;
        }
        setSubsLimit(res.count);
      }
    })();
  }, [postIds]);

  const loadMore = useInfiniteScrollContainer(mode, subsLimit);

  const onScroll = useCallback(
    (scrollTop: number) => {
      const NEAR_TOP_THRESHOLD = 100;

      if (scrollTop <= NEAR_TOP_THRESHOLD) {
        ui?.setScrollState("up", scrollTop);
      } else {
        ui?.setScrollState(scrollTop > (ui?.scrollY || 0) ? "down" : "up", scrollTop);
      }
    },
    [ui]
  );

  useEffect(() => {
    setHeaderHidden(ui?.scrollDirection === "down" && (ui?.scrollY ?? 0) > 10);
  }, [ui?.scrollDirection, ui?.scrollY]);

  const reloadTop = useCallback(async () => {
    if (virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({ index: 0, behavior: 'smooth' });
    }
    dispatch(clearPostIds());
    dispatch(clearPosts());
    const id = userId();
    if (!id) {
      window.location.reload();
      return;
    }
    dispatch(pagePostIdsFetch({ mode, skip: 0 }));
  }, [mode, postIds]);

  useEffect(() => {
    if (ui) ui.setHomeReclickHandler(reloadTop);
    return () => {
      if (ui) ui.setHomeReclickHandler(null);
    };
  }, [ui, reloadTop, mode]);

  const debouncedSearchTerm = useDebounce(ui?.searchValue, 1000);

  const updateArrayAdGap = useCallback(() => {
    const newArray: number[] = Array(15)
      .fill(null)
      .map(() => Math.floor(Math.random() * (6 - 3 + 1)) + 3);
    
    setArrayAdGap(prev => [...prev, ...newArray]);
  }, []);

  const itemContent = useCallback((index: number, postId: number) => {
    if (index >= arrayAdGap.length - 5) {
      updateArrayAdGap();
    }
    
    if (arrayAdGap[index] && index % arrayAdGap[index] === 0 && index !== 0) {
      return (
        <React.Fragment key={`${postId}-${index}`}>
          <PostCard disableComments={false} postId={postId} adPost={true} />
        </React.Fragment>
      );
    }
    
    return (
      <PostCard key={`${postId}-${index}`} disableComments={false} postId={postId} />
    );
  }, [arrayAdGap, updateArrayAdGap]);

  const Footer = useCallback(() => {
    if (status === "loading") {
      return (
        <div className={cn("space-y-4", styles.loadingIndicator)}>
          <div className={styles.spinner}></div>
          <p>Loading more posts...</p>
        </div>
      );
    }
    
    if (mode === "subs" && postIds.length >= subsLimit) {
      return (
        <div className="space-y-2 w-full flex flex-col justify-center items-center text-[#999] py-4">
          <p
            onClick={() => setMode("fyp")}
            className={`${
              postIds.length == 0 && "mt-10"
            } bg-white text-black p-3 rounded-3xl flex items-center cursor-pointer`}
          >
            Subscribe to more people
            <ChevronRight />
          </p>
          <p>You've reached the end!</p>
          <div className="h-[50px]"></div>
        </div>
      );
    }
    
    return null;
  }, [status, mode, postIds.length, subsLimit]);

  return (
    <>
      <div className={styles.homePage}>
        <header
          className={`${styles.homeHeader} ${
            headerHidden && styles.hidden
          } glass-dark`}
        >
          <div className="w-full flex justify-between items-center px-2 ">
            <button
              onClick={() => setMode("subs")}
              className={cn(styles.tab, `${mode === "subs" && styles.active}`)}
            >
              Following
            </button>
            <button
              onClick={() => setMode("fyp")}
              className={cn(styles.tab, `${mode === "fyp" && styles.active}`)}
            >
              For you
            </button>
            <button
              onClick={() => setMode("latest")}
              className={cn(
                styles.tab,
                `${mode === "latest" && styles.active}`
              )}
            >
              Latest
            </button>
          </div>
        </header>

        {ui?.searchOpen && (
          <SearchModal value={debouncedSearchTerm ? debouncedSearchTerm : ""} />
        )}

        <div ref={containerRef} className={styles.postsContainer}>
          <div className={styles.headerAdapt}></div>
          <Virtuoso
            ref={virtuosoRef}
            style={{ height: '100%', width: '100%' }}
            data={postIds}
            itemContent={itemContent}
            endReached={loadMore}
            components={{ Footer }}
            overscan={{
              main: 1000,
              reverse: 1000
            }}
            increaseViewportBy={{
              top: 400,
              bottom: 400
            }}
            useWindowScroll={false}
            customScrollParent={containerRef.current || undefined}
            scrollSeekConfiguration={{
              enter: (velocity) => Math.abs(velocity) > 1000,
              exit: (velocity) => Math.abs(velocity) < 50,
            }}
          />
        </div>
      </div>
    </>
  );
});

export default Home;