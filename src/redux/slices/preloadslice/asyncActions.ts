import http from "@/lib/http";
import { getAuth } from "@/lib/utils";
import { RootState } from "@/redux/store";
import { createAsyncThunk } from "@reduxjs/toolkit";

export type modeType = "subs" | "fyp" | "latest";

// Define types
type FetchArgs = {
  mode: modeType;
  skip: number;
  limit?: number; // Optional with default value
};

export const pagePostIdsFetch = createAsyncThunk<
  number[], // Return type (fulfilled payload)
  FetchArgs, // Argument type
  { rejectValue: string; state: RootState } // Type for rejectWithValue
>(
  "posts/pagePostIdsFetch",
  async ({ mode, limit = 10, skip }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const auth = getAuth();

      if (!auth) {
        return rejectWithValue("Session invalid");
        // Remove window.location.reload() - it won't execute after return
      }

      const urls = {
        latest: `/Posts/optimized/latest-ids?skip=${skip}&limit=${limit}`,
        fyp: `/Recommendation/posts?count=${limit}&sessionToken=${auth.token}&userId=${auth.id}`,
        subs: `/feed/following-posts-ids?limit=${limit+skip}&token=${auth.token}&userId=${auth.id}&skip=${skip}`,
      };

      const response = await http.get<number[] | { postIds: number[] }>(
        urls[mode]
      );

      // Handle different response formats based on mode
      if (mode === "fyp") {
        // Check if response.data has postIds property
        if ("postIds" in response.data) {
          return response.data.postIds;
        }
        // If it's already an array, return it
        if (Array.isArray(response.data)) {
          return response.data;
        }
        throw new Error("Invalid response format for FYP mode");
      } else {
        // For "latest" and "subs" modes, expect array directly
        if (Array.isArray(response.data)) {
          return response.data;
        }
        throw new Error(`Unexpected response format for ${mode} mode`);
      }
    } catch (error: any) {
      console.error("Failed to fetch post IDs:", error);
      return rejectWithValue(error.response?.data?.message || "Unknown error");
    }
  }
);
