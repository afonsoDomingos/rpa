<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const tab = ref("login");
const emailOrUsername = ref("");
const password = ref("");

const newEmail = ref("");
const newUsername = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

const router = useRouter();

const login = async () => {
  try {
    await axios.post("https://apirpa.onrender.com/api/auth/login", {
      email: emailOrUsername.value.trim().toLowerCase(),
      senha: password.value.trim(),
    });
    localStorage.setItem("email", emailOrUsername.value);
    router.push("/home");
  } catch {
    alert("Credenciais inválidas.");
  }
};

const register = async () => {
  if (newPassword.value !== confirmPassword.value) {
    alert("As senhas não coincidem!");
    return;
  }
  try {
    await axios.post("https://apirpa.onrender.com/api/auth/register", {
      nome: newUsername.value,
      email: newEmail.value,
      senha: newPassword.value,
    });
    alert("Cadastro realizado com sucesso!");
    router.push("/");
  } catch {
    alert("Erro ao registrar.");
  }
};
</script>

<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="tabs">
        <button :class="{ active: tab === 'login' }" @click="tab = 'login'">Entrar</button>
        <button :class="{ active: tab === 'register' }" @click="tab = 'register'">Registrar</button>
      </div>

      <transition name="fade" mode="out-in">
        <form v-if="tab === 'login'" key="login" @submit.prevent="login" class="form">
          <h2>Entrar</h2>
          <input v-model="emailOrUsername" type="text" placeholder="E-mail ou nome de usuário" />
          <input v-model="password" type="password" placeholder="Senha" />
          <button type="submit">Entrar</button>
        </form>

        <form v-else key="register" @submit.prevent="register" class="form">
          <h2>Criar Conta</h2>
          <input v-model="newUsername" type="text" placeholder="Nome completo" />
          <input v-model="newEmail" type="email" placeholder="E-mail" />
          <input v-model="newPassword" type="password" placeholder="Senha" />
          <input v-model="confirmPassword" type="password" placeholder="Confirmar senha" />
          <button type="submit">Registrar</button>
        </form>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f0f4f8, #d9e2ec);
  padding: 2rem;
}

.auth-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  padding: 2rem;
  transition: all 0.3s ease;
}

.tabs {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1.5rem;
}

.tabs button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-bottom: 2px solid transparent;
  background: none;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tabs button.active {
  border-color: #28a745;
  color: #28a745;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

input {
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 1rem;
  transition: border 0.2s ease;
}

input:focus {
  border-color: #28a745;
  outline: none;
}

button[type="submit"] {
  padding: 0.75rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

button[type="submit"]:hover {
  background-color: #218838;
}

h2 {
  text-align: center;
  color: #28a745;
  margin-bottom: 0.5rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
