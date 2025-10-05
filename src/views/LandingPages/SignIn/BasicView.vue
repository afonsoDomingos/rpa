<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

import NavbarDefault from "../../../examples/navbars/NavbarDefault.vue";
import FooterDefault from "../../../examples/footers/FooterDefault.vue";

const router = useRouter();
const modo = ref("login");

const email = ref("");
const password = ref("");
const nome = ref("");
const newEmail = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

const showPass = ref(false);
const showNewPass = ref(false);
const showConfirmPass = ref(false);

const login = async () => {
  if (!email.value || !password.value) {
    alert("Preencha todos os campos!");
    return;
  }
  try {
    const res = await axios.post("https://apirpa.onrender.com/api/auth/login", {
      email: email.value.trim().toLowerCase(),
      senha: password.value.trim(),
    });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("email", email.value);
    router.push("/home");
  } catch (err) {
    alert(err.response?.data?.msg || "Erro ao entrar. Tente novamente.");
  }
};

const register = async () => {
  if (!nome.value || !newEmail.value || !newPassword.value || !confirmPassword.value) {
    alert("Preencha todos os campos!");
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    alert("As senhas não coincidem!");
    return;
  }
  try {
    await axios.post("https://apirpa.onrender.com/api/auth/register", {
      nome: nome.value.trim(),
      email: newEmail.value.trim().toLowerCase(),
      senha: newPassword.value.trim(),
      role: "cliente",
    });
    alert("Conta criada com sucesso!");
    modo.value = "login";
    nome.value = newEmail.value = newPassword.value = confirmPassword.value = "";
  } catch (err) {
    alert(err.response?.data?.msg || "Erro ao registrar. Tente novamente.");
  }
};
</script>

<template>
  <div class="container-fluid position-sticky z-index-sticky top-0 px-0">
    <div class="row gx-0">
      <div class="col-12">
        <NavbarDefault :sticky="true" />
      </div>
    </div>
  </div>

  <div class="auth-container" :key="modo">
    <transition name="fade">
      <div class="switcher" key="modo">
        <button :class="{ active: modo === 'login' }" @click="modo = 'login'">
          <i class="fas fa-sign-in-alt"></i> Entrar
        </button>
        <button :class="{ active: modo === 'register' }" @click="modo = 'register'">
          <i class="fas fa-user-plus"></i> Cadastrar
        </button>
      </div>
    </transition>

    <!-- Login -->
    <transition name="slide-fade" mode="out-in">
      <form v-if="modo === 'login'" class="form" @submit.prevent="login" key="login">
        <label class="input-group">
          <i class="far fa-envelope"></i>
          <input v-model="email" type="email" placeholder="E-mail" required />
        </label>

        <label class="input-group">
          <i class="fas fa-lock"></i>
          <input :type="showPass ? 'text' : 'password'" v-model="password" placeholder="Senha" required />
          <i :class="showPass ? 'fas fa-eye-slash' : 'fas fa-eye'" class="eye" @click="showPass = !showPass"></i>
        </label>

        <button type="submit" class="btn pulse">Entrar</button>
        <a href="#" class="forgot">Esqueceu a senha?</a>
      </form>

      <!-- Registro -->
      <form v-else class="form" @submit.prevent="register" key="register">
        <label class="input-group">
          <i class="far fa-user"></i>
          <input v-model="nome" type="text" placeholder="Nome completo" required />
        </label>

        <label class="input-group">
          <i class="far fa-envelope"></i>
          <input v-model="newEmail" type="email" placeholder="E-mail" required />
        </label>

        <label class="input-group">
          <i class="fas fa-lock"></i>
          <input :type="showNewPass ? 'text' : 'password'" v-model="newPassword" placeholder="Senha" required />
          <i :class="showNewPass ? 'fas fa-eye-slash' : 'fas fa-eye'" class="eye" @click="showNewPass = !showNewPass"></i>
        </label>

        <label class="input-group">
          <i class="fas fa-lock"></i>
          <input :type="showConfirmPass ? 'text' : 'password'" v-model="confirmPassword" placeholder="Confirmar senha" required />
          <i :class="showConfirmPass ? 'fas fa-eye-slash' : 'fas fa-eye'" class="eye" @click="showConfirmPass = !showConfirmPass"></i>
        </label>

        <button type="submit" class="btn pulse">Cadastrar</button>
      </form>
    </transition>

    <p class="info">© 2025 RPA Moçambique</p>
  </div>

  <FooterDefault />
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap");
@import url("https://use.fontawesome.com/releases/v5.8.2/css/all.css");

* {
  font-family: "Poppins", sans-serif;
}

.auth-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #ffffff, #f8f3fc);
  animation: fadeIn 0.8s ease;
}

.switcher {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 320px;
}

.switcher button {
  flex: 1;
  padding: 0.7rem;
  border: none;
  border-radius: 8px;
  background: #e0e0e0;
  color: #333;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.switcher button.active {
  background: #800080;
  color: #fff;
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(128, 0, 128, 0.3);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 320px;
  transition: all 0.4s ease;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  background: #f1f1f1;
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  transition: box-shadow 0.3s;
}

.input-group:focus-within {
  box-shadow: 0 0 0 2px rgba(128, 0, 128, 0.3);
}

.input-group i {
  color: #800080;
  font-size: 16px;
  margin-right: 0.5rem;
}

.input-group input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #333;
}

.eye {
  position: absolute;
  right: 12px;
  color: #800080;
  cursor: pointer;
}

.btn {
  background: #800080;
  color: #fff;
  border: none;
  padding: 0.8rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 10px rgba(128, 0, 128, 0.4);
}

/* Efeito Pulse */
.btn:active::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 0.6s ease-out;
}

@keyframes pulse {
  0% {
    width: 0;
    height: 0;
    opacity: 0.6;
  }
  100% {
    width: 200%;
    height: 200%;
    opacity: 0;
  }
}

.forgot {
  text-align: center;
  margin-top: 0.6rem;
  font-size: 13px;
  color: #800080;
  text-decoration: none;
  transition: color 0.3s;
}

.forgot:hover {
  color: #5c005c;
}

.info {
  margin-top: 2rem;
  font-size: 12px;
  color: #888;
  text-align: center;
}

/* Animações suaves */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.5s ease;
}

.slide-fade-enter-from {
  transform: translateY(10px);
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
