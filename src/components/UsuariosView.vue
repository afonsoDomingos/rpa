<template>
  <div class="container py-4">
    <h2 class="mb-4">
      <i class="bi bi-people-fill me-2"></i> Lista de Usuários
    </h2>

    <!-- Botão para abrir o formulário de novo usuário -->
    <button
      class="btn btn-success mb-3"
      @click="mostrarFormulario = !mostrarFormulario"
    >
      <i class="bi bi-plus-circle me-1"></i>
      {{ mostrarFormulario ? "Fechar" : "Novo Usuário" }}
    </button>

    <AdicionarUsuario v-if="mostrarFormulario" @usuario-criado="atualizar++" />
    <ListaUsuarios :atualizar="atualizar" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import AdicionarUsuario from "../components/AdicionarUsuario.vue";
import ListaUsuarios from "../components/ListaUsuarios.vue";
import "bootstrap-icons/font/bootstrap-icons.css";

const mostrarFormulario = ref(false);
const atualizar = ref(0);
</script>
