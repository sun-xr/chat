import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // todo utils.js create a cookie named jwt
    // todo and cookieParser api in index.js
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({
        message: "No token found",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }
    // todo utils.js  jwt sign(userId, res)
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
     res.status(500).json({
      message: "Internal server error",
    });
  }
};
