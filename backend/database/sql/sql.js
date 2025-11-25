import sequelize from "./sequelize.js";
import User from "./models/user_model.js";
import Message from "./models/message_model.js";
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import Friend from "./models/friend_model.js";

export const connectDB = async () => {
  try {
    await sequelize.sync();

    Friend.belongsTo(User, { as: "requesterUser", foreignKey: "requester" });
    Friend.belongsTo(User, { as: "recipientUser", foreignKey: "recipient" });

    console.log("mysql connected.");
  } catch (error) {
    console.log("mysql connecting error: " + error);
  }
};

export const getAllFriends = async (userId) => {
  const friends = await Friend.findAll({
    where: {
      status: "accepted",
      [Op.or]: [{ requester: userId }, { recipient: userId }],
    },
    include: [
      {
        model: User,
        as: "requesterUser",
        attributes: { exclude: ["password"] },
      },
      {
        model: User,
        as: "recipientUser",
        attributes: { exclude: ["password"] },
      },
    ],
  });

  const friendUsers = friends.map((f) =>
    f.requesterUser._id === userId ? f.recipientUser : f.requesterUser
  );

  return friendUsers;
};

export const getUserById = async (userId) => {
  return await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });
};

export const getUserByEmail = async (email) => {
  return await User.findOne({
    where: {
      email,
    },
  });
};

export const createUser = async (fullName, email, password, id) => {
  return await User.create({ _id: id || uuidv4(), email, fullName, password });
};

export const findByIdAndUpdate = async (userId, url) => {
  const user = await User.findByPk(userId);
  if (!user) return null;

  await user.update({ profilePic: url });

  const { password, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
};

export const getMessagesByIds = async (myId, userToChatId) => {
  return await Message.findAll({
    where: {
      [Op.or]: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    },
    order: [["createdAt", "ASC"]],
  });
};

export const createMessage = async (senderId, receiverId, text, image) => {
  return await Message.create({
    _id: uuidv4(),
    senderId,
    receiverId,
    text,
    image,
  });
};

export const friendRequest = async (requesterId, recipientId) => {
  if (requesterId === recipientId)
    return { error: "You can't send a friend request to yourself." };

  const recipient = await User.findByPk(recipientId);
  if (!recipient) return { error: "That user doesn't exist." };

  const req = await Friend.findOne({
    where: {
      requester: requesterId,
      recipient: recipientId,
    },
  });
  if (req)
    return {
      error:
        req.status === "accepted"
          ? "You're already friends!"
          : "You've already sent a friend request. Please wait for them to respond.",
    };

  const rec = await Friend.findOne({
    where: {
      requester: recipientId,
      recipient: requesterId,
    },
  });
  if (rec) {
    if (rec.status === "accepted") return { error: "You're already friends!" };

    rec.status = "accepted";
    await rec.save();
    return { message: "Friend request accepted! You're now friends." };
  }

  await Friend.create({
    requester: requesterId,
    recipient: recipientId,
  });

  return { message: "Friend request sent successfully." };
};

export const friendRequestResponse = async (
  requesterId,
  recipientId,
  accept
) => {
  const req = await Friend.findOne({
    where: {
      requester: requesterId,
      recipient: recipientId,
    },
  });

  if (!req) return { error: "Friend request not found." };
  if (req.status === "accepted") return { error: "You're already friends." };

  if (accept) {
    req.status = "accepted";
    await req.save();
    return { message: "Friend request accepted! You're now friends." };
  } else {
    await req.destroy();
    return { message: "Friend request declined." };
  }
};

export const randomUsers = async (userId) => {
  const [friends, sentRequests, receivedRequests] = await Promise.all([
    Friend.findAll({
      where: {
        status: "accepted",
        [Op.or]: [{ requester: userId }, { recipient: userId }],
      },
      attributes: ["requester", "recipient"],
    }),

    Friend.findAll({
      where: {
        requester: userId,
        status: "pending",
      },
      include: [
        {
          model: User,
          as: "recipientUser",
          attributes: { exclude: ["password"] },
        },
      ],
    }),

    Friend.findAll({
      where: {
        recipient: userId,
        status: "pending",
      },
      include: [
        {
          model: User,
          as: "requesterUser",
          attributes: { exclude: ["password"] },
        },
      ],
    }),
  ]);

  const friendIds = friends.flatMap((f) =>
    f.requester === userId ? [f.recipient] : [f.requester]
  );
  friendIds.push(userId);

  const randomUsers = await User.findAll({
    where: {
      _id: { [Op.notIn]: friendIds },
    },
    attributes: { exclude: ["password"] },
    limit: 6,
  });

  const pendingRequests = await User.findAll({
    where: {
      _id: { [Op.in]: sentRequests.map((f) => f.recipient) },
    },
    attributes: { exclude: ["password"] },
  });

  const pendingAccepting = await User.findAll({
    where: {
      _id: { [Op.in]: receivedRequests.map((f) => f.requester) },
    },
    attributes: { exclude: ["password"] },
  });

  return [randomUsers, pendingRequests, pendingAccepting];
};
