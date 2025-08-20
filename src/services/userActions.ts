import http from "@/lib/http";
import { getAuth } from "@/lib/utils";

const userActions = {
  Follow: async (userId: number) => {
    const authdata = getAuth();
    if (!authdata) {
      window.location.reload();
      return;
    }
    try {
      const url = `/follow/follow`;

      const payload = {
        Token: authdata.token,
        FollowerId: authdata.id,
        FollowingId: userId,
      };

      const response = await http.post(url, payload);
      return response.data;
    } catch (err) {
      console.error(err);
    }
  },
  unFollow: async (userId: number) => {
    const authdata = getAuth();
    if (!authdata) {
      window.location.reload();
      return;
    }
    try {
      const url = `/follow/unfollow`;

      const payload = {
        Token: authdata.token,
        FollowerId: authdata.id,
        FollowingId: userId,
      };

      const response = await http.post(url, payload);
      return response.data;
    } catch (err) {
      console.error(err);
    }
  },
};

export default userActions;
