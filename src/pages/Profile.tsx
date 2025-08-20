import React, { useCallback, useContext, useEffect, useState } from "react";
import { ProfileData, UserPublic as UserType } from "@/types";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import getUser, { postsData, subsData } from "@/services/getUser";
import styles from "./User.module.css";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreVertical,
  UserRound,
  Image,
  Pencil,
  LogOut,
  ChevronLeft,
  LockKeyhole,
} from "lucide-react";
import { SkeletonOverlay } from "@/components/ui/skeletonOverlay";
import { UIContext } from "@/contexts/UIContext";
import userActions from "@/services/userActions";
import { cn } from "@/lib/utils";
import { Modal } from "antd";

const User: React.FC = () => {
  const [dataUser, setDataUser] = useState<ProfileData>();
  const [avatar, setAvatar] = useState();
  const [posts, setPosts] = useState<postsData>();
  const [subs, setSubs] = useState<subsData>();
  const ui = useContext(UIContext);
  const [popoverShow, setPopoverShow] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"edit" | "logout">("logout");

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const currentId = Number(Cookies.get("id"));

  useEffect(() => {
    ui?.setScrollState("up", 50);

    (async () => {
      const data = await getUser.getUserById(currentId);
      const avatar = await getUser.getAvatar(currentId);
      const postsdata = await getUser.getPosts(currentId);
      const subsdata = await getUser.getSubs(currentId);

      setPosts(postsdata);
      setSubs(subsdata);
      setDataUser(data);
      setAvatar(avatar);
    })();
  }, []);

  if (!dataUser || !posts || !subs) {
    return;
  }

  return (
    <>
      {isModalOpen && (
        <div className="fixed w-full h-[100vh] bg-[#000] flex flex-col">
          <div className="w-full flex items-center h-[70px]">
            <button onClick={handleCancel} className="ml-3">
              <ChevronLeft size={30} />
            </button>
          </div>
        </div>
      )}
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
                  <h3 className={styles.authorName}>{dataUser.name}</h3>
                  <p className={styles.authorUsername}>@{dataUser.userName}</p>
                </>
              ) : (
                <>
                  <h3 className={styles.authorName}>@{dataUser?.userName}</h3>
                </>
              ))}
          </div>

          <div
            onClick={() => setPopoverShow((prev) => !prev)}
            className={styles.actionsUser}
          >
            <MoreVertical />

            <div
              className={`${styles.popover} ${
                popoverShow ? styles.show : styles.hide
              }`}
            >
              <div className={styles.popoverContent}>
                <button className={styles.popoverOption}>
                  <Image className={styles.popoverIcon} />
                  <span>Replace avatar</span>
                </button>
                <button className={styles.popoverOption}>
                  <Pencil className={styles.popoverIcon} />
                  <span>Edit profile</span>
                </button>
                <button className={styles.popoverOption}>
                  <LockKeyhole className={styles.popoverIcon} />
                  <span>Change password</span>
                </button>
                <button
                  onClick={showModal}
                  className={`${styles.popoverOption} ${styles.logoutOption}`}
                >
                  <LogOut className={styles.popoverIcon} />
                  <span>Log out</span>
                </button>
              </div>
            </div>
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
