import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("join", (room) => {
    socket.join(room);
  });
  socket.on("leave", (room) => {
    socket.leave(room);
  });
});

// Simple HTTP endpoint to receive emits from server-side code
app.post("/emit", (req, res) => {
  const { roomId, payload } = req.body;
  if (!roomId || !payload)
    return res.status(400).json({ error: "roomId and payload required" });
  io.to(roomId).emit("message", payload);
  return res.json({ ok: true });
});

const PORT = process.env.SOCKET_PORT || 4000;
server.listen(PORT, () => console.log(`Socket server listening on ${PORT}`));
