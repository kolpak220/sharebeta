import React, { useState, useMemo, useEffect, useContext } from "react";
import { Heart, UserRound, Trash } from "lucide-react";
import "./Comment.css";
import formatTimeAgo from "@/services/formatTimeAgo";
import Cookies from "js-cookie";
import CommsActions from "@/services/commsActions";
import { CommentData } from "@/types";
import { useAppDispatch } from "@/redux/store";
import { postSummaryFetch } from "@/redux/slices/postsSlice/asyncActions";
import { UIContext } from "@/contexts/UIContext";
import getUser from "@/services/getUser";
import { message } from "antd";
import { deletePreload } from "@/redux/slices/preloadslice/slice";
import { formatNumber, getAvatarUrl } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { text } from "stream/consumers";

interface CommentProps {
  comment: CommentData;
  index: number;
}

const Comment: React.FC<CommentProps> = ({ comment, index }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const userId = Cookies.get("id");
  const dispatch = useAppDispatch();
  const ui = useContext(UIContext);
  const [error, setError] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likes?.length || 0);

  const navigate = useNavigate();

  useEffect(() => {
    const liked = comment.likes && comment.likes.includes(Number(userId));
    if (liked) {
      setIsLiked(true);
    }
  }, []);

  // Memoize formatted time to prevent recalculations
  const formattedTime = useMemo(
    () => formatTimeAgo(comment.createAt),
    [comment.createAt]
  );

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount((prev) => (newLikedState ? prev + 1 : prev - 1));
    CommsActions.ToggleLike(comment.id);
  };

  const deleteComment = () => {
    CommsActions.CommentDelete(comment.id, () =>
      dispatch(
        postSummaryFetch({
          postId: comment.idPost,
          dispatch: () => {
            dispatch(deletePreload(comment.idPost));
          },
        })
      )
    );
  };

  const loadOverlayByTag = async (user: string) => {
    const res = await getUser.getIdbyUser(user);
    if (!res) {
      message.error(`No user found: ${user}`);
      return;
    }
    navigate("/user/" + res.id);
  };

  const handleTagClick = (tag: string) => {
    if (tag.startsWith("#")) {
      ui?.toggleSearchOpen();
      ui?.setSearch(tag);
      // Navigate to hashtag page
    } else if (tag.startsWith("@")) {
      const formatted = tag.slice(1, tag.length);
      loadOverlayByTag(formatted);
    }
  };

  const handleLinkClick = (link: string) => {
    copyToClipboard(link);
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      await message.info("Link copied!")
    } catch (err) {
      console.error(err);

      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  return (
    <div className="comment" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="comment-header">
        <div
          onClick={() => navigate("/user/" + comment.idCreator)}
          className="flex justify-between items-center"
        >
          {comment.hasAuthorPhoto && !error ? (
            <img
              onError={() => {
                setError(true);
              }}
              src={getAvatarUrl(comment.idCreator)}
              className="authorAvatar"
            />
          ) : (
            <UserRound className="authorAvatar" />
          )}
          <div className="commentsAuthorDetails">
            {comment.authorName ? (
              <>
                <h3 className="">{comment.authorName}</h3>
                <p className="author">@{comment.authorUserName}</p>
              </>
            ) : (
              <>
                <h3 className="author">@{comment.authorUserName}</h3>
              </>
            )}
          </div>
          {/* <strong className="author">@{comment.authorUserName}</strong> */}
        </div>

        <span className="date">{formattedTime}</span>
      </div>
      <p className="main-text">
        {comment.text &&
          comment.text
            .split(/([#@][а-яёa-z0-9_]+|https?:\/\/[^\s]+|www\.[^\s]+\.[^\s]+)/gi)
            .map((part, index) => {
              if (!part) return null;

              if (part.startsWith('#') && /^#[а-яёa-z0-9_]+$/i.test(part)) {
                return (
                  <span
                    key={index}
                    className="text-blue-600 font-bold cursor-pointer hover:underline"
                    onClick={() => handleTagClick(part)}
                  >
                    {part}
                  </span>
                );
              } else if (part.startsWith('@') && /^@[a-z0-9_]+$/i.test(part)) {
                return (
                  <span
                    key={index}
                    className="text-blue-600 font-bold cursor-pointer hover:underline"
                    onClick={() => handleTagClick(part)}
                  >
                    {part}
                  </span>
                );
              } else if (/^(https?:\/\/|www\.)[^\s]+$/.test(part)) {
                return (
                  <a
                    key={index}
                    href={part}
                    className="text-links text-blue-500 underline cursor-pointer hover:text-blue-600"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();

                      handleLinkClick(part);
                    }}
                  >
                    {part}
                  </a>
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
        {comment.idCreator.toString() == userId && (
          <button className="comment-like-btn" onClick={deleteComment}>
            <Trash size={16} fill="none" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Comment;
