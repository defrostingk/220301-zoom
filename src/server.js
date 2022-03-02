import http from "http";
import WebSocket from "ws";
import express from "express";
import livereload from "livereload";
import connectLivereload from "connect-livereload";
import { handle } from "express/lib/application";

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

const PORT = 3000;
const handelListen = () => console.log(`Listening on http://localhost:${PORT}`);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

server.listen(PORT, handelListen);
