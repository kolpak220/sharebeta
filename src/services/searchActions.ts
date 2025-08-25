import http from "../lib/http";
import { Media, Post } from "../types";

export interface User {
  id: number;
  userName: string;
  name: string;
  about: string;
  hasPhoto: boolean;
}

export const SearchActions = {
  globalSearch: async (text: string, id: string) => {
    try {
      const url = `/search/global?query=${encodeURIComponent(
        text
      )}&skip=0&limit=100&currentUserId=${id}`;
      const response = await http.get<{ posts: Post[]; users: User[] }>(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch search:", error);
      throw error;
    }
  },
  searchPosts: async (text: string, id: string, skip: number) => {
    try {
      const url = `/search/posts?query=${encodeURIComponent(
        text
      )}&skip=${skip}&limit=20&currentUserId=${id}`;
      const response = await http.get<Post[]>(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch search:", error);
      throw error;
    }
  },
  searchUsers: async (text: string, id: string, skip: number) => {
    try {
      const url = `/search/users?query=${encodeURIComponent(
        text
      )}&skip=${skip}&limit=20&currentUserId=${id}`;
      const response = await http.get<User[]>(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch search:", error);
      throw error;
    }
  },
};

export default SearchActions;
