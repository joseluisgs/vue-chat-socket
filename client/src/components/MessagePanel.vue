<template>
  <div>
    <div class="header">
      <status-icon :connected="user.connected"></status-icon>👤
      {{ user.username }}
    </div>
    <div class="inbox">
      <ul class="messages">
        <li
          v-for="(message, index) in user.messages"
          :key="index"
          :class="message.fromSelf ? 'out-message m-3' : 'in-message m-3'"
        >
          <div class="sender" v-if="displaySender(message, index)">
            {{ message.fromSelf ? "(Tú)" : user.username }}
          </div>
          {{ message.content }}<br /><span class="time_date">{{
            getTime
          }}</span>
        </li>
      </ul>
    </div>
    <div class="columns">
      <div class="column">
        <form class="message_form m-3" @submit.prevent="onSubmit">
          <div class="columns"></div>
          <div class="field is-horizontal is-expanded">
            <div class="field-body">
              <div class="field is-expanded">
                <p class="control">
                  <input
                    class="input"
                    v-model="input"
                    type="text"
                    placeholder="Nuevo mensaje"
                  />
                </p>
              </div>
              <div class="field is-narrow">
                <p class="control">
                  <button
                    class="button is-link message_form__button"
                    :disabled="!isValid"
                    type="submit"
                  >
                    Enviar
                  </button>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import StatusIcon from './StatusIcon.vue';
import IUser from '../interfaces/IUser';

export default Vue.extend({
  name: 'MessagePanel',

  // Mis componentes
  components: {
    StatusIcon,
  },

  // Mis propiedades
  props: {
    user: Object as () => IUser,
  },

  // Mis datos
  data: () => ({
    input: '',
  }),

  methods: {
    onSubmit(): void {
      this.$emit('input', this.input);
      this.input = '';
    },

    displaySender(message: string, index: number | string | symbol): boolean {
      const indice = Number(index);
      return (
        index === 0
        || this.user.messages[indice - 1].fromSelf
          !== this.user.messages[indice].fromSelf
      );
    },
  },

  // Mis métodos computados
  computed: {
    isValid(): boolean {
      return this.input.length > 0;
    },
    getTime(): string {
      const time = new Date();
      return time.toLocaleString('es-ES');
    },
  },
});
</script>

<style scoped>
.header {
  line-height: 40px;
  padding: 10px 20px;
  border-bottom: 1px solid #dddddd;
}

.messages {
  margin: 0;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  padding-bottom: 2rem;
  overflow: auto;
}

.in-message {
  font-size: 0.9rem;
  margin: 1rem;
  background-color: #ccefff;
  width: 50%;
  padding: 1rem;
  box-shadow: -0px -2px 3px rgb(190, 190, 190);
  border-radius: 8px;
}
.out-message {
  font-size: 0.9rem;
  margin: 1rem;
  background-color: rgb(128, 245, 206);
  width: 50%;
  padding: 1rem;
  box-shadow: -0px -2px 3px rgb(190, 190, 190);
  border-radius: 8px;
  align-self: flex-end;
}

.sender {
  font-weight: bold;
  margin-top: 5px;
}

.message_form {
  background-color: rgb(224, 224, 224);
  padding: 1rem;
  height: 8vh;
  box-shadow: -0px -2px 3px rgb(190, 190, 190);
  border-radius: 8px;
}
.time_date {
  font-size: 0.75rem;
  color: grey;
}

.inbox {
  height: 62vh;
  overflow: auto;
}
</style>
