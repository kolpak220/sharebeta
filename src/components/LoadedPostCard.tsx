import { UIContext } from "@/contexts/UIContext";
import { formatNumber, getAuth, getAvatarUrl } from "@/lib/utils";
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
import Cookies from "js-cookie";
import { adminActions } from "@/services/adminActions";
import { useNavigate } from "react-router-dom";
import TextContent from "./TextContent";

const LoadedPostCard = ({
  postId,
  disableComments,
}: {
  postId: number;
  disableComments: boolean;
}) => {
  console.log("LoadedPostCard rendered", postId);
  const post = useSelector((state: RootState) => FindPost(state, postId));
  if (!post) {
    return;
  }
  const [copied, setCopied] = useState(false);
  const dispatch = useAppDispatch();
  const [viewerOpen, setOpen] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mediaFetch, setMedia] = useState<Media>();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [commentsModalOpen, setCommentsModalOpen] = useState<boolean>(false);
  const ui = useContext(UIContext);
  const [likeLoading, setLikeLoading] = useState(false);
  const authdata = getAuth();
  const isAdmin = Cookies.get("isAdmin")?.toString();
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleOk = useCallback(() => {
    const authdata = getAuth();
    if (!authdata.id || !authdata.token) {
      return;
    }
    const payload = {
      Token: authdata.token,
      UserId: authdata.id,
      PostId: post.idPost,
      dispatch: () => {
        dispatch(deletePreload(post.idPost));
        dispatch(deletePost(post.idPost));
      },
    };

    if (isAdmin?.includes("true")) {
      adminActions.deletePostAdmin(payload);
    } else {
      PostActions.deletePost(payload);
    }
  }, [dispatch, isAdmin, post?.idPost]);

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

    if (post.mediaCount > 0) {
      Promise.all([loadMedia(), FetchMediaByPost()]);
    }
  }, []); // Added proper dependencies

  const handleLike = useCallback(() => {
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
  }, [likeLoading, authdata.id, authdata.token, post.idPost, dispatch, postSummaryFetch, deletePreload, postId]);

  const postUrl = useMemo(() => {
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    return `${baseUrl}/post/${post.idPost}`;
  }, [post.idPost]);

  const handleClickUserInfo = useCallback(() => {
    navigate(`/user/${post.idCreator}`);
  }, [navigate, post.idCreator]);

  return (
    <>
      <div className={`${styles.postCard} glass`}>
        <div className={styles.postHeader}>
          <div onClick={handleClickUserInfo} className={styles.authorInfo}>
            {!error ? (
              <img
                onError={() => {
                  setError(true);
                }}
                src={getAvatarUrl(post.idCreator)}
                className={styles.authorAvatar}
              />
            ) : (
              <UserRound className={styles.authorAvatar} />
            )}
            <div className={styles.authorDetails}>
              {post.authorName ? (
                <>
                  <Paragraph
                    ellipsis
                    style={{
                      ...styles,
                      margin: 0,
                      fontWeight: 600,
                      fontSize: "1rem",
                      maxWidth:"130px",
                    }}
                    className={styles.authorName}
                  >
                    {post.authorName}
                  </Paragraph>
                  <Paragraph
                    ellipsis
                    style={{
                      ...styles,
                      margin: 0,
                      color: "#888",
                      fontSize: "0.95em",
                      maxWidth:"130px",
                    }}
                    className={styles.authorUsername}
                  >
                    @{post.authorUserName}
                  </Paragraph>
                </>
              ) : (
                <>
                  <Paragraph
                    ellipsis
                    style={{
                      ...styles,
                      margin: 0,
                      fontWeight: 600,
                      fontSize: "1rem",
                    }}
                    className={styles.authorName}
                  >
                    @{post.authorUserName}
                  </Paragraph>
                </>
              )}
            </div>
          </div>
          <span
            className="flex justify-center items-center"
            style={{ overflow: "visible" }}
          >
            <span className="date right-0">{formattedTime}</span>
            {(post.idCreator.toString() == authdata.id ||
              isAdmin?.includes("true")) && (
              <button
                id="more"
                onClick={(e) => {

                }}
                className={styles.moreBtn}
              >
                <Trash size={18} />

              </button>
            )}
          </span>
        </div>

        <div className={styles.postContent}>
          <TextContent text={post.text} />
          <PostMedia
            mediaFetch={mediaFetch}
            count={post.mediaCount}
            handleClick={() => {
              setOpen(true);
              ui?.toggleFullScreen();
              ui?.setChromeForceHidden(true);
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
                  ui?.setChromeForceHidden(true);
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
                // console.log(navigator.clipboard);
                if (window.AndroidBridge) {
                  window.AndroidBridge.copyToClipboard(getPostUrl());
                  setCopied(true);
                }
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
          ui?.toggleFullScreen();
          ui?.setChromeForceHidden(false);
          setOpen(false);
        }}
        onNavigate={handleNavigate}
      />
    </>
  );
};

export default React.memo(LoadedPostCard);
