import http from "@/lib/http";
import { getAuth } from "@/lib/utils";
import { ProfileData } from "@/types";

export interface postsData {
  count: number;
}

export interface subsData {
  followersCount: number;
  followingCount: number;
}

export const fetchPrivateProfile = {
  fetchProfile: async () => {
    const authdata = getAuth();
    if (!authdata) {
      window.location.reload();
      return;
    }

    try {
      const url = `/userprofile/public?userId=${authdata.id}`;

      const response = await http.get<ProfileData>(url);
      console.log(response);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getSubs: async () => {
    const authdata = getAuth();
    if (!authdata) {
      window.location.reload();
      return;
    }

    try {
      const url = `/follow/counts/${authdata.id}`;

      const response = await http.get<subsData>(url);
      console.log(response);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getPosts: async () => {
    const authdata = getAuth();
    if (!authdata) {
      window.location.reload();
      return;
    }

    try {
      const url = `/Posts/user/${authdata.id}/count`;

      const response = await http.get<postsData>(url);
      console.log(response);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
