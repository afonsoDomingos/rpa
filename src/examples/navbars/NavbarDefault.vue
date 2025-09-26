<script setup>
import { RouterLink } from "vue-router";
import { ref, watch, onMounted } from "vue";
import { useWindowsWidth } from "../../assets/js/useWindowsWidth";

const dropdownMenu = ref(null);

// Função para fechar o dropdown
function fecharDropdown() {
  const dropdown = bootstrap.Dropdown.getInstance(dropdownMenu.value?.parentElement);
  if (dropdown) {
    dropdown.hide();
  }
}

// images
import ArrDark from "@/assets/img/down-arrow-dark.svg";
import DownArrWhite from "@/assets/img/down-arrow-white.svg";

import eventBus from '@/eventBus'; 
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const usuario = ref(null);

// Logout
const logout = () => {
  localStorage.removeItem('email');
  usuario.value = null;
  alert('Logout realizado com sucesso!');
  router.push('/');
};

// Buscar usuário logado
const buscarUsuario = async () => {
  try {
    const emailLogado = localStorage.getItem('email');
    if (!emailLogado) {
      router.push('/');
      return;
    }

    const response = await axios.get('https://apirpa.onrender.com/api/auth/usuarios');
    if (!Array.isArray(response.data)) return;

    usuario.value = response.data.find(u => u.email === emailLogado);
    if (!usuario.value) router.push('/');
  } catch (error) {
    console.error('Erro ao buscar o usuário:', error);
  }
};

onMounted(() => {
  buscarUsuario();
});

const goToCadastrar = () => {
  eventBus.emit('changeTab', 'cadastrar');
  setTimeout(() => {
    const element = document.getElementById('cadastrar-tabs-simple');
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 0);
};

const props = defineProps({
  action: {
    type: Object,
    route: String,
    color: String,
    label: String,
    default: () => ({
      route: "https://docs.google.com/forms/d/e/1FAIpQLSdLO0mga6ygr6oVlCHQ6Hgt48baiZuQlXTzPRYynhXv0etD3g/viewform",
      color: "bg-gradient-success",
      label: "DOCUMENTOS"
    })
  },
  transparent: { type: Boolean, default: false },
  light: { type: Boolean, default: false },
  dark: { type: Boolean, default: false },
  sticky: { type: Boolean, default: false },
  darkText: { type: Boolean, default: false }
});

// set arrow color
function getArrowColor() {
  if (props.transparent && textDark.value) return ArrDark;
  else if (props.transparent) return DownArrWhite;
  else return ArrDark;
}

// set text color
const getTextColor = () => {
  if (props.transparent && textDark.value) return "text-dark";
  else if (props.transparent) return "text-white";
  else return "text-dark";
};

// Responsividade
let textDark = ref(props.darkText);
const { type } = useWindowsWidth();

if (type.value === "mobile") textDark.value = true;
else textDark.value = false;

watch(() => type.value, (newValue) => {
  textDark.value = newValue === "mobile";
});
</script>

<template>
  <nav class="navbar navbar-expand-lg top-0"
    :class="{
      'z-index-3 w-100 shadow-none navbar-transparent position-absolute my-3': props.transparent,
      'my-3 blur border-radius-lg z-index-3 py-2 shadow py-2 start-0 end-0 mx-4 position-absolute  mt-4': props.sticky,
      'navbar-light bg-white py-3': props.light,
      ' navbar-dark bg-gradient-dark z-index-3 py-3': props.dark
    }">
    <div :class="props.transparent || props.light || props.dark ? 'container' : 'container-fluid px-0'">
      
      <!-- Logo -->
      <RouterLink class="navbar-brand d-none d-md-block"
        :class="[(props.transparent && textDark.value) || !props.transparent ? 'text-dark font-weight-bolder ms-sm-3' : 'text-white font-weight-bolder ms-sm-3']"
        :to="{ name: 'presentation' }" rel="tooltip" title="Página inicial">
        <img src="@/assets/img/rPa.png" alt="Logo Rpa"
          style="height:38px;width:auto;object-fit:contain;vertical-align:middle;" />
      </RouterLink>

      <RouterLink class="navbar-brand d-block d-md-none"
        :class="props.transparent || props.dark ? 'text-white' : 'font-weight-bolder ms-sm-3'"
        to="/" rel="tooltip" title="Menu">Menu</RouterLink>

      <a @click="goToCadastrar" class="btn btn-sm bg-gradient-success mb-0 ms-auto d-lg-none d-block"
        :class="action.color" role="button">{{ action.label }}</a>

      <button class="navbar-toggler shadow-none ms-2" type="button" data-bs-toggle="collapse"
        data-bs-target="#navigation" aria-controls="navigation" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon mt-2">
          <span class="navbar-toggler-bar bar1"></span>
          <span class="navbar-toggler-bar bar2"></span>
          <span class="navbar-toggler-bar bar3"></span>
        </span>
      </button>

      <div class="collapse navbar-collapse w-100 pt-3 pb-2 py-lg-0" id="navigation">
        <ul class="navbar-nav navbar-nav-hover ms-auto ">

          <!-- Dropdown Páginas -->
          <li class="nav-item dropdown dropdown-hover mx-2">
            <a role="button" class="nav-link ps-2 d-flex cursor-pointer align-items-center borda-destacada"
              :class="getTextColor()" id="dropdownMenuPages" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="material-icons opacity-6 me-2 text-md" :class="getTextColor()">dashboard</i>
              Paginas
              <img :src="getArrowColor()" alt="down-arrow" class="arrow ms-2 d-lg-block d-none" />
            </a>
            <div class=" dropdown-menu dropdown-menu-animation ms-n3 dropdown-md p-3 border-radius-xl mt-0 mt-lg-3"
              aria-labelledby="dropdownMenuPages">
              <div class="row d-none d-lg-block">
                <div class="col-12 px-4 py-2">
                  <div class="row">
                    <div class="position-relative">
                      <div class="dropdown-header text-dark font-weight-bolder d-flex align-items-center px-1">
                        Pagina Principal
                      </div>
                      <RouterLink :to="{ name: 'about' }" class="dropdown-item border-radius-md">Sobre nós</RouterLink>
                      <RouterLink :to="{ name: 'contactus' }" class="dropdown-item border-radius-md">Contacte-nos</RouterLink>
                      <RouterLink :to="{ name: 'author' }" class="dropdown-item border-radius-md">Autor</RouterLink>

                      <div class="dropdown-header text-dark font-weight-bolder d-flex align-items-center px-0 mt-3">
                        Conta
                      </div>
                      <RouterLink :to="{ name: 'signin-basic' }" class="dropdown-item border-radius-md">Inscrever-se</RouterLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>

          <!-- Dropdown Usuário -->
          <li v-if="usuario" class="nav-item dropdown dropdown-hover mx-2">
            <a role="button" class="nav-link ps-2 d-flex cursor-pointer align-items-center" :class="getTextColor()"
              id="dropdownUser" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="material-icons opacity-6 me-2 text-md" :class="getTextColor()">person</i>
              {{ usuario?.nome || 'Usuário' }}
              <img :src="getArrowColor()" alt="down-arrow" class="arrow ms-2 d-lg-block d-none" />
            </a>

            <div ref="dropdownMenu"
              class="dropdown-menu dropdown-menu-end dropdown-menu-animation mt-0 p-2 borda-destacada"
              aria-labelledby="dropdownUser" style="min-width: 180px;">
              
              <button class="dropdown-item border-radius-md d-flex align-items-center gap-2"
                @click="$router.push({ name: 'MeusPagamentos' })">
                <i class="bi bi-credit-card text-primary"></i> Meus Pagamentos
              </button>

              <button class="dropdown-item border-radius-md d-flex align-items-center gap-2"
                @click="$router.push({ name: 'MeusDocumentos' })">
                <i class="bi bi-folder2-open text-info"></i> Meus Documentos
              </button>

              <div class="dropdown-divider"></div>
              <button class="dropdown-item border-radius-md d-flex align-items-center gap-2 text-danger" @click="logout">
                <i class="bi bi-box-arrow-right"></i> Sair
              </button>
            </div>
          </li>

          <li v-else class="nav-item dropdown dropdown-hover mx-2">
            <router-link to="/" class="nav-link d-flex cursor-pointer align-items-center">
              <i class="material-icons opacity-6 me-2 text-md">person</i> Entrar
            </router-link>
          </li>

          <!-- Dropdown Ferramentas -->
          <li class="nav-item dropdown dropdown-hover mx-2">
            <a role="button"
              class="nav-link ps-2 d-flex cursor-pointer align-items-center"
              :class="getTextColor()" id="dropdownTools" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-gear-fill me-2"></i>
              Ferramentas
              <img :src="getArrowColor()" alt="down-arrow" class="arrow ms-2 d-lg-block d-none" />
            </a>

            <div class="dropdown-menu dropdown-menu-end dropdown-menu-animation mt-0 p-2 border-radius-lg"
              aria-labelledby="dropdownTools" style="min-width: 180px;">
              
              <button class="dropdown-item border-radius-md d-flex align-items-center gap-2"
                @click="$router.push({ name: 'CVGenerator' })">
                <i class="bi bi-file-earmark-person text-warning"></i> Gerar Cv
              </button>

               <button class="dropdown-item border-radius-md d-flex align-items-center gap-2"
                @click="$router.push({ name: 'GuardarDocumentos' })">
                <i class="bi bi-folder-plus text-success"></i> Guardar Docs
              </button>

              <button class="dropdown-item border-radius-md d-flex align-items-center gap-2"
                @click="$router.push({ name: 'Viaturas' })">
                <i class="bi bi-car-front text-success"></i> Recuperar Viaturas
              </button>

             

            </div>
          </li>

          <!-- Assinaturas -->
          <li>
            <a class="btn btn-sm mb-0 ms-2" role="button" @click="$router.push({ name: 'Assinaturas' })"
              style="background-color: #6f42c1; color: white;">
              Assinatura
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
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
</style>
