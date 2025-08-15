import axios from "axios";
import http from "../lib/http";

export interface AuthPayload {
  UserName: string;
  Password: string;
  HCaptchaToken: string;
}

export const AuthService = {
  register: async (payload: AuthPayload) => {
    console.log(2)
    try {
      const url = "/api/UserAccount/register";
      const response = await axios.post(url, payload);
      console.log(response)
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
};

export default AuthService;
