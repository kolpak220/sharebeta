import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./SearchModal.module.css";
import SearchActions, { User } from "@/services/searchActions";
import Cookies, { set } from "js-cookie";
import { Post } from "@/types";
import { cn, formatNumber } from "@/lib/utils";
import MiniPostCard from "./MiniPostCard";
import Paragraph from "antd/es/typography/Paragraph";
import getUser from "@/services/getUser";
import { message } from "antd";
import { UIContext } from "@/contexts/UIContext";
import UserCard from "./UserCard";
import { ChevronLeft, X } from "lucide-react";

interface SearchModalProps {
  value: string;
}

const SearchModal: React.FC<SearchModalProps> = ({ value }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const lastScrollTopRef = useRef(0);

  const [activeSearchTab, setActiveSearchTab] = useState<"users" | "posts">(
    "users"
  );
  const ui = useContext(UIContext);

  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (ui?.searchValue.includes("#")) {
      setActiveSearchTab("posts");
    }
    setInputValue(ui?.searchValue ? ui.searchValue : "");
  }, []);

  useEffect(() => {
    async function FetchSearch() {
      const id = Cookies.get("id");
      setUsers([]);
      setPosts([]);
      if (value.length <= 1) {
        return;
      }
      if (!id) {
        window.location.reload();
        return;
      }
      setLoading(true);

      const resUsers = await SearchActions.searchUsers(
        value.toLowerCase(),
        id,
        0
      );
      const resPosts = await SearchActions.searchPosts(
        value.toLowerCase(),
        id,
        0
      );

      if (resUsers && resPosts) {
        setUsers(resUsers);
        setPosts(resPosts);
      }
      setLoading(false);
    }
    FetchSearch();
  }, [value]);

  const onContentScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop } = e.currentTarget;
      const last = lastScrollTopRef.current;
      const delta = scrollTop - last;

      if (Math.abs(delta) > 100) {
        lastScrollTopRef.current = scrollTop;

        handleScroll();
      }
    },
    [loading, activeSearchTab, inputValue, users]
  );
  const handleScroll = useCallback(async () => {
    if (loading) {
      return;
    }

    const id = Cookies.get("id");

    if (!id) {
      window.location.reload();
      return;
    }

    setLoading(true);

    if (activeSearchTab === "users") {
      console.log(users.length);

      const resUsers = await SearchActions.searchUsers(
        inputValue.toLowerCase(),
        id,
        users.length // Direct reference to current users length
      );

      const uniqueUsers = [...users, ...resUsers].filter(
        (user, index, self) => index === self.findIndex((u) => u.id === user.id)
      );

      setUsers(uniqueUsers);
    } else {
      const res = await SearchActions.searchPosts(
        inputValue.toLowerCase(),
        id,
        posts.length // Use posts.length instead of users.length
      );

      const uniquePosts = [...posts, ...res].filter(
        (post, index, self) =>
          index === self.findIndex((p) => p.idPost === post.idPost)
      );

      setPosts(uniquePosts); // Fixed: pass the filtered posts
    }

    setLoading(false);
    console.log(1);
  }, [loading, activeSearchTab, inputValue, users]); // Removed setUsers from deps

  useEffect(() => {
    console.log("Users updated:", users);
    console.log("Users length:", users.length);
  }, [users]);

  function onChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    setInputValue(newValue);
    ui?.setSearch(newValue);
  }

  const clearInput = () => {
    setInputValue("");
  };

  return (
    <div className={styles["search-modal"]}>
      <div className="flex flex-col w-full max-w-[700px] h-full">
        <div className="relative w-full flex justify-center pt-5">
          {" "}
          <button
            onClick={() => ui?.toggleSearchOpen()}
            className="absolute left-2 top-[25px]"
          >
            <ChevronLeft />
          </button>
          <input
            value={inputValue}
            className=" text-lg w-[70%] bg-white/15 px-3 py-1 rounded-2xl "
            type="text"
            placeholder="Search..."
            onChange={(e) => {
              onChangeHandler(e);
            }}
          />
          {inputValue.length != 0 && (
            <button>
              <X onClick={clearInput} className="absolute right-4 top-[25px]" />
            </button>
          )}
        </div>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeSearchTab === "users" ? styles.active : ""
            }`}
            onClick={() => setActiveSearchTab("users")}
          >
            Users
          </button>
          <button
            className={`${styles.tab} ${
              activeSearchTab === "posts" ? styles.active : ""
            }`}
            onClick={() => setActiveSearchTab("posts")}
          >
            Posts
          </button>
        </div>

        <div className={styles["tab-content-wrapper"]}>
          {posts && users ? (
            <>
              <div
                onScroll={onContentScroll}
                className={`${styles["tab-content"]} ${
                  activeSearchTab === "users" ? styles.active : ""
                }`}
                style={{
                  transform: `translateX(${
                    activeSearchTab === "users" ? 0 : -100
                  }%)`,
                }}
              >
                {!users.length && !loading && (
                  <div className={styles.TextCenter}>
                    <p>
                      {value.length <= 1
                        ? "Type at least 2 characters"
                        : `Nothing found among users by "${value}"`}
                    </p>
                  </div>
                )}
                <div>
                  {users.length > 0 &&
                    users.map((item) => <UserCard item={item} key={item.id} />)}
                </div>
                <div className="h-40"></div>
              </div>

              <div
                onScroll={onContentScroll}
                className={`${styles["tab-content"]} ${
                  activeSearchTab === "posts" ? styles.active : ""
                }`}
                style={{
                  transform: `translateX(${
                    activeSearchTab === "posts" ? 0 : 100
                  }%)`,
                }}
              >
                {!posts.length && !loading && (
                  <div className={styles.TextCenter}>
                    <p>
                      {value.length <= 1
                        ? "Type at least 2 characters"
                        : `Nothing found among posts by "${value}"`}
                    </p>
                  </div>
                )}
                {posts.length > 0 &&
                  posts.map((item) => (
                    <MiniPostCard key={item.idPost} item={item} />
                  ))}
                <div className="h-30"></div>
              </div>
            </>
          ) : (
            <div className={styles["no-results"]}>
              <p>No results found</p>
            </div>
          )}
          {loading && users.length == 0 && posts.length == 0 && (
            <div className={cn("space-y-4", styles.TextCenter)}>
              <div className={styles.spinner}></div>
              <p>Loading...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
