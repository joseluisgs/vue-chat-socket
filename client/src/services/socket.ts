// Cliente Socket.io
import { io } from 'socket.io-client';

// URL a donde nos vamos a conectar con su puerto
const PORT = 3000;
const URL = `http://localhost:${PORT}`;
const socket = io(URL, { autoConnect: false });

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;
