<template>
  <div id="app">
    <Header/>
    <select-username
      v-if="!usernameAlreadySelected"
      @input="onUsernameSelection"
    />
    <chat v-else />
    <Footer/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import socket from './services/socket';
import SelectUsername from './components/SelectUsername.vue';
import Chat from './components/Chat.vue';
import Footer from './components/Footer.vue';
import Header from './components/Header.vue';

export default Vue.extend({
  name: 'App',

  // Mis componentes
  components: {
    Chat,
    SelectUsername,
    Footer,
    Header,
  },

  // Mi modelo de datos
  data: () => ({
    usernameAlreadySelected: false,
  }),

  // Mis métodos
  methods: {
    // Si nos seleccionamos
    onUsernameSelection(username: string) {
      this.usernameAlreadySelected = true;
      socket.auth = { username };
      socket.connect();
    },
  },

  // Mi ciclo de vida
  // Al crearme
  created() {
    // Funciones de socket
    socket.on('connect_error', (err: Error) => {
      if (err.message === 'invalid username') {
        this.usernameAlreadySelected = false;
      }
    });
  },

  // Al destruirme
  destroyed() {
    socket.off('connect_error');
  },
});
</script>
