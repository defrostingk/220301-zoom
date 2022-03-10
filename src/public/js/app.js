const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");

let myStream;
let muted = false;
let cameraOff = false;

async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    });
    myFace.srcObject = myStream;
  } catch (e) {
    console.log(e);
  }
}

getMedia();

function handleMuteClick() {
  muteBtn.innerText = muted ? "Mute" : "Unmute";
  muted = !muted;
}
function handleCameraClick() {
  cameraBtn.innerText = cameraOff ? "Turn Camera Off" : "Turn Camera On";
  cameraOff = !cameraOff;
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
