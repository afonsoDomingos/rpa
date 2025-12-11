<template>
  <div>
    <!-- Navbar fixo -->
    <div class="container-fluid position-sticky z-index-sticky top-0 px-0">
      <div class="row gx-0">
        <div class="col-12">
          <NavbarDefault :sticky="true" />
        </div>
      </div>
    </div>

    <br /><br /><br />

    <!-- Conteúdo principal -->
    <div
      class="container-fluid pag-container-fluid py-4 my-4 bg-white shadow-sm rounded borda-destacada pag-container-responsive"
    >
      <h2 class="mb-4 text-center text-success fw-bold">Meu Conteúdo Aqui</h2>
      <p class="text-center">
        Exemplo de página usando Navbar fixo e Footer padrão.
      </p>
      <!-- Aqui vai todo o conteúdo da página -->
    </div>

    <!-- Rodapé -->
    <FooterDefault />
  </div>
</template>

<script setup>
import NavbarDefault from "../examples/navbars/NavbarDefault.vue";
import FooterDefault from "../examples/footers/FooterDefault.vue";
dggsg;
</script>
