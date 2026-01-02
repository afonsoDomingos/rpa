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
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-instagram opacity-8 text-lg" viewBox="0 0 16 16"><path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.844.047 1.097.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.282.11-.705.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/></svg>',
        link: "https://www.instagram.com/recuperaaqui_mz",
      },
      {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-whatsapp opacity-8 text-lg" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.061 3.966L0 16l4.232-1.114a7.834 7.834 0 0 0 3.758.917h.004c4.367 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.601 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>',
        link: "https://whatsapp.com/channel/0029Vb7LiyEBlHpZinsHGG2v",
      },
      {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-youtube opacity-8 text-lg" viewBox="0 0 16 16"><path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408z"/></svg>',
        link: "https://www.youtube.com/@recuperaqui",
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
            href: "https://www.instagram.com/recuperaaqui_mz",
          },
          {
            name: "Suporte WhatsApp",
            href: "https://wa.me/258847877405",
          },
          {
            name: "Canal WhatsApp",
            href: "https://whatsapp.com/channel/0029Vb7LiyEBlHpZinsHGG2v", 
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
            href: "/termsconditions",
          },
          {
            name: "Política de Privacidade",
            href: "/privacypolicy",
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
              <img :src="brand.logo" class="mb-3 footer-logo" alt="Logotipo Recupera Aqui Moçambique - Recuperação de Documentos" />
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
              <!-- Se começar com http ou for externo, usa <a>, se não usa path normal -->
              <a 
                v-if="item.href.startsWith('http')"
                class="nav-link" 
                :href="item.href" 
                target="_blank"
              >
                {{ item.name }}
              </a>
              <router-link
                v-else
                class="nav-link"
                :to="item.href.startsWith('/') ? item.href : '/' + item.href"
              >
                {{ item.name }}
              </router-link>
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
            <button 
              v-if="isAdmin"
              class="btn btn-sm btn-outline-secondary opacity-50" 
              @click="testarNotificacao"
            >
              🔔 Testar Notificação
            </button>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
<script>
import { notificationManager } from '@/utils/notificationManager';
export default {
  data() {
    return {
      isAdmin: false
    }
  },
  mounted() {
    const role = localStorage.getItem("role");
    this.isAdmin = ["admin", "SuperAdmin"].includes(role);
  },
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
