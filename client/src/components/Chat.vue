<template>
  <div>
    <div class="left-panel">
      <user
        v-for="user in users"
        :key="user.userID"
        :user="user"
        :selected="selectedUser === user"
        @select="onSelectUser(user)"
      />
    </div>
    <message-panel
      v-if="selectedUser"
      :user="selectedUser"
      @input="onMessage"
      class="right-panel"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import socket from '../services/socket';
import User from './User.vue';
import MessagePanel from './MessagePanel.vue';
import IUser from '../interfaces/IUser';

export default Vue.extend({
  name: 'Chat',

  // Mis componentes
  components: { User, MessagePanel },

  // Mi modelo de datos
  data: () => ({
    selectedUser: {} as IUser,
    users: [] as IUser[],
  }),

  // Mis métodos
  methods: {
    // Si llega un mensaje
    onMessage(content: string): void {
      // Si es de este usuario, emito el mensaje privado al usuario elegido con el contenido
      if (this.selectedUser) {
        socket.emit('private message', {
          content,
          to: this.selectedUser.userID,
        });
        this.selectedUser.messages.push({
          content,
          fromSelf: true,
        });
      }
    },

    // Si selecciono un usuario
    /* eslint-disable no-param-reassign */
    onSelectUser(user: IUser): void {
      this.selectedUser = user;
      user.hasNewMessages = false;
    },
  },

  // Mi ciclo de vida
  // Al crearme, iniciio toda la funcionalidad de Socket.io
  created() {
    // Al conectarme
    socket.on('connect', () => {
      this.users.forEach((user: IUser) => {
        if (user.self) {
          user.connected = true;
        }
      });
    });

    // Al desconectarme
    socket.on('disconnect', () => {
      this.users.forEach((user: IUser) => {
        if (user.self) {
          user.connected = false;
        }
      });
    });

    // Iniciamos propiedades rectivas
    const initReactiveProperties = (user: IUser) => {
      user.messages = [];
      user.hasNewMessages = false;
    };

    // Al recibir usuarios
    socket.on('users', (users: IUser[]) => {
      users.forEach((user) => {
        for (let i = 0; i < this.users.length; i += 1) {
          const existingUser = this.users[i];
          if (existingUser.userID === user.userID) {
            existingUser.connected = user.connected;
            return;
          }
        }
        user.self = user.userID === (socket as any).userID;
        initReactiveProperties(user);
        this.users.push(user);
      });
      // ponemos al usuario actual primero y el resto los ordenamos
      this.users = users.sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      });
    });

    // Al estar conectado
    socket.on('user connected', (user) => {
      // si existe en la lista actualizamos el estado
      for (let i = 0; i < this.users.length; i += 1) {
        const existingUser = this.users[i];
        if (existingUser.userID === user.userID) {
          existingUser.connected = true;
          return;
        }
      }
      initReactiveProperties(user);
      this.users.push(user);
    });

    // Al desconectarme
    socket.on('user disconnected', (id) => {
      for (let i = 0; i < this.users.length; i += 1) {
        const user = this.users[i];
        if (user.userID === id) {
          user.connected = false;
          break;
        }
      }
    });

    // Al mandar mensaje privado
    socket.on('private message', ({ content, from, to }) => {
      for (let i = 0; i < this.users.length; i += 1) {
        const user = this.users[i];
        const fromSelf = (socket as any).userID === from;
        if (user.userID === (fromSelf ? to : from)) {
          user.messages.push({
            content,
            fromSelf,
          });
          if (user !== this.selectedUser) {
            user.hasNewMessages = true;
          }
          break;
        }
      }
    });
  },

  // Al destruirme
  destroyed() {
    socket.off('connect');
    socket.off('disconnect');
    socket.off('users');
    socket.off('user connected');
    socket.off('user disconnected');
    socket.off('private message');
  },
});
</script>

<style scoped>
.left-panel {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 260px;
  overflow-x: hidden;
  background-color: #653ada;
  color: white;
}

.right-panel {
  margin-left: 260px;
}
</style>
