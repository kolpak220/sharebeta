import http from "../lib/http";
import { PostComments } from "../types";

export const GetComms = {
  fetchComms: async (postId: number, skip: number = 0, limit: number = 50) => {
    const url = `/comment/post/${postId}?skip=${skip}&limit=${limit}`;

    const response = await http.get<PostComments>(url);
    return response.data;
  },
};

export default GetComms;
