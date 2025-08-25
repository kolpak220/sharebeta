import React, { useContext, useEffect, useRef, useState } from "react";
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
  const [activeSearchTab, setActiveSearchTab] = useState<"users" | "posts">(
    "users"
  );
  const ui = useContext(UIContext);

  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (ui?.searchValue.includes("#")) {
      setActiveSearchTab("posts");
      setInputValue(ui.searchValue);
    }
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

  const loadOverlayByTag = async (user: string) => {
    const res = await getUser.getIdbyUser(user);
    if (!res) {
      message.error(`No user found: ${user}`);
      return;
    }
    ui?.setUserOverlay({
      show: true,
      userId: res.id,
    });
  };
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
          {loading && (
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
