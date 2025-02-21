<script setup>
import { onMounted, onUnmounted } from "vue";

//example components
import NavbarDefault from "../..//examples/navbars/NavbarDefault.vue";
import DefaultFooter from "../../examples/footers/FooterDefault.vue";
import Nossateam from "../../examples/footers/Nossateam.vue";
import Header from "../../examples/Header.vue";
import FilledInfoCard from "../../examples/cards/infoCards/FilledInfoCard.vue";

//Vue Material Kit 2 components

import VerDocumentos from '@/components/VerDocumentos.vue';
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
    <div
      class="page-header min-vh-75"
      :style="`background-image: url(${vueMkHeader})`"
      loading="lazy"
    >
      <div class="container">
        <div class="row">
          <div class="col-lg-7 text-center mx-auto position-relative">
            <h1
              class="text-white pt-3 mt-n5 me-2"
              :style="{ display: 'inline-block ' }"
            >
              
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
  <VerDocumentos />
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
          <a
            href="https://www.facebook.com/profile.php?id=61558461805280"
            data-bs-toggle="tooltip"
            data-bs-placement="bottom"
            title="Bootstrap 5 - Most popular front-end component library"
          >
            <img
              :src="logoBootstrap"
              alt="title"
              loading="lazy"
              :style="{ height: '90px' }"
            />
          </a>

          <a
            href="https://www.facebook.com/profile.php?id=61570930139844&sk=photos"
            class="mx-3"
            data-bs-toggle="tooltip"
            data-bs-placement="bottom"
            title="Vue.js - Is a Progressive JavaScript Framework"
          >
            <img
              :src="logoVue"
              alt="title"
              loading="lazy"
              :style="{ height: '90px' }"
            />
          </a>
          <a
            class="opacity-5"
            href="https://www.facebook.com/Techvibemz/"
            data-bs-toggle="tooltip"
            data-bs-placement="bottom"
            title="Coming Soon"
          >
            <img
              :src="logoTechvibe"
              alt="title"
              loading="lazy"
              :style="{ height: '90px' }"
            />
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
          <MaterialSocialButton
            route="https://www.facebook.com/profile.php?id=61570930139844&sk=photos"
            component="twitter"
            color="twitter"
            label="twitter"
          />
          <MaterialSocialButton
            route="https://www.facebook.com/profile.php?id=61570930139844&sk=photos"
            color="facebook"
            label="facebook"
          />
          <MaterialSocialButton
            route="https://docs.google.com/forms/d/e/1FAIpQLSdLO0mga6ygr6oVlCHQ6Hgt48baiZuQlXTzPRYynhXv0etD3g/viewform"
            component="pinterest"
            color="pinterest"
            label="Recupera Aqui"
          />
        </div>
      </div>
    </div>
  </div>
</div> <!-- Fechamento da div card -->

  
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
    background-image: url('/src/assets/img/banner2.png') !important; /* Obriga a usar esta imagem */
    height: 50vh; /* Ajusta a altura para 50% da tela */
  }
}
/* Media query específica para iPhone XR E 12 */
@media (max-width: 414px) and (max-height: 896px) {
  .page-header {
    background-image: url('/src/assets/img/banner2.png') !important; /* Obriga a usar esta imagem */
    height: 50vh; /* Ajusta a altura para 50% da tela */
  }
}
/* Media query específica para iPhone  14 PROMAX E PIXEL 7 GALAX S8 , S20*/
@media (max-width: 430px) and (max-height: 932px) {
  .page-header {
    background-image: url('/src/assets/img/banner2.png') !important; /* Obriga a usar esta imagem */
    height: 50vh; /* Ajusta a altura para 50% da tela */
  }
}
/* Media query específica para iPAD MIN*/
@media (max-width: 768px) and (max-height: 1024px) {
  .page-header {
    background-image: url('/src/assets/img/banner2.png') !important; /* Obriga a usar esta imagem */
    height: 50vh; /* Ajusta a altura para 50% da tela */
  }
}
/* Media query específica para iPAD AIR*/
@media (max-width: 820px) and (max-height: 1180px) {
  .page-header {
    background-image: url('/src/assets/img/banner2.png') !important; /* Obriga a usar esta imagem */
    height: 50vh; /* Ajusta a altura para 50% da tela */
  }
}
/* Media query específica para iPAD PRO*/
@media (max-width: 1024px) and (max-height: 1366px) {
  .page-header {
    background-image: url('/src/assets/img/banner2.png') !important; /* Obriga a usar esta imagem */
    height: 50vh; /* Ajusta a altura para 50% da tela */
  }
}
/* Media query específica para SURFACE PRO7 ,DUE, GALAX Z FOLD*/
@media (max-width: 912px) and (max-height: 1368px) {
  .page-header {
    background-image: url('/src/assets/img/banner2.png') !important; /* Obriga a usar esta imagem */
    height: 50vh; /* Ajusta a altura para 50% da tela */
  }
}
/* Media query específica para NEXTHUB*/
@media (max-width: 1280px) and (max-height: 800px) {
  .page-header {
    background-image: url('/src/assets/img/banner2.png') !important; /* Obriga a usar esta imagem */
    height: 50vh; /* Ajusta a altura para 50% da tela */
  }
}

/* Media query específica para MOREP */
@media (max-width: 400px) and (max-height: 645px) {
  .page-header {
    background-image: url('/src/assets/img/banner2.png') !important; /* Obriga a usar esta imagem */
    height: 50vh; /* Ajusta a altura para 50% da tela */
  }
}
/* Media query específica para iPhone SE */
@media (max-width: 400px) and (max-height: 686px) {
  .page-header {
    background-image: url('/src/assets/img/banner2.png') !important; /* Obriga a usar esta imagem */
    height: 50vh; /* Ajusta a altura para 50% da tela */
  }
}
</style>