import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));

const PORT = 3000;
const handelListen = () => console.log(`Listening on http://localhost:${PORT}`);

app.listen(3000, handelListen);
