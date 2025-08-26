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
import { Link, useLocation, useNavigate } from "react-router-dom";
import { deletePreload } from "@/redux/slices/preloadslice/slice";

interface CommentsModalProps {
  postId: number;
}

const ViewPost: React.FC<CommentsModalProps> = ({ postId }) => {
  const post = useSelector((state: RootState) => FindPost(state, postId));
  if (!post) {
    return;
  }

  const dispatch = useAppDispatch();

  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const ui = useContext(UIContext);
  const navigate = useNavigate();
  const location = useLocation();

  const doesAnyHistoryEntryExist = location.key !== "default";

  // const history = JSON.parse(sessionStorage.getItem("navHistory"));

  console.log(history);

  useEffect(() => {}, []);
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
      className={`glass-dark comments-modal ${
        ui?.isFullScreen && "overflowFullscreen"
      }`}
    >
      <div className="flex flex-col w-full max-w-[700px] justify-center items-center">
        {/* Modal Header */}
        <div className="modal-header">
          <button
            onClick={() => {
              if (doesAnyHistoryEntryExist) {
                navigate(-1);
              } else {
                navigate("/");
              }
            }}
            className="modal-close-btn"
            aria-label="Close comments"
          >
            <X size={24} />
          </button>

          <h2 className="modal-title">View post</h2>
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

export default ViewPost;
