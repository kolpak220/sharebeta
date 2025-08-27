import React, { useCallback, useContext, useEffect, useState } from "react";
import { ProfileData, UserPublic as UserType } from "@/types";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import getUser, { postsData, subsData } from "@/services/getUser";
import styles from "./User.module.css";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, UserRound } from "lucide-react";
import { SkeletonOverlay } from "@/components/ui/skeletonOverlay";
import { UIContext } from "@/contexts/UIContext";
import userActions from "@/services/userActions";
import MiniPostCard from "@/components/MiniPostCard";
import { DialogView } from "@/components/DialogView";
import { adminActions } from "@/services/adminActions";
import { message } from "antd";
import { getAvatarUrl } from "@/lib/utils";
import PostsUser from "@/components/PostsUser";
import UserAvatar from "@/components/UserAvatar";

const User: React.FC = () => {
  const [dataUser, setDataUser] = useState<ProfileData>();
  const [subs, setSubs] = useState<subsData>();
  const [postCount, setPostCount] = useState<number>();
  const [checkAdmin, setCheckAdmin] = useState<boolean>(false);
  const [follow, setFollow] = useState<boolean>(false);
  const isAdmin = Cookies.get("isAdmin")?.toString();
  const [dialog, setDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    description: "action:",
    buttonFunc: () => {},
  });
  const { id } = useParams();
  const ui = useContext(UIContext);
  const userId = Number(id);

  const navigate = useNavigate();
  const location = useLocation();

  const doesAnyHistoryEntryExist = location.key !== "default";

  const currentId = Number(Cookies.get("id"));

  useEffect(() => {
    ui?.setScrollState("up", 50);

    (async () => {
      const data = await getUser.getUserById(userId);
      const subsdata = await getUser.getSubs(userId);

      setSubs(subsdata);
      setDataUser(data);

      if (userId != currentId) {
        const isFollow = await getUser.getFollow(userId);
        if (isFollow) {
          setFollow(isFollow.isFollowing);
        }
      }

      if (isAdmin?.includes("true")) {
        const res = await getUser.getAdminsList();

        if (res?.admins?.find((admin) => admin.id === userId)) {
          setCheckAdmin(true);
        } else {
          setCheckAdmin(false);
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

  const toggleAdmin = async () => {
    if (!userId) {
      return;
    }
    if (checkAdmin) {
      await adminActions.revokeAdmin(userId);
    } else {
      await adminActions.grantAdmin(userId);
    }

    if (isAdmin?.includes("true")) {
      const res = await getUser.getAdminsList();

      if (res?.admins?.find((admin) => admin.id === userId)) {
        setCheckAdmin(true);
      } else {
        setCheckAdmin(false);
      }
    }
  };

  if (!dataUser || !subs) {
    return;
  }

  const removeUser = async () => {
    message.loading("Pending...");
    const res = await adminActions.removeUserAdmin(dataUser.id);
    message.info(res);
  };

  return (
    <>
      {dialog && (
        <DialogView
          title="Are you sure?"
          description={dialogContent.description}
          buttonText="confirm"
          buttonFunc={dialogContent.buttonFunc}
          setOpen={() => setDialog((prev) => !prev)}
        />
      )}
      <div className={styles.userContainer}>
        <div className="mb-5 w-full flex">
          <button
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
        </div>
        <div className={styles.userInfo}>
          <UserAvatar dataUser={dataUser} userId={userId} />

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
            {isAdmin?.includes("true") && (
              <>
                <button
                  onClick={() => {
                    setDialogContent({
                      description: `action: change user privelegies (${
                        checkAdmin ? "revoke" : "grant"
                      } admin)`,
                      buttonFunc: () => {
                        toggleAdmin();
                        setDialog(false);
                      },
                    });
                    setDialog(true);
                  }}
                  className={`${
                    checkAdmin ? styles.follow : styles.unfollow
                  } transition-colors duration-300`}
                >
                  <h2>{checkAdmin ? "revoke" : "grant"}</h2>
                </button>
                <button
                  onClick={() => {
                    setDialogContent({
                      description: "action: remove user",
                      buttonFunc: () => removeUser(),
                    });
                    setDialog(true);
                  }}
                  className={`${styles.follow} transition-colors duration-300`}
                >
                  <h2>remove user</h2>
                </button>
              </>
            )}
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
            <strong>
              {postCount ? (
                postCount
              ) : (
                <>
                  <div className="load"></div>
                </>
              )}
            </strong>{" "}
            Posts
          </span>
        </div>

        <div className="w-full flex flex-col mt-5 mb-20">
          <PostsUser userId={userId} setPostCount={setPostCount} />
        </div>
        <div className="h-20"></div>
      </div>
    </>
  );
};

export default User;
