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
import { useNavigate } from "react-router-dom";
import { TableCont } from "@/assets/icons";
import FetchPosts from "@/services/fetchposts";

// we are getting postIds first and add them to redux slice 1, render posts by this slice which are request async load to slice 2 with loaded posts summary[]
// and if we find loaded post in second slice we render LoadedPostCard.tsx
// i guess we want to create additional slice for comments

const Home = React.memo(() => {
  const dispatch = useAppDispatch();
  const postIds = useSelector(SelectPostIds);
  const status = useSelector(SelectPreloadState);
  const postsRef = useRef<HTMLDivElement | null>(null);
  const [popoverShow, setPopoverShow] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(60);
  const [targetOffset, setTargetOffset] = useState(0);
  const headerOffsetRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const lastScrollY = useRef(0);
  const lastScrollTopRef = useRef(0);
  const [mode, setMode] = useState<modeType>("latest");
  const ui = useContext(UIContext);
  const [subsLimit, setSubsLimit] = useState(100);
  const userId = useCallback(() => {
    const id = Cookies.get("id");
    return id;
  }, []);

  useEffect(() => {
    const currentScrollY = ui?.scrollY ?? 0;
    const direction = ui?.scrollDirection;
    const diff = currentScrollY - lastScrollY.current;
  
    if (Math.abs(diff) < 0.5) return;
  
    setTargetOffset(prev => {
      let newOffset = prev;
  
      if (direction === "down") {
        // Медленнее двигаем вниз
        newOffset = Math.min(headerHeight, prev + diff * 0.35);
      } else if (direction === "up") {
        // Быстрее возвращаем вверх
        newOffset = Math.max(0, prev - Math.abs(diff) * 0.95);
      }
  
      return newOffset;
    });
  
    lastScrollY.current = currentScrollY;
  }, [ui?.scrollY, ui?.scrollDirection, headerHeight]);

  useEffect(() => {
    const animate = () => {
      const current = headerOffsetRef.current;
      const target = targetOffset;
    
      const diff = target - current;
      const smoothed = current + diff * 0.15;
    
      if (Math.abs(diff) < 0.1) {
        headerOffsetRef.current = target;
      } else {
        headerOffsetRef.current = smoothed;
      }
    
      const opacity = 1 - headerOffsetRef.current / headerHeight;
      const clampedOpacity = Math.max(0, Math.min(1, opacity));
    
      if (headerRef.current) {
        headerRef.current.style.transform = `translateY(-${headerOffsetRef.current}px)`;
        headerRef.current.style.opacity = clampedOpacity.toString();
        headerRef.current.style.willChange = "transform, opacity";
      }
    
      animationRef.current = requestAnimationFrame(animate);
    };
  
    if (animationRef.current === null) {
      animationRef.current = requestAnimationFrame(animate);
    }
  
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [targetOffset]);

  useEffect(() => {}, [status]);
  useEffect(() => {
    dispatch(clearPostIds());
    dispatch(clearPosts());

    dispatch(pagePostIdsFetch({ mode, skip: 0 }));

    const handleClickOutside = (e: MouseEvent) => {
      if (e.target instanceof Element) {
        if (
          e.target.id === "popover" ||
          e.target.closest("#popover") ||
          e.target.id === "docs" ||
          e.target.closest("#docs")
        ) {
          return;
        }
        setPopoverShow(false);
      }
    };

    document.body.addEventListener("click", handleClickOutside);

    return () => {
      document.body.removeEventListener("click", handleClickOutside);
    };
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

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

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

  //методы, отвечающие за SEARCH
  const inputRef = useRef<HTMLInputElement>(null);

  //фокус при нажатии на кнопку поиска
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

  //тогл открытие - закрытие
  function SearchHandle() {
    ui?.toggleSearchOpen();
  }

  function onChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    ui?.setSearch(newValue);
  }

  const debouncedSearchTerm = useDebounce(ui?.searchValue, 1000);

  //конец методов SEARCH

  //ретюрн
  return (
    <>
      <div className={styles.homePage}>
        <header
          ref={headerRef}
          className={`${styles.homeHeader} glass-dark`}
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
          <SearchModal value={debouncedSearchTerm ? debouncedSearchTerm : ""} />
        )}

        <div
          className={styles.postsContainer}
          ref={postsRef}
          onScroll={onPostsScroll}
        >
          <div className={styles.headerAdapt}></div>
          {postIds.map((post) => (
            <PostCard disableComments={false} key={post} postId={post} />
          ))}
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
