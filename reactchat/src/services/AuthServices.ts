import axios from "axios";
import { useState } from "react";
import { AuthServiceProps } from "../@types/auth-service";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";

export function useAuthService(): AuthServiceProps {
  // const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
  //   const loggedIn = localStorage.getItem("isLoggedIn");
  //   if (loggedIn !== null) {
  //     return Boolean(loggedIn);
  //   } else {
  //     return false;
  //   }
  // });

  const navigate = useNavigate();

  const getInitialLoggedInValue = () => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    return loggedIn !== null && loggedIn === "true";
  };

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    getInitialLoggedInValue
  );

  const getUserDetails = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      // const accessToken = localStorage.getItem("access_token");
      const response = await axios.get(
        `http://127.0.0.1:8000/api/account/?user_id=${userId}`,
        { withCredentials: true }
      );
      // {
      //   headers: {
      //     Authorization: `Bearer ${accessToken}`,
      //   },
      // }

      const userDetails = response.data;
      localStorage.setItem("username", userDetails.username);
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");
    } catch (err: any) {
      setIsLoggedIn(false);
      localStorage.setItem("isLoggedIn", "false");
      return err;
    }
  };
  // const getUserIdFromToken = (access: string) => {
  //   const token = access;
  //   const tokenParts = token.split(".");
  //   const encodedPayLoad = tokenParts[1];
  //   // decode base64 encoded string
  //   // ascii to binary
  //   const decodedPayLoad = atob(encodedPayLoad);
  //   const payLoadData = JSON.parse(decodedPayLoad);
  //   const userId = payLoadData.user_id;

  //   return userId;
  // };

  const register = async (username: string, password: string) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/register/",
        {
          username,
          password,
        },
        { withCredentials: true }
      );
      return response.status;
    } catch (err: any) {
      return err.response.status;
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/token/",
        {
          username,
          password,
        },
        { withCredentials: true }
      );
      console.log(response);
      console.log(response.headers["set-cookie"]);
      // const { access, refresh } = response.data;

      // localStorage.setItem("access_token", access);
      // localStorage.setItem("refresh_token", refresh);
      // localStorage.setItem("userId", getUserIdFromToken(access));
      // console.log(response.data);
      const user_id = response.data.user_id;
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user_id", user_id);
      setIsLoggedIn(true);
      getUserDetails();
    } catch (err: any) {
      return err.response.status;
    }
  };

  const refreshAccessToken = async () => {
    try {
      await axios.post(
        `${BASE_URL}/token/refresh/`,
        {},
        { withCredentials: true }
      );
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  };

  const logout = async () => {
    // localStorage.removeItem("access_token");
    // localStorage.removeItem("refresh_token");
    // localStorage.removeItem("userId");
    // localStorage.removeItem("username");
    localStorage.setItem("isLoggedIn", "false");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    navigate("/login");

    try {
      await axios.post(`${BASE_URL}/logout/`, {}, { withCredentials: true });
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  };
  return { login, isLoggedIn, logout, refreshAccessToken, register };
}

export default useAuthService;
