<script setup>
import logoDark2 from "@/assets/img/rPa.png";
defineProps({
  brand: {
    type: Object,
    name: String,
    logo: String,
    route: "",
    default: () => ({
      name: "Rpa",
      logo: logoDark2,
      route: "/",
    }),
  },
  socials: {
    type: Array,
    icon: String,
    link: String,
    default: () => [
      {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-facebook opacity-8 text-lg" viewBox="0 0 16 16"><path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/></svg>',
        link: "https://www.facebook.com/profile.php?id=61570930139844&sk=photos",
      },
      {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-linkedin opacity-8 text-lg" viewBox="0 0 16 16"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225h2.401m-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4"/></svg>',
        link: "https://www.linkedin.com/in/afonso-domingos-6b59361a5/",
      },
      {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dribbble opacity-8 text-lg" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 0C3.584 0 0 3.584 0 8s3.584 8 8 8c4.408 0 8-3.584 8-8s-3.592-8-8-8m5.284 3.688a6.8 6.8 0 0 1 1.545 4.251c-.226-.043-2.482-.503-4.755-.217-.052-.112-.096-.234-.148-.355-.139-.33-.295-.668-.451-.99 2.516-1.023 3.662-2.498 3.809-2.689Zm-9.216.31a6.8 6.8 0 0 1 2.378-1.815c.677 1.745 2.115 3.332 3.69 4.316a51 51 0 0 1-1.358 4.22c-2.315-.818-4.57-1.168-5.353-1.205a6.8 6.8 0 0 1 .643-5.517m7.055 9.073c-.093.2-.185.397-.279.58A6.8 6.8 0 0 1 2.78 11.66c.214.032 2.764.444 6.216 1.411Zm-1.637.742c-.529 1.758-1.073 3.109-1.22 3.468a6.8 6.8 0 0 1-3.79-3.79c.361-.145 1.706-.689 3.461-1.218.423 1.137.962 1.455 1.55 1.541m2.16-1.677c.319.98.543 2.17.618 3.203a6.8 6.8 0 0 1-2.52 1.053c-.328-1.208-.544-2.61-.59-4.045 1.054-.108 1.956-.164 2.492-.211m1.564-1.916c.395-.12.836-.214 1.309-.274a6.8 6.8 0 0 1-.502 3.328c-.687-.208-2.622-.656-3.886-1.42 1.259-1.066 2.37-1.432 3.079-1.634m-.63-5.32c.11.08.799.646 2.053 1.272a6.8 6.8 0 0 1 .151 3.234c-.588.083-1.196.15-1.81.18-.306-.922-.572-1.928-.787-2.923l2.84-2.839a.5.5 0 0 0-.707-.707L8.35 12.35 6 10l-2.35 2.35a.5.5 0 0 0 .707.707L10 12.35l2.646 2.646a.5.5 0 0 0 .707 0l2.84-2.84c-.206-.995-.48-2.001-.787-2.923-1.6-.33-3.66-.46-5.46-.46z"/></svg>',
        link: "https://recuperaaqui.vercel.app",
      },
      {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github opacity-8 text-lg" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg>',
        link: "https://github.com/afonsoDomingos/rpa",
      },
      {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-youtube opacity-8 text-lg" viewBox="0 0 16 16"><path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408z"/></svg>',
        link: "https://www.youtube.com/channel/UClyCqvjCJeQHY21K5SMe2LA",
      },
    ],
  },
  menus: {
    type: Array,
    name: String,
    items: {
      type: Array,
      name: String,
      href: String,
    },
    default: () => [
      {
        name: "Empresa",
        items: [
          {
            name: "Sobre Nós",
            href: "about",
          },
          {
            name: "Porquê Rpa",
            href: "",
          },
          {
            name: "Como Funciona",
            href: "",
          },
          { name: "Equipe", href: "" },
        ],
      },
      {
        name: "Redes sociais",
        items: [
          {
            name: "Facebook",
            href: "https://www.facebook.com/profile.php?id=61570930139844&sk=photos",
          },
          {
            name: "Instagram",
            href: "https://www.facebook.com/profile.php?id=61570930139844&sk=photos",
          },
          {
            name: "Whatsapp",
            href: "https://www.facebook.com/profile.php?id=61570930139844&sk=photos",
          },
        ],
      },
      {
        name: "Suporte",
        items: [
          {
            name: "Contacte-nos",
            href: "contactus",
          },
        ],
      },
      {
        name: "Jurídico",
        items: [
          {
            name: "Termos e Condições",
            href: "termsconditions",
          },
          {
            name: "Política de Privacidade",
            href: "privacypolicy",
          },
        ],
      },
    ],
  },
});
</script>
<template>
  <footer class="footer pt-5 mt-5">
    <div class="container">
      <div class="row">
        <div class="col-md-3 mb-4 ms-auto">
          <div>
            <a :href="brand.route">
              <img :src="brand.logo" class="mb-3 footer-logo" alt="main_logo" />
            </a>
            <h6 class="font-weight-bolder mb-4 text-purple">{{ brand.name }}</h6>
          </div>
          <div>
            <ul class="d-flex flex-row ms-n3 nav">
              <li
                class="nav-item"
                v-for="{ icon, link } of socials"
                :key="link"
              >
                <a
                  class="nav-link pe-1 social-icon-link"
                  :href="link"
                  target="_blank"
                  v-html="icon"
                >
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div
          class="col-md-2 col-sm-6 col-6 mb-4"
          v-for="{ name, items } of menus"
          :key="name"
        >
          <h6 class="text-sm text-purple fw-bold">{{ name }}</h6>
          <ul class="flex-column ms-n3 nav">
            <li class="nav-item" v-for="item of items" :key="item.name">
              <a class="nav-link" :href="item.href" target="_blank">
                {{ item.name }}
              </a>
            </li>
          </ul>
        </div>

        <div class="col-12">
          <div class="text-center">
            <p class="text-dark my-4 text-sm font-weight-normal">
              Todos os Direitos Reservados.
              {{ new Date().getFullYear() }}
              Rpa By
              <a href="https://www.facebook.com/Techvibemz/" target="_blank"
                >Techvibe</a
              >.
            </p>
            <button class="btn btn-sm btn-outline-secondary opacity-50" @click="testarNotificacao">🔔 Testar Notificação</button>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
<script>
import { notificationManager } from '@/utils/notificationManager';
export default {
  methods: {
    testarNotificacao() {
      notificationManager.notifyDocumentoEncontrado('Documento Teste');
    }
  }
}
</script>
<style scoped>
.text-purple {
  color: #800080 !important;
}

.footer-logo {
  max-height: 50px;
  width: auto;
}

.social-icon-link {
  color: #800080 !important;
  transition: transform 0.2s ease;
}

.social-icon-link:hover {
  transform: translateY(-3px);
  color: #198754 !important; /* Verde no hover para contraste */
}

/* Garante que o SVG interno herde a cor */
.social-icon-link :deep(svg) {
  fill: currentColor !important;
  width: 20px;
  height: 20px;
}

.nav-link {
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #800080 !important;
}
</style>
