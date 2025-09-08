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
  const ui = useContext(UIContext);
  const [subsLimit, setSubsLimit] = useState(100);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<number>();

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

  const loadMore = useInfiniteScrollContainer(mode, subsLimit);

  const reloadTop = useCallback(() => {
    if (virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({ index: 0, behavior: "smooth" });
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

  useEffect(() => {
    if (ui) ui.setHomeReclickHandler(reloadTop);
    return () => {
      if (ui) ui.setHomeReclickHandler(null);
    };
  }, [ui, reloadTop]);

  const debouncedSearchTerm = useDebounce(ui?.searchValue, 1000);

  const itemContent = useCallback(
    (index: number, postId: number) => {
      return (
        <div style={{ contain: "content" }}>
          <PostCard
            key={`post-${postId}`}
            postId={postId}
            disableComments={false}
          />
        </div>
      );
    },
    []
  );

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
    // Ограничиваем частоту обновления скролла
    if (isScrolling.current) return;

    isScrolling.current = true;
    
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = window.setTimeout(() => {
      isScrolling.current = false;
    }, 50);

    const scrollDiff = Math.abs(scrollTop - lastScrollY.current);
    if (scrollDiff > 5) { // Увеличиваем порог для избежания микродвижений
      const direction: "up" | "down" = scrollTop > lastScrollY.current ? "down" : "up";
      ui?.setScrollState(direction, scrollTop);
      lastScrollY.current = scrollTop;
    }
  }, [ui]);

  const virtuosoComponents = useMemo(() => ({
    Footer,
    ScrollSeekPlaceholder: ({ index }: { index: number }) => (
      <div style={{ height: 400, contain: "content" }}>
        <ScrollSeekLoader index={index} hasMedia={true} />
      </div>
    ),
  }), [Footer]);

  const computeItemKey = useCallback((index: number, postId: number) => {
    return `post-${postId}`;
  }, []);

  // Очищаем таймаут при размонтировании
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
            overscan={1200} // Увеличиваем overscan для плавности
            increaseViewportBy={300}
            computeItemKey={computeItemKey}
            // Убираем initialTopMostItemIndex чтобы избежать скачков
            scrollSeekConfiguration={{
              enter: () => false,
              exit: () => false,
            }}
            onScroll={(e) => {
              const scrollTop = e.currentTarget.scrollTop;
              handleScroll(scrollTop);
            }}
            // Используем фиксированную высоту элементов для стабильности
            defaultItemHeight={400}
          />
        </div>
      </div>
    </>
  );
});

export default Home;