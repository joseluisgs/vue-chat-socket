<template>
  <div class="select-username">
    <form @submit.prevent="onSubmit">
      <input v-model="username" placeholder="Tu nombre de usuario..." />
      <button :disabled="!isValid">Enviar</button>
    </form>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "SelectUsername",

  // Mi modelo de datos
  data: {
    username: '' as string,
  },

  // Métodos computados
  computed: {
    // La longitud es mayor que dos
    isValid() {
      return this.username.length > 2;
    },
  },

  // Mis métodos
  methods: {
    // Emitimos el evento input hacia mi padre
    onSubmit() {
      this.$emit("input", this.username);
    },
  },
});
</script>

<style scoped>
.select-username {
  width: 300px;
  margin: 200px auto 0;
}
</style>
