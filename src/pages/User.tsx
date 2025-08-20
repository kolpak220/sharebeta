import React, { useCallback, useEffect, useState } from "react";
import { UserPublic as UserType } from "@/types";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import getUser from "@/services/getUser";
import styles from "./User.module.css";
import { Skeleton } from "@/components/ui/skeleton";
import { BellPlus, CircleEllipsis, Share2, UserRound } from "lucide-react";
import { SkeletonOverlay } from "@/components/ui/skeletonOverlay";

interface Data {
  user: UserType;
  posts: any;
}

const User: React.FC = () => {
  const [dataUser, setDataUser] = useState<Data | null>(null);
  const [avatar, setAvatar] = useState();
  const { id } = useParams();

  const currentUserId = useCallback(() => {
    const id = Cookies.get("id");
    return id;
  }, []);

  useEffect(() => {
    (async () => {
      const userId = id ? parseInt(id, 10) : NaN;
      const currentId = Number(currentUserId())

      const userData = await getUser.getUserById(userId);
      const postsData = await getUser.getUserPosts(userId, currentId);
      const avatar = await getUser.getAvatar(userId);
      
      console.log({
        user: userData,
        posts: postsData
      });
      
      setDataUser({
        user: userData,
        posts: postsData
      });
      setAvatar(avatar);
    })();
  }, []);

  const followData = (following=false) => {
    // меняем на реальные данные
    if (following) {
      const followingData = 22; // тут
      return (
        <span><strong>{followingData}</strong> Following</span>
      );
    }

    const followersData = 200; //тут
    return (
      <span><strong>{followersData}</strong> Followers</span>
    );
  }

  return (
    <>
      <div className={styles.userContainer}>
        <div className={styles.userInfo}>
          {dataUser ? (
            avatar ? (
              <img
                src={`/api/avatar/${dataUser?.user.id}?size=96&q=30`}
                className={styles.authorAvatar}
              />
            ) : dataUser?.user.hasPhoto ? (
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
            {dataUser?.user ? (
              dataUser.user.name ? (
                <>
                  <a href={`/user/${dataUser.user.id}`}>
                    <h3 className={styles.authorName}>{dataUser.user.name}</h3>
                  </a>
                  <p className={styles.authorUsername}>@{dataUser.user.userName}</p>
                </>
              ) : (
                <>
                  <h3 className={styles.authorName}>@{dataUser?.user.userName}</h3>
                </>
              )
            ) : (
              <></>
            )}
          </div>

          <div className={styles.actionsUser}>
            <button className={styles.follow}>
              <h2>Following</h2>
            </button>
          </div>
        </div>

        <div className={styles.aboutUser}>
          {dataUser?.user.about ? (
            <>
              <p>{dataUser.user.about}</p>
            </>
          ) : (
            <>
              <p>
                The user has not provided any information about themselves.
              </p>
            </>
          )}
        </div>

        <div className={styles.line}></div>
          
        <div className={styles.followers}>
          {followData(true)}
          {followData()}
        </div>

        <div className={styles.postsUser}>
          
        </div>
      </div>
    </>
  );
}

export default User;