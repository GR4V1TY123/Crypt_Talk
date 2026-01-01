import express from "express"
import { createServer } from 'node:http';
import { Server } from "socket.io";
import cors from "cors"
import { v4 as uuidv4 } from 'uuid';
import puppeteer from "puppeteer";
import { html } from "./report_format.js";

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}))
app.use(express.json())

const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {},
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  }
});

const onlineUsers = new Set(); //total
const queueByTopic = { //topic
  DSA: new Set(),
  SYSTEM_DESIGN: new Set(),
  GENERAL: new Set(),
  COLLABORATION: new Set(),
  PROJECT: new Set()
};

const rooms = new Map(); //roomid->roomdata
const socketToRoom = new Map(); //socket->roomid

function addToRoom(socket1, socket2, topic) {
  // Define Room
  const roomId = `room-${uuidv4()}`;
  const room = {
    id: roomId,
    topic,
    users: [
      { id: socket1.id, name: socket1.data.username },
      { id: socket2.id, name: socket2.data.username },
    ],
    created_at: Date.now(),
    messages: [],
    ideAccess: socket1.id,
    requester: null,
    ideValue: ""
  }

  rooms.set(roomId, room);  // Map roomId to room
  // Map sockets to their room
  socketToRoom.set(socket1.id, roomId)
  socketToRoom.set(socket2.id, roomId)

  socket1.join(roomId);
  socket2.join(roomId);

  // broadcast to only this room
  io.to(roomId).emit('room joined', {
    roomId,
    topic,
    users: room.users,
    created_at: room.created_at,
    ideAccess: room.ideAccess,
    requester: room.requester,
    ideValue: room.ideValue
  })
}

function collectUsers(q, topic) {
  // return if solo
  if (q.size < 2) return;

  // get the first 2 memebrs from queue, and remove them from queue
  const [id1, id2] = Array.from(q).slice(0, 2);
  q.delete(id1);
  q.delete(id2);

  const socket1 = io.sockets.sockets.get(id1)
  const socket2 = io.sockets.sockets.get(id2)

  if (!socket1 || !socket2) {
    if (socket1) joinQueue(socket1, topic);
    if (socket2) joinQueue(socket2, topic);
    return
  }

  addToRoom(socket1, socket2, topic);
}

function joinQueue(socket, topic) {
  const q = queueByTopic[topic]

  if (!q) return;
  // if already in queue-> ignore
  if (q.has(socket.id)) {
    return;
  }
  if (socketToRoom.has(socket.id)) {
    return;
  }
  q.add(socket.id); // add to the queue
  socket.emit("waiting", { topic });
  collectUsers(q, topic);
}

// User connect
io.on("connection", (socket) => {

  onlineUsers.add(socket.id)
  console.log(onlineUsers);

  socket.on("join queue", ({ topic, username }) => {
    // fetch username and topic from react
    socket.data.username = username;
    socket.data.topic = topic;
    joinQueue(socket, topic) //handles everything till room assignment
  })

  // When user sends a message in a room
  socket.on('message', (msg) => {

    const roomId = socketToRoom.get(socket.id)  // find roomId by the socketId->roomId map
    // return if 404
    if (!roomId) return;

    // Create new Message
    const newMsg = {
      user: socket.data.username,
      msg,
      created_at: Date.now()
    }

    const room = rooms.get(roomId); // get the roomId of sender by using the roomId -> room Object map

    room.messages.push(newMsg)  // add the message to the room object's message array

    io.to(roomId).emit('message', newMsg)     // send data to the receiver
  })

  // ide
  socket.on('request ide', () => {
    const roomId = socketToRoom.get(socket.id)
    const room = rooms.get(roomId)
    if (!room) return;
    const { users, ideAccess } = room;
    if (users.length < 2 || socket.id === ideAccess || room.requester == socket.id) return;
    room.requester = socket.id;
    const otherUser = users[0].id == socket.id ? users[1] : users[0]
    io.to(roomId).to(otherUser.id).emit('receive request', otherUser.name)
  })
  socket.on('grant ide', () => {
    const roomId = socketToRoom.get(socket.id)
    const room = rooms.get(roomId)
    if(!room) return;
    const { users, requester, ideAccess } = room
    if (users.length < 2 || ideAccess !== socket.id || !requester) return;
    room.requester = null;
    room.ideAccess = requester;
  })
  socket.on('write ide', (msg) => {
    const roomId = socketToRoom.get(socket.id)
    const room = rooms.get(roomId)
    if (!room) return;
    const { ideAccess} = room;
    if(socket.id !== ideAccess) return
    room.ideValue = msg;
    io.to(roomId).emit('write ide', msg)
  })

  // Disconnect
  socket.on("disconnect", () => {

    onlineUsers.delete(socket.id) // delete the user from the global and topic queue
    Object.values(queueByTopic).forEach(q => {
      q.delete(socket.id);
    });

    const roomId = socketToRoom.get(socket.id); // get room id of user
    if (!roomId) return;

    io.to(roomId).emit('room ended', {
      reason: "user_disconnected",
      by: socket.data.username
    });
    const room = rooms.get(roomId);

    room.users.forEach(u => {
      socketToRoom.delete(u.id);
      const s = io.sockets.sockets.get(u.id);
      s?.leave(roomId)
    })

    rooms.delete(roomId)
  })

})

app.get("/api/stats", (req, res) => {
  const stats = {};
  Object.entries(queueByTopic).forEach(([topic, q]) => {
    stats[topic] = q.size;
  });

  res.status(200).json({
    activeUsers: onlineUsers.size,
    totalRooms: rooms.size,
    queue: stats
  });
});

// api to generate the report
app.post("/api/report", async (req, res) => {
  console.log(req.body);

  const { messages, username, room } = req.body;
  if (!messages || !username || !room) {
    return res.status(408).json({
      message: "Missing fields"
    })
  }
  if (messages.length === 0) {
    return res.status(408).json({
      message: "No messages to parse"
    })
  }
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const htmlString = html(username);
    await page.setContent(htmlString, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4' });
    await browser.close();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="your_document.pdf"');
    return res.status(200).send(pdf);
  } catch (error) {
    console.log(error);
  }
})

// Start http + socket, not express
server.listen(3000, () => {
  console.log("Server online at port 3000.............");

})