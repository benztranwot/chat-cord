const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utils/users");

const PORT = 3000 || process.env.PORT;
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const botName = "ChatCord Bot";

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Run when client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    // Welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));

    // Broadcast when a user joined the chat
    socket.broadcast.to(user.room).emit("message", formatMessage(botName, `${user.username} has joined the chat`));

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // Run when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit("message", formatMessage(botName, `${user.username} has left the chat`));

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
