const socket = io();

const welcome = document.getElementById("welcome");
const room = document.getElementById("room");
const enterRoomForm = document.getElementById("enter-room");
const nameForm = document.getElementById("name");

let roomName;

room.hidden = true;

const addMessage = (message) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
};

const handleMessageSubmit = (event) => {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
};

const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const msgForm = room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit);
};

const handleNicknameSubmit = (event) => {
  event.preventDefault();
  const input = nameForm.querySelector("input");
  socket.emit("nickname", input.value);
};

const handleRoomSubmit = (event) => {
  event.preventDefault();
  const input = enterRoomForm.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
};

nameForm.addEventListener("submit", handleNicknameSubmit);
enterRoomForm.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user) => {
  addMessage(`${user} arrived!`);
});

socket.on("bye", (left) => {
  addMessage(`${left} left.`);
});

socket.on("new_message", addMessage);
