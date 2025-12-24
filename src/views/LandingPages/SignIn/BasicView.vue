<script setup lang="ts">  
import { ref, onMounted, computed, nextTick } from "vue";
import { useRouter } from "vue-router";
import api from "@/api";
import NavbarDefault from "../../../examples/navbars/NavbarDefault.vue";
import Swal from "sweetalert2";

// Interfaces
interface UserCredentials {
  email: string;
  senha: string;
}
interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  role: string;
}

// Estado
const router = useRouter();
const modo = ref<"login" | "register">("login");
const email = ref("");
const password = ref("");
const nome = ref("");
const newEmail = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const showPass = ref(false);
const showNewPass = ref(false);
const showConfirmPass = ref(false);
const isLoading = ref(false);
const isTakingLong = ref(false);
const errorMessage = ref("");

// Validações
const isLoginValid = computed(() => email.value.trim() && password.value.trim());
const isRegisterValid = computed(() =>
  nome.value.trim() &&
  newEmail.value.trim() &&
  newPassword.value.trim() &&
  confirmPassword.value.trim() &&
  newPassword.value === confirmPassword.value &&
  newPassword.value.length >= 8
);

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
};

// Login
const login = async () => {
  if (!isLoginValid.value) {
    errorMessage.value = "Por favor, preencha todos os campos obrigatórios";
    return;
  }
  if (!validateEmail(email.value)) {
    errorMessage.value = "Por favor, insira um e-mail válido";
    return;
  }
  isLoading.value = true;
  errorMessage.value = "";
  isTakingLong.value = false;

  const slowTimer = setTimeout(() => {
    isTakingLong.value = true;
  }, 3000);

  try {
    const res = await api.post("/auth/login", {
      email: email.value.trim().toLowerCase(),
      senha: password.value.trim(),
    });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("email", res.data.email || res.data.usuario?.email);
    const redirectUrl = res.data.redirectUrl || "/home";
    await router.push(redirectUrl);
  } catch (err: any) {
    console.error("Login Error:", err);
    errorMessage.value = err.response?.data?.msg || "Falha no login. Verifique seus dados e tente novamente.";
  } finally {
    clearTimeout(slowTimer);
    isLoading.value = false;
    isTakingLong.value = false;
  }
};

// Registro
const register = async () => {
  if (!isRegisterValid.value) {
    errorMessage.value = newPassword.value !== confirmPassword.value
      ? "As senhas não coincidem"
      : newPassword.value.length < 8
      ? "A senha deve ter pelo menos 8 caracteres"
      : "Por favor, preencha todos os campos obrigatórios (Nome, E-mail e Senhas)";
    return;
  }
  if (!validateEmail(newEmail.value)) {
    errorMessage.value = "Por favor, insira um e-mail válido";
    return;
  }
  isLoading.value = true;
  errorMessage.value = "";
  isTakingLong.value = false;

  const slowTimer = setTimeout(() => {
    isTakingLong.value = true;
  }, 3000);

  try {
    const res = await api.post("/auth/register", {
      nome: nome.value.trim(),
      email: newEmail.value.trim().toLowerCase(),
      senha: newPassword.value.trim(),
      role: "cliente",
    });

    // Tentar auto-login se o backend retornar token
    const token = res.data?.token;
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("email", res.data.email || res.data.usuario?.email || newEmail.value);
      
      Swal.fire({
        title: 'Bem-vindo!',
        text: 'Sua conta foi criada com sucesso.',
        icon: 'success',
        confirmButtonColor: '#800080',
        timer: 2000
      });
      
      await router.push("/home");
      return;
    }

    // Comportamento padrão: enviar para login
    errorMessage.value = "";
    modo.value = "login";
    email.value = newEmail.value; // Preenche o campo de login automaticamente
    password.value = newPassword.value;
    nome.value = newEmail.value = newPassword.value = confirmPassword.value = "";
    
    Swal.fire({
      title: 'Sucesso!',
      text: 'Conta criada! Você já pode entrar.',
      icon: 'success',
      confirmButtonColor: '#800080',
      timer: 3000
    });
  } catch (err: any) {
    console.error("Register Error:", err);
    errorMessage.value = err.response?.data?.msg || "Falha no registro. O servidor pode estar iniciando, tente novamente em instantes.";
  } finally {
    clearTimeout(slowTimer);
    isLoading.value = false;
    isTakingLong.value = false;
  }
};

// Login Google
const handleCredentialResponse = async (response: { credential: string }) => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await api.post("/auth/google", { token: response.credential });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("email", res.data.usuario.email);
    const redirectUrl =
      res.data.redirectUrl ||
      (res.data.usuario.role === "admin" ? "/dashboard/admin" : "/home");
    await router.push(redirectUrl);
  } catch (err: any) {
    errorMessage.value = err.response?.data?.msg || "Falha no login com Google";
  } finally {
    isLoading.value = false;
  }
};

// Carregar script Google
const loadGoogleScript = () => {
  return new Promise((resolve, reject) => {
    if (document.getElementById("google-signin-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "google-signin-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Inicialização
onMounted(async () => {
  try {
    await loadGoogleScript();
    const waitForGoogle = setInterval(async () => {
      if (window.google?.accounts?.id) {
        clearInterval(waitForGoogle);
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
        await nextTick();
        window.google.accounts.id.renderButton(
          document.getElementById("googleButton"),
          {
            theme: "outline",
            size: "large",
            width: "300",
            type: "standard",
          }
        );
        window.google.accounts.id.prompt();
      }
    }, 100);
  } catch (err) {
    console.error("Falha ao carregar script do Google:", err);
  }
});
</script>

<template>
  <div class="container-fluid position-sticky z-index-sticky top-0 px-0">
    <div class="row gx-0">
      <div class="col-12">
        <NavbarDefault :sticky="true" />
      </div>
    </div>
  </div>




  <div class="auth-container">
    <br /> <br /> <br />
    <transition name="fade">
      <div class="switcher">
        <button :class="{ active: modo === 'login' }" @click="modo = 'login'">
          <i class="bi bi-box-arrow-in-right"></i> Entrar
        </button>
        <button :class="{ active: modo === 'register' }" @click="modo = 'register'">
          <i class="bi bi-person-plus"></i> Cadastrar
        </button>
      </div>
    </transition>

    <div v-if="isTakingLong && isLoading" class="info-message">
       <i class="bi bi-hdd-network"></i> A acordar o servidor... <br>
       <small style="font-size: 0.75rem">(Isso pode levar alguns segundos)</small>
    </div>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

    <transition name="slide-fade" mode="out-in">
      <form v-if="modo === 'login'" @submit.prevent="login" class="form">
        <label class="custom-input-group">
          <i class="bi bi-envelope"></i>
          <input v-model="email" type="email" placeholder="E-mail" required />
        </label>
        
       <label class="custom-input-group">
  <i class="bi bi-lock"></i>
  <input :type="showPass ? 'text' : 'password'" v-model="password" placeholder="Senha" required />
  <span class="eye" @click="showPass = !showPass">
    <i :class="showPass ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
  </span>
</label>


    

        <button type="submit" class="btn pulse" :disabled="isLoading || !isLoginValid">
          <span v-if="isLoading">
            <span class="spinner"></span> Processando...
          </span>
          <span v-else>Entrar</span>
        </button>
        <a href="#" class="forgot">Esqueceu a senha?</a>
      </form>

      <form v-else @submit.prevent="register" class="form">
        <label class="custom-input-group">
          <i class="bi bi-person"></i>
          <input v-model="nome" type="text" placeholder="Nome completo" required />
        </label>
        <label class="custom-input-group">
          <i class="bi bi-envelope"></i>
          <input v-model="newEmail" type="email" placeholder="E-mail" required />
        </label>
      <label class="custom-input-group">
  <i class="bi bi-lock"></i>
  <input :type="showNewPass ? 'text' : 'password'" v-model="newPassword" placeholder="Senha" required />
  <span class="eye" @click="showNewPass = !showNewPass">
    <i :class="showNewPass ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
  </span>
</label>
        <label class="custom-input-group">
  <i class="bi bi-lock"></i>
  <input :type="showConfirmPass ? 'text' : 'password'" v-model="confirmPassword" placeholder="Confirmar senha" required />
  <span class="eye" @click="showConfirmPass = !showConfirmPass">
    <i :class="showConfirmPass ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
  </span>
</label>
        <button type="submit" class="btn pulse" :disabled="isLoading || !isRegisterValid">
          <span v-if="isLoading">
            <span class="spinner"></span> Processando...
          </span>
          <span v-else>Cadastrar</span>
        </button>
      </form>
    </transition>

    <div class="google-login-btn">
      <div id="googleButton"></div>
    </div>

    <p class="info">© 2025 RPA Moçambique</p>
  </div>


</template>

<style scoped>

/* Para a fonte Poppins */
@import '@fontsource/poppins/500.css';
@import '@fontsource/poppins/600.css';
@import '@fontsource/poppins/700.css';

/* --- Reset e configuração base --- */
html, body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

label, .form-label {
    font-size: 0.875rem;
    font-weight: 400;
    margin-bottom: 0.5rem;
    color: #800080;
    margin-left: 0.25rem;
}

:host, #app {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

* {
  font-family: "Poppins", sans-serif;
  box-sizing: border-box;
}

/* --- Navbar fixo sem margens --- */
.container-fluid {
  margin: 0;
  padding: 0;
}

/* --- Container principal (tela de login/registro) --- */
.auth-container {
  position: relative;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
              url('@/assets/img/mybanner2.jpg') no-repeat center center fixed;
  background-size: cover;
  background-attachment: fixed;
  animation: fadeIn 0.8s ease;
}

/* --- Seletor de modo (login/register) --- */
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

.switcher button i {
  margin-right: 5px;
}

/* --- Formulário --- */
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 320px;
}

.custom-input-group {
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: nowrap; /* Garante que não quebre linha */
  width: 100%; /* Ocupa largura total disponível */
  background: #f1f1f1;
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
}

.custom-input-group i {
  color: #800080;
  font-size: 16px;
  margin-right: 0.5rem;
  flex-shrink: 0; /* Ícone não encolhe */
}

.custom-input-group input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  width: 100%; /* Garante preenchimento */
  min-width: 0; /* Previne overflow em flex items */
}

/* .eye Refactored to Flexbox */
.eye {
  margin-left: 10px;
  cursor: pointer;
  color: #800080;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease, transform 0.2s ease;
  flex-shrink: 0;
}

.eye:hover {
  color: #0f752f;
  transform: scale(1.2);
}



/* --- Botão principal --- */
.btn {
  background: #800080;
  color: #fff;
  border: none;
  padding: 0.8rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.3s ease;
}

.btn:hover:not(:disabled) {
  transform: scale(1.03);
  box-shadow: 0 4px 10px rgba(128, 0, 128, 0.4);
}

.btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

/* --- Animação do botão --- */
.pulse {
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(128, 0, 128, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(128, 0, 128, 0); }
  100% { box-shadow: 0 0 0 0 rgba(128, 0, 128, 0); }
}

/* --- Spinner de carregamento --- */
.spinner {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #fff;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: inline-block;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* --- Esqueceu senha --- */
.forgot {
  text-align: center;
  margin-top: 0.6rem;
  font-size: 13px;
  color: #ffffff;
  text-decoration: none;
}

/* --- Botão do Google --- */
.google-login-btn {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  width: 300;
  max-width: 320px;
}

.google-login-btn > div {
  border: none !important;
  border-radius: 8px !important;
  padding: 10px;
  width: 300 !important;
  box-sizing: border-box;
  transition: transform 0.2s ease, box-shadow 0.3s ease;
}

.google-login-btn > div:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(128, 0, 128, 0.4);
}

/* --- Mensagens de erro --- */
.info-message {
  color: #856404;
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 320px;
  text-align: center;
  font-size: 0.9rem;
  animation: fadeIn 0.5s;
}

.error-message {
  color: #d32f2f;
  background: #fdeded;
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 320px;
  text-align: center;
}

/* --- Rodapé --- */
.info {
  margin-top: 2rem;
  font-size: 12px;
  color: #ddd;
  text-align: center;
}

/* --- Transições --- */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* --- Animação de entrada --- */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}


</style>

