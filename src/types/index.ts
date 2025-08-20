export interface Post {
  idCreator: number;
  idPost: number;
  text: string;
  authorName?: string;
  authorPhotoBase64: string;
  authorUserName: string;
  likesCount: number;
  commentsCount: number;
  createAt: string;
  isLiked: boolean;
  mediaCount: number;
}
export interface Media {
  type: string;
  url: string;
}

interface User {
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
export interface CommentData {
  id: string;
  idPost: number;
  idCreator: number;
  hasAuthorPhoto: boolean;
  text: string;
  authorUserName: string;
  authorName: string;
  createAt: string;
  likes: number[];
}

export interface PostComments {
  comments: CommentData[];
  totalCount: number;
  skip: number;
  limit: number;
}

export interface ProfileData {
  id: number;
  userName: string;
  name: string;
  about: string;
  hasPhoto: boolean;
}
