// server.js
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = {};

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    const { type, room, signal } = data;

    switch (type) {
      case "join":
        ws.room = room;
        rooms[room] = rooms[room] || [];
        rooms[room].push(ws);
        if (rooms[room].length === 2) {
          rooms[room].forEach((client) => {
            if (client !== ws) {
              client.send(JSON.stringify({ type: "ready" }));
            }
          });
        }
        break;
      case "signal":
        rooms[room].forEach((client) => {
          if (client !== ws) {
            client.send(JSON.stringify({ type: "signal", signal }));
          }
        });
        break;
    }
  });

  ws.on("close", () => {
    if (ws.room && rooms[ws.room]) {
      rooms[ws.room] = rooms[ws.room].filter((client) => client !== ws);
    }
  });
});

app.use(express.static("public"));

server.listen(3000, () => {
  console.log("Serveur vocal sur http://localhost:3000");
});
