const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const mikesSelect = document.getElementById("mikes");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = true;
let cameraOff = false;
let roomName;
let myPeerConnection;

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
}
async function handleMikeChange() {
  await getMedia(mikesSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);
mikesSelect.addEventListener("input", handleMikeChange);

// Welcome Form (join a room)

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function startMedia() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  socket.emit("join_room", input.value, startMedia);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code

socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("sent to offer");
  socket.emit("offer", offer, roomName);
});

socket.on("offer", (offer) => {
  console.log(offer);
});

// RTC Code

function makeConnection() {
  myPeerConnection = new RTCPeerConnection();
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}
