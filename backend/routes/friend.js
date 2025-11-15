import express from "express";
import { protextRoute } from "../middleware/auth_middleware.js";
import {
  getFriends,
  getSuggestion,
  request,
  response,
} from "../controllers/friend_controller.js";

const router = express.Router();

router.get("/users", protextRoute, getFriends);
router.get("/suggestion", protextRoute, getSuggestion);
router.post("/request", protextRoute, request);
router.post("/response", protextRoute, response);

export default router;
