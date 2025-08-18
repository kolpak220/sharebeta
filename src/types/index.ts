export interface Post {
  idCreator: number;
  idPost: number;
  text: string;
  authorName?: string;
  authorPhotoBase64: string;
  authorUserName: string;
  likesCount: number;
  createAt: string;
  isLiked: boolean;
  mediaCount: number;
}
export interface Media {
  type: string;
  url: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
}

export interface MediaItem {
  id: string;
  type: string;
  src: string;
  alt?: string;
  thumbnail?: string;
  title?: string;
}

export interface MediaGalleryProps {
  items: MediaItem[];
  className?: string;
  thumbnailSize?: "small" | "medium" | "large";
  columns?: number;
  onItemClick?: (item: MediaItem, index: number) => void;
}

export interface MediaViewerProps {
  items: MediaItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}
export interface Comment {
  id: number;
  idCreator: number;
  idPost: number;
  text: string;
  createAt: string;
  likes: [];
  authorUserName: string;
}

export interface PostComments {
  comments: Comment[];
  totalCount: number;
  skip: number;
  limit: number;
}

export interface UserOverlay {
  show: false | true,
  userId: number | null,
}