import mongoose from "mongoose";
import User from "./models/user_model.js";
import Message from "./models/message_model.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("mongedb connected.");
  } catch (error) {
    console.log("mongedb connecting error:" + error);
  }
};

export const getAllUsers = async (avoidId) => {
  return await User.find({ _id: { $ne: avoidId } }).select("-password");
};

export const getUserById = async (userId) => {
  return await User.findById(userId).select("-password");
};

export const getUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user;
};

export const createUser = async (fullName, email, password) => {
  const newUser = new User({ fullName, email, password });
  await newUser.save();
  return newUser;
};

export const getMessagesByIds = async (myId, userToChatId) => {
  if (!mongoose.Types.ObjectId.isValid(userToChatId)) return null;

  return await Message.find({
    $or: [
      { senderId: myId, receiverId: userToChatId },
      { senderId: userToChatId, receiverId: myId },
    ],
  });
};

export const createMessage = async (senderId, receiverId, text, image) => {
  const newMessage = new Message({
    senderId,
    receiverId,
    text,
    image,
  });
  await newMessage.save();
  return newMessage;
};
