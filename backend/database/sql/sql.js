import sequelize from "./sequelize.js";
import User from "./models/user_model.js";
import Message from "./models/message_model.js";
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";

export const connectDB = async () => {
  try {
    await sequelize.sync();
    console.log("mysql connected.");
  } catch (error) {
    console.log("mysql connecting error: " + error);
  }
};

//TODO check java backend project how the instance handled

export const getAllUsers = async (avoidId) => {
  return await User.findAll({
    where: {
      _id: {
        [Op.ne]: avoidId,
      },
    },
    attributes: { exclude: ["password"] },
  });
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
    senderId,
    receiverId,
    text,
    image,
  });
};
