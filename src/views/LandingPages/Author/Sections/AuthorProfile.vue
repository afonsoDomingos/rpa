<script setup>
import { onMounted } from "vue";

//Vue Material Kit 2 components
import MaterialAvatar from "@/components/MaterialAvatar.vue";
import MaterialButton from "@/components/MaterialButton.vue";

// image
import profilePic from "@/assets/img/vibeprofile.jpg";


// material-input
import setMaterialInput from "@/assets/js/material-input";
onMounted(() => {
  setMaterialInput();
});
</script>
<template>
  <section class="py-sm-7 py-5 position-relative">
    <div class="container">
      <div class="row">
        <div class="col-12 mx-auto">
          <div class="mt-n8 mt-md-n9 text-center">
            <div class="blur-shadow-avatar">
              <MaterialAvatar
                size="xxl"
                class="shadow-xl position-relative z-index-2"
                :image="profilePic"
                alt="Avatar"
              />
            </div>
          </div>
          <div class="row py-7">
            <div
              class="col-lg-7 col-md-7 z-index-2 position-relative px-md-2 px-sm-5 mx-auto"
            >
              <div
                class="d-flex justify-content-between align-items-center mb-2"
              >
                <h3 class="mb-0">Vibe</h3>
                <div class="d-block">
                  <MaterialButton
                    class="text-nowrap mb-0"
                    variant="outline"
                    color="success"
                    size="sm"
                    >Seguir</MaterialButton
                  >
                </div>
              </div>
              <div class="row mb-4">
                <div class="col-auto">
                  <span class="h6 me-1">5</span>
                  <span>Posts</span>
                </div>
                <div class="col-auto">
                  <span class="h6 me-1">14k</span>
                  <span>Seguidores</span>
                </div>
                <div class="col-auto">
                  <span class="h6 me-1">160</span>
                  <span>Seguindo</span>
                </div>
              </div>
              <p class="text-lg mb-0">
                A Recupera Aqui, desenvolvida pela Techvibe sob a liderança do CEO Afonso Domingos apelidado por Vibe, foi criada para resolver um problema que afeta inúmeras pessoas: a perda de documentos importantes. Em um mundo onde a documentação pessoal é fundamental para a realização de atividades cotidianas, perder um documento pode resultar em frustrações e complicações desnecessárias.
                <br />Reconhecendo essa necessidade, a Recupera Aqui visa oferecer uma solução eficiente e acessível, permitindo que indivíduos se conectem facilmente para registrar e recuperar documentos perdidos. Com um sistema intuitivo, buscamos transformar a experiência de recuperação em um processo simples e colaborativo.
                <br />
                <a
                  href="javascript:;"
                  class="text-success icon-move-right"
                  >Mais Sobre mim
                  <i class="fas fa-arrow-right text-sm ms-1"></i>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
