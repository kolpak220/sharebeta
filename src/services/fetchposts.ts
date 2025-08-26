import { getAuth } from "@/lib/utils";
import http from "../lib/http";
import { Media, Post } from "../types";

export const FetchPosts = {
  pageFetch: async (skip: number, limit = 10, id: string) => {
    try {
      const url = `/Posts/range?skip=${skip}&limit=${limit}&currentUserId=${id}`;
      const response = await http.get<Post[]>(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      throw error;
    }
  },
  pagePostIdsFetch: async (skip: number, limit = 10) => {
    try {
      const url = `/Posts/optimized/latest-ids?skip=${skip}&limit=${limit}`;
      const response = await http.get<string[]>(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      throw error;
    }
  },
  postSummaryFetch: async (postId: number, id: string) => {
    try {
      const url = `/Posts/optimized/${postId}/summary?currentUserId=${id}`;
      const response = await http.get<Post>(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      throw error;
    }
  },
  fetchMedia: async (postId: number, index: number) => {
    try {
      const url = `/Posts/optimized/${postId}/media/${index}`;
      const response = await http.get<Media>(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      throw error;
    }
  },
  subsLimit: async () => {
    const authdata = getAuth();
    if (!authdata) {
      window.location.reload();
      return;
    }
    try {
      const url = `/feed/following-posts-count?token=${authdata.token}&userId=${authdata.id}`;
      const response = await http.get<{
        count: number;
        followingCount: number;
      }>(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch subsLimit count:", error);
      throw error;
    }
  },
};

export default FetchPosts;
