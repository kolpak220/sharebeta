import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  MoreVertical,
  Layers,
  Play,
  Maximize2,
} from "lucide-react";
import { Media, MediaItem, Post, PostComments } from "../types";
import styles from "./PostCard.module.css";
import Base64Image from "./BaseImage";
import MediaViewer from "./MediaViewer";
import { UIContext } from "../contexts/UIContext";
import GetComms from "../services/getcomms";
import CommentsModal from "./CommentsModal";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import FetchPosts from "@/services/fetchposts";
import formatTimeAgo from "@/services/formatTimeAgo";

interface PostCardProps {
  post: Post;
  isShort?: boolean;
  handleComments?: () => void;
}

const PostCard = React.memo(({ post, isShort }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likes, setLikes] = useState(post.likesCount);
  const [viewerOpen, setOpen] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mediaFetch, setMedia] = useState<Media>();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [commentsModalOpen, setCommentsModalOpen] = useState<boolean>(false);
  const ui = useContext(UIContext);
  const [comments, setComments] = useState<PostComments>();

  const handleNavigate = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);
  const formattedTime = useMemo(
    () => formatTimeAgo(post.createAt),
    [post.createAt]
  );
  useEffect(() => {
    // Flag to track component mount status
    let isMounted = true;
    async function FetchMediaByPost() {
      const response = await FetchPosts.fetchMedia(post.idPost, 0);
      if (response) {
        setMedia(response);
      }
    }

    // Fetch comments function
    const fetchComms = async () => {
      const response = await GetComms.fetchComms(post.idPost);
      if (isMounted && response) {
        setComments(response);
      }
    };

    // Fetch media function
    const loadMedia = async () => {
      // Create array of media indices to fetch
      const indices = Array.from({ length: post.mediaCount }, (_, i) => i);

      // Process media in parallel instead of sequential loop
      const mediaPromises = indices.map(async (index) => {
        // Skip if already exists
        if (mediaItems.some((item) => item.id === index.toString())) {
          return null;
        }

        try {
          const response = await FetchPosts.fetchMedia(post.idPost, index);
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

      if (isMounted && newMediaItems.length) {
        setMediaItems((prev) => [...prev, ...newMediaItems]);
      }
    };
    fetchComms();
    // Execute both operations concurrently
    if (post.mediaCount > 0) {
      Promise.all([loadMedia(), FetchMediaByPost()]);
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [post.idPost, post.mediaCount]); // Added proper dependencies
  const handleTagClick = (tag: string) => {
    if (tag.startsWith("#")) {
      console.log("Hashtag clicked:", tag);
      // Navigate to hashtag page
    } else if (tag.startsWith("@")) {
      console.log("Mention clicked:", tag);
      // Navigate to user profile
    }
  };
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  // const parts = useMemo(() => {

  //   const regex = /([#@][\p{L}\p{N}_]+)|([^#@\s]+|\s+)/gu;
  //   const matches = post.text.matchAll(regex);
  //   const result = [];

  //   for (const match of matches) {
  //     if (match[1]) { // Tag match
  //       result.push(
  //         <span
  //           key={result.length}
  //           className="link-highlight"
  //           onClick={() => onTagClick?.(match[1])}
  //         >
  //           {match[1]}
  //         </span>
  //       );
  //     } else { // Non-tag text
  //       result.push(<React.Fragment key={result.length}>{match[0]}</React.Fragment>);
  //     }
  //   }

  //   return result;
  // }, [post.text, onTagClick]);
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };
  // useEffect(() => {
  //   if (mediaFetch) {
  //     console.log(mediaFetch.type + " " + post.authorName);
  //   }
  // }, []);

  //ТУТ КОД ДЛЯ КОММЕНТОВ

  return (
    <>
      <div
        className={`${styles.postCard} ${
          isShort ? styles.postCardShort : ""
        } glass`}
      >
        <div className={styles.postHeader}>
          <div className={styles.authorInfo}>
            <Base64Image
              base64String={post.authorPhotoBase64}
              alt={post.authorName}
              debug={false}
              className={styles.authorAvatar}
            />
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
            <button className={styles.moreBtn}>
              <MoreVertical size={18} />
            </button>
          </span>
        </div>

        <div className={styles.postContent}>
          <div className={styles.postText}>
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
          </div>
          {mediaFetch && post.mediaCount > 0 && (
            <div
              onClick={() => {
                setOpen(true);
                ui?.setScrollState("down", 50);
              }}
              className="relative"
            >
              {mediaFetch && mediaFetch.type.includes("video") && (
                <>
                  <video className={styles.postImage} src={mediaFetch.url} />
                  <div className={styles.postPlay}>
                    <Play />
                  </div>
                </>
              )}
              {mediaFetch && mediaFetch.type.includes("image") && (
                <img
                  src={mediaFetch.url}
                  alt="Post content"
                  className={styles.postImage}
                />
              )}

              <div className={styles.postMedia}>
                <Layers />
                1/{post.mediaCount}{" "}
              </div>
              <div className={styles.postMaximize}>
                <Maximize2 />
              </div>
            </div>
          )}
          {!mediaFetch && post.mediaCount > 0 && (
            <div className="relative">
              <Skeleton
                className={cn(styles.postImage, "h-[300px] w-full rounded-xl")}
              />
              <div className={styles.postMedia}>
                <Layers />
                1/{post.mediaCount}{" "}
              </div>
              <div className={styles.postMaximize}>
                <Maximize2 />
              </div>
            </div>
          )}
        </div>

        <div className={styles.postActions}>
          <button
            className={`${styles.actionBtn} ${isLiked ? styles.liked : ""}`}
            onClick={handleLike}
          >
            <Heart
              className={styles.actionIcon}
              size={20}
              fill={isLiked ? "currentColor" : "none"}
            />
            <span className={styles.actionCount}>{formatNumber(likes)}</span>
          </button>

          <button
            className={styles.actionBtn}
            onClick={() => {
              setCommentsModalOpen(true);
            }}
          >
            <MessageCircle className={styles.actionIcon} size={20} />
            <span className={styles.actionCount}>
              {comments ? formatNumber(comments.totalCount) : 0}
            </span>
          </button>

          <button className={styles.actionBtn}>
            <Repeat2 className={styles.actionIcon} size={20} />
            <span className={styles.actionCount}>{formatNumber(0)}</span>
          </button>

          <button className={styles.actionBtn}>
            <Share className={styles.actionIcon} size={20} />
          </button>
        </div>
      </div>
      {commentsModalOpen && (
        <CommentsModal
          post={post}
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
        }}
        onNavigate={handleNavigate}
      />
    </>
  );
});

export default PostCard;
