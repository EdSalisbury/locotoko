import { createApp } from "vue";
import { createBootstrap } from "bootstrap-vue-next";
import ToastPlugin from "vue-toast-notification";
import App from "./App.vue";
import router from "./router";
import cookies from "./cookies";

// Bootstrap and bootstrap-vue-next CSS (order matters), then icons and app styles.
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "vue-toast-notification/dist/theme-sugar.css";
import "@/assets/global.scss";

const app = createApp(App);

app.use(createBootstrap());
app.use(router);
app.use(cookies);
app.use(ToastPlugin, { position: "top-right", duration: 5000 });

app.mount("#app");
