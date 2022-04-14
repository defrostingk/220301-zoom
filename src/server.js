import http from 'http';
import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';
import express from 'express';

// App router
const app = express();
app.set('view engine', 'pug');
app.set('views', process.cwd() + '/src/views');
app.use('/public', express.static(process.cwd() + '/src/public'));
app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

// Port
const LOCAL_PORT = 4000;
const PORT = process.env.PORT || LOCAL_PORT;

// WebSockets server
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ['https://admin.socket.io'],
    credentials: true,
  },
});
instrument(wsServer, {
  auth: false,
});
httpServer.listen(PORT, () => {
  if (PORT === LOCAL_PORT) {
    console.log(`Listening on http://localhost:${PORT}`);
  }
});

// WebSockets
wsServer.on('connection', (socket) => {
  socket['partnerNickname'] = 'Anonymous';
  socket['nickname'] = 'Anonymous';
  wsServer.sockets.emit('update_rooms', getPublicRooms());
  socket.on('check_room', (nickname, roomName) => {
    if (isUserInRoom(socket.id)) {
      socket.emit('already_in_room');
    } else {
      const cnt = countUserInRoom(roomName) ? countUserInRoom(roomName) + 1 : 1;
      if (cnt > 2) {
        socket.emit('is_full', nickname, roomName);
      } else {
        socket.emit('is_available', nickname, roomName);
      }
    }
  });
  socket.on('join_room', (nickname, roomName) => {
    socket.nickname = nickname;
    socket.join(roomName);
    socket.to(roomName).emit('set_header', nickname);
    socket.to(roomName).emit('start_chat', nickname);
    socket.to(roomName).emit('send_offer');
    wsServer.sockets.emit('update_rooms', getPublicRooms());
  });
  socket.on('header', (nickname, partnerNickname, roomName) => {
    socket.partnerNickname = partnerNickname;
    socket.to(roomName).emit('header', nickname);
  });
  socket.on('partner_nickname', (partnerNickname) => {
    socket.partnerNickname = partnerNickname;
  });
  socket.on('join_chat', (nickname, roomName) => {
    socket.to(roomName).emit('join_chat', nickname);
  });
  socket.on('offer', (offer, roomName) => {
    socket.to(roomName).emit('offer', offer);
  });
  socket.on('answer', (answer, roomName) => {
    socket.to(roomName).emit('answer', answer);
  });
  socket.on('ice', (ice, roomName) => {
    socket.to(roomName).emit('ice', ice);
  });
  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit('leave_chat', socket.nickname);
      socket.to(room).emit('leave_call');
    });
  });
  socket.on('disconnect', () => {
    wsServer.sockets.emit('update_rooms', getPublicRooms());
  });
});

// function

function getPublicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = {};
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms[key] = countUserInRoom(key);
    }
  });
  return publicRooms;
}

function countUserInRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

// Return If the user is "already" in the room.
function isUserInRoom(userId) {
  const {
    sockets: {
      adapter: { rooms },
    },
  } = wsServer;
  const publicRooms = Object.keys(getPublicRooms());
  let exist = false;

  publicRooms.forEach((roomName) => {
    let users = rooms.get(roomName);
    if (users.has(userId)) {
      exist = true;
      return;
    }
  });

  return exist;
}
