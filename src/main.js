import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";

// Bootstrap CSS + JS
import "bootstrap/dist/css/bootstrap.min.css";
import * as bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";
window.bootstrap = bootstrap;

// Font Awesome (Somente CSS, removido JS pesado)
import "@fortawesome/fontawesome-free/css/all.min.css";

// Bootstrap Icons
import "bootstrap-icons/font/bootstrap-icons.css";

// Nucleo Icons
import "./assets/css/nucleo-icons.css";
import "./assets/css/nucleo-svg.css";

// Material Kit (custom)
import materialKit from "./material-kit";

// Global Effects & Animations
import "./assets/css/global-effects.css";

// ====================
// Fontes locais (Mantendo apenas as críticas se necessário, idealmente usar Google Fonts no index.html)
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

// ====================
// Criar app
const app = createApp(App);

app.use(i18n);
app.use(createPinia());
app.use(router);
app.use(materialKit);

app.mount("#app");
