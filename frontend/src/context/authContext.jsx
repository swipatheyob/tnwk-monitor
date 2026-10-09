/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState
} from "react";

const AuthContext =
  createContext();

export const AuthProvider = ({
  children
}) => {

  const [user, setUser] =
    useState(() => {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    });

  const [token, setToken] =
    useState(
      localStorage.getItem("token")
    );

  const login = (
    userData,
    tokenData
  ) => {

    localStorage.setItem(
      "token",
      tokenData
    );

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    setToken(tokenData);

    setUser(userData);
  };

  const logout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    setUser(null);

    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);
