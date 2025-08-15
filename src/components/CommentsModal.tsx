import React, { useEffect, useState } from "react";
import Comment from "./Comment";
import "./CommentsModal.css";
import { GetComms } from "../services/getcomms";
import Base64Image from "./BaseImage";
import { Heart, MessageCircle, Repeat2, Share, MoreVertical, Layers, Play, Maximize2, Send, X } from "lucide-react";
import { Post, Comment as CommentType } from "../types";

interface CommentsModalProps {
  post: Post;
  setViewComments: React.Dispatch<React.SetStateAction<boolean>>;
}

function CommentsModal({ post, setViewComments }: CommentsModalProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likes, setLikes] = useState(post.likesCount);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const data = await GetComms.fetchComms(post.idPost);
        setComments(data.comments as CommentType[]);
      } catch (err) {
        console.error("Ошибка при загрузке комментариев:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [post.idPost]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setViewComments(false);
    }, 300);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
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

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      console.log("Отправка комментария:", newComment);
      // ТУТ ОТПРАВКА КОММЕНТАРИЯ
      setNewComment("");
    }
  };

  return (
    <div className={`comments-modal ${isClosing ? 'closing' : ''}`}>
      {/* Modal Header */}
      <div className="modal-header">
        <button className="modal-close-btn" onClick={handleClose}>
          <X size={24} />
        </button>
        <h2 className="modal-title">Комментарии</h2>
        <div className="modal-header-spacer"></div>
      </div>

      {/* Post Display */}
      <div className="post-display">
        <div className="post-header">
          <div className="author-info">
            <Base64Image
              base64String={post.authorPhotoBase64}
              alt={post.authorName}
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
                <>
                  <h3 className="author-name">@{post.authorUserName}</h3>
                </>
              )}
            </div>
          </div>
          <button className="more-btn">
            <MoreVertical size={18} />
          </button>
        </div>

        <div className="post-content">
          <div className="post-text">
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
            <div className="post-media-container">
              {post.medias[0] && post.medias[0].type.includes("video") && (
                <>
                  <video
                    className="post-image"
                    src={`data:${post.medias[0].type};base64,${post.medias[0].content}`}
                  />
                  <div className="post-play">
                    <Play />
                  </div>
                </>
              )}
              {post.medias[0] && post.medias[0].type.includes("image") && (
                <img
                  src={`data:${post.medias[0].type};base64,${post.medias[0].content}`}
                  alt="Post content"
                  className="post-image"
                />
              )}

              <div className="post-media-info">
                <Layers />
                1/{post.medias.length}
              </div>
              <div className="post-maximize">
                <Maximize2 />
              </div>
            </div>
          )}
        </div>

        <div className="post-actions">
          <button
            className={`action-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <Heart
              className="action-icon"
              size={20}
              fill={isLiked ? "currentColor" : "none"}
            />
            <span className="action-count">{formatNumber(likes)}</span>
          </button>

          <button className="action-btn" onClick={handleClose}>
            <MessageCircle className="action-icon" size={20} />
            <span className="action-count">{formatNumber(comments.length)}</span>
          </button>

          <button className="action-btn">
            <Repeat2 className="action-icon" size={20} />
            <span className="action-count">{formatNumber(0)}</span>
          </button>

          <button className="action-btn">
            <Share className="action-icon" size={20} />
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
            placeholder="Написать комментарий..."
            className="comment-input"
            maxLength={500}
          />
          <button 
            type="submit" 
            className="comment-send-btn"
            disabled={!newComment.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </form>

      {/* Comments Section */}
      <div className="comments-section">
        {loading && <p className="load-title">Загрузка комментариев...</p>}
        {!loading && comments.length === 0 && <p className="nothing-title">Комментариев пока нет ¯\_(ツ)_/¯</p>}
        <div className="comments-list">
          {comments.map((c, index) => (
            <Comment key={c.id} comment={c} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CommentsModal;
