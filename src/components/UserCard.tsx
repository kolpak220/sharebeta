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
import { useNavigate } from "react-router-dom";

const UserCard: React.FC<{ item: User }> = ({ item }) => {
  const [subs, setSubs] = useState<subsData>();
  const [follow, setFollow] = useState<boolean>(false);
  const id = Number(Cookies.get("id"));
  const userId = item.id;
  const [error, setError] = useState(false);
  const navigate = useNavigate();

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
      className={"flex flex-col " + styles.containerCard}
      key={item.id}
    >
      <span className="flex w-full justify-between items-center">
        <span
          onClick={() => navigate("/user/" + item.id)}
          className="flex gap-3"
        >
          {item.hasPhoto && !error ? (
            <img
              onError={() => {
                setError(true);
              }}
              src={getAvatarUrl(item.id)}
              className={styles.authorAvatar}
            />
          ) : (
            <UserRound className={styles.authorAvatar} />
          )}
          <span className="flex flex-col">
            {/* <span className="text-sm">@{item.userName}</span> */}
            <Paragraph
              ellipsis
              className={styles.username}
              style={{ marginBottom: 0 }}
            >
              @{item.userName}
            </Paragraph>

            <Paragraph
              ellipsis
              style={{ marginBottom: 0 }}
              className={styles["search-meta"]}
            >
              {item.name}
            </Paragraph>
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
