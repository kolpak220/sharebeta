import http from "../lib/http";
import { Post } from "../types";

export const FetchPosts = {
  pageFetch: async (skip: number, limit = 10) => {
    const url = `/Posts/range?skip=${skip}&limit=${limit}`;
    // const url = "/Posts/range?skip=0&limit=10";

    const response = await http.get<Post[]>(url);
    return response.data;
  },
};

export default FetchPosts;
