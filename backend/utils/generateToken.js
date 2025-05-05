import jwt from "jsonwebtoken";

const generateToken = (id, res) => {
    const token = jwt.sign({ id }, process.env.JWT_SEC, {
        expiresIn: "15d",
    });

    res.cookie("token", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/", // Add path to ensure cookie is sent with all requests
    });

    return token; // Return the token
};

export default generateToken;
