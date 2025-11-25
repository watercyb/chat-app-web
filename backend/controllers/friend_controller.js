import {
  getAllFriends,
  friendRequest,
  friendRequestResponse,
  randomUsers,
} from "../database/db.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getFriends = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const fileteredUsers = await getAllFriends(loggedInUserId);

    res.status(200).json(fileteredUsers);
  } catch (error) {
    console.error("Error in getFriends: ", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getSuggestion = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const suggestFriends = await randomUsers(loggedInUserId);

    res.status(200).json(suggestFriends);
  } catch (error) {
    console.error("Error in getSuggestion: ", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const request = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const { recipientId } = req.body;
    const re = await friendRequest(loggedInUserId, recipientId);

    if (re.message) {
      const socketIds = getReceiverSocketId(recipientId);
      if (socketIds) {
        socketIds.forEach((socketId) => {
          io.to(socketId).emit("newFriendRequest");
        });
      }
    }

    res.status(200).json(re);
  } catch (error) {
    console.error("Error in friendRequest: ", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const response = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const { requesterId, accept } = req.body;

    const re = await friendRequestResponse(requesterId, loggedInUserId, accept);

    if (re.message) {
      const socketIds = getReceiverSocketId(requesterId);
      if (socketIds) {
        socketIds.forEach((socketId) => {
          io.to(socketId).emit("newFriendResponse", {
            user: req.user,
            accept,
          });
        });
      }
    }

    res.status(200).json(re);
  } catch (error) {
    console.error("Error in friendResponse: ", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};
