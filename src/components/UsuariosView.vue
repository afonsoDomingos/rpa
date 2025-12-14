<template>
  <div class="usuarios-view-wrapper">
    <div class="usuarios-view-container">
      <div class="section-header mb-4">
        <h2 class="section-title">
          <i class="bi bi-people-fill me-2"></i> Lista de Usuários
        </h2>
        <button
          class="btn btn-purple-custom shadow-sm"
          @click="mostrarFormulario = !mostrarFormulario"
        >
          <i class="bi bi-plus-circle me-1"></i>
          {{ mostrarFormulario ? "Fechar Formulário" : "Novo Usuário" }}
        </button>
      </div>

      <AdicionarUsuario v-if="mostrarFormulario" @usuario-criado="atualizar++" class="mb-4" />
      <ListaUsuarios :atualizar="atualizar" />
    </div>
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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap');

.usuarios-view-wrapper {
  width: 100%;
  background-color: #ffffff;
  padding: 2rem 0;
}

.usuarios-view-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  font-family: 'Poppins', sans-serif;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 900; /* Black */
  color: #800080; /* Roxo */
  margin: 0;
  font-size: 1.75rem;
}

.section-title i {
  color: #800080;
}

.btn-purple-custom {
  background: linear-gradient(135deg, #800080 0%, #6a006a 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-purple-custom:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(128, 0, 128, 0.3);
  background: linear-gradient(135deg, #6a006a 0%, #800080 100%);
  color: white;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .section-title {
    font-size: 1.5rem;
    text-align: center;
  }

  .btn-purple-custom {
    width: 100%;
    justify-content: center;
  }
}
</style>
