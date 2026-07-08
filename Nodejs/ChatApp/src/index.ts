import express from "express";
import user from "./routes/user";
import chat from "./routes/chat"
import chatHistory from "./routes/chat-history";
import { startWebSocket } from "./webSocket";
import http from "http";
import cors from "cors";

const app = express();

app.use(cors());

app.use(express.static("public"));

app.use(express.json());

app.get("/", (req, res) => {

  const {id}=req.query;

  res.send("Welcome to ChatApp API");

});

const server = http.createServer(app);

startWebSocket(server);

app.use("/user", user);
app.use("/chat",chat);
app.use("/chat-history",chatHistory);

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});