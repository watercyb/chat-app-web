import mongoose from "mongoose";
import User from "./models/user_model.js";
import Message from "./models/message_model.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
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
  return await User.findOne({ email });
};

export const createUser = async (fullName, email, password, id) => {
  let newUser;
  if (id) {
    newUser = new User({ _id: id, fullName, email, password });
  } else {
    newUser = new User({ fullName, email, password });
  }
  await newUser.save();
  return newUser;
};

export const findByIdAndUpdate = async (userId, url) => {
  return User.findByIdAndUpdate(
    userId,
    { profilePic: url },
    { new: true }
  ).select("-password");
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
