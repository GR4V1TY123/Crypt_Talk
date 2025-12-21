export default function addToRoom(socket1, socket2, topic) {
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
        users: room.users
    })
}