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
import { MediaItem, Post, PostComments } from "../types";
import styles from "./PostCard.module.css";
import Base64Image from "./BaseImage";
import MediaViewer from "./MediaViewer";
import { UIContext } from "../contexts/UIContext";
import GetComms from "../services/getcomms";
import CommentsModal from "./CommentsModal";

interface PostCardProps {
  post: Post;
  isShort?: boolean;
  handleComments?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, isShort = false, handleComments}) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likes, setLikes] = useState(post.likesCount);
  const [viewerOpen, setOpen] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [commentsModalOpen, setCommentsModalOpen] = useState<boolean>(false);
  const ui = useContext(UIContext);
  const [comments, setComments] = useState<PostComments>();

  const handleNavigate = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    async function fetchComms() {
      const response = await GetComms.fetchComms(post.idPost);
      console.log(response);
      if (response) {
        setComments(response);
      }
    }
    fetchComms();
  }, []);

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
  const medias: MediaItem[] = (post.medias || []).map((o, index) => {

    const item = {
      id: o.content + index,
      type: o.type.includes("image") ? "image" : "video",
      src: `data:${o.type};base64,${o.content}`,
    };
    return item;
  });
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
  //   if (post.medias[0]) {
  //     console.log(post.medias[0].type + " " + post.authorName);
  //   }
  // }, []);

  //ТУТ КОД ДЛЯ КОММЕНТОВ

  function handleHandleComment() {
    handleComments?.()
  }



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
          <button className={styles.moreBtn}>
            <MoreVertical size={18} />
          </button>
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
          {post.medias && post.medias.length > 0 && (
            <div
              onClick={() => {
                setOpen(true);
                ui?.setScrollState("down", 50);
              }}
              className="relative"
            >
              {post.medias[0] && post.medias[0].type.includes("video") && (
                <>
                  <video
                    className={styles.postImage}
                    src={`data:${post.medias[0].type};base64,${post.medias[0].content}`}
                  />
                  <div className={styles.postPlay}>
                    <Play />
                  </div>
                </>
              )}
              {post.medias[0] && post.medias[0].type.includes("image") && (
                <img
                  src={`data:${post.medias[0].type};base64,${post.medias[0].content}`}
                  alt="Post content"
                  className={styles.postImage}
                />
              )}

              <div className={styles.postMedia}>
                <Layers />
                1/{post.medias.length}{" "}
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

          <button className={styles.actionBtn} onClick={() => {handleHandleComment()}}>
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
      <MediaViewer
        items={medias}
        currentIndex={currentIndex}
        isOpen={viewerOpen}
        onClose={() => {
          setOpen(false);
        }}
        onNavigate={handleNavigate}
      />
    </>
  );
};

export default PostCard;
