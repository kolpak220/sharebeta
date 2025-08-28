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
  const lastScrollTopRef = useRef(0);
  const [mode, setMode] = useState<modeType>("latest");
  const ui = useContext(UIContext);
  const [subsLimit, setSubsLimit] = useState(100);
  const userId = useCallback(() => {
    const id = Cookies.get("id");
    return id;
  }, []);

  useEffect(() => {}, [status]);
  useEffect(() => {
    dispatch(clearPostIds());
    dispatch(clearPosts());

    dispatch(pagePostIdsFetch({ mode, skip: 0 }));

    const handleClickOutside = (e: MouseEvent) => {
      if (e.target instanceof Element) {
        // If click is on popover or its children, do nothing
        if (
          e.target.id === "popover" ||
          e.target.closest("#popover") ||
          e.target.id === "docs" ||
          e.target.closest("#docs")
        ) {
          return;
        }
        // If click is elsewhere, close the popover
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

  const handleScroll = useInfiniteScrollContainer(mode, subsLimit);

  const onPostsScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop } = e.currentTarget;
      const last = lastScrollTopRef.current;
      const delta = scrollTop - last;

      // Define threshold for "near top"
      const NEAR_TOP_THRESHOLD = 100; // pixels

      if (Math.abs(delta) > 4) {
        const isDown = delta > 0;

        // If we're near the top, always set to "up"
        if (scrollTop <= NEAR_TOP_THRESHOLD) {
          ui?.setScrollState("up", scrollTop);
        } else {
          // Otherwise, use normal logic
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
          className={`${styles.homeHeader} ${
            headerHidden && styles.hidden
          } glass-dark`}
        >
          <div className="relative px-1 py-2 flex justify-center w-full items-center">
            <button
              className="absolute left-2"
              id="docs"
              onClick={() => setPopoverShow(true)}
            >
              <TableCont />

              <div
                id="popover"
                className={`${styles.popover} ${
                  popoverShow ? styles.show : styles.hide
                }`}
              >
                <div className={styles.popoverContent}>
                  <button
                    onClick={() => {
                      setPopoverShow(false);
                      ui?.setScrollState("down", 50);
                      ui?.setOverlay(true, "rules");
                    }}
                    className={styles.popoverOption}
                  >
                    <BookOpen className={styles.popoverIcon} />
                    <span>Rules</span>
                  </button>
                  <button
                    onClick={() => {
                      setPopoverShow(false);
                      ui?.setScrollState("down", 50);

                      ui?.setOverlay(true, "privacy");
                    }}
                    className={styles.popoverOption}
                  >
                    <ShieldCheck className={styles.popoverIcon} />
                    <span>Privacy policy</span>
                  </button>
                </div>
              </div>
            </button>
            <h1
              className={styles.appTitle}
              onClick={reloadTop}
              role="button"
              aria-label="Go to top and refresh"
            >
              Share
            </h1>
          </div>
          {/* <input
            ref={inputRef}
            className={`${styles.searchInput} ${
              ui?.searchOpen ? styles.open : ""
            }`}
            type="text"
            placeholder="Search..."
            onChange={(e) => {
              onChangeHandler(e);
            }}
          /> */}
          <div className="w-full flex justify-between items-center px-2 py-2">
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
          {postIds.map((post) => (
            <PostCard disableComments={false} key={post} postId={post} />
          ))}
          {mode === "subs" && postIds.length >= subsLimit && (
            <div className="space-y-2 w-full flex flex-col justify-center items-center text-[#999]">
              <p
                onClick={() => setMode("fyp")}
                className="bg-white text-black p-3 rounded-3xl flex items-center"
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
