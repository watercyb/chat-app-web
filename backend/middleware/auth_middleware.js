import { getUserById } from "../database/db.js";
import { verifyToken } from "../auth/auth.js";

export const protextRoute = async (req, res, next) => {
  try {
    const userId = await verifyToken(req.cookies, res);
    if (!userId)
      return res.status(400).json({ message: "Please login first." });

    const user = await getUserById(userId);
    if (!user) return res.status(400).json({ message: "Please login first." });

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};
