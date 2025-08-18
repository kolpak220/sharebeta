import { RootState } from "@/redux/store";

export const FindPost = (state: RootState, id: number) => {
  if (!state.posts.items) return;

  return state.posts.items.find((obj) => obj.idPost === id);
};
