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
};

export default AuthService;
