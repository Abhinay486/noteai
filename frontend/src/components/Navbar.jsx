import React, { useState, useEffect } from "react";
import { Menu, X, Home, FileText, Settings, User, LogOut } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { UserData } from "../context/UserContext";
import axios from "axios";
import toast from "react-hot-toast";
const VITE_API_URL="https://noteai-aukb.onrender.com";

const Navbar = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userInitial = user && user.name ? user.name[0].toUpperCase() : "?";
  const navigate = useNavigate();
  const { setIsAuth, setUser } = UserData();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const logOutHand = async () => {
    try {
      await axios.get(`${VITE_API_URL}/api/logout`, {
        withCredentials: true,
        credentials: "include"
      });
      setIsAuth(false);
      setUser(null);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
      setIsAuth(false);
      setUser(null);
      navigate("/login");
    }
  };

  // Close mobile menu when window resizes to desktop view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMenuOpen]);

  const navLinks = [
    { name: "Home", icon: <Home size={18} />, path: "/" },
    { name: "My Notes", icon: <FileText size={18} />, path: "/notes" },
    { name: "Settings", icon: <Settings size={18} />, path: "/settings" },
    { name: "Profile", icon: <User size={18} />, path: "/profile" }
  ];
   
  return (
    <nav className={`bg-white ${scrolled ? 'shadow-md' : ''} sticky top-0 z-50 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">Notes</span>
            </div>
          </div>

          {/* Desktop Navigation Menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                <span className="mr-1">{link.icon}</span>
                {link.name}
              </Link>
            ))}
          </div>
          
          {/* Right side - User profile and logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800">
                {userInitial}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden lg:block">
                {user?.name || "User"}
              </span>
            </div>
            
            <button
              onClick={logOutHand}
              className="hidden md:flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-150"
            >
              <LogOut size={16} className="mr-1" />
              Logout
            </button>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute w-full bg-white shadow-lg border-t">
          <div className="px-4 pt-4 pb-4 space-y-3">
            {/* User info */}
            <div className="flex items-center space-x-3 py-3 border-b border-gray-200">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-800">
                {userInitial}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.name || "User"}
              </span>
            </div>
            
            {/* Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center text-gray-600 hover:text-blue-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-3">{link.icon}</span>
                {link.name}
              </Link>
            ))}
            
            {/* Logout button */}
            <button
              onClick={() => {
                setIsMenuOpen(false);
                logOutHand();
              }}
              className="w-full flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-150 mt-2"
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;