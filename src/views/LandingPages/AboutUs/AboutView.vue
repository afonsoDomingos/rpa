<script setup>
import { onMounted, onUnmounted } from "vue";

//example components
import DefaultNavbar from "../../../examples/navbars/NavbarDefault.vue";
import DefaultFooter from "../../../examples/footers/FooterDefault.vue";

//image
import bg0 from "@/assets/img/banner.png";

//dep
import Typed from "typed.js";

//sections
import Information from "./Sections/AboutInformation.vue";
import AboutTeam from "./Sections/AboutTeam.vue";
import Featuring from "./Sections/AboutFeaturing.vue";
import Newsletter from "./Sections/AboutNewsletter.vue";

const body = document.getElementsByTagName("body")[0];
//hooks
onMounted(() => {
  body.classList.add("about-us");
  body.classList.add("bg-gray-200");

  if (document.getElementById("typed")) {
    // eslint-disable-next-line no-unused-vars
    var typed = new Typed("#typed", {
      stringsElement: "#typed-strings",
      typeSpeed: 90,
      backSpeed: 90,
      backDelay: 200,
      startDelay: 500,
      loop: true,
    });
  }
});

onUnmounted(() => {
  body.classList.remove("about-us");
  body.classList.remove("bg-gray-200");
});
</script>
<template>
  <DefaultNavbar
    :action="{
      route: 'javascript:;',
      label: 'Whatsapp',
      color: 'btn-white',
    }"
    transparent
  />
  <header class="bg-gradient-dark">
    <div
      class="page-header min-vh-75"
      :style="{ backgroundImage: `url(${bg0})` }"
    >
      <span class="mask bg-gradient-dark opacity-6"></span>

      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-8 text-center mx-auto my-auto">
            <h1 class="text-white">
              Recupera aqui seu <span class="text-white" id="typed"></span>
            </h1>
            <div id="typed-strings">
              <h1>Bi</h1>
              <h1>Passaporte</h1>
              <h1>Cartao de Eleitor</h1>
            </div>
            <p class="lead mb-4 text-white opacity-8">
              Bem-vindo à Rpa, a solução confiável e rápida para a recuperação
              de documentos perdidos
            </p>
            <button type="submit" class="btn bg-white text-dark">
              Reportar
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
  <div class="card card-body shadow-xl mx-3 mx-md-4 mt-n6">
    <Information />
    <AboutTeam />
    <Featuring />
    <Newsletter />
  </div>
  <DefaultFooter />
</template>

<style scoped>
@media (max-width: 575.98px) {
  h1[data-v-5743eab4],
  .h1[data-v-5743eab4] {
    font-size: calc(1.125rem + 2.1vw);
    margin-top: 20%;
  }
}
</style>
