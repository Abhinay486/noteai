import express from 'express';
import dotenv from 'dotenv';
import connectDb from './database/db.js'; // Ensure you have a proper DB connection handler
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Initialize dotenv to load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware for parsing JSON and cookies
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// CORS setup - allow frontend requests from localhost:5173 (your React app)
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie']
  }));
  


// Import routes (Make sure you have your userRoutes.js file set up correctly)
import userRoutes from './routes/userRoutes.js';
app.use("/api", userRoutes);


// Example unprotected route
app.get("/", (req, res) => {
    res.send("Hello World!");  // Basic route for testing
});

// Start server and connect to database
app.listen(port,'0.0.0.0', async () => {
    console.log(`Server running on port ${port}`);
    await connectDb();  // Assuming you have a function to connect to your DB
});