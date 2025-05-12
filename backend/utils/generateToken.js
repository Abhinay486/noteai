import jwt from "jsonwebtoken";

const generateToken = (id, res) => {
    // Correct usage of the passed 'id' variable
    const token = jwt.sign({ id }, process.env.JWT_SEC, {
        expiresIn: "15d",  // Set expiration time
    });

    // Set token in cookies
    res.cookie("token", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000,  // 15 days in milliseconds
        httpOnly: true,  // Ensures the cookie is sent only through HTTP(S)
        sameSite: 'lax',  // Helps mitigate CSRF attacks
        secure: process.env.NODE_ENV === "production",  // Only set cookie over HTTPS in production
        path: "/",  // Available across the entire app
        domain: process.env.COOKIE_DOMAIN,  // Optional: Set for production domain (if needed)
    });

    return token;  // Return the token for usage if needed
};

export default generateToken;
