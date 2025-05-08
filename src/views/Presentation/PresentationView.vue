<script setup>
import { onMounted, onUnmounted } from "vue";

//example components
import NavbarDefault from "../../examples/navbars/NavbarDefault.vue";
import DefaultFooter from "../../examples/footers/FooterDefault.vue";
import Nossateam from "../../examples/footers/Nossateam.vue";
import Header from "../../examples/Header.vue";
import FilledInfoCard from "../../examples/cards/infoCards/FilledInfoCard.vue";

//Vue Material Kit 2 components

import Verdocumentos from '@/components/Verdocumentos.vue';
import MaterialSocialButton from "@/components/MaterialSocialButton.vue";


// sections  
import PresentationCounter from "./Sections/PresentationCounter.vue";
import setPopover from "./Sections/popover.vue";
import PresentationPages from "./Sections/PresentationPages.vue";
import PresentationExample from "./Sections/PresentationExample.vue";
import data from "./Sections/Data/designBlocksData";
import BuiltByDevelopers from "./Components/BuiltByDevelopers.vue";
import PresentationTestimonials from "./Sections/PresentationTestimonials.vue";
import PresentationInformation from "./Sections/PresentationInformation.vue";

//images
import vueMkHeader from "@/assets/img/banner.png";

import wavesWhite from "@/assets/img/waves-white.svg";
import logoBootstrap from "@/assets/img/logos/bootstrap5.jpg";
import logoTailwind from "@/assets/img/logos/icon-tailwind.jpg";
import logoVue from "@/assets/img/logos/vue.jpg";
import logoAngular from "@/assets/img/logos/angular.jpg";
import logoTechvibe from "@/assets/img/logos/techvibe.jpg"
import logoReact from "@/assets/img/logos/react.jpg";
import logoSketch from "@/assets/img/logos/sketch.jpg";


//hooks
const body = document.getElementsByTagName("body")[0];
onMounted(() => {
  body.classList.add("presentation-page");
  body.classList.add("bg-gray-200");
});
onUnmounted(() => {
  body.classList.remove("presentation-page");
  body.classList.remove("bg-gray-200");
});


import api from "../../api";
import { ref } from "vue"; // Importando ref para reatividade

// Definição de campos reativos
const nome_completo = ref('');
const contacto = ref('');
const tipo_documento = ref('');
const motivo = ref('');

// Mensagens de erro
const nomeError = ref('');
const contactoError = ref('');

// Lista de tipos de documentos
const tipo_documentos = [
  "Bilhete de Identidade", "Passaporte", "Cartão de Eleitor",
  "Cartão de Estudante", "Carta de Condução", "Seguro do Veículo",
  "Livrete", "Cartão de Identidade Militar"
];

// Função de validação do nome completo
const validarNome = () => {
  const nomeRegex = /^[A-Za-zÀ-ÿ\s]+$/;
  if (!nome_completo.value) {
    nomeError.value = 'O nome é obrigatório.';
    return false;
  } else if (!nomeRegex.test(nome_completo.value)) {
    nomeError.value = 'O nome completo deve conter apenas letras.';
    return false;
  }
  nomeError.value = '';
  return true;
};

// Função de validação do contacto
const validarContacto = () => {
  const contactoRegex = /^(84|85|86|87|83)\d{7}$/;
  if (!contacto.value) {
    contactoError.value = 'O contacto é obrigatório.';
    return false;
  } else if (!contactoRegex.test(contacto.value)) {
    contactoError.value = 'O contacto deve conter 9 dígitos e começar com 84, 85, 86, 87 ou 83.';
    return false;
  }
  contactoError.value = '';
  return true;
};

// Função para enviar a solicitação
const solicitarDocumento = async () => {
  // Validações
  if (!validarNome() || !validarContacto()) {
    return; // Não prossegue se alguma validação falhar
  }

  // Montar os dados para a solicitação
  const solicitacao = {
    nome_completo: nome_completo.value,
    contacto: contacto.value,
    tipo_documento: tipo_documento.value,
    motivo: motivo.value
  };

  try {
    // Envia os dados para a API
    const response = await api.post('/solicitacoes', solicitacao);
    console.log('Solicitação enviada com sucesso:', response.data);

    // Limpar os campos após envio
    nome_completo.value = '';
    contacto.value = '';
    tipo_documento.value = '';
    motivo.value = '';
  } catch (error) {
    console.error('Erro ao enviar a solicitação:', error);
  }
};

</script>

<template>
  <div class="container position-sticky z-index-sticky top-0">
    <div class="row">
      <div class="col-12">
        <NavbarDefault :sticky="true" />
      </div>
    </div>
  </div>

  <Header>
    <div class="page-header min-vh-75" :style="`background-image: url(${vueMkHeader})`" loading="lazy">
      <div class="container">
        <div class="row">
          <div class="col-lg-7 text-center mx-auto position-relative">
            <h1 class="text-white pt-3 mt-n5 me-2" :style="{ display: 'inline-block ' }">

            </h1>
            <p class="lead text-white px-5 mt-3" :style="{ fontWeight: '500' }">

            </p>
          </div>
        </div>
      </div>
    </div>
  </Header>

  <div class="card card-body blur shadow-blur mx-3 mx-md-4 mt-n6">
    <!-- Componente para Exibir Documentos -->
    <Verdocumentos />
    <!-- Componente para Contador de Apresentação -->
    <PresentationCounter />
    <!-- Componente para Definir Popover (ajuda contextual ou informações extras ao interagir com elementos) -->
    <setPopover />
    <!-- Componente para Exibir Informações de Apresentação -->
    <PresentationInformation />

    <div class="container">
      <div class="row">
        <div class="d-flex flex-column w-100 text-center p-5 mb-8">
          <h3>Parceiros</h3>
          <div class="d-flex justify-content-center mt-3 flex-wrap">
            <a href="https://www.facebook.com/profile.php?id=61558461805280" data-bs-toggle="tooltip"
              data-bs-placement="bottom" title="Bootstrap 5 - Most popular front-end component library">
              <img :src="logoBootstrap" alt="title" loading="lazy" :style="{ height: '90px' }" />
            </a>

            <a href="https://www.facebook.com/profile.php?id=61570930139844&sk=photos" class="mx-3"
              data-bs-toggle="tooltip" data-bs-placement="bottom"
              title="Vue.js - Is a Progressive JavaScript Framework">
              <img :src="logoVue" alt="title" loading="lazy" :style="{ height: '90px' }" />
            </a>
            <a class="opacity-5" href="https://www.facebook.com/Techvibemz/" data-bs-toggle="tooltip"
              data-bs-placement="bottom" title="Coming Soon">
              <img :src="logoTechvibe" alt="title" loading="lazy" :style="{ height: '90px' }" />
            </a>
          </div>
        </div>
      </div>
    </div>
    <div class="py-5">
      <div class="container">
        <div class="row">
          <div class="col-lg-5 ms-auto">
            <h4 class="mb-1">Obrigado pelo seu apoio!!</h4>
            <p class="lead mb-0">E por transformar este projeto em realidade.</p>
          </div>
          <div class="col-lg-5 me-lg-auto my-lg-auto text-lg-end mt-5">
            <MaterialSocialButton route="https://www.linkedin.com/in/afonso-domingos-6b59361a5/" component="linkedin"
              color="linkedin" label="linkedin" />
            <MaterialSocialButton route="https://www.facebook.com/profile.php?id=61570930139844&sk=photos"
              color="facebook" label="facebook" />
            <MaterialSocialButton
              route="https://docs.google.com/forms/d/e/1FAIpQLSdLO0mga6ygr6oVlCHQ6Hgt48baiZuQlXTzPRYynhXv0etD3g/viewform"
              component="dribbble" color="dribbble" label="Recupera Aqui" />
          </div>
        </div>
      </div>
    </div>
  </div> <!-- Fechamento da div card -->

  <!-- Modal -->

  <!-- Modal -->
  <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Solicitar</h5>
          <MaterialButton color="none" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></MaterialButton>
        </div>
        <div class="modal-body">
          <!-- Formulário de solicitação -->
          <form id="formSolicitacao" @submit.prevent="solicitarDocumento">
            <div class="mb-3">
              <label for="nomeSolicitante" class="form-label">Nome Completo</label>
              <input type="text" id="nomeSolicitante" class="form-control zoom-field" v-model="nome_completo"
                placeholder="Ex: João Silva" maxlength="50" required />
              <div v-if="nomeError" class="text-warning visible">{{ nomeError }}</div>
            </div>
            <div class="mb-3">
              <label for="contato" class="form-label">Contacto</label>
              <input type="tel" id="contato" class="form-control zoom-field" v-model="contacto"
                placeholder="Ex: 84 123 4567" maxlength="9" required />
              <div v-if="contactoError" class="text-warning visible">{{ contactoError }}</div>
            </div>
            <div class="mb-3">
              <label for="tipoDocumento" class="form-label">Tipo de Documento</label>
              <select id="tipoDocumento" class="form-select zoom-field" v-model="tipo_documento" required>
                <option disabled value="">Selecione o Tipo de Documento</option>
                <option v-for="tipo in tipo_documentos" :key="tipo" :value="tipo">{{ tipo }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="motivo" class="form-label">Motivo da solicitação</label>
              <textarea class="form-control" id="motivo" v-model="motivo" rows="3"
                placeholder="Explique por que está solicitando este documento (opcional)"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer justify-content-between">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="submit" class="btn btn-success" form="formSolicitacao">Enviar Solicitação</button>
        </div>
      </div>
    </div>
  </div>



  <!-- Componente para exibir informações sobre a nossa equipe -->
  <Nossateam />
  <!-- Componente para exibir o rodapé padrão -->
  <DefaultFooter />
</template>
<style scoped>
/* Estilos gerais para outros dispositivos */
.page-header {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
  height: 50vh;
}

/* Media query específica para iPhone SE */
@media (max-width: 375px) and (max-height: 667px) {
  .page-header {
    background-image: url('/src/assets/img/banner2.png') !important;
    /* Obriga a usar esta imagem */
    height: 50vh;
    /* Ajusta a altura para 50% da tela */
  }
}

/* Media query específica para iPhone XR E 12 */
@media (max-width: 414px) and (max-height: 896px) {
  .page-header {
    background-image: url('/src/assets/img/banner2.png') !important;
    /* Obriga a usar esta imagem */
    height: 50vh;
    /* Ajusta a altura para 50% da tela */
  }
}

/* Media query específica para iPhone  14 PROMAX E PIXEL 7 GALAX S8 , S20*/
@media (max-width: 430px) and (max-height: 932px) {
  .page-header {
    background-image: url('/src/assets/img/banner2.png') !important;
    /* Obriga a usar esta imagem */
    height: 50vh;
    /* Ajusta a altura para 50% da tela */
  }
}

/* Media query específica para iPAD MIN*/
@media (max-width: 768px) and (max-height: 1024px) {
  .page-header {
    background-image: url('/src/assets/img/banner2.png') !important;
    /* Obriga a usar esta imagem */
    height: 50vh;
    /* Ajusta a altura para 50% da tela */
  }
}

/* Media query específica para iPAD AIR*/
@media (max-width: 820px) and (max-height: 1180px) {
  .page-header {
    background-image: url('/src/assets/img/banner2.png') !important;
    /* Obriga a usar esta imagem */
    height: 50vh;
    /* Ajusta a altura para 50% da tela */
  }
}

/* Media query específica para iPAD PRO*/
@media (max-width: 1024px) and (max-height: 1366px) {
  .page-header {
    background-image: url('/src/assets/img/banner2.png') !important;
    /* Obriga a usar esta imagem */
    height: 50vh;
    /* Ajusta a altura para 50% da tela */
  }
}

/* Media query específica para SURFACE PRO7 ,DUE, GALAX Z FOLD*/
@media (max-width: 912px) and (max-height: 1368px) {
  .page-header {
    background-image: url('/src/assets/img/banner2.png') !important;
    /* Obriga a usar esta imagem */
    height: 50vh;
    /* Ajusta a altura para 50% da tela */
  }
}

/* Media query específica para NEXTHUB*/
@media (max-width: 1280px) and (max-height: 800px) {
  .page-header {
    background-image: url('/src/assets/img/banner2.png') !important;
    /* Obriga a usar esta imagem */
    height: 50vh;
    /* Ajusta a altura para 50% da tela */
  }
}

/* Media query específica para MOREP */
@media (max-width: 400px) and (max-height: 645px) {
  .page-header {
    background-image: url('/src/assets/img/banner2.png') !important;
    /* Obriga a usar esta imagem */
    height: 50vh;
    /* Ajusta a altura para 50% da tela */
  }
}

/* Media query específica para iPhone SE */
@media (max-width: 400px) and (max-height: 686px) {
  .page-header {
    background-image: url('/src/assets/img/banner2.png') !important;
    /* Obriga a usar esta imagem */
    height: 50vh;
    /* Ajusta a altura para 50% da tela */
  }
}
</style>
