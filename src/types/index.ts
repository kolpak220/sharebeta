export interface Post {
  idCreator: number;
  idPost: number;
  text: string;
  medias: Media[];
  authorName?: string;
  authorPhotoBase64: string;
  authorUserName: string;
  likesCount: number;
  createAt: string;
  isLiked: boolean;
}
export interface Media {
  type: string;
  content: string;
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
