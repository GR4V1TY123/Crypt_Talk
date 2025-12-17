import express from "express"
import { createServer } from 'node:http';
import { Server } from "socket.io";
import cors from "cors"

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


const messages = [];

// User connect
io.on("connection", (socket) => {

  const room = `1`
  socket.join(room)

  console.log("user connected", socket.id, "To room: ", room);

  socket.emit("chat history", messages);

  // Disconnect
  socket.on("disconnect", () => {
    console.log(socket.id, "has disconnected");
  })

  // Message
  socket.on('chat message', (msg) => {
    messages.push(msg)
    io.to(room).emit('chat message', msg);
    
  })
})

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

// Start http + socket, not express
server.listen(3000, () => {
  console.log("Server online at port 3000.............");

})