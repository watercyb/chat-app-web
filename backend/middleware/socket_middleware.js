import { getUserById } from "../database/db.js";
import cookie from "cookie";
import { verifyToken } from "../auth/auth.js";

export const socket_protextRoute = async (socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const userId = await verifyToken(cookies);
    if (!userId) return;

    const user = await getUserById(userId);
    if (!user) return;

    socket.user = user;
    next();
  } catch (error) {
    console.log("Error in socket_protextRoute middleware: ", error.message);
  }
};
