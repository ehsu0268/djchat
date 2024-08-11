import axios, { AxiosInstance } from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import useAuthService from "../services/AuthServices";
//const API_BASE_URL = BASE_URL;

const useAxiosWithInterceptor = () => {
  const jwtAxios = axios.create({});
  const navigate = useNavigate();
  const { logout } = useAuthService();

  jwtAxios.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 || 403) {
        axios.defaults.withCredentials = true;
        //const refreshToken = localStorage.getItem("refresh_token");
        //if (refreshToken) {
        try {
          const response = await axios.post(
            "http://127.0.0.1:8000/api/token/refresh/"
          );
          // const newAccessToken = refreshResponse.data.access;
          // localStorage.setItem("access_token", newAccessToken);
          // originalRequest.headers[
          //   "Authorization"
          // ] = `Bearer ${newAccessToken}`;
          if (response["status"] == 200) {
            return jwtAxios(originalRequest);
          }
        } catch (refreshError) {
          logout();
          const goLogin = () => navigate("/login");
          goLogin();
          return Promise.reject(refreshError);
        }
      }
    }
  );
  return jwtAxios;
};

export default useAxiosWithInterceptor;
