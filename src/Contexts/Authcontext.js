import { createContext, useEffect, useState } from "react";
import axios from "axios";
import qs from "qs";

import { accessTokenRequest } from "../Token/getToken";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [token, setToken] = useState("test");

  const onRefreshToken = async (callback = () => {}) => {
    console.log("refresh token");
    accessTokenRequest().then((accessToken) => {
      setToken(accessToken);
      console.log(accessToken);
      callback();
    });
  };

  useEffect(() => {
    onRefreshToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{ token: token, refreshToken: onRefreshToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};
