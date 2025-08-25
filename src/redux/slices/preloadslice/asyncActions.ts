import http from "@/lib/http";
import { RootState } from "@/redux/store";
import { createAsyncThunk } from "@reduxjs/toolkit";

// Define types
type FetchArgs = {
  mode: "subs" | "fyp" | "latest";
  limit?: number; // Optional with default value
};

// const modUrls

export const pagePostIdsFetch = createAsyncThunk<
  number[], // Return type (fulfilled payload)
  FetchArgs, // Argument type
  { rejectValue: string; state: RootState } // Type for rejectWithValue
>(
  "posts/pagePostIdsFetch",
  async ({ mode, limit = 10 }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const url = `/Posts/optimized/latest-ids?skip=${state.preload.items.length}&limit=${limit}`;
      const response = await http.get<number[]>(url);
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch post IDs:", error);
      return rejectWithValue(error.response?.data?.message || "Unknown error");
    }
  }
);
