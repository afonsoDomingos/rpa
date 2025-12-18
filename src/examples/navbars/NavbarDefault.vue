<template>
  <nav
    class="navbar navbar-expand-lg top-0 position-fixed mx-auto my-3"
    style="
      left: 0;
      right: 0;
      max-width: 1200px;
      border-radius: 12px;
      z-index: 1030;
    "
    :class="{
      'shadow-none navbar-transparent': props.transparent,
      'blur shadow py-2': props.sticky,
      'navbar-light bg-white py-3': props.light,
      'navbar-dark bg-gradient-dark py-3': props.dark,
    }"
  >
    <div class="container px-0">
      <!-- LOGO (Desktop + Mobile) -->
      <RouterLink
        class="navbar-brand animated-logo d-flex align-items-center"
        :to="{ name: 'presentation' }"
        rel="tooltip"
        title="Página inicial"
        @mouseenter="hovering = true"
        @mouseleave="hovering = false"
      >
        <div class="logo-wrapper">
          <transition name="fade-scale">
            <olhodedeus v-if="!hovering" class="eye-logo" />
          </transition>
          <transition name="fade-scale">
            <img
              v-if="hovering"
              src="@/assets/img/rPa.png"
              alt="Logo Rpa"
              class="brand-logo"
            />
          </transition>
        </div>
      </RouterLink>

      <!-- BOTÃO SYNC (Sempre visível no mobile) -->
      <div class="ms-auto d-lg-none d-flex align-items-center">
        <a class="nav-link p-1 cursor-pointer" @click="refreshContent">
          <i class="bi bi-arrow-clockwise fs-4 sync-icon" :class="{'spinning': isSyncing}"></i>
        </a>
      </div>

      <!-- BOTÃO ASSINATURAS (mobile) -->
      <a
        @click="
          $router.push({ name: 'Assinaturas' });
          fecharDropdown();
        "
        class="btn btn-sm mb-0 ms-1 d-lg-none d-block btn-assinatura"
        role="button"
      >
        ASSINATURAS
      </a>

      <!-- TOGGLER -->
      <button
        class="navbar-toggler shadow-none ms-2"
        :class="{ collapsed: !isMenuOpen }"
        type="button"
        @click="toggleNavbar"
        aria-controls="navigation"
        :aria-expanded="isMenuOpen"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon mt-2">
          <span class="navbar-toggler-bar bar1"></span>
          <span class="navbar-toggler-bar bar2"></span>
          <span class="navbar-toggler-bar bar3"></span>
        </span>
      </button>


      <!-- MENU -->
      <div
        class="collapse navbar-collapse w-100 pt-3 pb-2 py-lg-0"
        id="navigation"
        ref="navbarCollapse"
      >
        <ul class="navbar-nav navbar-nav-hover ms-auto">
          <!-- ==== PÁGINAS ==== -->
          <li class="nav-item dropdown dropdown-hover mx-2">
            <a
              role="button"
              class="nav-link ps-2 d-flex cursor-pointer align-items-center borda-destacada"
              :class="getTextColor()"
              id="dropdownMenuPages"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i
                class="material-icons-round opacity-6 me-2 text-md"
                :class="getTextColor()"
                >dashboard</i
              >
              Páginas
              <img
                :src="getArrowColor()"
                alt="down-arrow"
                class="arrow ms-2 d-lg-block d-none"
              />
            </a>

            <div
              class="dropdown-menu dropdown-menu-animation ms-n3 dropdown-md p-3 border-radius-xl mt-0 mt-lg-3"
              aria-labelledby="dropdownMenuPages"
            >
              <div class="row">
                <div class="col-12 px-4 py-2">
                  <div class="position-relative">
                    <div
                      class="dropdown-header text-dark font-weight-bolder px-1"
                    >
                      Página Principal
                    </div>
                    <RouterLink
                      :to="{ name: 'about' }"
                      class="dropdown-item border-radius-md"
                      @click="fecharDropdown"
                    >
                      Sobre nós
                    </RouterLink>
                    <RouterLink
                      :to="{ name: 'contactus' }"
                      class="dropdown-item border-radius-md"
                      @click="fecharDropdown"
                    >
                      Contacte-nos
                    </RouterLink>
                    <RouterLink
                      :to="{ name: 'author' }"
                      class="dropdown-item border-radius-md"
                      @click="fecharDropdown"
                    >
                      Autor
                    </RouterLink>

                    <div
                      class="dropdown-header text-dark font-weight-bolder px-0 mt-3"
                    >
                      Conta
                    </div>
                    <RouterLink
                      :to="{ name: 'signin-basic' }"
                      class="dropdown-item border-radius-md"
                      @click="fecharDropdown"
                    >
                      Inscrever-se
                    </RouterLink>
                  </div>
                </div>
              </div>
            </div>
          </li>

          <!-- ==== USUÁRIO (com Admin Anúncios) ==== -->
          <li v-if="usuario" class="nav-item dropdown dropdown-hover mx-2">
            <a
              role="button"
              class="nav-link ps-2 d-flex cursor-pointer align-items-center"
              :class="getTextColor()"
              id="dropdownUser"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i
                class="material-icons-round opacity-6 me-2 text-md rotatable-profile"
                :class="getTextColor()"
                >person</i
              >
              {{ usuario?.nome || "Usuário" }}
              <img
                :src="getArrowColor()"
                alt="down-arrow"
                class="arrow ms-2 d-lg-block d-none"
              />
            </a>

            <div
              ref="dropdownMenu"
              class="dropdown-menu dropdown-menu-end dropdown-menu-animation mt-0 p-2 borda-destacada"
              aria-labelledby="dropdownUser"
              style="min-width: 180px"
            >
              <!-- Dashboard Admin -->
              <button
                v-if="usuario && usuario.role?.toLowerCase() === 'admin'"
                class="dropdown-item border-radius-md d-flex align-items-center gap-2"
                @click="
                  $router.push({ name: 'dashboard' });
                  fecharDropdown();
                "
              >
                <i class="bi bi-speedometer2 text-warning"></i> Dashboard
              </button>

              <!-- Pagamentos Admin -->
              <button
                v-if="usuario && usuario.role?.toLowerCase() === 'admin'"
                class="dropdown-item border-radius-md d-flex align-items-center gap-2"
                @click="
                  $router.push({ name: 'AdminAssinaturas' });
                  fecharDropdown();
                "
              >
                <i class="bi bi-wallet2 text-success"></i> Pagamentos
              </button>

              <!-- **NOVO** Gerenciar Anúncios -->
              <button
                v-if="usuario && usuario.role?.toLowerCase() === 'admin'"
                class="dropdown-item border-radius-md d-flex align-items-center gap-2"
                @click="navegarParaAdminAnuncios"
              >
                <i class="bi bi-megaphone-fill text-purple"></i> Gerenciar
                Anúncios
              </button>

              <!-- Meus Pagamentos -->
              <button
                class="dropdown-item border-radius-md d-flex align-items-center gap-2"
                @click="
                  $router.push({ name: 'MeusPagamentos' });
                  fecharDropdown();
                "
              >
                <i class="bi bi-credit-card text-primary"></i> Meus Pagamentos
              </button>

              <!-- Meus Documentos -->
              <button
                class="dropdown-item border-radius-md d-flex align-items-center gap-2"
                @click="
                  $router.push({ name: 'MeusDocumentos' });
                  fecharDropdown();
                "
              >
                <i class="bi bi-folder2-open text-info"></i> Meus Documentos
              </button>

              <div class="dropdown-divider"></div>

              <!-- Sair -->
              <button
                class="dropdown-item border-radius-md d-flex align-items-center gap-2 text-danger"
                @click="
                  logout();
                  fecharDropdown();
                "
              >
                <i class="bi bi-box-arrow-right"></i> Sair
              </button>
            </div>
          </li>

          <!-- ==== LOGIN (quando não logado) ==== -->
          <li v-else class="nav-item dropdown dropdown-hover mx-2">
            <router-link
              to="/"
              class="nav-link d-flex cursor-pointer align-items-center"
              @click="fecharDropdown"
            >
              <i class="material-icons-round opacity-6 me-2 text-md">person</i>
              Entrar
            </router-link>
          </li>

          <!-- ==== FERRAMENTAS ==== -->
          <li class="nav-item dropdown dropdown-hover mx-2">
            <a
              role="button"
              class="nav-link ps-2 d-flex cursor-pointer align-items-center"
              :class="getTextColor()"
              id="dropdownTools"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i class="bi bi-gear-fill me-2 rotatable-icon"></i>
              Ferramentas
              <img
                :src="getArrowColor()"
                alt="down-arrow"
                class="arrow ms-2 d-lg-block d-none"
              />
            </a>

            <div
              class="dropdown-menu dropdown-menu-end dropdown-menu-animation mt-0 p-2 borda-destacada border-radius-lg"
              aria-labelledby="dropdownTools"
              style="min-width: 180px"
            >
              <!-- Meus Anúncios (todos os usuários) -->
              <button
                class="dropdown-item border-radius-md d-flex align-items-center gap-2"
                @click="
                  $router.push({ name: 'MeusAnuncios' });
                  fecharDropdown();
                "
              >
                <i class="bi bi-megaphone text-purple"></i> Meus Anúncios
              </button>

              <button
                class="dropdown-item border-radius-md d-flex align-items-center gap-2"
                @click="
                  $router.push({ name: 'ComunidadeRpa' });
                  fecharDropdown();
                "
              >
                <i class="bi bi-people-fill text-info"></i> Feed de publicações
              </button>

              <button
                class="dropdown-item border-radius-md d-flex align-items-center gap-2"
                @click="
                  $router.push({ name: 'CVGenerator' });
                  fecharDropdown();
                "
              >
                <i class="bi bi-file-earmark-person text-warning"></i> Gerador
                de Currículo
              </button>

              <button
                class="dropdown-item border-radius-md d-flex align-items-center gap-2"
                @click="
                  $router.push({ name: 'GuardarDocumentos' });
                  fecharDropdown();
                "
              >
                <i class="bi bi-folder-plus text-success"></i> Armazenar
                Documentos
              </button>

              <button
                class="dropdown-item border-radius-md d-flex align-items-center gap-2"
                @click="
                  $router.push({ name: 'Viaturas' });
                  fecharDropdown();
                "
              >
                <i class="bi bi-car-front text-success"></i> Rastreador de
                Viaturas
              </button>
            </div>
          </li>

          <!-- ==== ATUALIZAR (Sync - Desktop Only) ==== -->
          <li class="nav-item mx-1 d-none d-lg-block">
            <a
              class="nav-link d-flex align-items-center cursor-pointer"
              :class="getTextColor()"
              title="Sincronizar dados"
              @click="refreshContent"
            >
              <i class="bi bi-arrow-clockwise text-md sync-icon" :class="{'spinning': isSyncing}"></i>
            </a>
          </li>

          <!-- ==== ASSINATURA (desktop) ==== -->
          <li class="d-none d-lg-block">
            <a
              class="btn btn-sm mb-0 ms-2 btn-assinatura"
              role="button"
              @click="
                $router.push({ name: 'Assinaturas' });
                fecharDropdown();
              "
            >
              Assinatura
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { ref, watch, onMounted, nextTick } from "vue";
import { useWindowsWidth } from "../../assets/js/useWindowsWidth";
import olhodedeus from "./olhodedeus.vue"; // Componente do olho
import Swal from "sweetalert2"; // Import SweetAlert2

const dropdownMenu = ref(null);
const navbarCollapse = ref(null);
const hovering = ref(false); // hover do olho/logo
const isMenuOpen = ref(false);
const isSyncing = ref(false);

const refreshContent = async () => {
  if (isSyncing.value) return;
  isSyncing.value = true;
  
  try {
    // Sincroniza dados globais (usuário, etc)
    await buscarUsuario();
    
    // Notifica outros componentes que devem atualizar seus dados
    eventBus.emit("refreshData");
    
    // Simula um delay visual para o utilizador sentir que algo aconteceu
    setTimeout(() => {
      isSyncing.value = false;
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      Toast.fire({
        icon: 'success',
        title: 'Dados sincronizados'
      });
    }, 800);
  } catch (error) {
    isSyncing.value = false;
  }
};

onMounted(() => {
  buscarUsuario();

  // Fecha menu ao clicar em qualquer link
  nextTick(() => {
    document
      .querySelectorAll(".nav-link, .dropdown-item, .btn-assinatura")
      .forEach((el) => {
        el.addEventListener("click", (e) => {
          // Se for um toggle de dropdown, não fechar o menu mobile
          if (el.getAttribute("data-bs-toggle") === "dropdown") return;

          const collapse = bootstrap.Collapse.getInstance(navbarCollapse.value);
          if (collapse) collapse.hide();
        });
      });
      
    // Sincronizar estado do menu com a variável reativa para o ícone do botão
    if (navbarCollapse.value) {
      navbarCollapse.value.addEventListener("show.bs.collapse", () => {
        isMenuOpen.value = true;
      });
      navbarCollapse.value.addEventListener("hide.bs.collapse", () => {
        isMenuOpen.value = false;
      });
    }
  });
});
function fecharDropdown() {
  const dropdown = bootstrap.Dropdown.getInstance(
    dropdownMenu.value?.parentElement
  );
  if (dropdown) dropdown.hide();

  const collapse = bootstrap.Collapse.getInstance(navbarCollapse.value);
  if (collapse) collapse.hide();
}

// Imagens
import ArrDark from "@/assets/img/down-arrow-dark.svg";
import DownArrWhite from "@/assets/img/down-arrow-white.svg";

import eventBus from "@/eventBus";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const usuario = ref(null);

// LOGOUT COM SWEETALERT
const logout = () => {
  Swal.fire({
    title: "Tem certeza?",
    text: "Deseja realmente sair da sua conta?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#800080", // Roxo da marca
    cancelButtonColor: "#d33",
    confirmButtonText: "Sim, sair",
    cancelButtonText: "Cancelar"
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("email");
      localStorage.removeItem("token");
      usuario.value = null;

      Swal.fire({
        title: "Saiu!",
        text: "Logout realizado com sucesso.",
        icon: "success",
        confirmButtonColor: "#66bb6a", // Verde da marca
        timer: 2000,
        showConfirmButton: false
      });
      
      router.push("/");
    }
  });
};

// BUSCAR USUÁRIO LOGADO
const buscarUsuario = async () => {
  try {
    const token = localStorage.getItem("token");
    // Se não tiver token, apenas não define o usuário (não força redirect)
    if (!token) return;

    const { data } = await axios.get(
      "https://apirpa.onrender.com/api/auth/me",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    usuario.value = data;
  } catch (error) {
    console.error("Erro ao buscar o usuário:", error);
    // Se der erro (ex: token expirado), podemos limpar o token
    // localStorage.removeItem("token");
    // localStorage.removeItem("email");
  }
};



// Correção para o botão toggler (X) fechar o menu no mobile
const toggleNavbar = () => {
  if (navbarCollapse.value) {
    const collapse = new bootstrap.Collapse(navbarCollapse.value, {
      toggle: false, // Não inicializa togglando
    });
    collapse.toggle();
  }
};


const goToCadastrar = () => {
  eventBus.emit("changeTab", "cadastrar");
  setTimeout(() => {
    const element = document.getElementById("cadastrar-tabs-simple");
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 0);
};

const navegarParaAdminAnuncios = () => {
  router.push({ name: 'AdminAnuncios' })
    .then(() => fecharDropdown())
    .catch((error) => console.error("Erro ao navegar:", error));
};

const props = defineProps({
  action: {
    type: Object,
    default: () => ({
      route:
        "https://docs.google.com/forms/d/e/1FAIpQLSdLO0mga6ygr6oVlCHQ6Hgt48baiZuQlXTzPRYynhXv0etD3g/viewform",
      color: "bg-gradient-success",
      label: "ASSINATURAS",
    }),
  },
  transparent: { type: Boolean, default: false },
  light: { type: Boolean, default: false },
  dark: { type: Boolean, default: false },
  sticky: { type: Boolean, default: false },
  darkText: { type: Boolean, default: false },
});

// ---- CORES ----
function getArrowColor() {
  if (props.transparent && textDark.value) return ArrDark;
  else if (props.transparent) return DownArrWhite;
  else return ArrDark;
}
const getTextColor = () => {
  if (props.transparent && textDark.value) return "text-dark";
  else if (props.transparent) return "text-white";
  else return "text-dark";
};

// ---- RESPONSIVIDADE ----
let textDark = ref(props.darkText);
const { type } = useWindowsWidth();

if (type.value === "mobile") textDark.value = true;
else textDark.value = false;

watch(
  () => type.value,
  (newValue) => {
    textDark.value = newValue === "mobile";
  }
);
</script>

<style scoped>
/* LOGO / OLHO */
.logo-wrapper {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -2px;
  margin-bottom: -2px;
}
.brand-logo {
  height: 32px;
  width: auto;
  object-fit: contain;
  vertical-align: middle;
}

/* TRANSITIONS */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
.fade-scale-enter-to,
.fade-scale-leave-from {
  opacity: 1;
  transform: scale(1);
}

/* ESTILO GERAL */
.borda-destacada {
  border: 2px solid #66bb6a;
  border-radius: 12px;
  padding: 10px 0;
  background-color: #fff;
  transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
}
.borda-destacada:hover {
  border-color: #800080;
  box-shadow: 0 8px 20px rgba(128, 0, 128, 0.25);
  transform: scale(1.02);
}
.btn-assinatura {
  background: linear-gradient(135deg, #800080, #66bb6a);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.btn-assinatura:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(128, 0, 128, 0.3);
}

/* ÍCONES ROTATIVOS */
.rotatable-icon,
.rotatable-profile {
  transition: transform 0.3s ease, color 0.3s ease;
  color: inherit;
}
#dropdownTools[aria-expanded="true"] .rotatable-icon {
  transform: rotate(90deg);
  color: #800080;
}
#dropdownUser[aria-expanded="true"] .rotatable-profile {
  transform: scale(1.2);
  color: #800080 !important;
}

/* SYNC ICON ANIMATION */
.sync-icon {
  font-size: 1.2rem;
  transition: color 0.3s ease;
}
.spinning {
  animation: spin-around 0.8s linear infinite;
  color: #800080 !important;
}
@keyframes spin-around {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ESPAÇO PARA NAVBAR FIXA */
body {
  padding-top: 60px; /* ajuste conforme a altura real */
}

/* RESPONSIVO */
@media (max-width: 991px) {
  .navbar {
    width: 90%;
    max-width: 380px;
    margin: 0 auto;
    border-radius: 12px;
  }
  .navbar .container {
    padding-left: 10px;
    padding-right: 10px;
  }
}
</style>
