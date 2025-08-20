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
import { toast } from "sonner";

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
  const userId = Cookies.get("id");
  const dispatch = useAppDispatch();
  const ui = useContext(UIContext);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likes?.length || 0);

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
      dispatch(postSummaryFetch({ postId: comment.idPost }))
    );
  };

  const loadOverlayByTag = async (user: string) => {
    const res = await getUser.getIdbyUser(user);
    if (!res) {
      toast.error(`No user found: ${user}`);
      return;
    }
    ui?.setUserOverlay({
      show: true,
      userId: res.id,
    });
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

  return (
    <div className="comment" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="comment-header">
        <div
          onClick={() => {
            ui?.setUserOverlay({
              show: true,
              userId: comment.idCreator,
            });
          }}
          className="flex justify-between items-center"
        >
          {comment.hasAuthorPhoto ? (
            <img
              src={`/api/avatar/${comment.idCreator}?size=96&q=30`}
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
