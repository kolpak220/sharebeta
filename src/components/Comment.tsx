import React, { useState, useMemo } from "react";
import { Heart } from "lucide-react";
import "./Comment.css";
import formatTimeAgo from "@/services/formatTimeAgo";

interface CommentData {
  id: number;
  text: string;
  authorUserName: string;
  createAt: string;
  likes: number[];
}

interface CommentProps {
  comment: CommentData;
  index: number;
}

// Format large numbers
const formatNumber = (num: number) => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
};

const Comment: React.FC<CommentProps> = ({ comment, index }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likes?.length || 0);

  // Memoize formatted time to prevent recalculations
  const formattedTime = useMemo(
    () => formatTimeAgo(comment.createAt),
    [comment.createAt]
  );

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount((prev) => (newLikedState ? prev + 1 : prev - 1));
  };

  const handleTagClick = (tag: string) => {
    if (tag.startsWith("#")) {
      console.log("Hashtag clicked:", tag);
      // Navigate to hashtag page
    } else if (tag.startsWith("@")) {
      console.log("Mention clicked:", tag);
      // Navigate to user profile
    }
  };

  return (
    <div className="comment" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="comment-header">
        <strong className="author">@{comment.authorUserName}</strong>
        <span className="date">{formattedTime}</span>
      </div>
      <p className="main-text">
        {comment.text &&
          comment.text.split(/([#@][\w]+)/g).map((part, index) => {
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
      </p>
      <div className="comment-actions">
        <button
          className={`comment-like-btn ${isLiked ? "liked" : ""}`}
          onClick={handleLike}
          aria-label={isLiked ? "Unlike comment" : "Like comment"}
        >
          <Heart
            size={16}
            fill={isLiked ? "currentColor" : "none"}
            aria-hidden="true"
          />
          <span className="like-count">{formatNumber(likesCount)}</span>
        </button>
      </div>
    </div>
  );
};

export default Comment;
