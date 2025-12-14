<template>
  <div class="card mb-4">
    <div class="card-body">
      <h5 class="card-title">Criar Novo Usuário</h5>

      <form @submit.prevent="criarUsuario" novalidate>
        <div class="mb-3">
          <label class="form-label">Nome</label>
          <input
            type="text"
            class="form-control borda-destacada"
            :class="{ 'is-invalid': erro.nome }"
            v-model="novoUsuario.nome"
          />
          <div class="invalid-feedback">Nome é obrigatório.</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Email</label>
          <input
            type="email"
            class="form-control borda-destacada"
            :class="{ 'is-invalid': erro.email }"
            v-model="novoUsuario.email"
          />
          <div class="invalid-feedback">Email válido é obrigatório.</div>
        </div>

        <div class="mb-3 position-relative">
          <label class="form-label">Senha</label>
          <input
            :type="senhaVisivel ? 'text' : 'password'"
            class="form-control borda-destacada"
            :class="{ 'is-invalid': erro.senha }"
            v-model="novoUsuario.senha"
          />
          <i
            class="bi"
            :class="senhaVisivel ? 'bi-eye-slash' : 'bi-eye'"
            @click="senhaVisivel = !senhaVisivel"
            style="position: absolute; right: 10px; top: 38px; cursor: pointer"
          ></i>
          <div class="invalid-feedback">Senha é obrigatória.</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Perfil</label>
          <select class="form-select" v-model="novoUsuario.role">
            <option value="cliente">Cliente</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button class="btn btn-primary" type="submit">Criar Usuário</button>
      </form>

      <!-- Mensagem de sucesso -->
      <transition name="fade">
        <div v-if="mensagemSucesso" class="mensagem-sucesso mt-3">
          {{ mensagemSucesso }}
        </div>
      </transition>

      <!-- Mensagem de erro -->
      <transition name="fade">
        <div v-if="mensagemErro" class="mensagem-erro mt-3">
          {{ mensagemErro }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import api from "../api";

const emit = defineEmits(["usuario-criado"]);

const senhaVisivel = ref(false);
const erro = ref({ nome: false, email: false, senha: false });

const mensagemSucesso = ref("");
const mensagemErro = ref("");

const novoUsuario = ref({
  nome: "",
  email: "",
  senha: "",
  role: "cliente",
});

const validarEmail = (email) => /\S+@\S+\.\S+/.test(email);

const criarUsuario = async () => {
  erro.value.nome = !novoUsuario.value.nome;
  erro.value.email = !validarEmail(novoUsuario.value.email);
  erro.value.senha = !novoUsuario.value.senha;

  mensagemErro.value = "";
  mensagemSucesso.value = "";

  if (erro.value.nome || erro.value.email || erro.value.senha) return;

  try {
    const res = await api.post("/auth/register", novoUsuario.value);
    mensagemSucesso.value = res.data.msg || "Usuário criado com sucesso!";
    emit("usuario-criado");
    novoUsuario.value = { nome: "", email: "", senha: "", role: "cliente" };
    erro.value = { nome: false, email: false, senha: false };
  } catch (err) {
    mensagemErro.value = err.response?.data?.msg || "Erro ao criar usuário";
    console.error("Erro ao criar usuário:", err);
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap');

.card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  box-shadow: none;
  font-family: 'Poppins', sans-serif;
}

.card-title {
  font-weight: 900;
  color: #800080;
}

.form-label {
  font-weight: 700;
  color: #495057;
}

.borda-destacada {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  outline: none;
  transition: all 0.3s ease;
  background-color: #ffffff;
}

.borda-destacada:focus {
  border-color: #800080; /* Roxo */
  box-shadow: 0 0 0 0.2rem rgba(128, 0, 128, 0.15);
}

.btn-primary {
  background: linear-gradient(135deg, #800080 0%, #6a006a 100%);
  border: none;
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(128, 0, 128, 0.3);
  background: linear-gradient(135deg, #6a006a 0%, #800080 100%);
}

.mensagem-sucesso {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
}

.mensagem-erro {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
