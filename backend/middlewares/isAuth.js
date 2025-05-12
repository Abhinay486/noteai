// middlewares/auth.js
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';

export const isAuth = async (req, res, next) => {
    try {
        // Check for token in cookies or Authorization header
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login.',
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SEC);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Optional: Refresh token if less than 1 hour left
        const expiresInMs = decoded.exp * 1000;
        const oneHour = 60 * 60 * 1000;
        if (expiresInMs - Date.now() < oneHour) {
            const newToken = jwt.sign({ id: user._id }, process.env.JWT_SEC, {
                expiresIn: '15d',
            });

            res.cookie('token', newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 15 * 24 * 60 * 60 * 1000,
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please login again.',
        });
    }
};
