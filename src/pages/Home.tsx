import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useContext,
  useMemo,
} from "react";
import { Search, User, X } from "lucide-react";
import PostCard from "../components/PostCard";
import { useInfiniteScrollContainer } from "../hooks/useInfiniteScroll";
import { Post } from "../types";
import styles from "./Home.module.css";
import { UIContext } from "../contexts/UIContext";
import SearchModal from "../components/SearchModal";
import { FetchPosts } from "../services/fetchposts";
import CommentsModal from "../components/CommentsModal";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
const Home = React.memo(() => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const postsRef = useRef<HTMLDivElement | null>(null);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollTopRef = useRef(0);
  const ui = useContext(UIContext);
  const userId = useCallback(() => {
    const id = Cookies.get("id");
    return id;
  }, []);

  useEffect(() => {
    setLoading(true);

    const fetchPosts = async () => {
      const id = userId();
      if (!id) {
        window.location.reload();
        return;
      }
      const response = await FetchPosts.pageFetch(posts.length, 10, id);
      if (response) {
        setPosts(response);
        setLoading(false);
      } else {
        console.log("error" + response);
      }
    };
    fetchPosts();
  }, []);

  const fetchMorePosts = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      const id = userId();
      if (!id) {
        window.location.reload();
        return;
      }
      const response = await FetchPosts.pageFetch(posts.length, 10, id);

      if (!Array.isArray(response)) return; // Handle non-array response

      setPosts((prevPosts) => {
        // Create a Set of existing post IDs for fast lookup
        const existingIds = new Set(prevPosts.map((post) => post.idPost));

        // Filter out any duplicates from the new response
        const newPosts = response.filter(
          (post) => !existingIds.has(post.idPost)
        );

        // Only update if we have new posts
        return newPosts.length > 0 ? [...prevPosts, ...newPosts] : prevPosts;
      });
    } catch (error) {
      console.error("Error fetching more posts:", error);
      // Optionally handle UI error state here
    } finally {
      setLoading(false);
    }
  }, [loading, posts.length]);

  const { handleScroll, isFetching } = useInfiniteScrollContainer({
    fetchMore: fetchMorePosts,
    loading,
  });

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
    setLoading(true);
    setPosts([]);
    const id = userId();
    if (!id) {
      window.location.reload();
      return;
    }
    const response = await FetchPosts.pageFetch(posts.length, 10, id);
    if (response) {
      setPosts(response);
      setLoading(false);
    } else {
      console.log("error" + response);
    }
  }, []);

  useEffect(() => {
    if (ui) ui.setHomeReclickHandler(reloadTop);
    return () => {
      if (ui) ui.setHomeReclickHandler(null);
    };
  }, [ui, reloadTop]);

  //методы, отвечающие за SEARCH

  //обозначение переменных (думаю тут удобнее)
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const [showModal, setShowModal] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  //фокус при нажатии на кнопку поиска
  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  //тогл открытие - закрытие
  function SearchHandle() {
    if (searchOpen === true) {
      setShowModal(false);
    } else {
      setShowModal(true);
    }
    setSearchOpen((prev) => !prev);
  }

  //реактивная смена инпута и отправка данных
  function onChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    setSearchValue(newValue);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    //отправка данных по истечению секунды
    timeoutRef.current = setTimeout(() => {
      if (newValue !== "") {
        const searchApi = { query: newValue };
        console.log(searchApi);
      }
    }, 1000);
  }

  //очистка таймера
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  //конец методов SEARCH

  //ретюрн
  const postCards = useMemo(() => {
    return posts.map((post) => (
      <PostCard key={`${post.idPost}_${post.idCreator}`} post={post} />
    ));
  }, [posts]);

  return (
    <div className={styles.homePage}>
      <header
        className={`${styles.homeHeader} ${
          headerHidden ? styles.hidden : ""
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
          className={`${styles.searchInput} ${searchOpen ? styles.open : ""}`}
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
            {searchOpen ? <X size={18} /> : <Search size={18} />}
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

      {showModal && <SearchModal value={searchValue} />}

      <div
        className={styles.postsContainer}
        ref={postsRef}
        onScroll={onPostsScroll}
      >
        {postCards}

        {(loading || isFetching) && (
          <div className={cn("space-y-4", styles.loadingIndicator)}>
            <div className={styles.spinner}></div>
            <p>Loading more posts...</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default Home;
