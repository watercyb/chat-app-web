import mongoose from "mongoose";
import User from "./models/user_model.js";
import Message from "./models/message_model.js";
import Friend from "./models/friend_model.js";
import { v4 as uuidv4 } from "uuid";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("mongedb connected.");
  } catch (error) {
    console.log("mongedb connecting error:" + error);
  }
};

export const getAllFriends = async (userId) => {
  const friends = await Friend.find({
    status: "accepted",
    $or: [{ requester: userId }, { recipient: userId }],
  }).populate("requester recipient", "-password");

  const friendUsers = friends.map((f) =>
    f.requester._id.toString() === userId.toString() ? f.recipient : f.requester
  );

  return friendUsers;
};

export const getUserById = async (userId) => {
  return await User.findById(userId).select("-password");
};

export const getUserByEmail = async (email) => {
  return await User.findOne({ email });
};

export const createUser = async (fullName, email, password, id) => {
  const newUser = new User({ _id: id || uuidv4(), fullName, email, password });
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

export const friendRequest = async (requesterId, recipientId) => {
  if (requesterId === recipientId)
    return { error: "You can't send a friend request to yourself." };

  const recipient = await User.findById(recipientId);
  if (!recipient) return { error: "That user doesn't exist." };

  const req = await Friend.findOne({
    requester: requesterId,
    recipient: recipientId,
  });
  if (req)
    return {
      error:
        req.status === "accepted"
          ? "You're already friends!"
          : "You've already sent a friend request. Please wait for them to respond.",
    };

  const rec = await Friend.findOne({
    requester: recipientId,
    recipient: requesterId,
  });
  if (rec) {
    if (rec.status === "accepted") return { error: "You're already friends!" };

    rec.status = "accepted";
    await rec.save();
    return { message: "Friend request accepted! You're now friends." };
  }

  const newRequest = new Friend({
    requester: requesterId,
    recipient: recipientId,
  });

  await newRequest.save();

  return { message: "Friend request sent successfully." };
};

export const friendRequestResponse = async (
  requesterId,
  recipientId,
  accept
) => {
  const req = await Friend.findOne({
    requester: requesterId,
    recipient: recipientId,
  });

  if (!req) return { error: "Friend request not found." };
  if (req.status === "accepted") return { error: "You're already friends." };

  if (accept) {
    req.status = "accepted";
    await req.save();
    return { message: "Friend request accepted! You're now friends." };
  } else {
    await req.deleteOne();
    return { message: "Friend request declined." };
  }
};

export const randomUsers = async (userId) => {
  const [friends, sentRequests, receivedRequests] = await Promise.all([
    Friend.find({
      status: "accepted",
      $or: [{ requester: userId }, { recipient: userId }],
    }).select("requester recipient -_id"),

    Friend.find({
      requester: userId,
      status: "pending",
    }).populate("recipient", "-password"),

    Friend.find({
      recipient: userId,
      status: "pending",
    }).populate("requester", "-password"),
  ]);

  const friendIds = friends.flatMap((f) =>
    f.requester === userId ? [f.recipient] : [f.requester]
  );
  friendIds.push(userId);

  const randomUsers = await User.find({ _id: { $nin: friendIds } })
    .select("-password")
    .limit(6);

  const pendingRequests = await User.find({
    _id: { $in: sentRequests.map((f) => f.recipient) },
  }).select("-password");

  const pendingAccepting = await User.find({
    _id: { $in: receivedRequests.map((f) => f.requester) },
  }).select("-password");

  return [randomUsers, pendingRequests, pendingAccepting];
};
