import React, { useState } from 'react';
        import { Link, useNavigate } from "react-router-dom";
        import { UserData } from '../context/UserContext';
        import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
        
        // Spinner component for loading states
        const LoadingSpinner = () => (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          </div>
        );
        // Login Page Component
        
        export const Login = () => {
          const [email, setEmail] = useState('');
          const [password, setPassword] = useState('');
          const [showPassword, setShowPassword] = useState(false);
          const [rememberMe, setRememberMe] = useState(false);
          const { loginUser, btnLoading } = UserData();
          const navigate = useNavigate();
        
          const submitHandler = (e) => {
            e.preventDefault();
            loginUser(email, password, navigate);
          };
        
          return (
            <div className="min-h-screen flex flex-col md:flex-row">
              {/* Left side with background image and overlay */}
              <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-red-500 to-red-700 relative">
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12">
                  <h1 className="text-4xl font-bold mb-6">Welcome Back</h1>
                  <p className="text-xl max-w-md text-center mb-8">
                    Log in to your account to access your personalized notes and collections
                  </p>
                  <div className="w-16 h-1 bg-white rounded-full"></div>
                </div>
              </div>
        
              {/* Right side with login form */}
              <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 p-6">
                <div className="w-full max-w-md">
                  <div className="text-center mb-10">
                    <div className="mx-auto h-12 w-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-white font-bold text-2xl">N</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Sign in to NOTE</h2>
                    <p className="mt-2 text-sm text-gray-600">
                      Your personal idea space
                    </p>
                  </div>
        
                  <form onSubmit={submitHandler} className="space-y-6">
                    {/* Email field */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail size={18} className="text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
        
                    {/* Password field */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock size={18} className="text-gray-400" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Enter your password"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
        
                    {/* Remember me and forgot password */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                          Remember me
                        </label>
                      </div>
                      <div className="text-sm">
                        <Link to="/forgot-password" className="font-medium text-red-600 hover:text-red-500">
                          Forgot your password?
                        </Link>
                      </div>
                    </div>
        
                    {/* Submit button */}
                    <div>
                      <button
                        type="submit"
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150"
                        disabled={btnLoading}
                      >
                        {btnLoading ? <LoadingSpinner /> : (
                          <>
                            <span className="flex-1 text-center">Sign in</span>
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
        
                  {/* Sign up link */}
                  <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{" "}
                      <Link to="/register" className="font-medium text-red-600 hover:text-red-500">
                        Sign up for free
                      </Link>
                    </p>
                  </div>
        
                  {/* Social login options */}
                  <div className="mt-8">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                      </div>
                    </div>
        
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                      </button>
                      <button 
                        type="button"
                        className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <svg className="h-5 w-5 text-blue-500" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12" fillRule="evenodd" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        };
        
        export default Login;