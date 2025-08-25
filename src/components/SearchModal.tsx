import React, { useContext, useEffect, useState } from "react";
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

interface SearchModalProps {
  value: string;
}

const SearchModal: React.FC<SearchModalProps> = ({ value }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSearchTab, setActiveSearchTab] = useState<string>("users");
  const ui = useContext(UIContext);

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

  return (
    <div className={styles["search-modal"]}>
      <div className="flex flex-col w-full max-w-[700px] h-full">
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
