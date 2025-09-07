import React, { createContext, useContext, useCallback } from "react";
import { UIContext } from "./UIContext";

type ScrollDirection = "up" | "down";

interface PostUIContextValue {
  toggleFullScreen: () => void;
  openCommentsModal: (postId: number) => void;
}

const PostUIContext = createContext<PostUIContextValue | undefined>(undefined);

export const PostUIProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const ui = useContext(UIContext);

  // Memoize the methods to prevent unnecessary rerenders
  const toggleFullScreen = useCallback(() => {
    ui?.toggleFullScreen();
  }, [ui?.toggleFullScreen]);

  const openCommentsModal = useCallback((postId: number) => {
    ui?.openCommentsModal(postId);
  }, [ui?.openCommentsModal]);

  const value: PostUIContextValue = {
    toggleFullScreen,
    openCommentsModal,
  };

  return (
    <PostUIContext.Provider value={value}>
      {children}
    </PostUIContext.Provider>
  );
};

export const usePostUI = () => {
  const context = useContext(PostUIContext);
  if (context === undefined) {
    throw new Error('usePostUI must be used within a PostUIProvider');
  }
  return context;
};
