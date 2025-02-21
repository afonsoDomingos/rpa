<script setup>
import { onMounted } from "vue";
//Vue Material Kit 2 components
import MaterialButton from "@/components/MaterialButton.vue";

// popover
import setPopover from "@/assets/js/popover";

// store
import { useAppStore } from "@/stores";
const store = useAppStore();

// hook
onMounted(() => {
  setPopover(store.bootstrap);
});
</script>
<template>
  <div class="container">
    <div class="row py-7 text-center">
      <div>
        <MaterialButton
          variant="gradient"
          color="success"
          data-bs-container="body"
          data-bs-toggle="popover"
          data-bs-placement="top"
          data-bs-content="Pesquise seu nome e veja se seu documento já foi registrado!">
          Como funciona?
        </MaterialButton>
        
        <MaterialButton
          class="mx-2"
          variant="gradient"
          color="success"
          data-bs-container="body"
          data-bs-toggle="popover"
          data-bs-placement="right"
          data-bs-content="Cadastre um alerta e avisamos quando seu documento for encontrado!">
          E se não encontrar?
        </MaterialButton>

        <MaterialButton
          variant="gradient"
          color="success"
          data-bs-container="body"
          data-bs-toggle="popover"
          data-bs-placement="bottom"
          data-bs-content="Qualquer pessoa que encontrou um documento pode registrá-lo aqui!">
          Quem pode cadastrar?
        </MaterialButton>

        <MaterialButton
          class="ms-2"
          variant="gradient"
          color="success"
          data-bs-container="body"
          data-bs-toggle="popover"
          data-bs-placement="left"
          data-bs-content=" Sim! Mostramos apenas o necessário para a recuperação segura do documento.">
          É seguro?
        </MaterialButton>
      </div>
    </div>
  </div>
</template>
