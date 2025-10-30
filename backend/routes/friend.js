import express from "express";
import { protextRoute } from "../middleware/auth_middleware.js";
import { getFriends } from "../controllers/friend_controller.js";

const router = express.Router();

router.get("/users", protextRoute, getFriends);

export default router;
