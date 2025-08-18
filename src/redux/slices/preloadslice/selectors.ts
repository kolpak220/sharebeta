import { RootState } from "@/redux/store";

export const SelectPostIds = (state: RootState) => {
  return state.preload.items;
};
export const SelectPreloadState = (state: RootState) => {
  return state.preload.state;
};
