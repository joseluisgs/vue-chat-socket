/* eslint-disable no-param-reassign */
/**
* FUNCIONALIDAD DEL SOCKET.IO
*/

// Librerías
import * as socketio from 'socket.io';
import http from 'http';
import chalk from 'chalk';
import crypto from 'crypto';
import Redis from 'ioredis';
import RedisSessionStore from './store/RedisSessionStore';
import RedisMessageStore from './store/RedisMessageStore';
import ISession from './interfaces/ISession';
import IMessage from './interfaces/IMessage';

// Servidor http para worker
const servicio = http.createServer();
// Cliente de Redis
const redisClient = new Redis();
// Worker
const { setupWorker } = require('@socket.io/sticky');

// Para obtener ID aleatorios
const randomId = () => crypto.randomBytes(8).toString('hex');

// Las Sesiones
const sessionStore = new RedisSessionStore(redisClient);
// Los mensajes
const messageStore = new RedisMessageStore(redisClient);

// Creamos el módulo de configurar. Es una función que recibe Up
export default () => {
  // Creamos el socket asociado a nuestro servicio. Configuramos los cors, por si acaso
  const io = new socketio.Server();
  io.attach(servicio, {
    cors: {
      origin: 'http://localhost:8080',
    },
    // eslint-disable-next-line global-require
    adapter: require('socket.io-redis')({
      pubClient: redisClient,
      subClient: redisClient.duplicate(),
    }),
  });

  // Crea el middleware a usar
  io.use((socket: any, next) => {
    // Obtenemos el ID y buscamos si esta la sesion
    const { sessionID } = socket.handshake.auth;
    if (sessionID) {
      const session = sessionStore.findSession(sessionID);
      if (session) {
        socket.sessionID = sessionID;
        socket.userID = session.userID;
        socket.username = session.username;
        console.log(chalk.white(`-> Cliente ${socket.username} reconectado: ${new Date().toLocaleString()}`));
        return next();
      }
    }
    const { username } = socket.handshake.auth;
    if (!username) {
      return next(new Error('Nombre de usuario invalido'));
    }
    socket.sessionID = randomId();
    socket.userID = randomId();
    socket.username = username;
    console.log(chalk.cyan(`-> Cliente ${socket.username} conectado: ${new Date().toLocaleString()}`));
    return next();
  });

  // Si nos llega el evento de connexión
  io.on('connection', async (socket: any) => {
    socket.emit('status', '👋 Hola desde el servidor');

    // Almacenamos la sesion
    sessionStore.saveSession(socket.sessionID, {
      userID: socket.userID,
      username: socket.username,
      connected: true,
    });

    // Emitimos los datos de la sesion
    socket.emit('session', {
      sessionID: socket.sessionID,
      userID: socket.userID,
    });

    // Nos unimos a la sala del userID
    socket.join(socket.userID);

    // Recogemos todos los mensajes y sesiones de Redis
    const users: any = [];
    const [messages, sessions] = await Promise.all([
      messageStore.findMessagesForUser(socket.userID),
      sessionStore.findAllSessions(),
    ]);

    // Sacamos los mensajes por usuario
    const messagesPerUser = new Map();
    messages.forEach((message: IMessage) => {
      const { from, to } = message;
      const otherUser = socket.userID === from ? to : from;
      if (messagesPerUser.has(otherUser)) {
        messagesPerUser.get(otherUser).push(message);
      } else {
        messagesPerUser.set(otherUser, [message]);
      }
    });

    // Por cada sesion, creamos los usuarios
    sessions.forEach((session: ISession) => {
      users.push({
        userID: session.userID,
        username: session.username,
        connected: session.connected,
        messages: messagesPerUser.get(session.userID) || [],
      });
    });

    // Emitimos los usuarios
    socket.emit('users', users);

    // Notoficamos los usuarios existentes
    socket.broadcast.emit('user connected', {
      userID: socket.userID,
      username: socket.username,
      connected: true,
      messages: [],
    });

    // Evento de si nos llega un mensaje privado, se lo entregamos a quien corresponda
    socket.on('private message', (data: any) => {
      const message = {
        content: data.content,
        from: socket.userID,
        to: data.to,
      };
      // Se lo ransmitimos
      socket.to(message.to).to(socket.userID).emit('private message', message);
      messageStore.saveMessage(message);
      console.log(chalk.magenta(`# Mensaje de ${socket.username} ${new Date().toLocaleString()}`));
    });

    // Al desconectar
    socket.on('disconnect', async () => {
      // Casamos los socket donde estoy conectado
      const matchingSockets = await io.in(socket.userID).allSockets();
      const isDisconnected = matchingSockets.size === 0;
      if (isDisconnected) {
        // notifico a otros usuarios
        socket.broadcast.emit('user disconnected', socket.userID);
        // actualizamos el estado de la sesion
        sessionStore.saveSession(socket.sessionID, {
          userID: socket.userID,
          username: socket.username,
          connected: false,
        });
        console.log(chalk.yellow(`<- Cliente ${socket.username} desconectado: ${new Date().toLocaleString()}`));
      }
    });
  });
  // Lanzo el worker con el Socket
  setupWorker(io);
};
