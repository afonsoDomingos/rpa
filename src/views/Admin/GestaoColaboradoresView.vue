<script setup>
import { onMounted, onUnmounted } from "vue";

// Components
import NavbarDefault from "@/examples/navbars/NavbarDefault.vue";
import DefaultFooter from "@/examples/footers/FooterDefault.vue";
import Header from "@/examples/Header.vue";
import GestaoColaboradores from "@/components/GestaoColaboradores.vue";

// Images
import vueMkHeader from "@/assets/img/banner.png";

// Hooks
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
      class="page-header min-vh-50"
      :style="`background-image: url(${vueMkHeader})`"
      loading="lazy"
    >
      
    </div>
  </Header>

  <div class="card card-body blur shadow-blur mx-3 mx-md-4 mt-n6 mb-4">
    <GestaoColaboradores />
  </div>

  <DefaultFooter />
</template>

<style scoped>
.page-header {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
}
</style>
