<script setup>
import { onMounted, onUnmounted } from "vue";

//example components
import NavbarDefault from "../..//examples/navbars/NavbarDefault.vue";
import DefaultFooter from "../../examples/footers/FooterDefault.vue";
import Nossateam from "../../examples/footers/Nossateam.vue";
import Header from "../../examples/Header.vue";

//Vue Material Kit 2 components
import VerDocumentosadmin from '@/components/Verdocumentosadmin.vue';

// sections  
import PresentationCounter from "./Sections/PresentationCounter.vue";

//images
import vueMkHeader from "@/assets/img/banner.png";

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
  <VerDocumentosadmin />
  <!-- Componente para Contador de Apresentação -->
  <PresentationCounter />
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
