import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
import { cn, fileToBase64, getAvatarUrl } from "@/lib/utils";
import { message, Modal, UploadProps } from "antd";
import ChangePasswordForm, {
  ChangePwFormData,
} from "@/components/ChangePassworfForm";
import EditProfileForm, { EditProfileData } from "@/components/EditProfileForm";
import MiniPostCard from "@/components/MiniPostCard";

const User: React.FC = () => {
  const [dataUser, setDataUser] = useState<ProfileData>();
  const [avatar, setAvatar] = useState();
  const [posts, setPosts] = useState<postsData>();
  const [subs, setSubs] = useState<subsData>();
  const ui = useContext(UIContext);
  const [popoverShow, setPopoverShow] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"edit" | "logout" | "changepw">(
    "logout"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (e.target instanceof Element) {
        // If click is on popover or its children, do nothing
        if (
          e.target.id === "popover" ||
          e.target.closest("#popover") ||
          e.target.id === "more" ||
          e.target.closest("#more")
        ) {
          return;
        }
        // If click is elsewhere, close the popover
        setPopoverShow(false);
      }
    };

    document.body.addEventListener("click", handleClickOutside);

    return () => {
      document.body.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const showModal = () => {
    setIsModalOpen(true);
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
      const postscount = await getUser.getPosts(currentId);
      const subsdata = await getUser.getSubs(currentId);
      const posts = await getUser.getPostsById(currentId);

      if (!posts || !postscount) {
        return;
      }
      const postsforming = {
        ...postscount,
        posts,
      };

      setPosts(postsforming);
      setSubs(subsdata);
      setDataUser(data);
      setAvatar(avatar);
    })();
  }, []);

  if (!dataUser || !posts || !subs) {
    return;
  }
  const handleLogOut = () => {
    setTimeout(() => {
      Cookies.set("id", "");
      Cookies.set("token", "");
      window.location.reload();
    }, 100);
  };
  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      const res = await userActions.UpdateUserAvatar(base64);
      if (res) {
        window.location.reload();
      }
    }
  };

  const handleEdit = async (e: EditProfileData) => {
    try {
      message.loading("Saving changes..");
      const res = await userActions.PutEditProfile(e);
      if (res) {
        window.location.reload();
      }
    } catch (err: any) {
      let errorMessage = "An error occurred";

      if (err.message) {
        const parts = err.message.split(" code:");
        errorMessage = parts[0].replace("Error: ", "").trim();
      }

      if (err.message) {
        const match = err.message.match(
          /Error: Server error: (.*?)(?: code:|$)/
        );
        if (match && match[1]) {
          errorMessage = match[1].trim();
        }
      }

      message.error(errorMessage);
    }
  };

  const handleChangePW = async (e: ChangePwFormData) => {
    message.loading("Saving changes..");

    try {
      const res = await userActions.PutChangePw(e);
      if (res) {
        window.location.reload();
      }
    } catch (err: any) {
      // Extract only the first part of the error message
      let errorMessage = "An error occurred";

      if (err.message) {
        // Split by "code:" and take the first part, then clean it up
        const parts = err.message.split(" code:");
        errorMessage = parts[0].replace("Error: ", "").trim();
      }

      // Or simpler approach - just get the first meaningful part
      if (err.message) {
        // Remove "Error: Server error: " prefix and take everything before " code:"
        const match = err.message.match(
          /Error: Server error: (.*?)(?: code:|$)/
        );
        if (match && match[1]) {
          errorMessage = match[1].trim();
        }
      }

      message.error(errorMessage);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      {isModalOpen && (
        <div className="absolute w-full max-w-[700px] h-[100vh] bg-[#000] flex flex-col z-50">
          <div className="w-full flex items-center h-[70px] gap-5">
            <button onClick={handleCancel} className="ml-3">
              <ChevronLeft size={30} />
            </button>
            <span className="text-xl">
              {modalMode == "logout" && "Log out"}
              {modalMode == "changepw" && "Change password"}
              {modalMode == "edit" && "Edit profile"}
            </span>
          </div>

          <div className="w-full flex flex-col p-8">
            {modalMode == "logout" && (
              <>
                <div className="text-lg">Alternative options</div>
                <div
                  onClick={() => setModalMode("changepw")}
                  className="flex w-full justify-between"
                >
                  <div className="flex justify-center align-center w-[10%] px-1 py-5">
                    <Pencil size={25} />
                  </div>

                  <div className="flex flex-col w-[90%] p-2">
                    <div className="text-lg">Change password</div>
                    <div className="text-sm text-accent">
                      Change your current password
                    </div>
                  </div>
                </div>
                <div className={styles.line}></div>

                <div
                  onClick={handleLogOut}
                  className="text-red-500 text-lg cursor-pointer"
                >
                  Log out
                </div>
              </>
            )}
            {modalMode == "changepw" && (
              <ChangePasswordForm onSubmit={handleChangePW} />
            )}
            {modalMode == "edit" && (
              <EditProfileForm
                onSubmit={handleEdit}
                initialData={{
                  userName: dataUser.userName,
                  name: dataUser.name,
                  about: dataUser.about,
                }}
              />
            )}
          </div>
        </div>
      )}
      <div className={styles.userContainer}>
        <div className={styles.userInfo}>
          {avatar && !error ? (
            <img
              onError={() => {
                setError(true);
              }}
              src={getAvatarUrl(currentId)}
              className={styles.authorAvatar}
            />
          ) : dataUser?.hasPhoto && !error ? (
            <Skeleton />
          ) : (
            <>
              <UserRound className={styles.authorAvatar} />
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
            id="more"
            onClick={() => setPopoverShow((prev) => !prev)}
            className={styles.actionsUser}
          >
            <MoreVertical />

            <div
              id="popover"
              className={`${styles.popover} ${
                popoverShow ? styles.show : styles.hide
              }`}
            >
              <div className={styles.popoverContent}>
                <button onClick={handleUpload} className={styles.popoverOption}>
                  <Image className={styles.popoverIcon} />
                  <span>Replace avatar</span>
                </button>
                <button
                  onClick={() => {
                    showModal();
                    setModalMode("edit");
                  }}
                  className={styles.popoverOption}
                >
                  <Pencil className={styles.popoverIcon} />
                  <span>Edit profile</span>
                </button>
                <button
                  onClick={() => {
                    showModal();
                    setModalMode("changepw");
                  }}
                  className={styles.popoverOption}
                >
                  <LockKeyhole className={styles.popoverIcon} />
                  <span>Change password</span>
                </button>
                <button
                  onClick={() => {
                    showModal();
                    setModalMode("logout");
                  }}
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

        <div className="w-full flex flex-col mt-5 mb-20">
          {posts.posts.map((item) => (
            <MiniPostCard item={item} />
          ))}
        </div>
        <div className="h-20"></div>
      </div>
    </>
  );
};

export default User;
