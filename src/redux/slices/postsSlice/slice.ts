import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Posts, Status } from "./types";
import { postSummaryFetch } from "./asyncActions";
import { Post } from "./types";

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
    builder.addCase(postSummaryFetch.rejected, (state) => {
      state.state = Status.ERROR;
    });
  },
});

export const { clearPosts } = postSlice.actions;

export default postSlice.reducer;
