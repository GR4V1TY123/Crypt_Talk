import addToRoom from "./addToRoom.js";

export default function collectUsers(q, topic) {
    // return if solo
    if (q.size() < 2) return;

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