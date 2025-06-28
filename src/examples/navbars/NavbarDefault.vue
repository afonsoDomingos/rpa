<script setup>
import { RouterLink } from "vue-router";
import { ref, watch, onMounted } from "vue";
import { useWindowsWidth } from "../../assets/js/useWindowsWidth";



// images
import ArrDark from "@/assets/img/down-arrow-dark.svg";
//import downArrow from "@/assets/img/down-arrow.svg";
import DownArrWhite from "@/assets/img/down-arrow-white.svg";

import eventBus from '@/eventBus'; // Verifique se o caminho está correto

import { useRouter } from 'vue-router';
const router = useRouter();

const logout = () => {
  localStorage.removeItem('email'); // Remove o email salvo
  usuario.value = null; // Reseta o estado reativo do usuário

  alert('Logout realizado com sucesso!'); // Alerta simples

  router.push('/'); // Redireciona para a página de login
};


import axios from 'axios';

// Variável reativa para armazenar os dados do usuário
const usuario = ref(null);

// Função para buscar o usuário logado da API
const buscarUsuario = async () => {
  try {
    const emailLogado = localStorage.getItem('email');
    if (!emailLogado) {
      console.warn('Email não encontrado no localStorage. Redirecionando...');
      router.push('/');
      return;
    }

    const response = await axios.get('https://apirpa.onrender.com/api/auth/usuarios');
    console.log('Resposta da API:', response.data);

    if (!Array.isArray(response.data)) {
      console.error('Dados inválidos da API. Esperado um array de usuários.');
      return;
    }

    usuario.value = response.data.find(u => u.email === emailLogado);

    if (!usuario.value) {
      console.warn('Usuário não encontrado. Redirecionando para login...');
      router.push('/');
    }

  } catch (error) {
    console.error('Erro ao buscar o usuário:', error);
  }
};


// Hook onMounted para buscar o usuário assim que o componente for montado
onMounted(() => {
  buscarUsuario();
});

const goToCadastrar = () => {
  // Emitir o evento para mudar a aba
  eventBus.emit('changeTab', 'cadastrar');

  // Usar setTimeout para garantir que a aba seja ativada antes de fazer o scroll
  setTimeout(() => {
    const element = document.getElementById('cadastrar-tabs-simple'); // Certifique-se de que este ID existe
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Scroll suave até o elemento
    }
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
      label: "Reportar"
    })
  },
  transparent: {
    type: Boolean,
    default: false
  },
  light: {
    type: Boolean,
    default: false
  },
  dark: {
    type: Boolean,
    default: false
  },
  sticky: {
    type: Boolean,
    default: false
  },
  darkText: {
    type: Boolean,
    default: false
  }
});

// set arrow  color
function getArrowColor() {
  if (props.transparent && textDark.value) {
    return ArrDark;
  } else if (props.transparent) {
    return DownArrWhite;
  } else {
    return ArrDark;
  }
}

// set text color
const getTextColor = () => {
  let color;
  if (props.transparent && textDark.value) {
    color = "text-dark";
  } else if (props.transparent) {
    color = "text-white";
  } else {
    color = "text-dark";
  }

  return color;
};

// set nav color on mobile && desktop

let textDark = ref(props.darkText);
const { type } = useWindowsWidth();

if (type.value === "mobile") {
  textDark.value = true;
} else if (type.value === "desktop" && textDark.value == false) {
  textDark.value = false;
}

watch(
  () => type.value,
  (newValue) => {
    if (newValue === "mobile") {
      textDark.value = true;
    } else {
      textDark.value = false;
    }
  }
);
</script>
<template>
  <nav class="navbar navbar-expand-lg top-0" :class="{
    'z-index-3 w-100 shadow-none navbar-transparent position-absolute my-3':
      props.transparent,
    'my-3 blur border-radius-lg z-index-3 py-2 shadow py-2 start-0 end-0 mx-4 position-absolute mt-4':
      props.sticky,
    'navbar-light bg-white py-3': props.light,
    ' navbar-dark bg-gradient-dark z-index-3 py-3': props.dark
  }">
    <div :class="props.transparent || props.light || props.dark
      ? 'container'
      : 'container-fluid px-0'
      ">
      <RouterLink class="navbar-brand d-none d-md-block" :class="[
        (props.transparent && textDark.value) || !props.transparent
          ? 'text-dark font-weight-bolder ms-sm-3'
          : 'text-white font-weight-bolder ms-sm-3'
      ]" :to="{ name: 'presentation' }" rel="tooltip" title="Designed and Coded by Creative Tim"
        data-placement="bottom">
        Recupera Aqui
      </RouterLink>



      <RouterLink class="navbar-brand d-block d-md-none" :class="props.transparent || props.dark
        ? 'text-white'
        : 'font-weight-bolder ms-sm-3'
        " to="/" rel="tooltip" title="Designed and Coded by Creative Tim" data-placement="bottom">
        Menu
      </RouterLink>

      <a @click="goToCadastrar" class="btn btn-sm bg-gradient-success mb-0 ms-auto d-lg-none d-block"
        :class="action.color" role="button">
        {{ action.label }}
      </a>

      <button class="navbar-toggler shadow-none ms-2" type="button" data-bs-toggle="collapse"
        data-bs-target="#navigation" aria-controls="navigation" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon mt-2">
          <span class="navbar-toggler-bar bar1"></span>
          <span class="navbar-toggler-bar bar2"></span>
          <span class="navbar-toggler-bar bar3"></span>
        </span>
      </button>
      <div class="collapse navbar-collapse w-100 pt-3 pb-2 py-lg-0" id="navigation">
        <ul class="navbar-nav navbar-nav-hover ms-auto">
          <li class="nav-item dropdown dropdown-hover mx-2">
            <a role="button" class="nav-link ps-2 d-flex cursor-pointer align-items-center" :class="getTextColor()"
              id="dropdownMenuPages" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="material-icons opacity-6 me-2 text-md" :class="getTextColor()">dashboard</i>
              Paginas
              <img :src="getArrowColor()" alt="down-arrow" class="arrow ms-2 d-lg-block d-none" />
              <img :src="getArrowColor()" alt="down-arrow" class="arrow ms-1 d-lg-none d-block ms-auto" />
            </a>
            <div class="dropdown-menu dropdown-menu-animation ms-n3 dropdown-md p-3 border-radius-xl mt-0 mt-lg-3"
              aria-labelledby="dropdownMenuPages">
              <div class="row d-none d-lg-block">
                <div class="col-12 px-4 py-2">
                  <div class="row">
                    <div class="position-relative">
                      <div class="dropdown-header text-dark font-weight-bolder d-flex align-items-center px-1">
                        Pagina Principal
                      </div>
                      <RouterLink :to="{ name: 'about' }" class="dropdown-item border-radius-md">
                        <span>Sobre nós</span>
                      </RouterLink>
                      <RouterLink :to="{ name: 'contactus' }" class="dropdown-item border-radius-md">
                        <span>Contacte-nos</span>
                      </RouterLink>
                      <RouterLink :to="{ name: 'author' }" class="dropdown-item border-radius-md">
                        <span>Autor</span>
                      </RouterLink>
                      <div class="dropdown-header text-dark font-weight-bolder d-flex align-items-center px-0 mt-3">
                        Conta
                      </div>
                      <RouterLink :to="{ name: 'signin-basic' }" class="dropdown-item border-radius-md">
                        <span>Inscrever-se</span>
                      </RouterLink>
                    </div>
                  </div>
                </div>
              </div>
              <div class="d-lg-none">
                <div class="dropdown-header text-dark font-weight-bolder d-flex align-items-center px-0">
                  Pagina Principal
                </div>
                <RouterLink :to="{ name: 'about' }" class="dropdown-item border-radius-md">
                  <span>Sobre nós</span>
                </RouterLink>
                <RouterLink :to="{ name: 'contactus' }" class="dropdown-item border-radius-md">
                  <span>Contacte-nos</span>
                </RouterLink>

                <!-- <RouterLink :to="{ name: 'author' }" class="dropdown-item border-radius-md">
                  <span>Autor</span>
                </RouterLink>-->
                <div class="dropdown-header text-dark font-weight-bolder d-flex align-items-center px-0 mt-3">
                  Conta
                </div>
                <RouterLink :to="{ name: 'signin-basic' }" class="dropdown-item border-radius-md">
                  <span>Entrar</span>
                </RouterLink>
              </div>
            </div>
          </li>


          <li class="nav-item dropdown dropdown-hover mx-2">
            <a role="button" class="nav-link ps-2 d-flex cursor-pointer align-items-center" :class="getTextColor()"
              id="dropdownMenuDocs" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="material-icons opacity-6 me-2 text-md" :class="getTextColor()">article</i>
              Rpa Comunidade
              <img :src="getArrowColor()" alt="down-arrow" class="arrow ms-2 d-lg-block d-none" />
              <img :src="getArrowColor()" alt="down-arrow" class="arrow ms-1 d-lg-none d-block ms-auto" />
            </a>
            <div
              class="dropdown-menu dropdown-menu-end dropdown-menu-animation dropdown-md mt-0 mt-lg-3 p-3 border-radius-lg"
              aria-labelledby="dropdownMenuDocs">
              <div class="d-none d-lg-block">
                <ul class="list-group">
                  <li class="nav-item list-group-item border-0 p-0">
                    <a class="dropdown-item py-2 ps-3 border-radius-md "
                      href=" https://www.facebook.com/profile.php?id=61570930139844" target="_blank"
                      rel="noopener noreferrer">
                      <h6
                        class="dropdown-header text-dark font-weight-bolder d-flex justify-content-cente align-items-center p-0">
                        Facebook Rpa
                      </h6>
                      <span class="text-sm">Visita-nos</span>
                    </a>
                  </li>
                  <li class="nav-item list-group-item border-0 p-0">
                    <a class="dropdown-item py-2 ps-3 border-radius-md" href=" https://www.instagram.com/techvibemz/"
                      target="_blank" rel="noopener noreferrer">
                      <h6
                        class="dropdown-header text-dark font-weight-bolder d-flex justify-content-cente align-items-center p-0">
                        Instagram Rpa
                      </h6>
                      <span class="text-sm">Visita-nos</span>
                    </a>
                  </li>
                  <li class="nav-item list-group-item border-0 p-0">
                    <a class="dropdown-item py-2 ps-3 border-radius-md"
                      href=" https://www.linkedin.com/in/afonso-domingos-6b59361a5/" target="_blank"
                      rel="noopener noreferrer">
                      <h6
                        class="dropdown-header text-dark font-weight-bolder d-flex justify-content-cente align-items-center p-0">
                        linkedin Rpa
                      </h6>
                      <span class="text-sm">Visita-nos
                        nos</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </li>


        <li v-if="usuario" class="nav-item dropdown dropdown-hover mx-2">
  <a
    role="button"
    class="nav-link ps-2 d-flex cursor-pointer align-items-center"
    :class="getTextColor()"
    id="dropdownUser"
    data-bs-toggle="dropdown"
    aria-expanded="false"
  >
    <i class="material-icons opacity-6 me-2 text-md" :class="getTextColor()">person</i>
    {{ usuario?.nome || 'Usuário' }}
    <img
      :src="getArrowColor()"
      alt="down-arrow"
      class="arrow ms-2 d-lg-block d-none"
    />
  </a>

  <div
    class="dropdown-menu dropdown-menu-end dropdown-menu-animation mt-0 p-2 borda-destacada"
    aria-labelledby="dropdownUser"
    style="min-width: 180px;"
  >
    <button
      class="dropdown-item border-radius-md"
      @click="$router.push({ name: 'MeusPagamentos' })"
      style="cursor: pointer;"
    >
      Meus Pagamentos
    </button>

    <div class="dropdown-divider"></div>

    <button
      class="dropdown-item border-radius-md text-danger"
      @click="logout"
      style="cursor: pointer;"
    >
      Sair
    </button>
  </div>
</li>







          <li v-else class="nav-item dropdown dropdown-hover mx-2">
            <router-link to="/" class="nav-link d-flex cursor-pointer align-items-center">
              <i class="material-icons opacity-6 me-2 text-md">person</i>
              Entrar
            </router-link>
          </li>

          <!-- <li class="nav-item dropdown dropdown-hover mx-2">
            <a class="nav-link d-flex cursor-pointer align-items-center btn btn-sm mb-0" :class="action.color">
              <RouterLink :to="{ name: 'dashboard' }" class="dropdown-item border-radius-md">
                <span>Dashboard</span>
              </RouterLink>
            </a>
          </li>-->


        </ul>

        <ul class="navbar-nav d-lg-block d-none">
          <!--Antingo Link Nao Eliminar
          <li class="nav-item">
            <a :href="action.route" class="btn btn-sm mb-0" :class="action.color"
              onclick="smoothToPricing('pricing-soft-ui')">{{ action.label }}</a>
          </li>-->
          <li class="nav-item">
            <a @click="goToCadastrar" class="btn btn-sm mb-0" :class="action.color" role="button">
              {{ action.label }}
            </a>
          </li>
        </ul>
       
        <a class="btn btn-sm mb-0 ms-2" role="button" @click="$router.push({ name: 'Assinaturas' })"
          style="background-color: #6f42c1; color: white;">
          Assinatura
        </a>





      <!--  <a class="btn btn-sm bg-gradient-primary mb-0 ms-2" role="button"
          @click="$router.push({ name: 'GuardarDocumentos' })">
          Guardar Documentos
        </a>-->

      </div>
    </div>
  </nav>
  <!-- End Navbar -->
</template>


<style scoped>

.borda-destacada {
  border: 2px solid #66bb6a;
  border-radius: 12px;
  padding: 10px 0; /* removi padding grande para não ficar pesado */
  background-color: #fff;
  transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
}

.borda-destacada:hover {
  border-color: #800080;
  box-shadow: 0 8px 20px rgba(128, 0, 128, 0.25);
  transform: scale(1.02);
}

</style>