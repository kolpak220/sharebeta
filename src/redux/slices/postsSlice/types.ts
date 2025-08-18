export enum Status {
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}
export interface Post {
  idCreator: number;
  idPost: number;
  text: string;
  authorName?: string;
  authorUserName: string;
  likesCount: number;
  commentsCount: number;
  createAt: string;
  isLiked: boolean;
  mediaCount: number;
}
export interface Posts {
  items: Post[];
  state: Status;
}
