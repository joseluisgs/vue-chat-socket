/* eslint-disable no-param-reassign */
/**
* FUNCIONALIDAD DEL SOCKET.IO
*/

// Librerías
import * as socketio from 'socket.io';
import http from 'http';
import chalk from 'chalk';

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
    const { username } = socket.handshake.auth;
    if (!username) {
      return next(new Error('Nombre de usuario invalido'));
    }
    socket.username = username;
    return next();
  });

  // Si nos llega el evento de connexión
  io.on('connection', (socket: any) => {
    socket.emit('status', '👋 Hola desde el servidor');
    // Lista de usuarios
    const users: { userID: string; username: any; }[] = [];
    // Recorremos los abiertos
    io.of('/').sockets.forEach((value, key) => {
      const { username } = value as any;
      users.push({
        userID: key,
        username,
      });
      console.log(chalk.cyan(`-> Clientes conectados ${username} conectado: ${new Date().toLocaleString()}`));
    });
    // Emitimos la lista de usuarios
    socket.emit('users', users);

    // Notoficamos los usuarios existentes
    socket.broadcast.emit('user connected', {
      userID: socket.id,
      username: socket.username,
    });

    // Evento de si nos llega un mensaje privado, se lo entregamos a quien corresponda
    socket.on('private message', (data: any) => {
      socket.to(data.to).emit('private message', {
        content: data.content,
        from: socket.id,
      });
    });

    // Si nos llega el evento de desconectar
    socket.on('disconnect', () => {
      socket.broadcast.emit('user disconnected', socket.id);
      console.log(chalk.yellow(`<- Cliente ${socket.username} desconectado: ${new Date().toLocaleString()}`));
    });
  });
};
