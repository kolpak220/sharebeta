import http from "@/lib/http";
import { getAuth } from "@/lib/utils";
import { Post } from "@/redux/slices/postsSlice/types";
import { ProfileData } from "@/types";

export interface postsData {
  count: number;
  posts: Post[];
}

export interface subsData {
  followersCount: number;
  followingCount: number;
}

export interface IdByUser {
  id: number;
  userName: string;
  name: string;
}
export interface isAdmin {
  userId: number;
  userName: string;
  isAdmin: boolean;
  message: string;
}

const getUser = {
  getUserById: async (userId: number) => {
    try {
      const url = `/userprofile/public?userId=${userId}`;

      const response = await http.get<ProfileData>(url);
      return response.data;
    } catch (err) {
      console.error(err);
    }
  },
  getAdmin: async () => {
    const authdata = getAuth();
    if (!authdata) {
      window.location.reload();
      return;
    }

    try {
      const url = `/admin/check?userId=${authdata.id}&token=${authdata.token}`;

      const response = await http.get<isAdmin>(url);
      return response.data;
    } catch (err) {
      console.error(err);
    }
  },
  getAdminsList: async () => {
    const authdata = getAuth();
    if (!authdata) {
      window.location.reload();
      return;
    }

    try {
      const url = `/admin/list?token=${authdata.token}&userId=${authdata.id}`;

      const response = await http.get<{
        totalAdmins: number;
        admins: ProfileData[];
      }>(url);
      return response.data;
    } catch (err) {
      console.error(err);
    }
  },

  getIdbyUser: async (user: string) => {
    try {
      const url = `/userprofile/resolve?username=${user}`;

      const response = await http.get<IdByUser>(url);
      return response.data;
    } catch (err) {
      console.error(err);
    }
  },
  getAvatar: async (userId: number) => {
    try {
      const checkurl = `/userprofile/public?userId=${userId}`;

      const checkresponse = await http.get(checkurl);

      return checkresponse.data.hasPhoto;
    } catch (err) {
      console.error(err);
    }
  },
  getResizedAvatar: async (userId: number) => {
    try {
      const url = `/avatar/${userId}?size=96&q=30`;

      const res = await http.get(url);

      // const blob = new Blob([res.data], { type: 'image/svg' });

      // // Create URL from blob
      // const imageUrl = URL.createObjectURL(blob);

      return res;
    } catch (err) {
      console.error(err);
    }
  },
  getUserPosts: async (userId: number, currentUserId: number) => {
    try {
      const url = `/Posts/user/${userId}?currentUserId=${currentUserId}`;

      const response = await http.get(url);

      return response.data;
    } catch (err) {
      console.error(err);
    }
  },
  getSubs: async (userId: number) => {
    const authdata = getAuth();
    if (!authdata) {
      window.location.reload();
      return;
    }

    try {
      const url = `/follow/counts/${userId}`;

      const response = await http.get<subsData>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getPosts: async (userId: number) => {
    const authdata = getAuth();
    if (!authdata) {
      window.location.reload();
      return;
    }

    try {
      const url = `/Posts/user/${userId}/count`;

      const response = await http.get<{ count: number }>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getFollow: async (id: number) => {
    const authdata = getAuth();
    if (!authdata) {
      window.location.reload();
      return;
    }

    try {
      const url = `/follow/status/${authdata.id}/${id}`;

      const response = await http.get<{ isFollowing: boolean }>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getPostsById: async (id: number) => {
    const authdata = getAuth();
    if (!authdata) {
      window.location.reload();
      return;
    }

    try {
      const url = `/Posts/user/${id}?currentUserId=${authdata.id}`;

      const response = await http.get<Post[]>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default getUser;
