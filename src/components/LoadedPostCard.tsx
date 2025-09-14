import { usePostUI } from "@/contexts/PostUIContext";
import { formatNumber, getAuth, getAvatarUrl } from "@/lib/utils";
import FetchPosts from "@/services/fetchposts";
import formatTimeAgo from "@/services/formatTimeAgo";
import PostActions from "@/services/postActions";
import {
  MoreVertical,
  Heart,
  MessageCircle,
  Share,
  UserRound,
  CopyCheck,
  Trash,
  Check,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MediaViewer from "./MediaViewer";
import PostMedia from "./PostMedia";
import { Media, MediaItem } from "../types";
import styles from "./PostCard.module.css";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/redux/store";
import { FindPost } from "@/redux/slices/postsSlice/selectors";
import { postSummaryFetch } from "@/redux/slices/postsSlice/asyncActions";
import Paragraph from "antd/es/typography/Paragraph";
import { deletePreload } from "@/redux/slices/preloadslice/slice";
import { deletePost } from "@/redux/slices/postsSlice/slice";
import Cookies from "js-cookie";
import { adminActions } from "@/services/adminActions";
import { useNavigate } from "react-router-dom";
import TextContent from "./TextContent";

const LoadedPostCard = ({
  postId,
  disableComments,
  isInModal = false,
}: {
  postId: number;
  disableComments: boolean;
  isInModal?: boolean;
}) => {
  const post = useSelector((state: RootState) => FindPost(state, postId));
  if (!post) {
    return;
  }
  const [copied, setCopied] = useState(false);
  const [popoverShow, togglePopover] = useState(false);
  const dispatch = useAppDispatch();
  const [viewerOpen, setOpen] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mediaFetch, setMedia] = useState<Media>();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const postUI = usePostUI();
  const [likeLoading, setLikeLoading] = useState(false);
  const authdata = getAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isAdmin = Cookies.get("isAdmin")?.toString();
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef(0);
  const touchClickCountRef = useRef(0);
  const isSwipeActiveRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const postCardRef = useRef<HTMLDivElement>(null);
  
  // Состояния для анимации свайпа
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [shouldAnimateBack, setShouldAnimateBack] = useState(false);

  const textContent = useMemo(() => {
    return <TextContent text={post.text} />;
  }, [post.text]);

  const handleOk = () => {
    const authdata = getAuth();
    if (!authdata.id || !authdata.token) {
      return;
    }
    const payload = {
      Token: authdata.token,
      UserId: authdata.id,
      PostId: post.idPost,
      dispatch: () => {
        dispatch(deletePreload(post.idPost));
        dispatch(deletePost(post.idPost));
      },
    };

    if (isAdmin?.includes("true")) {
      adminActions.deletePostAdmin(payload);
    } else {
      PostActions.deletePost(payload);
    }
  };

  const handleLike = useCallback(() => {
    if (likeLoading) {
      return;
    }
    setLikeLoading(true);
    if (!authdata.id || !authdata.token) {
      setLikeLoading(false);
      return;
    }

    PostActions.likeToggle({
      PostId: post.idPost,
      Token: authdata.token,
      UserId: authdata.id,
      dispatch: () => {
        dispatch(
          postSummaryFetch({
            postId,
            dispatch: () => {
              dispatch(deletePreload(postId));
            },
          })
        );
        setLikeLoading(false);
      },
    });
  }, [likeLoading, authdata.id, authdata.token, post.idPost, postId, dispatch]);

  const openComments = useCallback(() => {
    if (disableComments) {
      return;
    }
    postUI.openCommentsModal(postId);
  }, [disableComments, postUI, postId]);

  const handleDoubleClick = useCallback(() => {
    console.log('handleDoubleClick called, likeLoading:', likeLoading);
    if (likeLoading) return;
    console.log('Executing like action');
    handleLike();
  }, [likeLoading, handleLike]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isInModal) return;
    
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
    setIsSwiping(true);
    setShouldAnimateBack(false);
    isSwipeActiveRef.current = false;
  }, [isInModal]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isInModal || !touchStartRef.current) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    const deltaX = currentX - touchStartRef.current.x;
    const deltaY = currentY - touchStartRef.current.y;
    
    // Если движение в основном по вертикали, игнорируем
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }
    
    // УБИРАЕМ preventDefault отсюда - он будет в нативном обработчике
    // e.preventDefault();
    
    // Разрешаем только свайп влево (отрицательный deltaX)
    if (deltaX > 0) {
      // Блокируем свайп вправо - возвращаем на место
      setSwipeOffset(0);
      return;
    }
    
    // Помечаем, что начался свайп
    if (Math.abs(deltaX) > 10) {
      isSwipeActiveRef.current = true;
    }
    
    // Нелинейная функция для свайпа влево (ease-out эффект)
    const maxOffset = window.innerWidth;
    const normalizedDelta = Math.abs(deltaX) / maxOffset;
    const easeOut = 1 - Math.pow(1 - Math.min(normalizedDelta, 1), 2);
    const limitedOffset = -easeOut * maxOffset * 0.7;
    
    // Устанавливаем смещение для анимации
    setSwipeOffset(limitedOffset);
    setSwipeDirection('left');
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const endTime = Date.now();
    
    const deltaX = endX - touchStartRef.current.x;
    const deltaY = endY - touchStartRef.current.y;
    const duration = endTime - touchStartRef.current.time;
    
    // Если был свайп, не обрабатываем как клик
    if (isSwipeActiveRef.current) {
      // Проверяем условия только для свайпа влево
      const isLeftSwipe = deltaX < -100;
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY) * 2;
      const isFastEnough = duration < 400;
      
      // Вычисляем текущий прогресс свайпа для плавного возврата
      const swipeProgress = Math.abs(swipeOffset) / (window.innerWidth * 0.7);
      
      if (isLeftSwipe && isHorizontal && isFastEnough) {
        // Доводим анимацию до конца с ease-out эффект
        setSwipeOffset(-window.innerWidth * 0.7);
        setShouldAnimateBack(true);
        
        // Открываем комментарии сразу
        openComments();
        
        // Плавно возвращаем карточку на место
        setTimeout(() => {
          setSwipeOffset(0);
          setIsSwiping(false);
          setSwipeDirection(null);
          isSwipeActiveRef.current = false;
        }, 300);
      } else if (Math.abs(swipeOffset) > window.innerWidth * 0.3) {
        // Если свайпнули достаточно далеко влево, но не активировали
        setSwipeOffset(-window.innerWidth * 0.7);
        setShouldAnimateBack(true);
        
        setTimeout(() => {
          openComments();
          setSwipeOffset(0);
          setIsSwiping(false);
          setSwipeDirection(null);
          isSwipeActiveRef.current = false;
        }, 300);
      } else {
        // Возвращаем карточку на место
        setShouldAnimateBack(true);
        setSwipeOffset(0);
        setTimeout(() => {
          setIsSwiping(false);
          setSwipeDirection(null);
          isSwipeActiveRef.current = false;
        }, 300 * swipeProgress);
      }
    } else {
      // Если не было свайпа - обрабатываем как тап/клик
      touchClickCountRef.current += 1;
      console.log('Touch click count:', touchClickCountRef.current);
      
      if (touchClickCountRef.current === 1) {
        // Первый клик - устанавливаем таймер
        console.log('Touch: First click, setting timeout');
        clickTimeoutRef.current = setTimeout(() => {
          // Если за 300ms не было второго клика, это одиночный клик
          console.log('Touch: Single click timeout triggered');
          touchClickCountRef.current = 0;
          clickTimeoutRef.current = null;
          // Здесь можно обработать одиночный клик если нужно
        }, 300);
      } else if (touchClickCountRef.current === 2) {
        // Второй клик - это двойной клик
        console.log('Touch: Double click detected!');
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
          clickTimeoutRef.current = null;
        }
        touchClickCountRef.current = 0;
        handleDoubleClick();
      }
    }
    
    touchStartRef.current = null;
  }, [openComments, swipeOffset, handleDoubleClick]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isInModal || !touchStartRef.current || e.buttons !== 1) return;
    
    const currentX = e.clientX;
    const currentY = e.clientY;
    
    const deltaX = currentX - touchStartRef.current.x;
    const deltaY = currentY - touchStartRef.current.y;
    
    // Если движение в основном по вертикали, игнорируем
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }
    
    // Разрешаем только свайп влево (отрицательный deltaX)
    if (deltaX > 0) {
      // Блокируем свайп вправо - возвращаем на место
      setSwipeOffset(0);
      return;
    }
    
    // Помечаем, что начался свайп
    if (Math.abs(deltaX) > 5) {
      isSwipeActiveRef.current = true;
    }
    
    // Нелинейная функция для свайпа влево
    const maxOffset = window.innerWidth;
    const normalizedDelta = Math.abs(deltaX) / maxOffset;
    const easeOut = 1 - Math.pow(1 - Math.min(normalizedDelta, 1), 2);
    const limitedOffset = -easeOut * maxOffset * 0.7;
    
    setSwipeOffset(limitedOffset);
    setSwipeDirection('left');
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!touchStartRef.current) return;
    
    const endX = e.clientX;
    const endY = e.clientY;
    
    const deltaX = endX - touchStartRef.current.x;
    const deltaY = endY - touchStartRef.current.y;
    
    // Если был свайп, не обрабатываем как клик
    if (isSwipeActiveRef.current) {
      // Проверяем условия только для свайпа влево
      const isLeftSwipe = deltaX < -100;
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY) * 2;
      
      // Вычисляем текущий прогресс свайпа
      const swipeProgress = Math.abs(swipeOffset) / (window.innerWidth * 0.7);
      
      if (isLeftSwipe && isHorizontal) {
        setSwipeOffset(-window.innerWidth * 0.7);
        setShouldAnimateBack(true);
        
        openComments();
        
        setTimeout(() => {
          setSwipeOffset(0);
          setIsSwiping(false);
          setSwipeDirection(null);
          isSwipeActiveRef.current = false;
        }, 300);
      } else if (Math.abs(swipeOffset) > window.innerWidth * 0.3) {
        setSwipeOffset(-window.innerWidth * 0.7);
        setShouldAnimateBack(true);
        
        setTimeout(() => {
          openComments();
          setSwipeOffset(0);
          setIsSwiping(false);
          setSwipeDirection(null);
          isSwipeActiveRef.current = false;
        }, 300);
      } else {
        setShouldAnimateBack(true);
        setSwipeOffset(0);
        setTimeout(() => {
          setIsSwiping(false);
          setSwipeDirection(null);
          isSwipeActiveRef.current = false;
        }, 300 * swipeProgress);
      }
    }
    
    touchStartRef.current = null;
  }, [openComments, swipeOffset]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isInModal) return;

    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };
    setIsSwiping(true);
    setShouldAnimateBack(false);
    isSwipeActiveRef.current = false;
  }, []);

  const handlePostClick = useCallback((e: React.MouseEvent) => {
    // Prevent mouse events if we just handled a touch event
    if (Date.now() - (touchStartRef.current?.time || 0) < 500) {
      console.log('Mouse: Ignoring click - recent touch detected');
      return;
    }
    
    if (isSwipeActiveRef.current) {
      isSwipeActiveRef.current = false;
      return;
    }
    
    clickCountRef.current += 1;
    console.log('Mouse click count:', clickCountRef.current);
    
    if (clickCountRef.current === 1) {
      // Первый клик - устанавливаем таймер
      console.log('Mouse: First click, setting timeout');
      clickTimeoutRef.current = setTimeout(() => {
        // Если за 300ms не было второго клика, это одиночный клик
        console.log('Mouse: Single click timeout triggered');
        clickCountRef.current = 0;
        clickTimeoutRef.current = null;
        // Здесь можно обработать одиночный клик если нужно
      }, 300);
    } else if (clickCountRef.current === 2) {
      // Второй клик - это двойной клик
      console.log('Mouse: Double click detected!');
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      clickCountRef.current = 0;
      e.preventDefault();
      e.stopPropagation();
      handleDoubleClick();
    }
  }, [handleDoubleClick]);

  const handleNavigate = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);
  
  const formattedTime = useMemo(
    () => formatTimeAgo(post.createAt),
    [post.createAt]
  );
  
  useEffect(() => {
    async function FetchMediaByPost() {
      if (!post) {
        return;
      }
      const response = await FetchPosts.fetchMedia(post.idPost, 0);
      if (response) {
        setMedia(response);
      }
    }

    // Fetch media function
    const loadMedia = async () => {
      // Create array of media indices to fetch
      const indices = Array.from({ length: post.mediaCount }, (_, i) => i);

      // Process media in parallel instead of sequential loop
      const mediaPromises = indices.map(async (index) => {
        try {
          const response = await FetchPosts.fetchMedia(post.idPost, index);
          if (mediaItems.some((item) => item.src == response.url)) {
            return null;
          }
          return response
            ? {
                type: response.type.includes("image") ? "image" : "video",
                src: response.url,
                id: index.toString(),
              }
            : {
                type: "image",
                src: "error",
                id: index.toString(),
              };
        } catch {
          return {
            type: "image",
            src: "error",
            id: index.toString(),
          };
        }
      });

      // Wait for all media to load
      const newMediaItems = (await Promise.all(mediaPromises)).filter(
        Boolean
      ) as MediaItem[];

      if (newMediaItems.length) {
        setMediaItems(newMediaItems);
      }
    };

    if (post.mediaCount > 0) {
      Promise.all([loadMedia(), FetchMediaByPost()]);
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (e.target instanceof Element) {
        // If click is on popover or its children, do nothing
        if (
          e.target.id === "popover" ||
          e.target.closest("#popover") ||
          e.target.id === "more" ||
          e.target.closest("#more")
        ) {
          return;
        }
        // If click is elsewhere, close the popover
        togglePopover(false);
      }
    };

    document.body.addEventListener("click", handleClickOutside);

    const element = postCardRef.current;
    let nativeTouchMoveHandler: ((e: TouchEvent) => void) | null = null;

    if (element && !isInModal) {
      nativeTouchMoveHandler = (e: TouchEvent) => {
        if (!touchStartRef.current) return;
        
        const touch = e.touches[0];
        const currentX = touch.clientX;
        const currentY = touch.clientY;
        
        const deltaX = currentX - touchStartRef.current.x;
        const deltaY = currentY - touchStartRef.current.y;
        
        // Если движение в основном по вертикали, игнорируем
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return;
        }
        
        // Теперь preventDefault будет работать
        e.preventDefault();
        
        // Разрешаем только свайп влево (отрицательный deltaX)
        if (deltaX > 0) {
          setSwipeOffset(0);
          return;
        }
        
        if (Math.abs(deltaX) > 10) {
          isSwipeActiveRef.current = true;
        }
        
        const maxOffset = window.innerWidth;
        const normalizedDelta = Math.abs(deltaX) / maxOffset;
        const easeOut = 1 - Math.pow(1 - Math.min(normalizedDelta, 1), 2);
        const limitedOffset = -easeOut * maxOffset * 0.7;
        
        setSwipeOffset(limitedOffset);
        setSwipeDirection('left');
      };

      element.addEventListener('touchmove', nativeTouchMoveHandler, { passive: false });
    }

    return () => {
      document.body.removeEventListener("click", handleClickOutside);
      if (element && nativeTouchMoveHandler) {
        element.removeEventListener('touchmove', nativeTouchMoveHandler);
      }
      // Очищаем таймер при размонтировании компонента
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      // Сбрасываем счетчики
      clickCountRef.current = 0;
      touchClickCountRef.current = 0;
    };
  }, [post.mediaCount, post.idPost, mediaItems, isInModal]);

  const getPostUrl = () => {
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    return `${baseUrl}/post/${post.idPost}`;
  };

  const handleClickUserInfo = () => {
    navigate(`/user/${post.idCreator}`);
  };

  // Стиль для анимации свайпа
  const swipeStyle = {
    transform: `translateX(${swipeOffset}px)`,
    transition: shouldAnimateBack ? 'transform 0.3s ease-out' : 'none',
    opacity: isSwiping && swipeDirection === 'left' ? 1 - Math.abs(swipeOffset) / window.innerWidth : 1
  };

  return (
    <>
      {/* Добавляем обработчики свайпа и двойного клика на основную карточку */}
      <div 
        ref={postCardRef}
        className={`${styles.postCard} glass`} 
        onClick={handlePostClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove} // Оставляем React обработчик для синхронизации состояния
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ 
          cursor: 'pointer', 
          touchAction: 'pan-y',
          ...swipeStyle
        }}
      >
        <div className={styles.postHeader}>
          <div onClick={handleClickUserInfo} className={styles.authorInfo}>
            {!error ? (
              <img
                onError={() => {
                  setError(true);
                }}
                src={getAvatarUrl(post.idCreator)}
                className={styles.authorAvatar}
              />
            ) : (
              <UserRound className={styles.authorAvatar} />
            )}
            <div className={styles.authorDetails}>
              {post.authorName ? (
                <>
                  <Paragraph
                    ellipsis
                    style={{
                      ...styles,
                      margin: 0,
                      fontWeight: 600,
                      fontSize: "1rem",
                      maxWidth: "130px",
                    }}
                    className={styles.authorName}
                  >
                    {post.authorName}
                  </Paragraph>
                  <Paragraph
                    ellipsis
                    style={{
                      ...styles,
                      margin: 0,
                      color: "#888",
                      fontSize: "0.95em",
                      maxWidth: "130px",
                    }}
                    className={styles.authorUsername}
                  >
                    @{post.authorUserName}
                  </Paragraph>
                </>
              ) : (
                <>
                  <Paragraph
                    ellipsis
                    style={{
                      ...styles,
                      margin: 0,
                      fontWeight: 600,
                      fontSize: "1rem",
                    }}
                    className={styles.authorName}
                  >
                    @{post.authorUserName}
                  </Paragraph>
                </>
              )}
            </div>
          </div>
          <span
            className="flex justify-center items-center"
            style={{ overflow: "visible" }}
          >
            <span className="date right-0">{formattedTime}</span>
            {(post.idCreator.toString() == authdata.id ||
              isAdmin?.includes("true")) && (
              <button
                id="more"
                onClick={(e) => {
                  if (e.target instanceof Element) {
                    // Check if the clicked element or any of its parents have 'popover' ID
                    if (
                      e.target.id === "popover" ||
                      e.target.closest("#popover")
                    ) {
                      return;
                    }
                  }
                  togglePopover((prev) => !prev);
                }}
                className={`${styles.moreBtn} ${
                  popoverShow && styles.moreBtnActive
                }`}
              >
                <MoreVertical size={18} />
                {popoverShow && (
                  <div
                    id="popover"
                    className={`${styles.popover} ${styles.show}`}
                  >
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(true);
                        if (confirmDelete) {
                          handleOk();
                        }
                      }}
                      className={styles.popoverContent}
                    >
                      {confirmDelete ? (
                        <>
                          {" "}
                          <span>Confirm?</span>
                        </>
                      ) : (
                        <>
                          {" "}
                          <Trash className={styles.popoverIcon} />
                          <span>Delete post</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </button>
            )}
          </span>
        </div>

        <div className={styles.postContent}>
          {textContent}

          {post.mediaCount > 0 && (
            <PostMedia
              mediaFetch={mediaFetch}
              count={post.mediaCount}
              handleClick={() => {
                setOpen(true);
                postUI.toggleFullScreen();
              }}
            />
          )}
        </div>

        <div className={styles.postActions}>
          <span className="flex justify-between items-center w-full">
            <span className="flex justify-center items-center">
              <button
                className={`${styles.actionBtn} ${
                  post.isLiked ? styles.liked : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation(); // Предотвращаем всплытие события
                  handleLike();
                }}
              >
                <Heart
                  className={styles.actionIcon}
                  size={20}
                  fill={
                    likeLoading
                      ? "#fff"
                      : post.isLiked
                      ? "currentColor"
                      : "none"
                  }
                />
                <span className={styles.actionCount}>
                  {formatNumber(post.likesCount)}
                </span>
              </button>

              <button
                className={styles.actionBtn}
                onClick={(e) => {
                  e.stopPropagation(); // Предотвращаем всплытие события
                  openComments();
                }}
              >
                <MessageCircle className={styles.actionIcon} size={20} />
                <span className={styles.actionCount}>
                  {formatNumber(post.commentsCount)}
                </span>
              </button>
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Предотвращаем всплытие события
                if (window.AndroidBridge) {
                  window.AndroidBridge.copyToClipboard(getPostUrl());
                  setCopied(true);
                }
                navigator.clipboard.writeText(getPostUrl());

                setCopied(true);
              }}
              className={styles.actionBtn}
            >
              {copied ? (
                <CopyCheck className={styles.actionIcon} size={20} />
              ) : (
                <Share className={styles.actionIcon} size={20} />
              )}
            </button>
          </span>
        </div>
      </div>
      <MediaViewer
        items={mediaItems}
        currentIndex={currentIndex}
        isOpen={viewerOpen}
        onClose={() => {
          postUI.toggleFullScreen();
          setOpen(false);
        }}
        onNavigate={handleNavigate}
      />
    </>
  );
};

const LoadedAdPostCard = ({}) => {
  return (
    <>
      <div className="content-ad">
        <h1>Ad</h1>
      </div>
    </>
  );
};

export { LoadedAdPostCard };
export default LoadedPostCard;