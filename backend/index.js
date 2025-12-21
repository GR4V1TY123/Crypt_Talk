import express from "express"
import { createServer } from 'node:http';
import { Server } from "socket.io";
import cors from "cors"
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors())
app.use(express.json())

const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {},
  cors: {
    origin: "http://localhost:5173"
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
console.log(queueByTopic);

const rooms = new Map(); //room->roomdata
const socketToRoom = new Map(); //socket->room

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
    messages: []
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
    created_at: room.created_at
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

    console.log(newMsg);

    const room = rooms.get(roomId); // get the roomId of sender by using the roomId -> room Object map

    room.messages.push(newMsg)  // add the message to the room object's message array

    io.to(roomId).emit('message', newMsg)     // send data to the receiver
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

// Start http + socket, not express
server.listen(3000, () => {
  console.log("Server online at port 3000.............");

})