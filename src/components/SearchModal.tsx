import React, { useEffect, useState } from "react";
import styles from "./SearchModal.module.css";
import SearchActions, { User } from "@/services/searchActions";
import Cookies, { set } from "js-cookie";
import { Post } from "@/types";
import Paragraph from "antd/es/typography/Paragraph";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface SearchModalProps {
  value: string;
}

const SearchModal: React.FC<SearchModalProps> = ({ value }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSearchTab, setActiveSearchTab] = useState<string>("users");

  useEffect(() => {
    async function FetchSearch() {
      const id = Cookies.get("id");
      setUsers([]);
      setPosts([]);
      if (value.length == 0) {
        return;
      }
      if (!id) {
        window.location.reload();
        return;
      }
      setLoading(true);

      const res = await SearchActions.globalSearch(value.toLowerCase(), id);
      if (res) {
        setUsers(res.users);
        setPosts(res.posts);
        setLoading(false);
      }
    }
    FetchSearch();
  }, [value]);

  return (
    <div className={styles["search-modal"]}>
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
                  <p>Nothing found among users by "{value}"</p>
                </div>
              )}
              {users.length > 0 &&
                users.map((item) => (
                  <div className={styles["search-item"]} key={item.id}>
                    <span className={styles["search-result"]}>{item.name}</span>
                    <span className={styles["search-meta"]}>
                      @{item.userName}
                    </span>
                  </div>
                ))}
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
                  <p>Nothing found among posts by "{value}"</p>
                </div>
              )}
              {posts.length > 0 &&
                posts.map((item) => (
                  <Link to={"/post/" + item.idPost}>
                    <div className={styles["search-item"]} key={item.idPost}>
                      <span className={styles["search-result"]}>
                        {item.authorUserName}
                      </span>
                      <span className={styles["search-meta"]}></span>
                      <Paragraph className={styles["search-meta"]} ellipsis>
                        {item.text}
                      </Paragraph>
                    </div>
                  </Link>
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
  );
};

export default SearchModal;
