const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit("joinRoom", { username, room });

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on("message", (message) => {
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;

  // Edit message to server
  socket.emit("chatMessage", msg);

  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Update message to document
function outputMessage(message) {
  const timeSpan = document.createElement("span");
  timeSpan.textContent = message.time;
  const metaParagraph = document.createElement("p");
  metaParagraph.classList.add("meta");
  metaParagraph.textContent = `${message.username} `;
  metaParagraph.appendChild(timeSpan);
  const textParagraph = document.createElement("p");
  textParagraph.textContent = `${message.text}`;
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  messageDiv.append(metaParagraph, textParagraph);
  chatMessages.appendChild(messageDiv);
}

// Update room name
function outputRoomName(room) {
  roomName.textContent = room;
}

// Update user list
function outputUsers(users) {
  userList.textContent = "";

  for (const user of users) {
    const usernameDisplay = document.createElement("li");
    usernameDisplay.textContent = user.username;
    userList.appendChild(usernameDisplay);
  }
}
