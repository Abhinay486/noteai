import jwt from "jsonwebtoken";

const generateToken = (userId) => {
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "15m", // Access token expires in 15 minutes
      });
      const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d", // Refresh token expires in 7 days
      });
      return { accessToken, refreshToken };
};

export default generateToken;
