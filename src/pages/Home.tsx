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
import CommentsModal from "../components/CommentsModal";
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
import ScrollSeekLoader from "@/components/ScrollSeekLoader";

const Home = React.memo(() => {
  const dispatch = useAppDispatch();
  const postIds = useSelector(SelectPostIds);
  const status = useSelector(SelectPreloadState);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<modeType>("latest");
  const ui = useContext(UIContext);
  const [subsLimit, setSubsLimit] = useState(100);
  const [arrayAdGap, setArrayAdGap] = useState<number[]>([]);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);
  const isUserScrolling = useRef(false);
  const scrollTimeout = useRef<number>();
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
  }, [mode, dispatch]);

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
  }, [postIds, mode]);

  // Watch scroll direction and manage header/bottom nav visibility
  useEffect(() => {
    if (!ui) return;
    

    const shouldHide = ui.scrollDirection === "down" && ui.scrollY > 100 || ui.commentsModal.isOpen || ui.isFullScreen;

    // Update header visibility
    setHeaderHidden(shouldHide);

    // Update bottom nav visibility through UI context
    ui.setBottomNavHidden(shouldHide);
  }, [ui?.scrollDirection, ui?.scrollY, ui, ui?.commentsModal.isOpen, ui?.isFullScreen]);

  const loadMore = useInfiniteScrollContainer(mode, subsLimit);

  const reloadTop = useCallback(async () => {
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
  }, [ui, reloadTop, mode]);

  const debouncedSearchTerm = useDebounce(ui?.searchValue, 1000);

  const updateArrayAdGap = useCallback(() => {
    const newArray: number[] = Array(15)
      .fill(null)
      .map(() => Math.floor(Math.random() * (6 - 3 + 1)) + 3);

    setArrayAdGap((prev) => [...prev, ...newArray]);
  }, []);

  const itemContent = useCallback(
    (index: number, postId: number) => {
      // if (index >= arrayAdGap.length - 5) {
      //   updateArrayAdGap();
      // }

      // if (arrayAdGap[index] && index % arrayAdGap[index] === 0 && index !== 0) {
      //   return (
      //     <React.Fragment key={`${postId}-${index}`}>
      //       <PostCard disableComments={false} postId={postId} adPost={true} />
      //     </React.Fragment>
      //   );
      // }

      return (
        <PostCard
          key={`${postId}-${index}`}
          disableComments={false}
          postId={postId}
        />
      );
    },
    [arrayAdGap, updateArrayAdGap]
  );

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

  const handleVirtuosoScroll = useCallback(
    (scrollTop: number) => {

      const scrollDiff = Math.abs(scrollTop - lastScrollY.current);
      
      if (scrollDiff > 100) {
        const direction: "up" | "down" =
          scrollTop > lastScrollY.current ? "down" : "up";
        
        ui?.setScrollState(direction, scrollTop);
        lastScrollY.current = scrollTop;
      }
    },
    [ui]
  );

  return (
    <>
      <CommentsModal />

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

        <div
          onScroll={(e) => handleVirtuosoScroll(e.currentTarget.scrollTop)}
          ref={containerRef}
          className={styles.postsContainer}
        >
          <div className={styles.headerAdapt}></div>
          <Virtuoso
            ref={virtuosoRef}
            style={{ height: "100%", width: "100%" }}
            data={postIds}
            itemContent={itemContent}
            endReached={loadMore}
            components={{
              Footer,
              ScrollSeekPlaceholder: ({ index }) => (
                <ScrollSeekLoader index={index} />
              ),
            }}
            overscan={1000}
            increaseViewportBy={800}
            customScrollParent={containerRef.current!}
            scrollSeekConfiguration={{
              enter: (velocity) => Math.abs(velocity) > 500,
              exit: (velocity) => Math.abs(velocity) < 30,
            }}
            onScroll={(e: React.UIEvent<HTMLDivElement>) => {
              const scrollTop = e.currentTarget.scrollTop;
              console.log(1);
            }}
          />
        </div>
      </div>
    </>
  );
});

export default Home;
