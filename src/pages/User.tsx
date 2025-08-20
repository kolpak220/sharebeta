import React, { useCallback, useContext, useEffect, useState } from "react";
import { ProfileData, UserPublic as UserType } from "@/types";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import getUser, { postsData, subsData } from "@/services/getUser";
import styles from "./User.module.css";
import { Skeleton } from "@/components/ui/skeleton";
import { BellPlus, CircleEllipsis, Share2, UserRound } from "lucide-react";
import { SkeletonOverlay } from "@/components/ui/skeletonOverlay";
import { UIContext } from "@/contexts/UIContext";
import userActions from "@/services/userActions";

const User: React.FC = () => {
  const [dataUser, setDataUser] = useState<ProfileData>();
  const [avatar, setAvatar] = useState();
  const [posts, setPosts] = useState<postsData>();
  const [subs, setSubs] = useState<subsData>();
  const { id } = useParams();
  const ui = useContext(UIContext);
  const [follow, setFollow] = useState<boolean>(false);
  const userId = Number(id);

  const currentId = Number(Cookies.get("id"));

  useEffect(() => {
    ui?.setScrollState("up", 50);

    (async () => {
      const data = await getUser.getUserById(userId);
      const avatar = await getUser.getAvatar(userId);
      const postsdata = await getUser.getPosts(userId);
      const subsdata = await getUser.getSubs(userId);

      setPosts(postsdata);
      setSubs(subsdata);
      setDataUser(data);
      setAvatar(avatar);

      if (userId != currentId) {
        const isFollow = await getUser.getFollow(userId);
        if (isFollow) {
          setFollow(isFollow.isFollowing);
        }
      }
    })();
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

    const subsdata = await getUser.getSubs(userId);
    setSubs(subsdata);
    const isFollow = await getUser.getFollow(userId);
    if (isFollow) {
      setFollow(isFollow.isFollowing);
    }
  };

  if (!dataUser || !posts || !subs) {
    return;
  }

  return (
    <>
      <div className={styles.userContainer}>
        <div className={styles.userInfo}>
          {dataUser ? (
            avatar ? (
              <img
                src={`/api/avatar/${dataUser?.id}?size=96&q=30`}
                className={styles.authorAvatar}
              />
            ) : dataUser?.hasPhoto ? (
              <Skeleton />
            ) : (
              <>
                <UserRound className={styles.authorAvatar} />
              </>
            )
          ) : (
            <>
              <SkeletonOverlay />
            </>
          )}

          <div className={styles.authorDetails}>
            {dataUser &&
              (dataUser.name ? (
                <>
                  <a href={`/user/${dataUser.id}`}>
                    <h3 className={styles.authorName}>{dataUser.name}</h3>
                  </a>
                  <p className={styles.authorUsername}>@{dataUser.userName}</p>
                </>
              ) : (
                <>
                  <h3 className={styles.authorName}>@{dataUser?.userName}</h3>
                </>
              ))}
          </div>

          <div className={styles.actionsUser}>
            {userId != currentId && (
              <button
                onClick={toggleFollow}
                className={`${
                  follow ? styles.follow : styles.unfollow
                } transition-colors duration-300`}
              >
                <h2>{follow ? "Following" : "Subscribe"}</h2>
              </button>
            )}
          </div>
        </div>

        <div className={styles.aboutUser}>
          {dataUser?.about ? (
            <>
              <p>{dataUser.about}</p>
            </>
          ) : (
            <>
              <p>The user has not provided any information about themselves.</p>
            </>
          )}
        </div>

        <div className={styles.line}></div>

        <div className={styles.followers}>
          <span>
            <strong>{subs.followingCount}</strong> Following
          </span>
          <span>
            <strong>{subs.followersCount}</strong> Followers
          </span>
          <span>
            <strong>{posts.count}</strong> Posts
          </span>
        </div>

        <div className={styles.postsUser}></div>
      </div>
    </>
  );
};

export default User;
