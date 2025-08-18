import http from "@/lib/http";

const getUser = {
  getUserById: async (userId: number) => {
    try {
      const url = `/userprofile/public?userId=${userId}`;

      const response = await http.get(url);
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
};

export default getUser;
