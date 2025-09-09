import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useContext,
  useMemo,
} from "react";
import {
  ChevronRight,
} from "lucide-react";
import PostCard from "../components/PostCard";
import { useInfiniteScrollContainer } from "../hooks/useInfiniteScroll";
import styles from "./Home.module.css";
import { UIContext } from "../contexts/UIContext";
import SearchModal from "../components/SearchModal";
import CommentsModal from "../components/CommentsModal";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { useDebounce } from "@/hooks/debounce";
import { useAppDispatch } from "@/redux/store";
import { modeType, pagePostIdsFetch } from "@/redux/slices/preloadslice/asyncActions";
import { useSelector } from "react-redux";
import { SelectPostIds, SelectPreloadState } from "@/redux/slices/preloadslice/selectors";
import { clearPostIds } from "@/redux/slices/preloadslice/slice";
import { clearPosts } from "@/redux/slices/postsSlice/slice";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import FetchPosts from "@/services/fetchposts";
import ScrollSeekLoader from "@/components/ScrollSeekLoader";

const Home = React.memo(() => {
  const dispatch = useAppDispatch();
  const postIds = useSelector(SelectPostIds);
  const status = useSelector(SelectPreloadState);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [mode, setMode] = useState<modeType>("latest");
  const [heights, setHeights] = useState<Record<number, number>>({});
  const [postMediaInfo, setPostMediaInfo] = useState<Record<number, boolean>>({});
  const heightMapRef = useRef<Record<number, number>>({});
  const [subsLimit, setSubsLimit] = useState(100);
  const [headerHidden, setHeaderHidden] = useState(false);
  const scrollPositionRef = useRef<number>(0);
  const isScrollingRef = useRef(false);
  const lastScrollY = useRef(0);
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<number>();
  const ui = useContext(UIContext);

  const userId = useCallback(() => {
    return Cookies.get("id") || null;
  }, []);

  useEffect(() => {
    dispatch(clearPostIds());
    dispatch(clearPosts());
    dispatch(pagePostIdsFetch({ mode, skip: 0 }));
  }, [mode, dispatch]);

  useEffect(() => {
    (async () => {
      if (mode === "subs") {
        const res = await FetchPosts.subsLimit();
        if (res) setSubsLimit(res.count);
      }
    })();
  }, [mode]);

  useEffect(() => {
    if (!ui) return;

    const shouldHide =
      ui.scrollDirection === "down" &&
      ui.scrollY > 100 &&
      !ui.commentsModal.isOpen &&
      !ui.isFullScreen;

    setHeaderHidden(shouldHide);
    ui.setBottomNavHidden(shouldHide);
  }, [
    ui?.scrollDirection,
    ui?.scrollY,
    ui?.commentsModal.isOpen,
    ui?.isFullScreen,
    ui,
  ]);

  useEffect(() => {
    if (virtuosoRef.current) {
      virtuosoRef.current.getState((state) => {
        scrollPositionRef.current = state.scrollTop;
      });
    }
  }, [postIds]);

  useEffect(() => {
    if (scrollPositionRef.current > 0 && virtuosoRef.current) {
      const restoreScroll = () => {
        virtuosoRef.current?.scrollTo({
          top: scrollPositionRef.current,
          behavior: 'auto'
        });
        scrollPositionRef.current = 0;
      };
      
      setTimeout(restoreScroll, 50);
    }
  }, [postIds]);

  const loadMore = useInfiniteScrollContainer(mode, subsLimit);

  const reloadTop = useCallback(() => {
    if (virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({ index: 0, behavior: "smooth" });
    }
    
    if (virtuosoRef.current) {
      virtuosoRef.current.getState((state) => {
        scrollPositionRef.current = state.scrollTop;
      });
    }
    
    dispatch(clearPostIds());
    dispatch(clearPosts());
    const id = userId();
    if (!id) {
      window.location.reload();
      return;
    }
    dispatch(pagePostIdsFetch({ mode, skip: 0 }));
  }, [mode, dispatch, userId]);

  const debouncedSearchTerm = useDebounce(ui?.searchValue, 1000);

  const Footer = useMemo(() => {
    return function FooterComponent() {
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
              className={cn(
                postIds.length === 0 && "mt-10",
                "bg-white text-black p-3 rounded-3xl flex items-center cursor-pointer"
              )}
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
    };
  }, [status, mode, postIds.length, subsLimit]);

  const handleScroll = useCallback((scrollTop: number) => {
    isScrollingRef.current = true;
    
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
  
    scrollTimeout.current = window.setTimeout(() => {
      const direction: "up" | "down" = scrollTop > lastScrollY.current ? "down" : "up";
      const scrollDiff = Math.abs(scrollTop - lastScrollY.current);
      
      if (scrollDiff > 10) {
        ui?.setScrollState(direction, scrollTop);
        lastScrollY.current = scrollTop;
      }
      
      isScrollingRef.current = false;
    }, 16);
  }, [ui]);

  const virtuosoComponents = useMemo(() => ({
    Footer,
    ScrollSeekPlaceholder: ({ index }: { index: number }) => {
      const postId = postIds[index];
      const hasMedia = postMediaInfo[postId] || false;
      const estimatedHeight = heights[postId] || (hasMedia ? 700 : 300);
      
      return (
        <div style={{ height: estimatedHeight, contain: "content" }}>
          <ScrollSeekLoader 
            index={index} 
            hasMedia={hasMedia} 
            estimatedHeight={estimatedHeight}
          />
        </div>
      );
    },
  }), [Footer, postIds, heights]);

  const handleHeightMeasured = useCallback((postId: number, height: number) => {
  const currentHeight = heightMapRef.current[postId];
  if (!currentHeight || Math.abs(currentHeight - height) > 50) {
    heightMapRef.current[postId] = height;
    setHeights(prev => ({ ...prev, [postId]: height }));
  }
}, []);
  
  const estimateHeight = useCallback((index: number) => {
    const postId = postIds[index];
    return heights[postId] || 300;
  }, [postIds, heights]);

  const MemoizedPostCard = React.memo(PostCard, (prevProps, nextProps) => {
    return prevProps.postId === nextProps.postId && 
           prevProps.disableComments === nextProps.disableComments;
  });

  const itemContent = useCallback((index: number, postId: number) => {
    return (
      <div style={{ contain: "content" }}>
        <MemoizedPostCard
          key={`post-${postId}`}
          postId={postId}
          disableComments={false}
          onHeightMeasured={handleHeightMeasured}
          onMediaDetected={(hasMedia: boolean) => {
            setPostMediaInfo(prev => ({ ...prev, [postId]: hasMedia }));
          }}
        />
      </div>
    );
  }, [handleHeightMeasured]);

  const computeItemKey = useCallback((index: number, postId: number) => {
    return `post-${postId}`;
  }, []);

  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  return (
    <>
      <CommentsModal />

      <div className={styles.homePage}>
        <header
          className={cn(
            styles.homeHeader,
            headerHidden && styles.hidden,
            "glass-dark"
          )}
        >
          <div className="w-full flex justify-between items-center px-2">
            <button
              onClick={() => setMode("subs")}
              className={cn(styles.tab, mode === "subs" && styles.active)}
            >
              Following
            </button>
            <button
              onClick={() => setMode("fyp")}
              className={cn(styles.tab, mode === "fyp" && styles.active)}
            >
              For you
            </button>
            <button
              onClick={() => setMode("latest")}
              className={cn(styles.tab, mode === "latest" && styles.active)}
            >
              Latest
            </button>
          </div>
        </header>

        {ui?.searchOpen && (
          <SearchModal value={debouncedSearchTerm || ""} />
        )}

        <div className={styles.postsContainer}>
          <div className={styles.headerAdapt} />
          <Virtuoso
            ref={virtuosoRef}
            style={{ height: "100%", width: "100%" }}
            data={postIds}
            itemContent={itemContent}
            endReached={loadMore}
            components={virtuosoComponents}
            overscan={800}
            increaseViewportBy={250}
            computeItemKey={computeItemKey}
            scrollSeekConfiguration={{
              enter: (velocity) => Math.abs(velocity) > 800,
              exit: (velocity) => Math.abs(velocity) < 50,
            }}
            onScroll={(e) => {
              const scrollTop = e.currentTarget.scrollTop;
              handleScroll(scrollTop);
            }}
            useWindowScroll={false}
          />
        </div>
      </div>
    </>
  );
});

export default Home;