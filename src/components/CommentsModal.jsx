import React, { useEffect, useState } from "react";
import Comment from "./Comment";
import "./CommentsModal.css";
import { GetComms } from "../services/getcomms";

function CommentsModal({ postId, setViewComments }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const data = await GetComms.fetchComms(postId);
        setComments(data.comments);
      } catch (err) {
        console.error("Ошибка при загрузке комментариев:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setViewComments(false);
    }, 300);
  };

  return (
    <div className={`comments-modal ${isClosing ? 'closing' : ''}`}>
      <button onClick={handleClose} className="close">Закрыть</button>
      <h3 className="title">Комментарии:</h3>
      {loading && <p className="load-title">Загрузка комментариев...</p>}
      {!loading && comments.length === 0 && <p className="nothing-title">Комментариев пока нет ¯\_(ツ)_/¯</p>}
      <div className="comments-list">
        {comments.map((c, index) => (
          <Comment key={c.id} comment={c} index={index} />
        ))}
      </div>
    </div>
  );
}

export default CommentsModal;
