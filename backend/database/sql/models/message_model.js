import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";
import User from "./user_model.js";

const Message = sequelize.define(
  "Message",
  {
    senderId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: User,
        key: "_id",
      },
    },
    receiverId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: User,
        key: "_id",
      },
    },
    text: {
      type: DataTypes.STRING,
    },
    image: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
  }
);

export default Message;
