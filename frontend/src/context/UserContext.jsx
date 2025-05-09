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
        console.log('Initial token check:', token ? 'Token exists' : 'No token found');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log('Authorization header set:', axios.defaults.headers.common['Authorization']);
        }
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Fetching user with token:', token ? 'Token exists' : 'No token found');
            
            if (!token) {
                console.log('No token found, skipping user fetch');
                setIsAuth(false);
                setUser(null);
                setLoading(false);
                return;
            }

            // Set the token in axios headers before making the request
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log('Making request with headers:', axios.defaults.headers.common);
            
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/me`, {
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (data && data.user) {
                setUser(data.user);
                setIsAuth(true);
            } else {
                console.error("Invalid user data received:", data);
                setIsAuth(false);
                setUser(null);
                localStorage.removeItem('token'); // Clear invalid token
            }
        } catch (error) {
            console.error("Fetch user error:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            // If token is invalid or expired, clear it
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization'];
            }
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
        console.log("Attempting login to:", import.meta.env.VITE_API_URL);
        setBtnLoading(true);
        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/users/login`,
                { email, password },
                { withCredentials: true }
            );
            if (data && data.user && data.token) {
                console.log('Login successful, storing token');
                localStorage.setItem("token", data.token); 
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                setUser(data.user);
                setIsAuth(true);
                toast.success("Login Successful");
                navigate("/");
            } else {
                console.error('Login response missing required data:', data);
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
