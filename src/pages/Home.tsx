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

import FetchPosts from "@/services/fetchposts";

const Home = React.memo(() => {
  const dispatch = useAppDispatch();
  const postIds = useSelector(SelectPostIds);
  const status = useSelector(SelectPreloadState);
  const postsRef = useRef<HTMLDivElement | null>(null);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollTopRef = useRef(0);
  const [mode, setMode] = useState<modeType>("latest");
  const ui = useContext(UIContext);
  const [subsLimit, setSubsLimit] = useState(100);
  const [arrayAdGap, setArrayAdGap] = useState<number[]>([]);
  const userId = useCallback(() => {
    const id = Cookies.get("id");
    return id;
  }, []);

  useEffect(() => {
    // Инициализируем массив при монтировании компонента
    const initialArray: number[] = Array(15)
      .fill(null)
      .map(() => Math.floor(Math.random() * (6 - 3 + 1)) + 3);
    setArrayAdGap(initialArray);
  }, []);

  useEffect(() => {}, [status]);
  
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

  const handleScroll = useInfiniteScrollContainer(mode, subsLimit);

  const onPostsScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop } = e.currentTarget;
      const last = lastScrollTopRef.current;
      const delta = scrollTop - last;

      const NEAR_TOP_THRESHOLD = 100;

      if (Math.abs(delta) > 4) {
        const isDown = delta > 0;

        if (scrollTop <= NEAR_TOP_THRESHOLD) {
          ui?.setScrollState("up", scrollTop);
        } else {
          ui?.setScrollState(isDown ? "down" : "up", scrollTop);
        }

        lastScrollTopRef.current = scrollTop;
        handleScroll(e);
      }
    },
    [handleScroll, ui]
  );
  
  useEffect(() => {
    setHeaderHidden(ui?.scrollDirection === "down" && (ui?.scrollY ?? 0) > 10);
  }, [ui?.scrollDirection, ui?.scrollY]);

  const reloadTop = useCallback(async () => {
    if (postsRef.current) {
      postsRef.current.scrollTo({ top: 0, behavior: "smooth" });
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

  // Методы поиска
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHeaderHidden(false);
    if (ui?.searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (ui?.searchOpen === false) {
      ui?.setScrollState("up", 50);
    }
    if (inputRef.current && ui?.searchValue) {
      inputRef.current.value = ui.searchValue;
    }
  }, [ui?.searchOpen, ui?.searchValue]);

  function SearchHandle() {
    ui?.toggleSearchOpen();
  }

  function onChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    ui?.setSearch(newValue);
  }

  const debouncedSearchTerm = useDebounce(ui?.searchValue, 1000);

  const updateArrayAdGap = useCallback(() => {
    const newArray: number[] = Array(15)
      .fill(null)
      .map(() => Math.floor(Math.random() * (6 - 3 + 1)) + 3);
    
    setArrayAdGap(prev => [...prev, ...newArray]);
  }, []);

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

        <div
          className={styles.postsContainer}
          ref={postsRef}
          onScroll={onPostsScroll}
        >
          <div className={styles.headerAdapt}></div>
          {postIds.map((post, index) => {
            if (index >= arrayAdGap.length - 5) {
              updateArrayAdGap();
            }
            
            return arrayAdGap[index] && index % arrayAdGap[index] === 0 && index !== 0 ? (
              <React.Fragment key={`${post}-${index}`}>
                <PostCard disableComments={false} postId={post} adPost={true} />
              </React.Fragment>
            ) : (
              <PostCard key={`${post}-${index}`} disableComments={false} postId={post} />
            );
          })}
          {mode === "subs" && postIds.length >= subsLimit && (
            <div className="space-y-2 w-full flex flex-col justify-center items-center text-[#999]">
              <p
                onClick={() => setMode("fyp")}
                className={`${
                  postIds.length == 0 && "mt-10"
                } bg-white text-black p-3 rounded-3xl flex items-center`}
              >
                Subscribe to more people
                <ChevronRight />
              </p>
              <p>You've reached the end!</p>
              <div className="h-[100px]"></div>
            </div>
          )}
          {status === "loading" && (
            <div className={cn("space-y-4", styles.loadingIndicator)}>
              <div className={styles.spinner}></div>
              <p>Loading more posts...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

export default Home;