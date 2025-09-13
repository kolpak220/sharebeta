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
import { PostUIProvider } from "@/contexts/PostUIContext";
import { FindPost } from "@/redux/slices/postsSlice/selectors";
import { RootState, useAppDispatch } from "@/redux/store";
import { useSelector } from "react-redux";
import CommsActions from "@/services/commsActions";
import { postSummaryFetch } from "@/redux/slices/postsSlice/asyncActions";
import { UIContext } from "@/contexts/UIContext";
import { deletePreload } from "@/redux/slices/preloadslice/slice";

const CommentsModal: React.FC = () => {
  // Получаем контекст UI для управления состоянием приложения
  const ui = useContext(UIContext);
  
  // Получаем ID поста из контекста UI
  const postId = ui?.commentsModal.postId;
  
  // Получаем данные поста из Redux store
  const post = useSelector((state: RootState) => FindPost(state, postId!));

  // Хук для dispatch Redux actions
  const dispatch = useAppDispatch();

  // Состояния компонента
  const [comments, setComments] = useState<CommentType[]>([]); // Список комментариев
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [isClosing, setIsClosing] = useState(false); // Анимация закрытия
  const [newComment, setNewComment] = useState(""); // Текст нового комментария
  const modalRef = useRef<HTMLDivElement>(null); // Ref для модального окна

  // Обработчик кнопки "назад" в браузере
  useEffect(() => {
    if (!ui) {
      return;
    }
    
    const handleBackButton = (event: PopStateEvent) => {
      event.preventDefault();
      ui?.closeCommentsModal();
    };

    // Добавляем обработчик события popstate (кнопка назад)
    window.addEventListener("popstate", handleBackButton);

    return () => {
      // Убираем обработчик при размонтировании
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [ui]);

  // Загрузка комментариев при открытии модального окна
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        if (!post) {
          return;
        }
        // Запрашиваем комментарии для поста
        const data = await GetComms.fetchComms(post.idPost);
        setComments(data.comments as CommentType[]);
      } catch (err) {
        console.error("Error loading comments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
    
    // Восстанавливаем навигацию при закрытии
    return () => {
      ui?.setBottomNavHidden(false);
    };
  }, [post, ui]);

  // Обработка полноэкранного режима
  useEffect(() => {
    if (ui?.isFullScreen) {
      // При полноэкранном режиме скроллим к верху
      if (modalRef.current) {
        modalRef.current.scrollTo({
          top: 0,
          behavior: "auto",
        });
      }
    }
  }, [ui?.isFullScreen]);

  // Закрытие модального окна при открытии поиска
  useEffect(() => {
    if (ui?.searchOpen) {
      handleClose();
    }
  }, [ui?.searchOpen]);

  // Функция закрытия модального окна с анимацией
  const handleClose = useCallback(() => {
    if (!ui) {
      return;
    }
    setIsClosing(true);
    setTimeout(() => {
      if (!ui?.searchOpen && ui) {
        ui?.setScrollState("up", 50);
      }
      ui.closeCommentsModal();
    }, 300);
  }, [ui]);

  // Отправка нового комментария
  const handleSubmitComment = useCallback(
    (e: React.FormEvent) => {
      if (!postId) {
        return;
      }
      e.preventDefault();
      
      if (newComment.trim()) {
        // Создаем комментарий через сервис
        CommsActions.CommentCreate(newComment, postId, () =>
          // После успешного создания обновляем данные поста
          dispatch(
            postSummaryFetch({
              postId,
              dispatch: () => {
                dispatch(deletePreload(postId));
              },
            })
          )
        );
        setNewComment(""); // Очищаем поле ввода
      }
    },
    [newComment, postId, dispatch]
  );

  // Если модальное окно не открыто или нет ID поста - не рендерим
  if (!ui?.commentsModal.isOpen || !ui?.commentsModal.postId) {
    return null;
  }

  // Если пост не найден - не рендерим
  if (!post) {
    return null;
  }

  return (
    <div
      ref={modalRef}
      style={{
        transition: "all 0.3s ease",
      }}
      className={`fixed top-0 left-0 w-full h-[100vh] flex items-center flex-col z-10 bg-black ${
        isClosing && "closing"
      } ${ui?.isFullScreen && "overflowFullscreen"}`}
    >
      <div className="flex flex-col w-full h-full max-w-[700px] justify-center items-center relative">
        
        {/* Шапка модального окна */}
        <div className="modal-header">
          {/* Кнопка закрытия */}
          <button
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close comments"
          >
            <X size={24} />
          </button>
          
          {/* Заголовок */}
          <h2 className="modal-title">Comments</h2>
          
          {/* Spacer для выравнивания */}
          <div className="modal-header-spacer"></div>
        </div>

        {/* Основное содержимое модального окна */}
        <div className="!overflow-y-auto !overflow-x-hidden flex flex-col h-full w-full items-center px-2">
          
          {/* Пост с комментариями - ОТКЛЮЧАЕМ СВАЙП */}
          <PostUIProvider>
            <LoadedPostCard 
              postId={postId!} 
              disableComments 
              isInModal={true} // Важно: передаем флаг что это в модалке
            />
          </PostUIProvider>

          {/* Форма для ввода нового комментария */}
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

          {/* Секция с комментариями */}
          <div className="comments-section">
            {/* Состояние загрузки */}
            {loading && <p className="load-title">Loading comments...</p>}
            
            {/* Нет комментариев */}
            {!loading && comments.length === 0 && (
              <p className="nothing-title">No comments yet ¯\_(ツ)_/¯</p>
            )}
            
            {/* Список комментариев */}
            <div className="comments-list">
              {comments.map((comment, index) => (
                <Comment key={comment.id} comment={comment} index={index} />
              ))}
            </div>
            
            {/* Отступ внизу для скролла */}
            <div className="h-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;