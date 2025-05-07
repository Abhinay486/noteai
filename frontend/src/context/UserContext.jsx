import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuth, setIsAuth] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    // Set Axios default auth header from localStorage (on page load/reload)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
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
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/users/register`, 
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
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/users/login`,
                { email, password },
                { withCredentials: true }
            );
            if (data && data.user) {
                localStorage.setItem("token", data.token); 
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                setUser(data.user);
                setIsAuth(true);
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
