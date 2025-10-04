import jwt from "jsonwebtoken";
import { getUserById } from "../database/db.js";
import cookie from "cookie";

export const socket_protextRoute = async (socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token = cookies.jwt;
    if (!token ) return;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return;

    const user = await getUserById(decoded.userId);
    if (!user) return;

    socket.user = user;
    next();
  } catch (error) {
    console.log("Error in socket_protextRoute middleware: ", error.message);
  }
};
