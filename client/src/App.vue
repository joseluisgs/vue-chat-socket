<template>
  <div id="app">
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

export default Vue.extend({
  name: 'App',

  // Mis componentes
  components: {
    Chat,
    SelectUsername,
    Footer,
  },

  // Mi modelo de datos
  data() {
    return {
      usernameAlreadySelected: false,
    };
  },

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

<style>
body {
  margin: 0;
}

</style>
