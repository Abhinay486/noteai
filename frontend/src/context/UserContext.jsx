// context/UserProvider.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
const VITE_API_URL= import.meta.env.VITE_API_URL || "http://localhost:5000";

axios.defaults.withCredentials = true;

const UserContext = createContext();

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
  </div>
);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
      fetchUser();
  }, []);
  

  const fetchUser = async () => {
    try {
      const { data } = await axios.get(`${VITE_API_URL}/api/me`, {
        withCredentials: true,
        credentials: "include",
      });
      setUser(data.user);
      setIsAuth(true);
    } catch (error) {
      if (error.response?.status === 401) {
        // Try to refresh the token
        try {
          setIsRefreshing(true);
          await axios.post(`${VITE_API_URL}/api/refresh`, {}, {
            withCredentials: true,
            credentials: "include",
          });
          // Retry fetching user data after successful refresh
          const { data } = await axios.get(`${VITE_API_URL}/api/me`, {
            withCredentials: true,
            credentials: "include",
          });
          setUser(data.user);
          setIsAuth(true);
        } catch (refreshError) {
          console.error("Token refresh failed", refreshError);
          setUser(null);
          setIsAuth(false);
        } finally {
          setIsRefreshing(false);
        }
      } else {
        console.error("Auth check failed", error.response?.data || error.message);
        setUser(null);
        setIsAuth(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Add token refresh interval
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      if (isAuth) {
        try {
          setIsRefreshing(true);
          await axios.post(`${VITE_API_URL}/api/refresh`, {}, {
            withCredentials: true,
            credentials: "include",
          });
        } catch (error) {
          console.error("Token refresh failed", error);
          setUser(null);
          setIsAuth(false);
        } finally {
          setIsRefreshing(false);
        }
      }
    }, 14 * 60 * 1000); // Refresh every 14 minutes (before 15-minute expiry)

    return () => clearInterval(refreshInterval);
  }, [isAuth]);

  const registerUser = async (name, email, password, navigate) => {
    setBtnLoading(true);
    try {
      const res = await fetch(`${VITE_API_URL}/api/users/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      setUser(data.user);
      setIsAuth(true);
      toast.success("Registered successfully");
      navigate("/");
    } catch {
      toast.error("Registration failed");
    } finally{
      setBtnLoading(false);
    }
  };

  const loginUser = async (email, password, navigate) => {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${VITE_API_URL}/api/users/login`,
        { email, password },
        { 
          credentials: "include",
          withCredentials: true 
        }
      );
      
      // Fetch user data immediately after successful login
      await fetchUser();
      
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
      await axios.get(`${VITE_API_URL}/api/logout`, {
        credentials: "include",
      });
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
        setUser,
        btnLoading,
        loginUser,
        registerUser,
        logOut,
        setIsAuth,
        fetchUser,
      }}
    >
      <Toaster position="top-right" />
      {(loading || isRefreshing) && <LoadingSpinner />}
      {children}
    </UserContext.Provider>
  );
};

export const UserData = () => useContext(UserContext);
