import { getMessagesByIds, createMessage } from "../database/db.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getMessages = async (req, res) => {
  try {
    const messages = await getMessagesByIds(req.user._id, req.params.id);
    if (!messages) return res.status(400).json({ message: "Invalid user ID." });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "react_chat/" + senderId,
      });
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await createMessage(
      senderId,
      receiverId,
      text,
      imageUrl
    );

    const senderSocketIds = getReceiverSocketId(senderId);
    if (senderSocketIds) {
      senderSocketIds.forEach((senderSocketId) => {
        io.to(senderSocketId).emit("newMessage", newMessage);
      });
    }

    const receiverSocketIds = getReceiverSocketId(receiverId);
    if (receiverSocketIds) {
      receiverSocketIds.forEach((receiverSocketId) => {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};
