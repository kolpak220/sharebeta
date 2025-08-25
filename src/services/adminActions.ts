import http from "@/lib/http";
import { actionPayload } from "./postActions";
import { getAuth } from "@/lib/utils";

export interface removeUserPayload {
  Token: string;
  UserId: string;
  PostId: number;
  dispatch: () => void;
}

export const adminActions = {
  deletePostAdmin: async (payload: actionPayload) => {
    try {
      const url = `/PostAdmin/delete`;
      const response = await http.post(url, payload);
      if (response) {
        payload.dispatch();
      }
      return response.data;
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      throw error;
    }
  },
  removeUserAdmin: async (userId: number) => {
    const authdata = getAuth();
    if (!authdata) {
      window.location.reload();
      return;
    }
    const payload = {
      Token: authdata.token,
      UserId: authdata.id,
      TargetUserId: userId,
    };
    try {
      const url = `/PostAdmin/delete-user`;
      const response = await http.post(url, payload);
      if (response) {
        window.location.assign("/");
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  grantAdmin: async (userId: number) => {
    const authdata = getAuth();
    if (!authdata) {
      window.location.reload();
      return;
    }
    const payload = {
      Token: authdata.token,
      UserId: authdata.id,
      TargetUserId: userId,
    };
    try {
      const url = `/PostAdmin/grant-admin`;
      const response = await http.post(url, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  revokeAdmin: async (userId: number) => {
    const authdata = getAuth();
    if (!authdata) {
      window.location.reload();
      return;
    }
    const payload = {
      Token: authdata.token,
      UserId: authdata.id,
      TargetUserId: userId,
    };
    try {
      const url = `/PostAdmin/revoke-admin`;
      const response = await http.post(url, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
