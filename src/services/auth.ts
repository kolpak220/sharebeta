import http from "../lib/http";

export interface AuthPayload {
  UserName: string;
  Password: string;
}

export const AuthService = {
  register: async (payload: AuthPayload) => {
    const url = "/UserAccount/register";
    const response = await http.post(url, payload);
    return response.data;
  },
  login: async (payload: AuthPayload) => {
    const url = "/UserAccount/login";
    const response = await http.post(url, payload);
    return response.data;
  },
};

export default AuthService;
