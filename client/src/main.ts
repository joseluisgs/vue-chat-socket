import Vue from 'vue';
import Buefy from 'buefy';
import App from './App.vue';
import 'buefy/dist/buefy.css';

Vue.config.productionTip = false;

// Importamos nuestros estilos globales de bulma
require('./assets/css/main.scss');

Vue.use(Buefy);

new Vue({
  render: (h) => h(App),
}).$mount('#app');
