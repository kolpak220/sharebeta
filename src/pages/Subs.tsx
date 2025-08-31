import { UIContext } from "@/contexts/UIContext";
import { ChevronLeft } from "lucide-react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import styles from "./Subs.module.css";
import { cn, formatNumber } from "@/lib/utils";
import getUser, { subsData } from "@/services/getUser";
import { ProfileData } from "@/types";
import { User } from "@/services/searchActions";
import UserCard from "@/components/UserCard";

export default function Subs() {
  const { id, mode } = useParams<{ id: string; mode: string }>();
  const userId = Number(id);
  const ui = useContext(UIContext);
  const [dataUser, setDataUser] = useState<ProfileData>();
  const [subs, setSubs] = useState<subsData>();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreFollowing, setHasMoreFollowing] = useState(true);
  const [hasMoreFollowers, setHasMoreFollowers] = useState(true);
  const [following, setFollowing] = useState<User[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [followingShowing, setFollowingShowing] = useState(0);
  const [followersShowing, setFollowersShowing] = useState(0);
  const [activeMode, setActiveMode] = useState<"following" | "followers">(
    mode === "followers" ? "followers" : "following"
  );

  const navigate = useNavigate();
  const location = useLocation();
  const observer = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);
  const doesAnyHistoryEntryExist = location.key !== "default";

  const loadMoreFollowing = useCallback(async () => {
    if (loadingMore || !hasMoreFollowing) return;

    setLoadingMore(true);
    try {
      const followingData = await getUser.getFollowing(
        userId,
        followingShowing
      );

      if (followingData.following.length === 0) {
        setHasMoreFollowing(false);
      } else {
        // Create a map of existing users for O(1) lookup
        const existingUserMap = new Map(
          following.map((user) => [user.id, user])
        );

        // Filter new users that don't already exist
        const newUsers = followingData.following.filter(
          (user) => !existingUserMap.has(user.id)
        );

        if (newUsers.length > 0) {
          setFollowing((prev) => [...prev, ...newUsers]);
          setFollowingShowing((prev) => prev + newUsers.length);
        } else {
          setHasMoreFollowing(false);
        }
      }
    } catch (error) {
      console.error("Failed to load more following", error);
    } finally {
      setLoadingMore(false);
    }
  }, [userId, followingShowing, loadingMore, hasMoreFollowing, following]);

  const loadMoreFollowers = useCallback(async () => {
    if (loadingMore || !hasMoreFollowers) return;

    setLoadingMore(true);
    try {
      const followersData = await getUser.getFollowers(
        userId,
        followersShowing
      );

      if (followersData.followers.length === 0) {
        setHasMoreFollowers(false);
      } else {
        // Create a map of existing users for O(1) lookup
        const existingUserMap = new Map(
          followers.map((user) => [user.id, user])
        );

        // Filter new users that don't already exist
        const newUsers = followersData.followers.filter(
          (user) => !existingUserMap.has(user.id)
        );

        if (newUsers.length > 0) {
          setFollowers((prev) => [...prev, ...newUsers]);
          setFollowersShowing((prev) => prev + newUsers.length);
        } else {
          setHasMoreFollowers(false);
        }
      }
    } catch (error) {
      console.error("Failed to load more followers", error);
    } finally {
      setLoadingMore(false);
    }
  }, [userId, followersShowing, loadingMore, hasMoreFollowers, followers]);
  useEffect(() => {
    if (!loadingRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          if (activeMode === "following" && hasMoreFollowing) {
            loadMoreFollowing();
          } else if (activeMode === "followers" && hasMoreFollowers) {
            loadMoreFollowers();
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadingRef.current);

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [
    activeMode,
    loadingMore,
    hasMoreFollowing,
    hasMoreFollowers,
    loadMoreFollowing,
    loadMoreFollowers,
  ]);

  useEffect(() => {
    ui?.setScrollState("down", 50);

    if (!userId || isNaN(userId)) return;

    setLoading(true);

    const fetchData = async () => {
      try {
        const [userData, subsData] = await Promise.all([
          getUser.getUserById(userId),
          getUser.getSubs(userId),
        ]);

        if (activeMode === "following") {
          const followingData = await getUser.getFollowing(userId, 0);
          setFollowing(followingData.following);
          setFollowingShowing(followingData.following.length);
          setHasMoreFollowing(followingData.following.length > 0);
        } else {
          const followersData = await getUser.getFollowers(userId, 0);
          setFollowers(followersData.followers);
          setFollowersShowing(followersData.followers.length);
          setHasMoreFollowers(followersData.followers.length > 0);
        }

        setDataUser(userData);
        setSubs(subsData);
      } catch (error) {
        console.error("Failed to fetch user ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, activeMode, ui]);

  if (!dataUser || !subs) {
    return null;
  }

  const hasMore =
    activeMode === "following" ? hasMoreFollowing : hasMoreFollowers;
  const currentItems = activeMode === "following" ? following : followers;
  const shouldShowLoader =
    (activeMode === "followers" && subs.followersCount > 10) ||
    (activeMode === "following" && subs.followingCount > 10);

  return (
    <div className="w-full h-[100vh] relative flex flex-col items-center p-2">
      <div className="w-full flex flex-col items-center gap-y-2 mt-5">
        <div className="mb-1 w-full flex justify-center items-center">
          <button
            className="left-7 absolute"
            onClick={() => {
              if (doesAnyHistoryEntryExist) {
                navigate(-1);
              } else {
                navigate("/");
              }
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-lg font-bold">{dataUser.userName}</span>
        </div>
      </div>

      <div className="mb-5 w-full flex justify-between items-center">
        <button
          onClick={() => setActiveMode("following")}
          className={cn(
            styles.tab,
            activeMode === "following" && styles.active
          )}
          style={{ cursor: "pointer" }}
        >
          <span>{`Following ${formatNumber(subs.followingCount)}`}</span>
        </button>
        <button
          onClick={() => setActiveMode("followers")}
          className={cn(
            styles.tab,
            activeMode === "followers" && styles.active
          )}
          style={{ cursor: "pointer" }}
        >
          <span>{`Followers ${formatNumber(subs.followersCount)}`}</span>
        </button>
      </div>

      <div className="w-full flex flex-col">
        {currentItems.length === 0 && !loading && (
          <div className={styles.TextCenter}>
            <p>
              {activeMode === "following"
                ? "No following found"
                : "No followers found"}
            </p>
          </div>
        )}

        <div className={styles["tab-content"]}>
          {currentItems.map((item) => (
            <UserCard item={item} key={item.id} />
          ))}

          {shouldShowLoader && hasMore && (
            <div ref={loadingRef} className={styles.loadingSubs}>
              <span>{loadingMore ? "Loading..." : "Scroll to load more"}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
