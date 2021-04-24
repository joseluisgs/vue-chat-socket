<template>
  <div class="user" @click="onClick" :class="{ selected: selected }">
    <div class="description">
      <div class="name"> 👤
        {{ user.username }} {{ user.self ? " (Tú)" : "" }}
      </div>
      <div class="status">
        <status-icon :connected="user.connected" />{{ status }}
      </div>
    </div>
    <div v-if="user.hasNewMessages" class="new-messages">!</div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import StatusIcon from './StatusIcon.vue';

export default Vue.extend({
  name: 'User',
  // Mis componentes
  components: { StatusIcon },

  // Mis propiedades
  props: {
    user: Object,
    selected: Boolean,
  },

  // Mis métodos
  methods: {
    // Emito ele vento select a mi padre
    onClick() {
      this.$emit('select');
    },
  },

  // Métodos computados
  computed: {
    // Muestra el estado
    status(): 'conectado' | 'desconectado' {
      return this.user.connected ? 'conectado' : 'desconectado';
    },
  },
});
</script>

<style scoped>
.selected {
  background-color: #1164a3;
}

.user {
  padding: 10px;
}

.description {
  display: inline-block;
}

.status {
  color: #cecfd1;
}

.new-messages {
  color: white;
  background-color: red;
  width: 20px;
  border-radius: 5px;
  text-align: center;
  float: right;
  margin-top: 10px;
}
</style>
