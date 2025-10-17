import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";
import User from "./user_model.js";

const Friend = sequelize.define(
  "Friend",
  {
    requester: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    recipient: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted"),
      defaultValue: "pending",
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

export default Friend;
