import { User } from "@/services/searchActions";
import styles from "./SearchModal.module.css";
import Paragraph from "antd/es/typography/Paragraph";
import { Skeleton } from "./ui/skeleton";
import { SkeletonOverlay } from "./ui/skeletonOverlay";
import { UserRound } from "lucide-react";
import getUser, { subsData } from "@/services/getUser";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { cn, formatNumber, getAvatarUrl } from "@/lib/utils";
import userActions from "@/services/userActions";

const UserCard: React.FC<{ item: User }> = ({ item }) => {
  const [subs, setSubs] = useState<subsData>();
  const [follow, setFollow] = useState<boolean>(false);
  const id = Number(Cookies.get("id"));
  const userId = item.id;

  useEffect(() => {
    async function fetchuser() {
      const subsdata = await getUser.getSubs(userId);

      setSubs(subsdata);

      if (userId != id) {
        const isFollow = await getUser.getFollow(userId);
        if (isFollow) {
          setFollow(isFollow.isFollowing);
        }
      }
    }
    fetchuser();
  }, []);

  const toggleFollow = async () => {
    if (!userId) {
      return;
    }
    if (follow) {
      await userActions.unFollow(userId);
    } else {
      await userActions.Follow(userId);
    }

    const isFollow = await getUser.getFollow(userId);
    const subsdata = await getUser.getSubs(userId);
    setSubs(subsdata);

    if (isFollow) {
      setFollow(isFollow.isFollowing);
    }
  };

  if (!subs) {
    return;
  }

  return (
    <div
      //   onClick={() => loadOverlayByTag(item.userName)}
      className="flex flex-col"
      key={item.id}
    >
      <span className="flex w-full justify-between items-center">
        <span className="flex gap-3">
          {item.hasPhoto ? (
            <img src={getAvatarUrl(item.id)} className={styles.authorAvatar} />
          ) : (
            <UserRound className={styles.authorAvatar} />
          )}
          <span className="flex flex-col ">
            <span className="text-sm">@{item.userName}</span>
            <span className={styles["search-meta"]}>{item.name}</span>
            <Paragraph className={styles["search-meta"]}>
              {formatNumber(subs.followersCount)} followers
            </Paragraph>
          </span>
        </span>
        {userId != id && (
          <div className="h-full items-center justify-center pb-2">
            <button
              onClick={toggleFollow}
              className={`${
                follow ? styles.follow : styles.unfollow
              } transition-colors duration-300`}
            >
              <h2>{follow ? "Following" : "Subscribe"}</h2>
            </button>
          </div>
        )}
      </span>
    </div>
  );
};

export default UserCard;
