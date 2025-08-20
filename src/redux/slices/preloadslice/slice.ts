import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { postIds, Status } from "./types";
import { pagePostIdsFetch } from "./asyncActions";

const initialState: postIds = {
  items: [],
  state: Status.LOADING,
};

export const preloadSlice = createSlice({
  name: "preload",
  initialState,
  reducers: {
    clearPostIds(state) {
      state.items = [];
    },
    deletePreload(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      pagePostIdsFetch.fulfilled,
      (state, action: PayloadAction<number[]>) => {
        const newIds = action.payload.filter((id) => !state.items.includes(id));
        state.items = [...state.items, ...newIds];
        state.state = Status.SUCCESS;
      }
    );
    builder.addCase(pagePostIdsFetch.pending, (state) => {
      state.state = Status.LOADING;
    });
    builder.addCase(pagePostIdsFetch.rejected, (state) => {
      state.state = Status.ERROR;
    });
  },
});

export const { clearPostIds, deletePreload } = preloadSlice.actions;

export default preloadSlice.reducer;
