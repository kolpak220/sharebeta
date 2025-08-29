import { getAuth } from "@/lib/utils";
import http from "../lib/http";

export interface AuthPayload {
  UserName: string;
  Password: string;
  HCaptchaToken: string;
}

export const AuthService = {
  register: async (payload: AuthPayload) => {
    try {
      const url = "/UserAccount/register";
      const response = await http.post(url, payload);
      return response.data;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  },
  login: async (payload: AuthPayload) => {
    try {
      const url = "/UserAccount/login";
      const response = await http.post(url, payload);
      return response.data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },
  checkSession: async () => {
    const authdata = getAuth();
    if (!authdata) {
      window.location.reload();
      return;
    }
    try {
      const url = "/useraccount/validate";

      const payload = {
        Token: authdata.token,
        UserId: authdata.id,
      };

      const res = await http.post(url, payload);

      return res.data;
    } catch (error) {
      return false;
    }
  },
};

export default AuthService;
