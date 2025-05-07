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
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/me`, {
                withCredentials: true
            });
            if (data && data.user) {
                setUser(data.user);
                setIsAuth(true);
            } else {
                console.error("Invalid user data received:", data);
                setIsAuth(false);
                setUser(null);
            }
        } catch (error) {
            console.error("Fetch user error:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setIsAuth(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const registerUser = async (name, email, password, navigate) => {
        setBtnLoading(true);
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/register`, 
                { name, email, password },
                { withCredentials: true }
            );
            if (data && data.user) {
                setUser(data.user);
                setIsAuth(true);
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
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/login`,
                { email, password },
                { withCredentials: true }
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
        fetchUser // Expose fetchUser for manual refresh if needed
    }), [btnLoading, isAuth, user, loading]);

    return (
        <UserContext.Provider value={contextValue}>
            <Toaster position="top-right" />
            {children}
        </UserContext.Provider>
    );
};

export const UserData = () => useContext(UserContext);
