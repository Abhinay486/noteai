import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';

export const isAuth = async (req, res, next) => {
    try {
        // Check for token in cookies or Authorization header
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                message: 'Please Login'
            });
        }

        // Decode and verify the token
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);

        // If token is expired or invalid, jwt.verify will throw an error
        req.user = await User.findById(decodedData.id);
        if (!req.user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        next();
    } catch (error) {
        // Handling different JWT errors explicitly
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                message: 'Token expired'
            });
        } else if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                message: 'Invalid token'
            });
        }

        // Generic catch if something else fails
        res.status(500).json({
            message: 'Internal server error'
        });
    }
};

