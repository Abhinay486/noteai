import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { UserData } from '../context/UserContext';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordError, setPasswordError] = useState('');

    const { registerUser, btnLoading } = UserData();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Check password strength when password field changes
        if (name === 'password') {
            checkPasswordStrength(value);
        }
    };

    const checkPasswordStrength = (password) => {
        // Reset password error
        setPasswordError('');
        
        // Initial strength score
        let strength = 0;
        
        // If password is empty, set strength to 0
        if (password.length === 0) {
            setPasswordStrength(0);
            return;
        }
        
        // Check length
        if (password.length >= 8) strength += 1;
        
        // Check for mixed case
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
        
        // Check for numbers
        if (password.match(/\d/)) strength += 1;
        
        // Check for special characters
        if (password.match(/[^a-zA-Z\d]/)) strength += 1;
        
        setPasswordStrength(strength);
        
        // Set error message if strength is less than 3
        if (password.length > 0 && strength < 3) {
            setPasswordError('Password should be at least 8 characters with uppercase, lowercase, numbers and special characters');
        }
    };

    const getStrengthColor = () => {
        switch (passwordStrength) {
            case 0: return 'bg-gray-200';
            case 1: return 'bg-red-500';
            case 2: return 'bg-orange-500';
            case 3: return 'bg-yellow-500';
            case 4: return 'bg-green-500';
            default: return 'bg-gray-200';
        }
    };

    const submitHandler = (e) => {
        e.preventDefault();
        
        // Validation checks
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match");
            return;
        }
        
        if (passwordStrength < 3) {
            alert("Please create a stronger password");
            return;
        }
        
        if (!agreeToTerms) {
            alert("Please agree to Terms & Conditions");
            return;
        }
        
        registerUser(formData.name, formData.email, formData.password, navigate);
    };

    // Loading component
    const LoadingAnimation = () => (
        <div className="flex justify-center">
            <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left side - Brand/Image */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 text-white p-12 flex-col justify-between">
                <div>
                    <h1 className="text-3xl font-bold">NOTE</h1>
                    <p className="mt-2 text-blue-100">Your personal notes platform</p>
                </div>
                
                <div className="space-y-6">
                    <h2 className="text-4xl font-bold">Join Our Community</h2>
                    <p className="text-xl text-blue-100">Create, organize, and share your ideas effortlessly.</p>
                    
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <CheckCircle className="text-blue-200" size={20} />
                            <p>Unlimited notes and collections</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <CheckCircle className="text-blue-200" size={20} />
                            <p>Sync across all your devices</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <CheckCircle className="text-blue-200" size={20} />
                            <p>Collaborate with friends and colleagues</p>
                        </div>
                    </div>
                </div>
                
                <p className="text-sm text-blue-200">© 2025 NOTE. All rights reserved.</p>
            </div>
            
            {/* Right side - Registration form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-gray-50">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Create an Account</h2>
                        <p className="mt-2 text-gray-600">Join thousands of users organizing their thoughts</p>
                    </div>
                    
                    <form onSubmit={submitHandler} className="mt-8 space-y-6">
                        <div className="space-y-4">
                            {/* Name field */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-3 border"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                            
                            {/* Email field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-3 border"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>
                            
                            {/* Password field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="pl-10 pr-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-3 border"
                                        placeholder="Create a strong password"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Password strength meter */}
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${getStrengthColor()}`} 
                                                style={{ width: `${passwordStrength * 25}%` }}
                                            ></div>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {passwordStrength === 0 && "Enter password"}
                                            {passwordStrength === 1 && "Weak password"}
                                            {passwordStrength === 2 && "Fair password"}
                                            {passwordStrength === 3 && "Good password"}
                                            {passwordStrength === 4 && "Strong password"}
                                        </p>
                                        {passwordError && <p className="mt-1 text-xs text-red-500">{passwordError}</p>}
                                    </div>
                                )}
                            </div>
                            
                            {/* Confirm Password field */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="pl-10 pr-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-3 border"
                                        placeholder="Confirm your password"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <p className="mt-1 text-xs text-red-500">Passwords don't match</p>
                                )}
                            </div>
                            
                            {/* Terms and conditions */}
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        checked={agreeToTerms}
                                        onChange={() => setAgreeToTerms(!agreeToTerms)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="font-medium text-gray-700">
                                        I agree to the <a href="/terms" className="text-blue-600 hover:text-blue-500">Terms of Service</a> and <a href="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <button
                                type="submit"
                                disabled={btnLoading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                            >
                                {btnLoading ? <LoadingAnimation /> : (
                                    <>
                                        Sign up
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                    
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
