"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var socket = io();
var main = document.querySelector('main');
var footer = document.querySelector('footer');
var header = document.querySelector('header');
var home = document.getElementById('home');
var myFace = document.getElementById('myFace');
var peerFace = document.getElementById('peerFace');
var muteBtn = document.getElementById('muteBtn');
var cameraBtn = document.getElementById('cameraBtn');
var camerasSelect = document.getElementById('cameras');
var mikesSelect = document.getElementById('mikes');
var call = document.getElementById('call');
call.style.display = 'none';
peerFace.style.display = 'none';
var myStream;
var muted = true;
var cameraOff = true;
var nickname;
var roomName;
var myPeerConnection;
var myDataChannel;
var ALIGN_LEFT = 'left';
var ALIGN_RIGHT = 'right';

function getDevices() {
  return _getDevices.apply(this, arguments);
}

function _getDevices() {
  _getDevices = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return getCameras();

          case 2:
            _context4.next = 4;
            return getMikes();

          case 4:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _getDevices.apply(this, arguments);
}

function getCameras() {
  return _getCameras.apply(this, arguments);
}

function _getCameras() {
  _getCameras = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
    var devices, cameras, currentCamera;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            _context5.next = 3;
            return navigator.mediaDevices.enumerateDevices();

          case 3:
            devices = _context5.sent;
            cameras = devices.filter(function (device) {
              return device.kind === 'videoinput';
            });
            currentCamera = myStream.getVideoTracks()[0];
            cameras.forEach(function (camera) {
              var option = document.createElement('option');
              option.value = camera.deviceId;
              option.innerText = camera.label;

              if (currentCamera.label === camera.label) {
                option.selected = true;
              }

              camerasSelect.appendChild(option);
            });
            _context5.next = 12;
            break;

          case 9:
            _context5.prev = 9;
            _context5.t0 = _context5["catch"](0);
            console.log(_context5.t0);

          case 12:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[0, 9]]);
  }));
  return _getCameras.apply(this, arguments);
}

function getMikes() {
  return _getMikes.apply(this, arguments);
}

function _getMikes() {
  _getMikes = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
    var devices, mikes, currentMike;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            _context6.next = 3;
            return navigator.mediaDevices.enumerateDevices();

          case 3:
            devices = _context6.sent;
            mikes = devices.filter(function (device) {
              return device.kind === 'audioinput';
            });
            currentMike = myStream.getAudioTracks()[0];
            mikes.forEach(function (mike) {
              var option = document.createElement('option');
              option.value = mike.deviceId;
              option.innerText = mike.label;

              if (currentMike.label === mike.label) {
                option.selected = true;
              }

              mikesSelect.appendChild(option);
            });
            _context6.next = 12;
            break;

          case 9:
            _context6.prev = 9;
            _context6.t0 = _context6["catch"](0);
            console.log(_context6.t0);

          case 12:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[0, 9]]);
  }));
  return _getMikes.apply(this, arguments);
}

function getMedia(_x) {
  return _getMedia.apply(this, arguments);
}

function _getMedia() {
  _getMedia = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(deviceId) {
    var devices, cameras, mikes, initialConstrains, userConstrains;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return navigator.mediaDevices.enumerateDevices();

          case 2:
            devices = _context7.sent;
            cameras = devices.filter(function (device) {
              return device.kind === 'videoinput';
            }).map(function (device) {
              return device.deviceId;
            });
            mikes = devices.filter(function (device) {
              return device.kind === 'audioinput';
            }).map(function (device) {
              return device.deviceId;
            });
            initialConstrains = {
              audio: true,
              video: {
                facingMode: 'user'
              }
            };
            userConstrains = {
              audio: mikes.includes(deviceId) ? {
                deviceId: {
                  exact: deviceId
                }
              } : true,
              video: cameras.includes(deviceId) ? {
                deviceId: {
                  exact: deviceId
                }
              } : {
                facingMode: 'user'
              }
            };
            _context7.prev = 7;
            _context7.next = 10;
            return navigator.mediaDevices.getUserMedia(deviceId ? userConstrains : initialConstrains);

          case 10:
            myStream = _context7.sent;
            myFace.srcObject = myStream;
            myStream.getAudioTracks()[0].enabled = !muted;
            myStream.getVideoTracks()[0].enabled = !cameraOff;

            if (deviceId) {
              _context7.next = 17;
              break;
            }

            _context7.next = 17;
            return getDevices();

          case 17:
            _context7.next = 22;
            break;

          case 19:
            _context7.prev = 19;
            _context7.t0 = _context7["catch"](7);
            console.log(_context7.t0);

          case 22:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[7, 19]]);
  }));
  return _getMedia.apply(this, arguments);
}

function handleMuteClick() {
  var curState = myStream.getAudioTracks()[0].enabled;
  myStream.getAudioTracks()[0].enabled = !curState;
  muteBtn.innerText = muted ? 'Mute' : 'Unmute';
  muted = !muted;
}

function handleCameraClick() {
  var curState = myStream.getVideoTracks()[0].enabled;
  myStream.getVideoTracks()[0].enabled = !curState;
  cameraBtn.innerText = cameraOff ? 'Cam Off' : 'Cam On';
  cameraOff = !cameraOff;
}

function handleCameraChange() {
  return _handleCameraChange.apply(this, arguments);
}

function _handleCameraChange() {
  _handleCameraChange = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
    var videoTrack, videoSender;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return getMedia(camerasSelect.value);

          case 2:
            if (myPeerConnection) {
              videoTrack = myStream.getVideoTracks()[0];
              videoSender = myPeerConnection.getSenders().find(function (sender) {
                return sender.track.kind === 'video';
              });
              videoSender.replaceTrack(videoTrack);
            }

          case 3:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));
  return _handleCameraChange.apply(this, arguments);
}

function handleMikeChange() {
  return _handleMikeChange.apply(this, arguments);
}

function _handleMikeChange() {
  _handleMikeChange = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
    var audioTrack, audioSender;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return getMedia(mikesSelect.value);

          case 2:
            if (myPeerConnection) {
              audioTrack = myStream.getAudioTracks()[0];
              audioSender = myPeerConnection.getSenders().find(function (sender) {
                return sender.track.kind === 'audio';
              });
              audioSender.replaceTrack(audioTrack);
            }

          case 3:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));
  return _handleMikeChange.apply(this, arguments);
}

muteBtn.addEventListener('click', handleMuteClick);
cameraBtn.addEventListener('click', handleCameraClick);
camerasSelect.addEventListener('input', handleCameraChange);
mikesSelect.addEventListener('input', handleMikeChange); // saveNickname form

var saveNickname = document.getElementById('saveNickname');
var saveNicknameForm = saveNickname.querySelector('form');
var enterRoom = document.getElementById('enterRoom');

function handleSaveSubmit(event) {
  event.preventDefault();
  var nicknameInput = document.getElementById('nickname');
  nickname = nicknameInput.value;
  var enterRoomBtn = enterRoom.querySelector('button');
  setNickname(nickname);
  enterRoomBtn.disabled = false;
  setDevices();
  initButton();
}

function setNickname(nickname) {
  var greeting = enterRoom.querySelector('span');
  greeting.innerText = "".concat(nickname, ", Welcome.");
}

function setDevices() {
  var mikeOffCheck = document.getElementById('mikeOff');
  var cameraOffCheck = document.getElementById('cameraOff');
  muted = mikeOffCheck.checked;
  cameraOff = cameraOffCheck.checked;
}

function initButton() {
  muteBtn.innerText = muted ? 'Unmute' : 'Mute';
  cameraBtn.innerText = cameraOff ? 'Cam On' : 'Cam Off';
}

saveNicknameForm.addEventListener('submit', handleSaveSubmit); // enterRoom Form (join a room)

var enterRoomForm = enterRoom.querySelector('form');
var callHeader = document.getElementById('callHeader');

function initCall() {
  return _initCall.apply(this, arguments);
}

function _initCall() {
  _initCall = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            call.style.display = 'flex';
            home.style.display = 'none';
            header.style.display = 'none';
            footer.style.display = 'none';
            main.style.marginBottom = '0';
            _context10.next = 7;
            return getMedia();

          case 7:
            makeConnection();

          case 8:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));
  return _initCall.apply(this, arguments);
}

function setRoomName() {
  var title = callHeader.querySelectorAll('span');
  title[0].innerText = "".concat(roomName);
  title[1].innerText = 'Waiting for a call partner...';
}

function setCallPartner(partnerNickname) {
  var title = callHeader.querySelectorAll('span');
  title[1].innerText = "Call with ".concat(partnerNickname);
}

function handleEnterRoomSubmit(event) {
  event.preventDefault();
  var roomNameInput = document.getElementById('roomName');
  roomName = roomNameInput.value;

  if (nickname) {
    socket.emit('check_room', nickname, roomName);
    roomNameInput.value = '';
  } else {
    alert('You have to your nickname first.');
  }
}

enterRoomForm.addEventListener('submit', handleEnterRoomSubmit); // Chat Form

var chat = document.getElementById('chat');
var messageForm = document.getElementById('message');

function addMessage(message, alignment, sender) {
  var ul = chat.querySelector('ul');
  var li = document.createElement('li');
  var messageSpan = document.createElement('span');

  if (sender && alignment === 'left') {
    var nicknameSpan = document.createElement('span');
    nicknameSpan.classList.add('chat__nickname');
    nicknameSpan.innerText = sender;
    li.appendChild(nicknameSpan);
  }

  messageSpan.innerText = message;
  messageSpan.classList.add('chat__message');
  li.appendChild(messageSpan);

  if (alignment === 'left') {
    li.classList.add('chat--align-left');
  } else if (alignment === 'right') {
    li.classList.add('chat--align-right');
  } else {
    li.classList.add('chat--align-center');
  }

  ul.appendChild(li);
  ul.scrollTop = ul.scrollHeight;
}

function handleMessageSubmit(event) {
  event.preventDefault();
  var messageInput = messageForm.querySelector('input');
  var message = messageInput.value;
  messageInput.value = '';
  addMessage(message, ALIGN_RIGHT, nickname);

  try {
    myDataChannel.send(message);
  } catch (e) {
    console.log(e);
  }
}

function handleMessageFocusIn() {
  var input = messageForm.querySelector('input');
  input.placeholder = '';
}

function handleMessageFocusOut() {
  var input = messageForm.querySelector('input');
  input.placeholder = 'message';
}

messageForm.addEventListener('focusin', handleMessageFocusIn);
messageForm.addEventListener('focusout', handleMessageFocusOut);
messageForm.addEventListener('submit', handleMessageSubmit); // Socket Code

socket.on('update_rooms', function (rooms) {
  var roomList = document.getElementById('roomList');
  roomList.innerText = '';

  if (!Object.keys(rooms).length) {
    var li = document.createElement('li');
    li.innerText = 'There is no room.';
    roomList.append(li);
  } else {
    var _loop = function _loop(room) {
      var button = document.createElement('button');
      button.innerText = "".concat(room, "\n(").concat(rooms[room], " / 2)");

      if (rooms[room] > 1) {
        button.setAttribute('disabled', 'true');
      }

      roomList.append(button);
      button.addEventListener('click', function () {
        if (nickname) {
          roomName = room;
          socket.emit('check_room', nickname, roomName);
        } else {
          alert('You have to save your nickname first.');
        }
      });
    };

    for (var room in rooms) {
      _loop(room);
    }
  }
});
socket.on('already_in_room', function () {
  alert("You are already in the other room.\nYou can enter only one room.");
});
socket.on('is_full', function (nickname, roomName) {
  alert("".concat(roomName, " is full."));
});
socket.on('is_available', /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(nickname, roomName) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return initCall();

          case 2:
            setRoomName();
            socket.emit('join_room', nickname, roomName);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x2, _x3) {
    return _ref.apply(this, arguments);
  };
}());
socket.on('set_header', function (partnerNickname) {
  setCallPartner(partnerNickname);
  socket.emit('header', nickname, partnerNickname, roomName);
});
socket.on('header', function (myNickname) {
  setCallPartner(myNickname);
  socket.emit('partner_nickname', myNickname);
});
socket.on('start_chat', function (partnerNickname) {
  peerFace.style.display = 'flex';
  myDataChannel = myPeerConnection.createDataChannel('chat');
  addMessage("".concat(partnerNickname, " arrived!"));
  myDataChannel.addEventListener('message', function (event) {
    addMessage(event.data, ALIGN_LEFT, partnerNickname);
  });
  socket.emit('join_chat', nickname, roomName);
});
socket.on('join_chat', function (partnerNickname) {
  peerFace.style.display = 'flex';
  myPeerConnection.addEventListener('datachannel', function (event) {
    myDataChannel = event.channel;
    addMessage("".concat(partnerNickname, " arrived!"));
    myDataChannel.addEventListener('message', function (event) {
      addMessage(event.data, ALIGN_LEFT, partnerNickname);
    });
  });
});
socket.on('send_offer', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
  var offer;
  return regeneratorRuntime.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return myPeerConnection.createOffer();

        case 2:
          offer = _context2.sent;
          myPeerConnection.setLocalDescription(offer);
          socket.emit('offer', offer, roomName);

        case 5:
        case "end":
          return _context2.stop();
      }
    }
  }, _callee2);
})));
socket.on('offer', /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(offer) {
    var answer;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            myPeerConnection.setRemoteDescription(offer);
            _context3.next = 3;
            return myPeerConnection.createAnswer();

          case 3:
            answer = _context3.sent;
            myPeerConnection.setLocalDescription(answer);
            socket.emit('answer', answer, roomName);

          case 6:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x4) {
    return _ref3.apply(this, arguments);
  };
}());
socket.on('answer', function (answer) {
  myPeerConnection.setRemoteDescription(answer);
});
socket.on('ice', function (ice) {
  myPeerConnection.addIceCandidate(ice);
});
socket.on('leave_chat', function (partnerNickname) {
  addMessage("".concat(partnerNickname, " left"));
});
socket.on('leave_call', function (partnerNickname) {
  peerFace.srcObject.getVideoTracks().forEach(function (track) {
    track.stop();
    peerFace.srcObject.removeTrack(track);
  });
  setRoomName();
  makeConnection();
  socket.emit('join_room', nickname, roomName);
}); // RTC Code

function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [{
      urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302', 'stun:stun3.l.google.com:19302', 'stun:stun4.l.google.com:19302']
    }]
  });
  myPeerConnection.addEventListener('icecandidate', handleIce);
  myPeerConnection.addEventListener('addstream', handleAddStream);
  myStream.getTracks().forEach(function (track) {
    return myPeerConnection.addTrack(track, myStream);
  });
}

function handleIce(data) {
  socket.emit('ice', data.candidate, roomName);
}

function handleAddStream(data) {
  peerFace.srcObject = data.stream;
}