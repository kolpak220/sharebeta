import http from "@/lib/http";
import { RootState } from "@/redux/store";
import { Post } from "./types";
import { createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

// Define types
type FetchArgs = {
  postId: number; // Optional with default value
  dispatch: () => void;
};

export const postSummaryFetch = createAsyncThunk<
  Post, // Return type (fulfilled payload)
  FetchArgs, // Argument type
  { rejectValue: number; state: RootState } // Type for rejectWithValue
>(
  "posts/postSummaryFetch",
  async ({ postId, dispatch }, { rejectWithValue, getState }) => {
    try {
      const id = Cookies.get("id");
      const url = `/Posts/optimized/${postId}/summary?currentUserId=${id}`;
      const response = await http.get<Post>(url);
      return response.data;
    } catch (error: any) {
      dispatch();
      console.error("Failed to fetch post summary:", error);
      return rejectWithValue(postId);
    }
  }
);
