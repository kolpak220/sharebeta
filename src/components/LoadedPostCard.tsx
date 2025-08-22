import { UIContext } from "@/contexts/UIContext";
import { formatNumber, getAuth } from "@/lib/utils";
import FetchPosts from "@/services/fetchposts";
import formatTimeAgo from "@/services/formatTimeAgo";
import PostActions from "@/services/postActions";
import {
  MoreVertical,
  Heart,
  MessageCircle,
  Share,
  UserRound,
  CopyCheck,
  Trash,
  Check,
} from "lucide-react";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import CommentsModal from "./CommentsModal";
import MediaViewer from "./MediaViewer";
import PostMedia from "./PostMedia";
import { Media, MediaItem } from "../types";
import styles from "./PostCard.module.css";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/redux/store";
import { FindPost } from "@/redux/slices/postsSlice/selectors";
import { postSummaryFetch } from "@/redux/slices/postsSlice/asyncActions";
import getUser from "@/services/getUser";
import Paragraph from "antd/es/typography/Paragraph";
import { Button, message, Modal } from "antd";
import { deletePreload } from "@/redux/slices/preloadslice/slice";
import { deletePost } from "@/redux/slices/postsSlice/slice";

const LoadedPostCard = ({
  postId,
  disableComments,
}: {
  postId: number;
  disableComments: boolean;
}) => {
  const post = useSelector((state: RootState) => FindPost(state, postId));
  if (!post) {
    return;
  }
  const [copied, setCopied] = useState(false);
  const [popoverShow, togglePopover] = useState(false);
  const dispatch = useAppDispatch();
  const [viewerOpen, setOpen] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mediaFetch, setMedia] = useState<Media>();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [commentsModalOpen, setCommentsModalOpen] = useState<boolean>(false);
  const ui = useContext(UIContext);
  const [likeLoading, setLikeLoading] = useState(false);
  const [avatarFetch, setAvatar] = useState();
  const authdata = getAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleOk = () => {
    const authdata = getAuth();
    if (!authdata.id || !authdata.token) {
      return;
    }

    PostActions.deletePost({
      Token: authdata.token,
      UserId: authdata.id,
      PostId: post.idPost,
      dispatch: () => {
        dispatch(deletePreload(post.idPost));
        dispatch(deletePost(post.idPost));
      },
    });
  };

  const handleNavigate = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);
  const formattedTime = useMemo(
    () => formatTimeAgo(post.createAt),
    [post.createAt]
  );
  useEffect(() => {
    async function FetchMediaByPost() {
      if (!post) {
        return;
      }
      const response = await FetchPosts.fetchMedia(post.idPost, 0);
      if (response) {
        setMedia(response);
      }
    }

    // Fetch media function
    const loadMedia = async () => {
      // Create array of media indices to fetch
      const indices = Array.from({ length: post.mediaCount }, (_, i) => i);

      // Process media in parallel instead of sequential loop
      const mediaPromises = indices.map(async (index) => {
        try {
          const response = await FetchPosts.fetchMedia(post.idPost, index);
          if (mediaItems.some((item) => item.src == response.url)) {
            return null;
          }
          return response
            ? {
                type: response.type.includes("image") ? "image" : "video",
                src: response.url,
                id: index.toString(),
              }
            : {
                type: "image",
                src: "error",
                id: index.toString(),
              };
        } catch {
          return {
            type: "image",
            src: "error",
            id: index.toString(),
          };
        }
      });

      // Wait for all media to load
      const newMediaItems = (await Promise.all(mediaPromises)).filter(
        Boolean
      ) as MediaItem[];

      if (newMediaItems.length) {
        setMediaItems(newMediaItems);
      }
    };
    // Execute both operations concurrently
    async function fetchAvatar() {
      if (!post) {
        return;
      }
      const res = await getUser.getAvatar(post.idCreator);
      setAvatar(res);
    }
    if (post.mediaCount > 0) {
      Promise.all([loadMedia(), FetchMediaByPost()]);
    }
    fetchAvatar();
    return;
  }, []); // Added proper dependencies

  const loadOverlayByTag = async (user: string) => {
    const res = await getUser.getIdbyUser(user);
    if (!res) {
      message.error(`No user found: ${user}`);
      return;
    }
    ui?.setUserOverlay({
      show: true,
      userId: res.id,
    });
  };

  const handleTagClick = (tag: string) => {
    if (tag.startsWith("#")) {
      ui?.toggleSearchOpen();
      ui?.setSearch(tag);
      // Navigate to hashtag page
    } else if (tag.startsWith("@")) {
      const formatted = tag.slice(1, tag.length);
      loadOverlayByTag(formatted);
    }
  };
  const handleLike = () => {
    if (likeLoading) {
      return;
    }
    setLikeLoading(true);
    if (!authdata.id || !authdata.token) {
      return;
    }

    PostActions.likeToggle({
      PostId: post.idPost,
      Token: authdata.token,
      UserId: authdata.id,
      dispatch: () => {
        dispatch(
          postSummaryFetch({
            postId,
            dispatch: () => {
              dispatch(deletePreload(postId));
            },
          })
        );
        setLikeLoading(false);
      },
    });
  };

  const getPostUrl = () => {
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    return `${baseUrl}/post/${post.idPost}`;
  };

  const handleClickUserInfo = () => {
    ui?.setUserOverlay({
      show: true,
      userId: post.idCreator,
    });
  };

  return (
    <>
      <div className={`${styles.postCard} glass`}>
        <div className={styles.postHeader}>
          <div onClick={handleClickUserInfo} className={styles.authorInfo}>
            {avatarFetch ? (
              <img
                src={`/api/avatar/${post.idCreator}?size=96&q=30`}
                className={styles.authorAvatar}
              />
            ) : (
              <UserRound className={styles.authorAvatar} />
            )}
            <div className={styles.authorDetails}>
              {post.authorName ? (
                <>
                  <h3 className={styles.authorName}>{post.authorName}</h3>
                  <p className={styles.authorUsername}>
                    @{post.authorUserName}
                  </p>
                </>
              ) : (
                <>
                  <h3 className={styles.authorName}>@{post.authorUserName}</h3>
                </>
              )}
            </div>
          </div>
          <span className="flex justify-center items-center">
            <span className="date right-0">{formattedTime}</span>
            {post.idCreator.toString() == authdata.id && (
              <button
                onClick={(e) => {
                  if (e.target instanceof Element) {
                    // Check if the clicked element or any of its parents have 'popover' ID
                    if (
                      e.target.id === "popover" ||
                      e.target.closest("#popover")
                    ) {
                      return;
                    }
                  }
                  togglePopover((prev) => !prev);
                }}
                className={`${styles.moreBtn} ${
                  popoverShow && styles.moreBtnActive
                }`}
              >
                <MoreVertical size={18} />
                {popoverShow && (
                  <div
                    id="popover"
                    className={`${styles.popover} ${styles.show}`}
                  >
                    <div
                      onClick={() => {
                        setConfirmDelete(true);
                        if (confirmDelete) {
                          handleOk();
                        }
                      }}
                      className={styles.popoverContent}
                    >
                      {confirmDelete ? (
                        <>
                          {" "}
                          <span>Confirm?</span>
                        </>
                      ) : (
                        <>
                          {" "}
                          <Trash className={styles.popoverIcon} />
                          <span>Delete post</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </button>
            )}
          </span>
        </div>

        <div className={styles.postContent}>
          <Paragraph
            style={{ color: "#fff" }}
            ellipsis={{ rows: 3, expandable: true, symbol: "more" }}
          >
            {post.text &&
              post.text.split(/([#@][\w]+)/g).map((part, index) => {
                if (/^[#@]\w+$/.test(part)) {
                  return (
                    <span
                      key={index}
                      className="text-blue-600 font-bold"
                      onClick={() => handleTagClick(part)}
                    >
                      {part}
                    </span>
                  );
                }
                return <React.Fragment key={index}>{part}</React.Fragment>;
              })}
          </Paragraph>
          <PostMedia
            mediaFetch={mediaFetch}
            count={post.mediaCount}
            handleClick={() => {
              setOpen(true);
              ui?.toggleFullScreen();
              ui?.setScrollState("down", 50);
            }}
          />
        </div>

        <div className={styles.postActions}>
          <span className="flex justify-between items-center w-full">
            <span className="flex justify-center items-center">
              <button
                className={`${styles.actionBtn} ${
                  post.isLiked ? styles.liked : ""
                }`}
                onClick={() => {
                  // debouncedClick(() => {
                  handleLike();
                  // });
                }}
              >
                <Heart
                  className={styles.actionIcon}
                  size={20}
                  fill={
                    likeLoading
                      ? "#fff"
                      : post.isLiked
                      ? "currentColor"
                      : "none"
                  }
                />
                <span className={styles.actionCount}>
                  {formatNumber(post.likesCount)}
                </span>
              </button>

              <button
                className={styles.actionBtn}
                onClick={() => {
                  if (disableComments) {
                    return;
                  }

                  setCommentsModalOpen(true);
                  ui?.setScrollState("down", 50);
                }}
              >
                <MessageCircle className={styles.actionIcon} size={20} />
                <span className={styles.actionCount}>
                  {formatNumber(post.commentsCount)}
                </span>
              </button>
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(getPostUrl());

                setCopied(true);
              }}
              className={styles.actionBtn}
            >
              {copied ? (
                <CopyCheck className={styles.actionIcon} size={20} />
              ) : (
                <Share className={styles.actionIcon} size={20} />
              )}
            </button>
          </span>
        </div>
      </div>
      {commentsModalOpen && (
        <CommentsModal
          postId={postId}
          setViewComments={(e) => {
            setCommentsModalOpen(e);
          }}
        />
      )}
      <MediaViewer
        items={mediaItems}
        currentIndex={currentIndex}
        isOpen={viewerOpen}
        onClose={() => {
          setOpen(false);
          ui?.toggleFullScreen();
        }}
        onNavigate={handleNavigate}
      />
    </>
  );
};

export default LoadedPostCard;
