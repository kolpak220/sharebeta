import { getAuth } from "@/lib/utils";
import http from "../lib/http";
import { PostComments } from "../types";

export const CommsActions = {
  ToggleLike: async (CommentId: string) => {
    const url = `/comment/like`;
    const authdata = getAuth();

    const payload = {
      CommentId,
      UserId: authdata.id,
      Token: authdata.token,
    };

    const response = await http.post(url, payload);
    return response.data;
  },
  CommentCreate: async (Text: string, PostId: number, dispatch: () => void) => {
    const url = `/comment/create`;
    const authdata = getAuth();

    const payload = {
      UserId: authdata.id,
      Token: authdata.token,
      PostId,
      Text,
    };

    const response = await http.post(url, payload);
    dispatch();
    return response.data;
  },
  CommentDelete: async (CommentId: string, dispatch: () => void) => {
    const url = `/comment/delete`;
    const authdata = getAuth();
    if (!authdata) {
      return;
    }

    const payload = {
      UserId: authdata.id,
      Token: authdata.token,
      CommentId,
    };

    const response = await http.delete(url, { data: payload });
    dispatch();
    return response.data;
  },
};

export default CommsActions;
