import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./database/db.js";

import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/message.js";
import { app, server } from "./lib/socket.js";
import path from "path";

const port = process.env.PORT;

const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV == "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get(new RegExp(".*"), (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
  });
}

server.listen(port, () => {
  console.log("Running on: " + port);
  connectDB();
});
