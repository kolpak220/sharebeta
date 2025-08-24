import { ChangePwFormData } from "@/components/ChangePassworfForm";
import { EditProfileData } from "@/components/EditProfileForm";
import http from "@/lib/http";
import { getAuth } from "@/lib/utils";
import Cookies from "js-cookie";

interface postPayload {
  Token: string;
  UserId: string;
  Text?: string;
  Medias?: any;
}

const userActions = {
  newPost: async (payload: postPayload) => {
    try {
      const url = "/createpost/create-json";

      const res = await http.post(url, payload);

      return res.data
    } catch (err: any) {

      let errorMessage = "An error occurred";

      if (err.message) {
        // Split by "code:" and take the first part, then clean it up
        const parts = err.message.split(" code:");
        errorMessage = parts[0].replace("Error:", "").trim();
      }

      // Or simpler approach - just get the first meaningful part
      if (err.message) {
        // Remove "Error: Server error: " prefix and take everything before " code:"
        const match = err.message.match(
          /Error: Server error: (.*?)(?: code:|$)/
        );
        if (match && match[1]) {
          errorMessage = match[1].trim();
        }
      }
      return {error: errorMessage}
    }
  },
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
  PutEditProfile: async (FormData: EditProfileData) => {
    const authdata = getAuth();
    if (!authdata) {
      window.location.reload();
      return;
    }
    try {
      const urlFieldMap: { [key: string]: keyof EditProfileData } = {
        "/userprofile/about": "about",
        "/userprofile/username": "userName",
        "/userprofile/name": "name",
      };

      const payloadBase = {
        Token: authdata.token,
        UserId: Number(authdata.id),
      };

      let finalResponse = [];

      // Iterate through each URL and check if corresponding field exists
      for (const [url, fieldName] of Object.entries(urlFieldMap)) {
        // Check if the field exists in FormData and has a value
        if (FormData[fieldName] !== undefined && FormData[fieldName] !== null) {
          // Capitalize first character of field name
          const capitalizedFieldName =
            fieldName.charAt(0).toUpperCase() + fieldName.slice(1);

          // Create payload with dynamic capitalized field name
          const payload = {
            ...payloadBase,
            [capitalizedFieldName]: FormData[fieldName], // This creates Name: value, UserName: value, etc.
          };

          const response = await http.put(url, payload);
          finalResponse.push(response.status); // Keep track of the last response
        }
      }

      return finalResponse;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  PutChangePw: async (FormData: ChangePwFormData) => {
    const authdata = getAuth();
    if (!authdata) {
      window.location.reload();
      return;
    }
    try {
      const url = "/userprofile/password";

      const payloadBase = {
        Token: authdata.token,
        UserId: Number(authdata.id),
      };

      const payload = {
        ...payloadBase,
        CurrentPassword: FormData.current,
        NewPassword: FormData.new, // This creates Name: value, UserName: value, etc.
      };

      const response = await http.put(url, payload);

      Cookies.set("id", "");
      Cookies.set("token", "");
      window.location.reload();
      return response;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  UpdateUserAvatar: async (photoBase64: string) => {
    const authdata = getAuth();
    if (!authdata) {
      window.location.reload();
      return;
    }
    try {
      const payload = {
        Token: authdata.token,
        UserId: authdata.id,
        PhotoBase64: photoBase64,
      };

      const response = await http.put("/useravatar/avatar", payload);
      return response.data;
    } catch (err: any) {
      console.error(err);
      let errorMessage = "Failed to update avatar";

      if (err.message) {
        const match = err.message.match(
          /Error: Server error: (.*?)(?: code:|$)/
        );
        if (match && match[1]) {
          errorMessage = match[1].trim();
        }
      }

      throw new Error(errorMessage);
    }
  },
};
export default userActions;
