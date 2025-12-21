import collectUsers from "./collectUsers.js";

export default function joinQueue({ socket, topic }) {
  const q = queueByTopic[topic]

  if (!q) return;   // if already in queue-> ignore
  if (q.has(socket.id)) {
    return;
  }
  q.add(socket.id); // add to the queue

  collectUsers(q, topic);
}