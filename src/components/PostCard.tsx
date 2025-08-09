import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  MoreVertical,
} from "lucide-react";
import { Post } from "../types";
import "./PostCard.css";

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
    <div className={`post-card ${isShort ? "post-card-short" : ""} glass`}>
      <div className="post-header">
        <div className="author-info">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="author-avatar"
          />
          <div className="author-details">
            <h3 className="author-name">{post.author.name}</h3>
            <p className="author-username">
              @{post.author.username} • {post.timestamp}
            </p>
          </div>
        </div>
        <button className="more-btn">
          <MoreVertical size={18} />
        </button>
      </div>

      <div className="post-content">
        <p className={isShort ? "content-short" : ""}>{post.content}</p>
        {post.image && (
          <img src={post.image} alt="Post content" className="post-image" />
        )}
      </div>

      <div className="post-actions">
        <button
          className={`action-btn like-btn ${isLiked ? "liked" : ""}`}
          onClick={handleLike}
        >
          <Heart
            className="action-icon"
            size={20}
            fill={isLiked ? "currentColor" : "none"}
          />
          <span className="action-count">{formatNumber(likes)}</span>
        </button>

        <button className="action-btn">
          <MessageCircle className="action-icon" size={20} />
          <span className="action-count">{formatNumber(post.comments)}</span>
        </button>

        <button className="action-btn">
          <Repeat2 className="action-icon" size={20} />
          <span className="action-count">{formatNumber(post.shares)}</span>
        </button>

        <button className="action-btn">
          <Share className="action-icon" size={20} />
        </button>
      </div>
    </div>
  );
};

export default PostCard;
