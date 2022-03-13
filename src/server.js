import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";
import livereload from "livereload";
import connectLivereload from "connect-livereload";

const liveReloadServer = livereload.createServer({
  exts: ["pug", "js", "scss"],
});
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

const app = express();
app.use(connectLivereload());

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});
instrument(wsServer, {
  auth: false,
});

wsServer.on("connection", (socket) => {
  socket.on("join_room", (nickName, roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("partner_header", nickName);
    socket.to(roomName).emit("start_chat", nickName);
    socket.to(roomName).emit("welcome");
  });
  socket.on("header", (nickName, roomName) => {
    socket.to(roomName).emit("header", nickName);
  });
  socket.on("join_chat", (nickName, roomName) => {
    socket.to(roomName).emit("join_chat", nickName);
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
});

const PORT = 4000;
function handelListen() {
  console.log(`Listening on http://localhost:${PORT}`);
}
httpServer.listen(PORT, handelListen);
