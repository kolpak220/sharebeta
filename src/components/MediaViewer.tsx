import React, { useEffect, useCallback, useState, useContext } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { MediaViewerProps } from "../types/index";
import "./MediaViewer.css";

const MediaViewer: React.FC<MediaViewerProps> = ({
  items,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [loadedItems, setLoadedItems] = useState<Set<string>>(new Set());

  const currentItem = items[currentIndex];

  const handlePrevious = useCallback(() => {
    const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    onNavigate(prevIndex);
  }, [currentIndex, items.length, onNavigate]);

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex === items.length - 1 ? 0 : currentIndex + 1;
    onNavigate(nextIndex);
  }, [currentIndex, items.length, onNavigate]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          handlePrevious();
          break;
        case "ArrowRight":
          event.preventDefault();
          handleNext();
          break;
        case "Escape":
          event.preventDefault();
          onClose();
          break;
      }
    },
    [isOpen, handlePrevious, handleNext, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (currentItem && !loadedItems.has(currentItem.id)) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [currentIndex, currentItem, loadedItems]);

  const handleMediaLoad = () => {
    if (currentItem) {
      setLoadedItems((prev) => new Set(prev).add(currentItem.id));
      setIsLoading(false);
      setHasError(false);
    }
  };

  const handleMediaError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !currentItem) {
    return null;
  }

  return (
    <div
      className="media-viewer-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
    >
      <div className="media-viewer-container">
        <button
          className="media-viewer-close"
          onClick={onClose}
          aria-label="Close media viewer"
        >
          <X size={24} />
        </button>

        <div className="media-viewer-content">
          {isLoading && !loadedItems.has(currentItem.id) && (
            <div className="media-viewer-loading">
              <Loader2 size={32} className="animate-spin" />
              <span>Loading...</span>
            </div>
          )}

          {hasError && (
            <div className="media-viewer-error">
              <AlertCircle size={48} />
              <span>Failed to load media</span>
            </div>
          )}

          {currentItem.type === "image" ? (
            <img
              src={currentItem.src}
              alt={currentItem.alt || currentItem.title || "Gallery image"}
              className={`media-viewer-image ${
                isLoading && !loadedItems.has(currentItem.id) ? "loading" : ""
              }`}
              onLoad={handleMediaLoad}
              onError={handleMediaError}
              style={{ display: hasError ? "none" : "block" }}
            />
          ) : (
            <video
              src={currentItem.src}
              className={`media-viewer-video ${
                isLoading && !loadedItems.has(currentItem.id) ? "loading" : ""
              }`}
              controls
              autoPlay
              onLoadedData={handleMediaLoad}
              onError={handleMediaError}
              style={{ display: hasError ? "none" : "block" }}
              aria-label={currentItem.title || "Gallery video"}
            />
          )}
        </div>

        {items.length > 1 && (
          <>
            <button
              className="media-viewer-nav media-viewer-nav-prev"
              onClick={handlePrevious}
              aria-label="Previous media"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className="media-viewer-nav media-viewer-nav-next"
              onClick={handleNext}
              aria-label="Next media"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        <div className="media-viewer-info">
          <span className="media-viewer-counter">
            {currentIndex + 1} / {items.length}
          </span>
          {currentItem.title && (
            <h3 className="media-viewer-title">{currentItem.title}</h3>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;
