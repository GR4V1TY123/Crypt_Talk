import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = 'crypt-talk.up.railway.app';

export const socket = io(URL, {
    autoConnect: false
});