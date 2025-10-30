import {
  getAllUsers,
} from "../database/db.js";

export const getFriends = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const fileteredUsers = await getAllUsers(loggedInUserId);

    res.status(200).json(fileteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSideBar: ", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};