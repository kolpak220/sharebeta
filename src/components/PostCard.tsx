import React, { useEffect, useState } from "react";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  MoreVertical,
  Layers,
} from "lucide-react";
import { Post } from "../types";
import styles from "./PostCard.module.css";
import Base64Image from "./BaseImage";

interface PostCardProps {
  post: Post;
  isShort?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, isShort = false }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likes, setLikes] = useState(post.likesCount);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
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
                <p className={styles.authorUsername}>@{post.authorUserName}</p>
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
        <div>{post.text}</div>
        {post.medias.length > 0 && (
          <div className="relative">
            <img
              src={`data:${post.medias[0].type};base64,${post.medias[0].content}`}
              alt="Post content"
              className={styles.postImage}
            />
            <div className={styles.postMedia}>
              <Layers />
              1/{post.medias.length}{" "}
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

        <button className={styles.actionBtn}>
          <MessageCircle className={styles.actionIcon} size={20} />
          <span className={styles.actionCount}>{formatNumber(0)}</span>
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
  );
};

export default PostCard;
