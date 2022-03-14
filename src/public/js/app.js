const socket = io();

const header = document.querySelector("header");
const myFace = document.getElementById("myFace");
const peerFace = document.getElementById("peerFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const mikesSelect = document.getElementById("mikes");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = true;
let cameraOff = false;
let nickname;
let roomName;
let myPeerConnection;
let myDataChannel;

initButton();

function initButton() {
  muteBtn.innerText = muted ? "Unmute" : "Mute";
  cameraBtn.innerText = cameraOff ? "Turn Camera On" : "Turn Camera Off";
}

async function getDevices() {
  await getCameras();
  await getMikes();
}

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];

    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMikes() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const mikes = devices.filter((device) => device.kind === "audioinput");
    const currentMike = myStream.getAudioTracks()[0];

    mikes.forEach((mike) => {
      const option = document.createElement("option");
      option.value = mike.deviceId;
      option.innerText = mike.label;
      if (currentMike.label === mike.label) {
        option.selected = true;
      }
      mikesSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cameras = devices
    .filter((device) => device.kind === "videoinput")
    .map((device) => device.deviceId);
  const mikes = devices
    .filter((device) => device.kind === "audioinput")
    .map((device) => device.deviceId);
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  const userConstrains = {
    audio: mikes.includes(deviceId) ? { deviceId: { exact: deviceId } } : true,
    video: cameras.includes(deviceId)
      ? { deviceId: { exact: deviceId } }
      : { facingMode: "user" },
  };

  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? userConstrains : initialConstrains
    );
    myFace.srcObject = myStream;
    myStream.getAudioTracks()[0].enabled = !muted;
    myStream.getVideoTracks()[0].enabled = !cameraOff;
    if (!deviceId) {
      await getDevices();
    }
  } catch (e) {
    console.log(e);
  }
}

function handleMuteClick() {
  const curState = myStream.getAudioTracks()[0].enabled;
  myStream.getAudioTracks()[0].enabled = !curState;
  muteBtn.innerText = muted ? "Mute" : "Unmute";
  muted = !muted;
}
function handleCameraClick() {
  const curState = myStream.getVideoTracks()[0].enabled;
  myStream.getVideoTracks()[0].enabled = !curState;
  cameraBtn.innerText = cameraOff ? "Turn Camera Off" : "Turn Camera On";
  cameraOff = !cameraOff;
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
}
async function handleMikeChange() {
  await getMedia(mikesSelect.value);
  if (myPeerConnection) {
    const audioTrack = myStream.getAudioTracks()[0];
    const audioSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "audio");
    audioSender.replaceTrack(audioTrack);
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);
mikesSelect.addEventListener("input", handleMikeChange);

// Welcome Form (join a room)

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

function setRoomName() {
  const headerTitle = header.querySelector("h1");
  headerTitle.innerText = `${roomName}`;
}

function setCallPartner(partnerNickname) {
  const callPartner = header.querySelector("h3");
  callPartner.innerText = `Call with ${partnerNickname}`;
}

function resetCallPartner() {
  const callPartner = header.querySelector("h3");
  callPartner.innerText = "";
}

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const nicknameInput = document.getElementById("nickname");
  const roomNameInput = document.getElementById("roomName");
  nickname = nicknameInput.value;
  roomName = roomNameInput.value;
  await initCall();
  setRoomName();
  socket.emit("join_room", nickname, roomName);
  nicknameInput.value = "";
  roomNameInput.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Chat Form

const chat = document.getElementById("chat");
const chatForm = chat.querySelector("form");

function addMessage(message, sender) {
  const ul = chat.querySelector("ul");
  const li = document.createElement("li");
  if (sender) {
    li.innerText = `${sender}: ${message}`;
  } else {
    li.innerText = message;
  }
  ul.appendChild(li);
}

function handleChatSubmit(event) {
  event.preventDefault();
  const messageInput = document.getElementById("message");
  const message = messageInput.value;
  messageInput.value = "";
  addMessage(message, nickname);
  try {
    myDataChannel.send(message);
  } catch (e) {
    console.log(e);
  }
}

chatForm.addEventListener("submit", handleChatSubmit);

// Socket Code

socket.on("update_rooms", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerText = "";
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerHTML = `<button>${room}</button>`;
    roomList.append(li);
  });
});

socket.on("set_header", (partnerNickname) => {
  console.log(nickname, "set_header");
  setCallPartner(partnerNickname);
  socket.emit("header", nickname, partnerNickname, roomName);
});
socket.on("header", (myNickname) => {
  console.log(nickname, "header");
  setCallPartner(myNickname);
  socket.emit("partner_nickname", myNickname);
});

socket.on("start_chat", (partnerNickname) => {
  console.log(nickname, "start_chat");
  console.log("made data channel");
  myDataChannel = myPeerConnection.createDataChannel("chat");
  addMessage(`${partnerNickname} arrived!`);
  myDataChannel.addEventListener("message", (event) => {
    addMessage(event.data, partnerNickname);
  });
  socket.emit("join_chat", nickname, roomName);
});
socket.on("join_chat", (partnerNickname) => {
  console.log(nickname, "join_chat");
  myPeerConnection.addEventListener("datachannel", (event) => {
    myDataChannel = event.channel;
    addMessage(`${partnerNickname} arrived!`);
    myDataChannel.addEventListener("message", (event) => {
      addMessage(event.data, partnerNickname);
    });
  });
});

socket.on("send_offer", async () => {
  console.log(nickname, "send_offer");
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("sent to offer");
  socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
  console.log(nickname, "offer");
  console.log("received the offer");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
  console.log("sent the answer");
});

socket.on("answer", (answer) => {
  console.log(nickname, "answer");
  console.log("received the answer");
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log(nickname, "ice");
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
});

socket.on("leave_chat", (partnerNickname) => {
  console.log(nickname, "leave_chat");
  addMessage(`${partnerNickname} left`);
});

socket.on("leave_call", () => {
  console.log(nickname, "leave_call");
  peerFace.srcObject.getVideoTracks().forEach((track) => {
    track.stop();
    peerFace.srcObject.removeTrack(track);
  });
  resetCallPartner();
  makeConnection();
  socket.emit("join_room", nickname, roomName);
});

// RTC Code

function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
  socket.emit("ice", data.candidate, roomName);
  console.log("sent candidate");
}

function handleAddStream(data) {
  peerFace.srcObject = data.stream;
}
