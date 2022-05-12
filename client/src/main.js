import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import {
  BootstrapVue,
  BootstrapVueIcons,
} from "bootstrap-vue";

// Import Bootstrap and BootstrapVue CSS files (order is important)
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import VueCookie from "vue-cookie";

Vue.config.productionTip = false;

Vue.use(VueCookie);
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
