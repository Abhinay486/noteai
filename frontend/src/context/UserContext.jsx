import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { CloudCog } from "lucide-react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuth, setIsAuth] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log("No token found");
                setIsAuth(false);
                setUser(null);
                setLoading(false);
                return;
            }

            console.log("Fetching user data with token:", token.substring(0, 10) + "...");
            
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/me`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            
            console.log("User data received:", data);
            
            if (data && data.user) {
                setUser(data.user);
                setIsAuth(true);
                console.log("User authenticated:", data.user.name);
            } else {
                console.error("Invalid user data received:", data);
                setIsAuth(false);
                setUser(null);
                toast.error("Session expired. Please login again.");
            }
        } catch (error) {
            console.error("Fetch user error:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setIsAuth(false);
            setUser(null);
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                localStorage.removeItem('token');
            }
        } finally {
            setLoading(false);
        }
    };

    const registerUser = async (name, email, password, navigate) => {
        setBtnLoading(true);
        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/register`, 
                { name, email, password },
                { 
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            
            if (data && data.user) {
                setUser(data.user);
                setIsAuth(true);
                localStorage.setItem("token", data.token);
                toast.success("Registration Successful");
                navigate("/");
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error) {
            console.error("Registration error:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setBtnLoading(false);
        }
    };

    const loginUser = async (email, password, navigate) => {
        setBtnLoading(true);
        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/login`,
                { email, password },
                { 
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            
            console.log("Login response data:", data);
            
            if (data && data.user) {
                setUser(data.user);
                setIsAuth(true);
                localStorage.setItem("token", data.token);
                toast.success("Login Successful");
                navigate("/");
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error) {
            console.error("Login error:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            setBtnLoading(false);
        }
    };

    const contextValue = useMemo(() => ({
        loginUser,
        registerUser,
        btnLoading,
        isAuth,
        setIsAuth,
        setUser,
        user,
        loading,
        fetchUser
    }), [btnLoading, isAuth, user, loading]);

    return (
        <UserContext.Provider value={contextValue}>
            <Toaster position="top-right" />
            {children}
        </UserContext.Provider>
    );
};

export const UserData = () => useContext(UserContext);
