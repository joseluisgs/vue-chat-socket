/* eslint-disable no-param-reassign */
/**
* FUNCIONALIDAD DEL SOCKET.IO
*/

// Librerías
import * as socketio from 'socket.io';
import http from 'http';
import chalk from 'chalk';
import crypto from 'crypto';
import InMemorySessionStore from './store/InMemorySessionStore';
import InMemoryMessageStore from './store/InMemoryMessageStore';
import ISession from './interfaces/ISession';
import IMessage from './interfaces/IMessage';

// Para obtener ID aleatorios
const randomId = () => crypto.randomBytes(8).toString('hex');
// Las Sesiones
const sessionStore = new InMemorySessionStore();
// Los mensajes
const messageStore = new InMemoryMessageStore();

// Creamos el módulo de configurar. Es una función que recibe Up
export default (servicio: http.Server) => {
  // Creamos el socket asociado a nuestro servicio. Configuramos los cors, por si acaso
  const io = new socketio.Server();
  io.attach(servicio, {
    cors: {
      origin: 'http://localhost:8080',
    },
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
  io.on('connection', (socket: any) => {
    socket.emit('status', '👋 Hola desde el servidor');

    // Almacenamos la sesion
    sessionStore.saveSession(socket.sessionID, {
      userID: socket.userID,
      username: socket.username,
      connected: true,
      messages: [],
    });

    // Emitimos los datos de la sesion
    socket.emit('session', {
      sessionID: socket.sessionID,
      userID: socket.userID,
    });

    // Nos unimos a la sala del userID
    socket.join(socket.userID);

    // Recuperamos los mensajes de cada usuario y hacemos una cache de ellos
    const messagesPerUser: Map<string, IMessage[]> = new Map();
    messageStore.findMessagesForUser(socket.userID).forEach((message) => {
      const { from, to } = message;
      // Obtenemos los mensajes y analizamos si van o entran de otro usuario
      const otherUser = socket.userID === from ? to : from;
      if (messagesPerUser.has(otherUser)) {
        // Si existe, lo recuperamos del otro usuario y lo almacenamos en los nuestros
        messagesPerUser.get(otherUser)?.push(message);
      } else {
        // si no es nuestro se lo metemos al otro usuario
        messagesPerUser.set(otherUser, [message]);
      }
    });

    // Lista de usuarios desde la sesion.
    // Cargamos las sesiones y le pasamos sus mensajes
    const users: ISession[] = [];
    sessionStore.findAllSessions().forEach((session) => {
      users.push({
        userID: session.userID,
        username: session.username,
        connected: session.connected,
        messages: messagesPerUser.get(session.userID) || [],
      });
    });
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
          messages: [],
        });
        console.log(chalk.yellow(`<- Cliente ${socket.username} desconectado: ${new Date().toLocaleString()}`));
      }
    });
  });
};
