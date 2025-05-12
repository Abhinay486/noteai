// context/UserProvider.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/me`, {
        withCredentials: true
      });
      setUser(data.user);
      setIsAuth(true);
    } catch (error) {
      console.error("Auth check failed", error.response?.data || error.message);
      setUser(null);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (name, email, password, navigate) => {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/register`,
        { name, email, password }
      );
      setUser(data.user);
      setIsAuth(true);
      toast.success("Registered successfully");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setBtnLoading(false);
    }
  };

  const loginUser = async (email, password, navigate) => {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/login`,
        { email, password },
        { withCredentials: true }
      );
      setUser(data.user);
      setIsAuth(true);
      toast.success("Login successful");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setBtnLoading(false);
    }
  };

  const logOut = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_URL}/api/users/logout`);
      setUser(null);
      setIsAuth(false);
      toast.success("Logged out");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuth,
        loading,
        btnLoading,
        loginUser,
        registerUser,
        logOut,
        fetchUser,
      }}
    >
      <Toaster position="top-right" />
      {children}
    </UserContext.Provider>
  );
};

export const UserData = () => useContext(UserContext);
