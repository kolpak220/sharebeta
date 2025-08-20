import { UIContext } from "@/contexts/UIContext";
import { getAuth } from "@/lib/utils";
import FetchPosts from "@/services/fetchposts";
import formatTimeAgo from "@/services/formatTimeAgo";
import PostActions from "@/services/postActions";
import {
  MoreVertical,
  Heart,
  MessageCircle,
  Share,
  UserRound,
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
import { Media, MediaItem, PostComments } from "../types";
import styles from "./PostCard.module.css";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/redux/store";
import { FindPost } from "@/redux/slices/postsSlice/selectors";
import { postSummaryFetch } from "@/redux/slices/postsSlice/asyncActions";
import getUser from "@/services/getUser";
import Paragraph from "antd/es/typography/Paragraph";
import { Popover } from "antd";

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
  const handleTagClick = (tag: string) => {
    if (tag.startsWith("#")) {
      console.log("Hashtag clicked:", tag);
      ui?.toggleSearchOpen();
      ui?.setSearch(tag);
      // Navigate to hashtag page
    } else if (tag.startsWith("@")) {
      console.log("Mention clicked:", tag);
      // Navigate to user profile
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
        dispatch(postSummaryFetch({ postId }));
        setLikeLoading(false);
      },
    });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <>
      <div className={`${styles.postCard} glass`}>
        <div className={styles.postHeader}>
          <div className={styles.authorInfo}>
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
              <button className={styles.moreBtn}>
                <MoreVertical size={18} />
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
            {/* <Popover title="Url copied!" trigger="click">
              <button className={styles.actionBtn}>
                <Share className={styles.actionIcon} size={20} />
              </button>
            </Popover> */}
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
