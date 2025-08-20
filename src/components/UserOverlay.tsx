import React, { useContext, useEffect, useRef, useState } from "react";
import { UIContext } from "@/contexts/UIContext";
import { ProfileData, UserOverlay as T } from "@/types";
import getUser, { postsData, subsData } from "@/services/getUser";
import styles from "./UserOverlay.module.css";
import { Skeleton } from "./ui/skeleton";
import { UserRound } from "lucide-react";
import { SkeletonOverlay, SkeletonOverlayAbout } from "./ui/skeletonOverlay";
import Cookies from "js-cookie";
import { cn } from "@/lib/utils";
import userActions from "@/services/userActions";
import { Link } from "react-router-dom";

const UserOverlay: React.FC<T> = ({ userId }) => {
  const ui = useContext(UIContext);

  const [dataUser, setDataUser] = useState<ProfileData>();
  const [avatar, setAvatar] = useState(null);
  const [closeOverlay, setCloseOverlay] = useState<boolean>(false);
  const [posts, setPosts] = useState<postsData>();
  const [subs, setSubs] = useState<subsData>();
  const [follow, setFollow] = useState<boolean>(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const id = Number(Cookies.get("id"));
  useEffect(() => {
    setCloseOverlay(false);

    ui?.setScrollState("down", 50);

    (async () => {
      if (userId) {
        const data = await getUser.getUserById(userId);
        const avatar = await getUser.getAvatar(userId);
        const postsdata = await getUser.getPosts(userId);
        const subsdata = await getUser.getSubs(userId);

        setPosts(postsdata);
        setSubs(subsdata);
        setDataUser(data);
        setAvatar(avatar);

        if (userId != id) {
          const isFollow = await getUser.getFollow(userId);
          if (isFollow) {
            setFollow(isFollow.isFollowing);
          }
        }
      }
    })();
  }, []);

  const handleClickOverlay: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (overlayRef.current && e.target !== overlayRef.current) {
      return;
    }
    setCloseOverlay(true);
    setTimeout(() => {
      ui?.setUserOverlay({
        show: false,
        userId: null,
      });
    }, 300);
  };

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

  return (
    <>
      <div
        ref={overlayRef}
        className={`${styles.overlay} ${
          closeOverlay && styles.closeOverlayContainer
        }`}
        onClick={handleClickOverlay}
      >
        <div
          className={`${styles.overlayContainer} ${
            closeOverlay && styles.closeOverlay
          } glass-dark`}
        >
          <div className="relative space-between flex items-center justify-center">
            <Link
              onClick={() => {
                setCloseOverlay(true);
                setTimeout(() => {
                  ui?.setUserOverlay({
                    show: false,
                    userId: null,
                  });
                }, 300);
              }}
              className="w-full"
              to={"/user/" + userId}
            >
              <div className={cn("w-full", styles.userInfo)}>
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
                  {dataUser ? (
                    dataUser.name ? (
                      <>
                        <h3 className={styles.authorName}>{dataUser.name}</h3>
                        <p className={styles.authorUsername}>
                          @{dataUser.userName}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className={styles.authorName}>
                          @{dataUser?.userName}
                        </h3>
                      </>
                    )
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </Link>
            <div className={cn("w-[150px]", styles.actionsUser)}>
              {userId != id && dataUser && (
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
          {/* <div className={styles.line}></div> */}
          {subs && posts && (
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
          )}{" "}
          {!subs && !posts && (
            <div className={styles.followers}>
              <Skeleton className="w-[80px] h-4" />
              <Skeleton className="w-[80px] h-4" />
              <Skeleton className="w-[80px] h-4" />
            </div>
          )}
          <div className={styles.line}></div>
          <div className={styles.aboutContainer}>
            <h1>About</h1>
            {dataUser ? (
              dataUser.about ? (
                <>
                  <p>{dataUser.about}</p>
                </>
              ) : (
                <>
                  <p>
                    The user has not provided any information about themselves.
                  </p>
                </>
              )
            ) : (
              <SkeletonOverlayAbout />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserOverlay;
