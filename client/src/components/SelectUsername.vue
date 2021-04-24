<template>
  <div>
    <header class="has-background-primary py-2 mb-4 has-text-link-light">
      <p class="has-text-centered is-size-1 has-text-weight-semibold">
        📨 Vue.js Socket.io Web Chat
        <img src="@/assets/logo.png" width="40" />
      </p>
    </header>
    <form @submit.prevent="onSubmit">
      <div class="select-username">
        <p class="has-text-centered is-size-1">¡Conéctate!</p>
        <div class="field">
          <label class="label">Username</label>
          <div class="control">
            <input
              v-model="username"
              class="input"
              type="text"
              placeholder="Tu nombre de usuario..."
            />
          </div>
        </div>

        <div class="field is-grouped">
          <div class="control">
            <button :disabled="!isValid" class="button is-link">Enviar</button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'SelectUsername',

  // Mi modelo de datos
  data() {
    return {
      username: '' as string,
    };
  },

  // Métodos computados
  computed: {
    // La longitud es mayor que dos
    isValid(): boolean {
      return this.username.length > 2;
    },
  },

  // Mis métodos
  methods: {
    // Emitimos el evento input hacia mi padre
    onSubmit() {
      this.$emit('input', this.username);
    },
  },
});
</script>

<style lang="scss">
.select-username {
  width: 300px;
  margin: 200px auto 0;
}
</style>
