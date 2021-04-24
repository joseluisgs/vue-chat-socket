/* eslint-disable no-param-reassign */
/**
* FUNCIONALIDAD DEL SOCKET.IO
*/

// Librerías
import * as socketio from 'socket.io';
import http from 'http';
import chalk from 'chalk';
import crypto from 'crypto';
import InMemorySessionStore from './Store/InMemorySessionStore';

// Para obtener ID aleatorios
const randomId = () => crypto.randomBytes(8).toString('hex');
// Las Sesiones
const sessionStore = new InMemorySessionStore();

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
    });

    // Emitimos los datos de la sesion
    socket.emit('session', {
      sessionID: socket.sessionID,
      userID: socket.userID,
    });

    // Nos unimos a la sala del userID
    socket.join(socket.userID);

    // Lista de usuarios desde la sesion
    // fetch existing users
    const users: any[] = [];
    sessionStore.findAllSessions().forEach((session) => {
      users.push({
        userID: session.userID,
        username: session.username,
        connected: session.connected,
      });
    });
    socket.emit('users', users);

    // Notoficamos los usuarios existentes
    socket.broadcast.emit('user connected', {
      userID: socket.userID,
      username: socket.username,
      connected: true,
    });

    // Evento de si nos llega un mensaje privado, se lo entregamos a quien corresponda
    socket.on('private message', (data: any) => {
      socket.to(data.to).emit('private message', {
        content: data.content,
        from: socket.id,
      });
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
};
