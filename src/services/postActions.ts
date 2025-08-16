import http from "../lib/http";
export interface toggleLikePayload {
  Token: string;
  UserId: string;
  PostId: number;
}
export const PostActions = {
  likeToggle: async (payload: toggleLikePayload) => {
    try {
      const url = `/PostPublic/like/toggle`;
      const response = await http.post(url, payload);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      throw error;
    }
  },
};

export default PostActions;
