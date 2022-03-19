const socket = io();

const header = document.querySelector('header');
const home = document.getElementById('home');
const myFace = document.getElementById('myFace');
const peerFace = document.getElementById('peerFace');
const muteBtn = document.getElementById('muteBtn');
const cameraBtn = document.getElementById('cameraBtn');
const camerasSelect = document.getElementById('cameras');
const mikesSelect = document.getElementById('mikes');
const call = document.getElementById('call');

call.style.display = 'none';
peerFace.style.display = 'none';

let myStream;
let roomIsFull = false;
let muted = true;
let cameraOff = true;
let nickname;
let roomName;
let myPeerConnection;
let myDataChannel;

async function getDevices() {
  await getCameras();
  await getMikes();
}

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === 'videoinput');
    const currentCamera = myStream.getVideoTracks()[0];

    cameras.forEach((camera) => {
      const option = document.createElement('option');
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
    const mikes = devices.filter((device) => device.kind === 'audioinput');
    const currentMike = myStream.getAudioTracks()[0];

    mikes.forEach((mike) => {
      const option = document.createElement('option');
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
    .filter((device) => device.kind === 'videoinput')
    .map((device) => device.deviceId);
  const mikes = devices
    .filter((device) => device.kind === 'audioinput')
    .map((device) => device.deviceId);
  const initialConstrains = {
    audio: true,
    video: { facingMode: 'user' },
  };
  const userConstrains = {
    audio: mikes.includes(deviceId) ? { deviceId: { exact: deviceId } } : true,
    video: cameras.includes(deviceId)
      ? { deviceId: { exact: deviceId } }
      : { facingMode: 'user' },
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
  muteBtn.innerText = muted ? 'Mute' : 'Unmute';
  muted = !muted;
}
function handleCameraClick() {
  const curState = myStream.getVideoTracks()[0].enabled;
  myStream.getVideoTracks()[0].enabled = !curState;
  cameraBtn.innerText = cameraOff ? 'Turn Camera Off' : 'Turn Camera On';
  cameraOff = !cameraOff;
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === 'video');
    videoSender.replaceTrack(videoTrack);
  }
}
async function handleMikeChange() {
  await getMedia(mikesSelect.value);
  if (myPeerConnection) {
    const audioTrack = myStream.getAudioTracks()[0];
    const audioSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === 'audio');
    audioSender.replaceTrack(audioTrack);
  }
}

muteBtn.addEventListener('click', handleMuteClick);
cameraBtn.addEventListener('click', handleCameraClick);
camerasSelect.addEventListener('input', handleCameraChange);
mikesSelect.addEventListener('input', handleMikeChange);

// saveNickname form

const saveNickname = document.getElementById('saveNickname');
const saveNicknameForm = saveNickname.querySelector('form');
const enterRoom = document.getElementById('enterRoom');

function handleSaveSubmit(event) {
  event.preventDefault();
  const nicknameInput = document.getElementById('nickname');
  nickname = nicknameInput.value;
  const enterRoomBtn = enterRoom.querySelector('button');
  setNickname(nickname);
  console.log(enterRoomBtn);
  enterRoomBtn.disabled = false;
  setDevices();
  initButton();
}

function setNickname(nickname) {
  const greeting = enterRoom.querySelector('span');
  greeting.innerText = `${nickname}, Welcome.`;
}

function setDevices() {
  const mikeOffCheck = document.getElementById('mikeOff');
  const cameraOffCheck = document.getElementById('cameraOff');
  muted = mikeOffCheck.checked;
  cameraOff = cameraOffCheck.checked;
}

function initButton() {
  muteBtn.innerText = muted ? 'Unmute' : 'Mute';
  cameraBtn.innerText = cameraOff ? 'Turn Camera On' : 'Turn Camera Off';
}

saveNicknameForm.addEventListener('submit', handleSaveSubmit);

// enterRoom Form (join a room)

const enterRoomForm = enterRoom.querySelector('form');
const callHeader = document.getElementById('callHeader');

async function initCall() {
  call.style.display = 'flex';
  home.style.display = 'none';
  header.style.display = 'none';
  await getMedia();
  makeConnection();
}

function setRoomName() {
  const title = callHeader.querySelectorAll('span');
  title[0].innerText = `${roomName}`;
  title[1].innerText = 'Waiting for a call partner...';
}

function setCallPartner(partnerNickname) {
  const title = callHeader.querySelectorAll('span');
  title[1].innerText = `Call with ${partnerNickname}`;
}

function handleEnterRoomSubmit(event) {
  event.preventDefault();
  const roomNameInput = document.getElementById('roomName');
  roomName = roomNameInput.value;
  if (nickname) {
    socket.emit('check_room', nickname, roomName);
    roomNameInput.value = '';
  } else {
    alert('You have to your nickname first.');
  }
}

enterRoomForm.addEventListener('submit', handleEnterRoomSubmit);

// Chat Form

const chat = document.getElementById('chat');
const chatForm = chat.querySelector('form');

function addMessage(message, sender) {
  const ul = chat.querySelector('ul');
  const li = document.createElement('li');
  if (sender) {
    li.innerText = `${sender}: ${message}`;
  } else {
    li.innerText = message;
  }
  ul.appendChild(li);
}

function handleChatSubmit(event) {
  event.preventDefault();
  const messageInput = document.getElementById('message');
  const message = messageInput.value;
  messageInput.value = '';
  addMessage(message, nickname);
  try {
    myDataChannel.send(message);
  } catch (e) {
    console.log(e);
  }
}

function handleChatFocusIn() {
  const input = chatForm.querySelector('input');
  input.placeholder = '';
}

function handleChatFocusOut() {
  const input = chatForm.querySelector('input');
  input.placeholder = 'message';
}

chatForm.addEventListener('focusin', handleChatFocusIn);
chatForm.addEventListener('focusout', handleChatFocusOut);
chatForm.addEventListener('submit', handleChatSubmit);

// Socket Code

socket.on('update_rooms', (rooms) => {
  const roomList = document.getElementById('roomList');
  roomList.innerText = '';
  if (!Object.keys(rooms).length) {
    const li = document.createElement('li');
    li.innerText = 'There is no room.';
    roomList.append(li);
  } else {
    for (const room in rooms) {
      const button = document.createElement('button');
      button.innerText = `${room}\n(${rooms[room]} / 2)`;
      if (rooms[room] > 1) {
        button.setAttribute('disabled', 'true');
      }
      roomList.append(button);
      button.addEventListener('click', () => {
        if (nickname) {
          roomName = room;
          socket.emit('check_room', nickname, roomName);
        } else {
          alert('You have to save your nickname first.');
        }
      });
    }
  }
});

socket.on('already_in_room', () => {
  alert(`You are already in the other room.\nYou can enter only one room.`);
});

socket.on('is_full', (nickname, roomName) => {
  alert(`${roomName} is full.`);
});
socket.on('is_available', async (nickname, roomName) => {
  await initCall();
  setRoomName();
  socket.emit('join_room', nickname, roomName);
});

socket.on('set_header', (partnerNickname) => {
  console.log(nickname, 'set_header');
  setCallPartner(partnerNickname);
  socket.emit('header', nickname, partnerNickname, roomName);
});
socket.on('header', (myNickname) => {
  console.log(nickname, 'header');
  setCallPartner(myNickname);
  socket.emit('partner_nickname', myNickname);
});

socket.on('start_chat', (partnerNickname) => {
  console.log(nickname, 'start_chat');
  console.log('made data channel');
  peerFace.style.display = 'flex';
  myDataChannel = myPeerConnection.createDataChannel('chat');
  addMessage(`${partnerNickname} arrived!`);
  myDataChannel.addEventListener('message', (event) => {
    addMessage(event.data, partnerNickname);
  });
  socket.emit('join_chat', nickname, roomName);
});
socket.on('join_chat', (partnerNickname) => {
  console.log(nickname, 'join_chat');
  peerFace.style.display = 'flex';
  myPeerConnection.addEventListener('datachannel', (event) => {
    myDataChannel = event.channel;
    addMessage(`${partnerNickname} arrived!`);
    myDataChannel.addEventListener('message', (event) => {
      addMessage(event.data, partnerNickname);
    });
  });
});

socket.on('send_offer', async () => {
  console.log(nickname, 'send_offer');
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log('sent to offer');
  socket.emit('offer', offer, roomName);
});

socket.on('offer', async (offer) => {
  console.log(nickname, 'offer');
  console.log('received the offer');
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit('answer', answer, roomName);
  console.log('sent the answer');
});

socket.on('answer', (answer) => {
  console.log(nickname, 'answer');
  console.log('received the answer');
  myPeerConnection.setRemoteDescription(answer);
});

socket.on('ice', (ice) => {
  console.log(nickname, 'ice');
  console.log('received candidate');
  myPeerConnection.addIceCandidate(ice);
});

socket.on('leave_chat', (partnerNickname) => {
  console.log(nickname, 'leave_chat');
  addMessage(`${partnerNickname} left`);
});

socket.on('leave_call', (partnerNickname) => {
  console.log(nickname, 'leave_call');
  peerFace.srcObject.getVideoTracks().forEach((track) => {
    track.stop();
    peerFace.srcObject.removeTrack(track);
  });
  setRoomName();
  makeConnection();
  socket.emit('join_room', nickname, roomName);
});

// RTC Code

function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
          'stun:stun3.l.google.com:19302',
          'stun:stun4.l.google.com:19302',
        ],
      },
    ],
  });
  myPeerConnection.addEventListener('icecandidate', handleIce);
  myPeerConnection.addEventListener('addstream', handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
  socket.emit('ice', data.candidate, roomName);
  console.log('sent candidate');
}

function handleAddStream(data) {
  peerFace.srcObject = data.stream;
}
