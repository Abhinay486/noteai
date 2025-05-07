import express from 'express';
import dotenv from 'dotenv';
import connectDb from './database/db.js'; // Ensure you have a proper DB connection handler
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Initialize dotenv to load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware for parsing JSON and cookies
app.use(express.json());
app.use(cookieParser());

// CORS setup
const allowedOrigins = [
    'http://localhost:5173',  // Development
    'https://notes1ai.vercel.app'  // Production
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Import routes (Make sure you have your userRoutes.js file set up correctly)
import userRoutes from './routes/userRoutes.js';
app.use("/api", userRoutes);


// Example unprotected route
app.get("/", (req, res) => {
    res.send("Hello World!");  // Basic route for testing
});


if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    });
  }
// Start server and connect to database
app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    await connectDb();  // Assuming you have a function to connect to your DB
});
