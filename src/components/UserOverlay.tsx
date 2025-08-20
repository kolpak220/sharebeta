import React, { useContext, useEffect, useState } from "react";
import { UIContext } from "@/contexts/UIContext";
import { UserOverlay as T } from "@/types";
import getUser from "@/services/getUser";
import styles from "./UserOverlay.module.css";
import { Skeleton } from "./ui/skeleton";
import { BellPlus, CircleEllipsis, Share2, UserRound } from "lucide-react";
import { SkeletonOverlay, SkeletonOverlayAbout } from "./ui/skeletonOverlay";

type data = dataInterface | null;

interface dataInterface {
  about: string;
  hasPhoto: boolean;
  id: number;
  name: string;
  userName: string;
}

const UserOverlay: React.FC<T> = ({ userId }) => {
  const ui = useContext(UIContext);
  const [dataUser, setDataUser] = useState<data>(null);
  const [avatar, setAvatar] = useState(null);
  const [closeOverlay, setCloseOverlay] = useState<boolean>(false);

  useEffect(() => {
    setCloseOverlay(false);

    (async () => {
      if (userId) {
        const data = await getUser.getUserById(userId);
        const avatar = await getUser.getAvatar(userId);

        setDataUser(data);
        setAvatar(avatar);
      }
    })();
  }, []);

  const handleClickOverlay = () => {
    setCloseOverlay(true);
    setTimeout(() => {
      ui?.setUserOverlay({
        show: false,
        userId: null,
      });
    }, 300);
  };

  return (
    <>
      <div
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
              {dataUser ? (
                dataUser.name ? (
                  <>
                    <a href={`/user/${dataUser.id}`}>
                      <h3 className={styles.authorName}>{dataUser.name}</h3>
                    </a>
                    <p className={styles.authorUsername}>
                      @{dataUser.userName}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className={styles.authorName}>@{dataUser?.userName}</h3>
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

          {/* <div className={styles.line}></div> */}
          <div className={styles.followers}>
            <span>
              <strong>200</strong> Following
            </span>
            <span>
              <strong>20</strong> Followers
            </span>
            <span>
              <strong>42</strong> Posts
            </span>
          </div>
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
