import http from "../lib/http";
export interface toggleLikePayload {
  Token: string;
  UserId: string;
  PostId: number;
  dispatch: () => void;
}
export const PostActions = {
  likeToggle: async (payload: toggleLikePayload) => {
    try {
      const url = `/PostPublic/like/toggle`;
      const response = await http.post(url, payload);
      if (response) {
        payload.dispatch();
      }
      return response.data;
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      throw error;
    }
  },
};

export default PostActions;
