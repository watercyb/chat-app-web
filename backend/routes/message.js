import express from "express";
import { protextRoute } from "../middleware/auth_middleware.js";
import {
  getMessages,
  getUsersForSideBar,
  sendMessage,
} from "../controllers/message_controller.js";

const router = express.Router();

router.get("/users", protextRoute, getUsersForSideBar);
router.get("/:id", protextRoute, getMessages);

router.post("/send/:id", protextRoute, sendMessage);

export default router;
