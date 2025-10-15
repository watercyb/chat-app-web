import cloudinary from "../lib/cloudinary.js";
import { findByIdAndUpdate } from "../database/db.js";
import { disconnectByUserId } from "../lib/socket.js";

export const { signup, login } = await import("../auth/auth.js");

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.cookie("idToken", "", { maxAge: 0 });
    res.cookie("refreshToken", "", { maxAge: 0 });
    disconnectByUserId(req.user._id);
    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.log("Error in logout controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;
    if (!profilePic)
      return res.status(400).json({ message: "Profile pic is required." });

    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      folder: "react_chat",
      public_id: userId,
      overwrite: true,
    });

    const updateUser = await findByIdAndUpdate(
      userId,
      uploadResponse.secure_url
    );

    res.status(200).json(updateUser);
  } catch (error) {
    console.log("Error in update profile: ", error.message);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in chechAuth controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error." });
  }
};
