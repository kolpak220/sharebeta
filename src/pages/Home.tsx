import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useContext,
} from "react";
import { Search, User, X } from "lucide-react";
import PostCard from "../components/PostCard";
import { useInfiniteScrollContainer } from "../hooks/useInfiniteScroll";
import styles from "./Home.module.css";
import { UIContext } from "../contexts/UIContext";
import SearchModal from "../components/SearchModal";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { useDebounce } from "@/hooks/debounce";
import { useAppDispatch } from "@/redux/store";
import { pagePostIdsFetch } from "@/redux/slices/preloadslice/asyncActions";
import { useSelector } from "react-redux";
import {
  SelectPostIds,
  SelectPreloadState,
} from "@/redux/slices/preloadslice/selectors";
import { clearPostIds } from "@/redux/slices/preloadslice/slice";
import { clearPosts } from "@/redux/slices/postsSlice/slice";
import UserOverlay from "@/components/UserOverlay";

// we are getting postIds first and add them to redux slice 1, render posts by this slice which are request async load to slice 2 with loaded posts summary[]
// and if we find loaded post in second slice we render LoadedPostCard.tsx
// i guess we want to create additional slice for comments

const Home = React.memo(() => {
  const dispatch = useAppDispatch();
  const postIds = useSelector(SelectPostIds);
  const status = useSelector(SelectPreloadState);
  const postsRef = useRef<HTMLDivElement | null>(null);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollTopRef = useRef(0);
  const ui = useContext(UIContext);
  const userId = useCallback(() => {
    const id = Cookies.get("id");
    return id;
  }, []);

  useEffect(() => {}, [status]);
  useEffect(() => {
    dispatch(pagePostIdsFetch({}));
  }, []);

  const handleScroll = useInfiniteScrollContainer();

  const onPostsScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop } = e.currentTarget;
      const last = lastScrollTopRef.current;
      const delta = scrollTop - last;
      if (Math.abs(delta) > 4) {
        const isDown = delta > 0;
        setHeaderHidden(isDown && scrollTop > 12);
        lastScrollTopRef.current = scrollTop;
        ui?.setScrollState(isDown ? "down" : "up", scrollTop);
      }
      handleScroll(e);
    },
    [handleScroll]
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
    dispatch(pagePostIdsFetch({}));
  }, []);

  useEffect(() => {
    if (ui) ui.setHomeReclickHandler(reloadTop);
    return () => {
      if (ui) ui.setHomeReclickHandler(null);
    };
  }, [ui, reloadTop]);

  //методы, отвечающие за SEARCH
  const inputRef = useRef<HTMLInputElement>(null);
  const [showModal, setShowModal] = useState(false);

  //фокус при нажатии на кнопку поиска
  useEffect(() => {
    setHeaderHidden(false);
    if (ui?.searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (ui?.searchOpen === true) {
      setShowModal(true);
    } else {
      setShowModal(false);
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
    <div className={styles.homePage}>
      <header
        className={`${styles.homeHeader} ${
          headerHidden && styles.hidden
        } glass-dark`}
      >
        <h1
          className={styles.appTitle}
          onClick={reloadTop}
          role="button"
          aria-label="Go to top and refresh"
        >
          Share
        </h1>

        <input
          ref={inputRef}
          className={`${styles.searchInput} ${
            ui?.searchOpen ? styles.open : ""
          }`}
          type="text"
          placeholder="Search..."
          onChange={(e) => {
            onChangeHandler(e);
          }}
        />

        <div className="header-actions">
          <button
            className={styles.searchBtn}
            aria-label="Search"
            onClick={SearchHandle}
          >
            {ui?.searchOpen ? <X size={18} /> : <Search size={18} />}
          </button>

          <button
            className={styles.profileBtn}
            aria-label="Profile"
            onClick={() => (window.location.href = "/profile")}
          >
            <User size={18} />
          </button>
        </div>
      </header>

      {showModal && (
        <SearchModal value={debouncedSearchTerm ? debouncedSearchTerm : ""} />
      )}

      <div
        className={styles.postsContainer}
        ref={postsRef}
        onScroll={onPostsScroll}
      >
        {postIds.map((post) => (
          <PostCard disableComments={false} key={post} postId={post} />
        ))}

        {status === "loading" && (
          <div className={cn("space-y-4", styles.loadingIndicator)}>
            <div className={styles.spinner}></div>
            <p>Loading more posts...</p>
          </div>
        )}
      </div>

      {ui?.userOverlay.show && (
        <UserOverlay
          show={ui.userOverlay.show}
          userId={ui.userOverlay.userId}
        />
      )}
    </div>
  );
});

export default Home;
