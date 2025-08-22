import React, {
  useEffect,
  useState,
  useCallback,
  useContext,
  useRef,
} from "react";
import Comment from "./Comment";
import "./CommentsModal.css";
import { GetComms } from "../services/getcomms";
import { Send, X } from "lucide-react";
import { CommentData as CommentType } from "../types";

import LoadedPostCard from "./LoadedPostCard";
import { FindPost } from "@/redux/slices/postsSlice/selectors";
import { RootState, useAppDispatch } from "@/redux/store";
import { useSelector } from "react-redux";
import CommsActions from "@/services/commsActions";
import { postSummaryFetch } from "@/redux/slices/postsSlice/asyncActions";
import { UIContext } from "@/contexts/UIContext";
import { deletePreload } from "@/redux/slices/preloadslice/slice";

interface CommentsModalProps {
  postId: number;
  setViewComments: React.Dispatch<React.SetStateAction<boolean>>;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
  postId,
  setViewComments,
}) => {
  const post = useSelector((state: RootState) => FindPost(state, postId));
  if (!post) {
    return;
  }

  const dispatch = useAppDispatch();

  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [newComment, setNewComment] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const ui = useContext(UIContext);

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
  }, [post]);

  useEffect(() => {
    if (ui?.isFullScreen) {
      if (modalRef.current) {
        modalRef.current.scrollTo({
          top: 0,
          behavior: "auto",
        });
      }
    } else {
    }
  }, [ui?.isFullScreen]);
  useEffect(() => {
    if (ui?.searchOpen) {
      handleClose();
    }
    // if (ui?.userOverlay.show) {
    //   handleClose();
    // }
  }, [ui?.searchOpen, ui?.userOverlay]);

  // Close modal with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => setViewComments(false), 300);
  }, [setViewComments]);

  // Submit new comment
  const handleSubmitComment = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (newComment.trim()) {
        CommsActions.CommentCreate(newComment, postId, () =>
          dispatch(
            postSummaryFetch({
              postId,
              dispatch: () => {
                dispatch(deletePreload(postId));
              },
            })
          )
        );
        setNewComment("");
      }
    },
    [newComment]
  );

  return (
    <div
      ref={modalRef}
      className={`glass-dark comments-modal ${isClosing && "closing"} ${
        ui?.isFullScreen && "overflowFullscreen"
      }`}
    >
      <div className="flex flex-col w-full max-w-[700px]">
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
        {/* <div className="adapt">
        <div className="flex max-w-[700px] flex-col"> */}
        <LoadedPostCard postId={postId} disableComments />

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
          <div className="h-20"></div>
        </div>
        {/* </div>
      </div> */}
      </div>
    </div>
  );
};

export default CommentsModal;
