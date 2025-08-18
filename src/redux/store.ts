import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import preload from "./slices/preloadslice/slice";
import posts from "./slices/postsSlice/slice";

const store = configureStore({
  reducer: { preload, posts },
});

export type AppDispatch = typeof store.dispatch;

export type RootState = ReturnType<typeof store.getState>;

export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;