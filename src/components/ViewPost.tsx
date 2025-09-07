import React, {
  useEffect,
  useState,
  useCallback,
  useContext,
  useRef,
} from "react";
import Comment from "./Comment";
import { GetComms } from "../services/getcomms";
import { Send, X } from "lucide-react";
import { CommentData as CommentType } from "../types";

import LoadedPostCard from "./LoadedPostCard";
import { PostUIProvider } from "@/contexts/PostUIContext";
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
      style={{
        transition: "all 0.3s ease",
      }}
      className={`fixed top-0 left-0 w-full h-[100vh] flex items-center flex-col z-10 bg-black ${
        ui?.isFullScreen && "overflowFullscreen"
      }`}
    >
      <div className="flex flex-col w-full h-full max-w-[700px] justify-center items-center relative">
        {/* Modal Header */}
        <div
          className="top-0 w-full flex items-center justify-between p-4 bg-black bg-opacity-95 z-10 h-[70px]"
          style={{
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <button
            onClick={() => {
              if (doesAnyHistoryEntryExist) {
                navigate(-1);
              } else {
                navigate("/");
              }
            }}
            className="bg-transparent border-none text-gray-400 cursor-pointer p-2 rounded-md transition-all duration-200 flex items-center justify-center"
            aria-label="Close comments"
          >
            <X size={24} />
          </button>

          <h2 className="text-lg font-semibold text-white m-0 flex-1 text-center">View post</h2>
          <div className="w-10"></div>
        </div>
        
        <div className="!overflow-y-auto flex flex-col h-full w-full items-center px-2">
          <PostUIProvider>
            <LoadedPostCard postId={postId} disableComments />
          </PostUIProvider>

          {/* Comment Input */}
          <form onSubmit={handleSubmitComment} className="w-[calc(100%-40px)] mx-5 my-5 mb-5">
            <div
              className="overflow-hidden flex items-center gap-3 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-3xl px-4 py-2 transition-all duration-200 h-[52px] focus-within:border-gray-600 focus-within:bg-white focus-within:bg-opacity-8"
            >
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-transparent border-none text-white text-sm outline-none py-2 placeholder-gray-400"
                maxLength={500}
                aria-label="Comment input"
              />
              <button
                type="submit"
                className="bg-gray-600 border-none rounded-full w-9 h-9 flex items-center justify-center text-white cursor-pointer transition-all duration-200 flex-shrink-0 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!newComment.trim()}
                aria-label="Send comment"
              >
                <Send size={18} />
              </button>
            </div>
          </form>

          {/* Comments Section */}
          <div className="w-[98%] mx-5 mb-5">
            {loading && <p className="text-center text-gray-400 mt-10">Loading comments...</p>}
            {!loading && comments.length === 0 && (
              <p className="text-center text-gray-400 mt-10">No comments yet ¯\_(ツ)_/¯</p>
            )}
            <div className="mt-5">
              {comments.map((comment, index) => (
                <Comment key={comment.id} comment={comment} index={index} />
              ))}
            </div>
            <div className="h-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPost;
