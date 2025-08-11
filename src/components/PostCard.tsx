import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  MoreVertical,
} from "lucide-react";
import { Post } from "../types";
import styles from "./PostCard.module.css";

interface PostCardProps {
  post: Post;
  isShort?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, isShort = false }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likes, setLikes] = useState(post.likes);

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
    <div className={`${styles.postCard} ${isShort ? styles.postCardShort : ""} glass`}>
      <div className={styles.postHeader}>
        <div className={styles.authorInfo}>
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className={styles.authorAvatar}
          />
          <div className={styles.authorDetails}>
            <h3 className={styles.authorName}>{post.author.name}</h3>
            <p className={styles.authorUsername}>
              @{post.author.username} • {post.timestamp}
            </p>
          </div>
        </div>
        <button className={styles.moreBtn}>
          <MoreVertical size={18} />
        </button>
      </div>

      <div className={styles.postContent}>
        <p className={isShort ? styles.contentShort : ""}>{post.content}</p>
        {post.image && (
          <img src={post.image} alt="Post content" className={styles.postImage} />
        )}
      </div>

      <div className={styles.postActions}>
        <button
          className={`${styles.actionBtn} ${isLiked ? styles.liked : ""}`}
          onClick={handleLike}
        >
          <Heart className={styles.actionIcon} size={20} fill={isLiked ? "currentColor" : "none"} />
          <span className={styles.actionCount}>{formatNumber(likes)}</span>
        </button>

        <button className={styles.actionBtn}>
          <MessageCircle className={styles.actionIcon} size={20} />
          <span className={styles.actionCount}>{formatNumber(post.comments)}</span>
        </button>

        <button className={styles.actionBtn}>
          <Repeat2 className={styles.actionIcon} size={20} />
          <span className={styles.actionCount}>{formatNumber(post.shares)}</span>
        </button>

        <button className={styles.actionBtn}>
          <Share className={styles.actionIcon} size={20} />
        </button>
      </div>
    </div>
  );
};

export default PostCard;
