import express from "express";
import {
  signup,
  login,
  logout,
  updateProfile,
  checkAuth,
} from "../controllers/auth_controller.js";
import { protextRoute } from "../middleware/auth_middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protextRoute, logout);

router.put("/update_profile", protextRoute, updateProfile);

router.get("/check", protextRoute, checkAuth);

export default router;
