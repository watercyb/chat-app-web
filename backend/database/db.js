import dotenv from "dotenv";

let db;

dotenv.config();
switch (process.env.DB_TYPE) {
  case "mysql":
    db = await import("./sql/sql.js");
    break;
  case "mongodb":
    db = await import("./mongodb/mongodb.js");
    break;
  default:
    throw new Error(`Unknown DB_TYPE: ${process.env.DB_TYPE}`);
}

export const {
  connectDB,
  getUserById,
  getUserByEmail,
  createUser,
  getAllUsers,
  findByIdAndUpdate,
  getMessagesByIds,
  createMessage,
} = db;
