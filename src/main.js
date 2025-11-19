import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import i18n from './i18n';

import metaPixel from './plugins/metaPixel';

// Bootstrap CSS + JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Font Awesome
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';

// Material Icons
import 'material-icons/iconfont/material-icons.css';

// Nucleo Icons
import "./assets/css/nucleo-icons.css";
import "./assets/css/nucleo-svg.css";

// Material Kit (custom)
import materialKit from "./material-kit";

// ====================
// Fontes locais @fontsource v4
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto/900.css';
import '@fontsource/roboto-slab/400.css';
import '@fontsource/roboto-slab/700.css';

// ====================
// Criar app
const app = createApp(App);

app.use(i18n);
app.use(createPinia());
app.use(router);
app.use(materialKit);
app.use(metaPixel); // ← ativa o plugin Meta Pixel


// Track PageView em toda mudança de rota (SPA)
router.afterEach((to) => {
  // Pequeno delay para garantir que a página renderizou
  setTimeout(() => {
    window.fbq('track', 'PageView');
    // Opcional: enviar ViewContent com nome da rota
    window.fbq('track', 'ViewContent', {
      content_name: to.name || to.path,
      content_category: to.path.includes('anuncie') ? 'anunciantes' : 'assinaturas'
    });
  }, 300);
});

app.mount("#app");
