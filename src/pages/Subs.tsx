import { UIContext } from "@/contexts/UIContext";
import { ChevronLeft } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
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
  const [following, setFollowing] = useState<User[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<"following" | "followers">(
    mode === "followers" ? "followers" : "following"
  );

  const navigate = useNavigate();
  const location = useLocation();
  const doesAnyHistoryEntryExist = location.key !== "default";

  useEffect(() => {
    ui?.setScrollState("up", 50);

    if (!userId || isNaN(userId)) return;

    setLoading(true);

    const fetchData = async () => {
      try {
        const userData = await getUser.getUserById(userId);
        const subsData = await getUser.getSubs(userId);

        let fetchedFollowing: User[] = [];
        let fetchedFollowers: User[] = [];

        if (activeMode === "following") {
          const followingData = await getUser.getFollowing(userId, 0);
          fetchedFollowing = followingData?.following || [];
        } else {
          const followersData = await getUser.getFollowers(userId, 0);
          fetchedFollowers = followersData?.followers || [];
        }

        setDataUser(userData);
        setSubs(subsData);
        setFollowing(fetchedFollowing);
        setFollowers(fetchedFollowers);
      } catch (error) {
        console.error("Failed to fetch user ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, activeMode]);

  if (!dataUser || !subs) {
    return null;
  }

  return (
    <div className="w-full h-[100vh] relative flex flex-col items-center p-10">
      <div className="mb-1 w-full flex justify-center items-center">
        <button
          className="left-10 absolute"
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

      <div className="mb-5 w-full flex justify-between items-center">
        <button
          onClick={() => setActiveMode("following")}
          className={cn(
            styles.tab,
            activeMode === "following" && styles.active
          )}
        >
          <span>{`Following ${formatNumber(subs.followingCount)}`}</span>
        </button>
        <button
          onClick={() => setActiveMode("followers")}
          className={cn(
            styles.tab,
            activeMode === "followers" && styles.active
          )}
        >
          <span>{`Followers ${formatNumber(subs.followersCount)}`}</span>
        </button>
      </div>

      <div className="w-full flex flex-col">
        {activeMode === "following" && !following.length && !loading && (
          <div className={styles.TextCenter}>
            <p>No following found</p>
          </div>
        )}

        {activeMode === "followers" && !followers.length && !loading && (
          <div className={styles.TextCenter}>
            <p>No followers found</p>
          </div>
        )}

        <div className={styles["tab-content-wrapper"]}>
          <div className={styles["tab-content"]}>
            {activeMode === "following" &&
              following.map((item) => <UserCard item={item} key={item.id} />)}

            {activeMode === "followers" &&
              followers.map((item) => <UserCard item={item} key={item.id} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
