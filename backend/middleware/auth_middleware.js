import jwt from "jsonwebtoken";
import User from "../models/user_model.js";

export const protextRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(400).json({ message: "Please login first." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded)
      return res.status(400).json({ message: "Please login first." });

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(400).json({ message: "Please login first." });

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};
