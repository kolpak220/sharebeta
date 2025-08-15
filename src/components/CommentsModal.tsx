import React, { useEffect, useState, useCallback } from "react";
import Comment from "./Comment";
import "./CommentsModal.css";
import { GetComms } from "../services/getcomms";
import Base64Image from "./BaseImage";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  MoreVertical,
  Layers,
  Play,
  Maximize2,
  Send,
  X,
} from "lucide-react";
import { Post, Comment as CommentType } from "../types";

interface CommentsModalProps {
  post: Post;
  setViewComments: React.Dispatch<React.SetStateAction<boolean>>;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
  post,
  setViewComments,
}) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likes, setLikes] = useState(post.likesCount);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const data = await GetComms.fetchComms(post.idPost);
        setComments(data.comments as CommentType[]);
      } catch (err) {
        console.error("Error loading comments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [post.idPost]);

  // Close modal with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => setViewComments(false), 300);
  }, [setViewComments]);

  // Format large numbers
  const formatNumber = useCallback((num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  }, []);

  // Handle tag clicks
  const handleTagClick = useCallback((tag: string) => {
    if (tag.startsWith("#")) {
      console.log("Hashtag clicked:", tag);
      // Navigate to hashtag page
    } else if (tag.startsWith("@")) {
      console.log("Mention clicked:", tag);
      // Navigate to user profile
    }
  }, []);

  // Toggle like status
  const handleLike = useCallback(() => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikes((prev) => (newLiked ? prev + 1 : prev - 1));
  }, [isLiked]);

  // Submit new comment
  const handleSubmitComment = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (newComment.trim()) {
        console.log("Submitting comment:", newComment);
        // Add comment submission logic here
        setNewComment("");
      }
    },
    [newComment]
  );

  return (
    <div className={`comments-modal ${isClosing ? "closing" : ""}`}>
      {/* Modal Header */}
      <div className="modal-header">
        <button
          className="modal-close-btn"
          onClick={handleClose}
          aria-label="Close comments"
        >
          <X size={24} />
        </button>
        <h2 className="modal-title">Comments</h2>
        <div className="modal-header-spacer"></div>
      </div>

      {/* Post Display */}
      <div className="post-display">
        <div className="post-header">
          <div className="author-info">
            <Base64Image
              base64String={post.authorPhotoBase64}
              alt={post.authorName || post.authorUserName}
              debug={false}
              className="author-avatar"
            />
            <div className="author-details">
              {post.authorName ? (
                <>
                  <h3 className="author-name">{post.authorName}</h3>
                  <p className="author-username">@{post.authorUserName}</p>
                </>
              ) : (
                <h3 className="author-name">@{post.authorUserName}</h3>
              )}
            </div>
          </div>
          <button className="more-btn" aria-label="More options">
            <MoreVertical size={18} />
          </button>
        </div>

        <div className="post-content">
          <div className="post-text">
            {post.text &&
              post.text.split(/([#@][\w]+)/g).map((part, index) =>
                /^[#@]\w+$/.test(part) ? (
                  <span
                    key={index}
                    className="text-blue-600 font-bold cursor-pointer"
                    onClick={() => handleTagClick(part)}
                  >
                    {part}
                  </span>
                ) : (
                  <React.Fragment key={index}>{part}</React.Fragment>
                )
              )}
          </div>

          {/* {post.medias?.length > 0 && (
            <div className="post-media-container">
              {post.medias[0]?.type.includes("video") ? (
                <>
                  <video
                    className="post-image"
                    src={`data:${post.medias[0].type};base64,${post.medias[0].content}`}
                    controls
                  />
                  <div className="post-play">
                    <Play />
                  </div>
                </>
              ) : (
                <img
                  src={`data:${post.medias[0].type};base64,${post.medias[0].content}`}
                  alt="Post content"
                  className="post-image"
                />
              )}

              <div className="post-media-info">
                <Layers size={16} />
                <span>1/{post.medias.length}</span>
              </div>
              <button className="post-maximize" aria-label="Expand media">
                <Maximize2 size={16} />
              </button>
            </div>
          )} */}
        </div>

        <div className="post-actions">
          <button
            className={`action-btn ${isLiked ? "liked" : ""}`}
            onClick={handleLike}
            aria-label={isLiked ? "Unlike post" : "Like post"}
          >
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
            <span className="action-count">{formatNumber(likes)}</span>
          </button>

          <button className="action-btn active" aria-label="Comments">
            <MessageCircle size={20} />
            <span className="action-count">
              {formatNumber(comments.length)}
            </span>
          </button>

          <button className="action-btn" aria-label="Repost">
            <Repeat2 size={20} />
            <span className="action-count">{formatNumber(0)}</span>
          </button>

          <button className="action-btn" aria-label="Share">
            <Share size={20} />
          </button>
        </div>
      </div>

      {/* Comment Input */}
      <form onSubmit={handleSubmitComment} className="comment-form">
        <div className="comment-input-wrapper">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="comment-input"
            maxLength={500}
            aria-label="Comment input"
          />
          <button
            type="submit"
            className="comment-send-btn"
            disabled={!newComment.trim()}
            aria-label="Send comment"
          >
            <Send size={18} />
          </button>
        </div>
      </form>

      {/* Comments Section */}
      <div className="comments-section">
        {loading && <p className="load-title">Loading comments...</p>}
        {!loading && comments.length === 0 && (
          <p className="nothing-title">No comments yet ¯\_(ツ)_/¯</p>
        )}
        <div className="comments-list">
          {comments.map((comment, index) => (
            <Comment key={comment.id} comment={comment} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
