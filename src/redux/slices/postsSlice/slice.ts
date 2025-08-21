import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Posts, Status } from "./types";
import { postSummaryFetch } from "./asyncActions";
import { Post } from "./types";
import { deletePreload } from "../preloadslice/slice";

const initialState: Posts = {
  items: [],
  state: Status.LOADING,
};

export const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearPosts(state) {
      state.items = [];
    },
    deletePost(state, action: PayloadAction<number>) {
      state.items = state.items.filter(
        (post) => post.idPost !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      postSummaryFetch.fulfilled,
      (state, action: PayloadAction<Post>) => {
        const exist = state.items.find(
          (obj) => obj.idPost === action.payload.idPost
        );
        if (exist) {
          Object.assign(exist, action.payload);
        } else {
          state.items = [...state.items, action.payload];
        }
        state.state = Status.SUCCESS;
      }
    );
    // );
    // builder.addCase(pagePostIdsFetch.pending, (state) => {
    //   state.state = Status.LOADING;
    // });
    builder.addCase(
      postSummaryFetch.rejected,
      (state, action: PayloadAction<number | undefined>) => {
        if (action.payload) {
          deletePreload(action.payload);
        }
        state.state = Status.ERROR;
      }
    );
  },
});

export const { clearPosts, deletePost } = postSlice.actions;

export default postSlice.reducer;
