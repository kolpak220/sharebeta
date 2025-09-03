import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "../pages/User.module.css";
import UserAvatar from "./UserAvatar";
import { ProfileData } from "@/types";
import getUser, { subsData } from "@/services/getUser";
import Cookies from "js-cookie";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { UIContext } from "@/contexts/UIContext";
import PostsUser from "./PostsUser";
import { message } from "antd";
import { adminActions } from "@/services/adminActions";
import userActions from "@/services/userActions";
import { DialogView } from "./DialogView";
import {
  ChevronLeft,
  Image,
  LockKeyhole,
  LogOut,
  MoreVertical,
  Pencil,
  UserRound,
} from "lucide-react";
import ChangePasswordForm, { ChangePwFormData } from "./ChangePassworfForm";
import EditProfileForm, { EditProfileData } from "./EditProfileForm";
import { fileToBase64, formatNumber, getAvatarUrl } from "@/lib/utils";

interface UserConatinerProps {
  userPage: boolean;
}

const UserContainer: React.FC<UserConatinerProps> = ({ userPage }) => {
  const [dataUser, setDataUser] = useState<ProfileData>();
  const [subs, setSubs] = useState<subsData>();
  const [postCount, setPostCount] = useState<number>();
  const [checkAdmin, setCheckAdmin] = useState<boolean>(false);
  const [follow, setFollow] = useState<boolean>(false);
  const [popoverShow, setPopoverShow] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    description: "action:",
    buttonFunc: () => {},
  });
  const [modalMode, setModalMode] = useState<"edit" | "logout" | "changepw">(
    "logout"
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { id } = useParams();
  const ui = useContext(UIContext);

  const navigate = useNavigate();
  const location = useLocation();

  const doesAnyHistoryEntryExist = location.key !== "default";

  const currentId = Number(Cookies.get("id"));
  const userId = Number(id) || currentId;
  const isAdmin = Cookies.get("isAdmin")?.toString();
  const [error, setError] = useState(false);

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

  const handleLogOut = () => {
    Cookies.set("id", "");
    Cookies.set("token", "");
    setTimeout(() => window.location.reload(), 100);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      const res = await userActions.UpdateUserAvatar(base64);
      if (res) window.location.reload();
    }
  };

  const handleEdit = async (e: EditProfileData) => {
    try {
      message.loading("Saving changes..");
      const res = await userActions.PutEditProfile(e);
      if (res) window.location.reload();
    } catch (err: any) {
      let errorMessage = "An error occurred";
      if (err.message) {
        const parts = err.message.split(" code:");
        errorMessage = parts[0].replace("Error: ", "").trim();
      }
      message.error(errorMessage);
    }
  };

  const handleChangePW = async (e: ChangePwFormData) => {
    message.loading("Saving changes..");
    try {
      const res = await userActions.PutChangePw(e);
      if (res) window.location.reload();
    } catch (err: any) {
      let errorMessage = "An error occurred";
      if (err.message) {
        const parts = err.message.split(" code:");
        errorMessage = parts[0].replace("Error: ", "").trim();
      }
      message.error(errorMessage);
    }
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

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      {userPage ? (
        dialog && (
          <DialogView
            title="Are you sure?"
            description={dialogContent.description}
            buttonText="confirm"
            buttonFunc={dialogContent.buttonFunc}
            setOpen={() => setDialog((prev) => !prev)}
          />
        )
      ) : (
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
              <div
                className={
                  "w-full flex items-center h-[70px] gap-5 " +
                  styles.alignCenter
                }
              >
                <button onClick={() => setIsModalOpen(false)} className="ml-3">
                  <ChevronLeft size={30} />
                </button>
                <span className="text-xl">
                  {modalMode === "logout" && "Log out"}
                  {modalMode === "changepw" && "Change password"}
                  {modalMode === "edit" && "Edit profile"}
                </span>
              </div>

              <div className={"w-full flex flex-col p-8 " + styles.alignCenter}>
                {modalMode === "logout" && (
                  <>
                    <div className="text-lg">Alternative options</div>
                    <div
                      onClick={() => setModalMode("changepw")}
                      className="flex w-full justify-between cursor-pointer"
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

                {modalMode === "changepw" && (
                  <ChangePasswordForm onSubmit={handleChangePW} />
                )}

                {modalMode === "edit" && (
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
        </>
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
          {!error ? (
            <img
              onError={() => {
                setError(true);
              }}
              src={getAvatarUrl(userId)}
              className={styles.authorAvatar}
            />
          ) : (
            <UserRound className={styles.authorAvatar} />
          )}

          <div className={styles.authorDetails}>
            {dataUser &&
              (dataUser.name ? (
                <>
                  {userPage ? (
                    <>
                      <a href={`/user/${dataUser.id}`}>
                        <h3 className={styles.authorName}>{dataUser.name}</h3>
                      </a>
                    </>
                  ) : (
                    <>
                      <h3 className={styles.authorName}>{dataUser.name}</h3>
                    </>
                  )}
                  <p className={styles.authorUsername}>@{dataUser.userName}</p>
                </>
              ) : (
                <>
                  <h3 className={styles.authorName}>@{dataUser?.userName}</h3>
                </>
              ))}
          </div>

          {userPage ? (
            <>
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
            </>
          ) : (
            <>
              <div
                id="more"
                onClick={() => navigate("/edit-profile")}
                className={styles.actionsUser}
              >
                <Pencil />

                <div
                  id="popover"
                  className={`${styles.popover} ${
                    popoverShow ? styles.show : styles.hide
                  }`}
                >
                  <div className={styles.popoverContent}>
                    <button
                      onClick={handleUpload}
                      className={styles.popoverOption}
                    >
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
            </>
          )}
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
          <Link to={`/subs/following/${userId}`}>
            <span>
              <strong>{formatNumber(subs.followingCount)}</strong> Following
            </span>
          </Link>
          <Link to={`/subs/followers/${userId}`}>
            <span className="px-3 border-x-2 border-x-[#333]">
              <strong>{formatNumber(subs.followersCount)}</strong> Followers
            </span>
          </Link>

          <span>
            <strong>
              {postCount ? (
                formatNumber(postCount)
              ) : postCount === 0 ? (
                formatNumber(postCount)
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

export default UserContainer;
