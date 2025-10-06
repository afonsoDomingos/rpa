<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import NavbarDefault from "../../../examples/navbars/NavbarDefault.vue";
import FooterDefault from "../../../examples/footers/FooterDefault.vue";

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

// API
const api = {
  async login(credentials: UserCredentials) {
    return axios.post("https://apirpa.onrender.com/api/auth/login", credentials);
  },
  async register(data: RegisterData) {
    return axios.post("https://apirpa.onrender.com/api/auth/register", data);
  },
  async googleAuth(token: string) {
    return axios.post("https://apirpa.onrender.com/api/auth/google", { token });
  }
};

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
  try {
    const res = await api.login({
      email: email.value.trim().toLowerCase(),
      senha: password.value.trim(),
    });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("email", res.data.email);
    
    // Redireciona baseado no redirectUrl do backend (admin vai para dashboard, cliente para home)
    const redirectUrl = res.data.redirectUrl || "/home";
    await router.push(redirectUrl);
  } catch (err: any) {
    errorMessage.value = err.response?.data?.msg || "Falha no login. Tente novamente.";
  } finally {
    isLoading.value = false;
  }
};

// Registro
const register = async () => {
  if (!isRegisterValid.value) {
    errorMessage.value = newPassword.value !== confirmPassword.value
      ? "As senhas não coincidem"
      : newPassword.value.length < 8
      ? "A senha deve ter pelo menos 8 caracteres"
      : "Por favor, preencha todos os campos obrigatórios";
    return;
  }
  if (!validateEmail(newEmail.value)) {
    errorMessage.value = "Por favor, insira um e-mail válido";
    return;
  }
  isLoading.value = true;
  errorMessage.value = "";
  try {
    await api.register({
      nome: nome.value.trim(),
      email: newEmail.value.trim().toLowerCase(),
      senha: newPassword.value.trim(),
      role: "cliente",
    });
    errorMessage.value = "";
    modo.value = "login";
    nome.value = newEmail.value = newPassword.value = confirmPassword.value = "";
    alert("Conta criada com sucesso!");
  } catch (err: any) {
    errorMessage.value = err.response?.data?.msg || "Falha no registro. Tente novamente.";
  } finally {
    isLoading.value = false;
  }
};

// Login Google
const handleCredentialResponse = async (response: { credential: string }) => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await api.googleAuth(response.credential);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("email", res.data.usuario.email);

    // Se o backend retornar redirectUrl, use ele. Caso contrário, use role para decidir
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
    const waitForGoogle = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(waitForGoogle);
        console.log("Google API carregada ✅");

        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleButton"),
          {
            theme: "outline",
            size: "large",
            width: "100%",
            type: "standard",
          }
        );

        window.google.accounts.id.prompt(); // força exibição
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

  <div class="auth-container" :key="modo">
    <transition name="fade">
      <div class="switcher" key="modo">
        <button
          :class="{ active: modo === 'login' }"
          @click="modo = 'login'"
          aria-label="Alternar para formulário de login"
        >
          <i class="fas fa-sign-in-alt"></i> Entrar
        </button>
        <button
          :class="{ active: modo === 'register' }"
          @click="modo = 'register'"
          aria-label="Alternar para formulário de registro"
        >
          <i class="fas fa-user-plus"></i> Cadastrar
        </button>
      </div>
    </transition>

    <div v-if="errorMessage" class="error-message" role="alert">
      {{ errorMessage }}
    </div>

    <transition name="slide-fade" mode="out-in">
      <form
        v-if="modo === 'login'"
        class="form"
        @submit.prevent="login"
        key="login"
        aria-label="Formulário de login"
      >
        <label class="input-group">
          <i class="far fa-envelope" aria-hidden="true"></i>
          <input
            v-model="email"
            type="email"
            placeholder="E-mail"
            required
            aria-label="Endereço de e-mail"
          />
        </label>

        <label class="input-group">
          <i class="fas fa-lock" aria-hidden="true"></i>
          <input
            :type="showPass ? 'text' : 'password'"
            v-model="password"
            placeholder="Senha"
            required
            aria-label="Senha"
          />
          <i
            :class="showPass ? 'fas fa-eye-slash' : 'fas fa-eye'"
            class="eye"
            @click="showPass = !showPass"
            role="button"
            aria-label="Alternar visibilidade da senha"
          ></i>
        </label>

        <button
          type="submit"
          class="btn pulse"
          :disabled="isLoading || !isLoginValid"
          aria-label="Enviar formulário de login"
        >
          <span v-if="isLoading">Entrando...</span>
          <span v-else>Entrar</span>
        </button>
        <a href="#" class="forgot" aria-label="Link para recuperação de senha">Esqueceu a senha?</a>
      </form>

      <form
        v-else
        class="form"
        @submit.prevent="register"
        key="register"
        aria-label="Formulário de registro"
      >
        <label class="input-group">
          <i class="far fa-user" aria-hidden="true"></i>
          <input
            v-model="nome"
            type="text"
            placeholder="Nome completo"
            required
            aria-label="Nome completo"
          />
        </label>

        <label class="input-group">
          <i class="far fa-envelope" aria-hidden="true"></i>
          <input
            v-model="newEmail"
            type="email"
            placeholder="E-mail"
            required
            aria-label="Endereço de e-mail"
          />
        </label>

        <label class="input-group">
          <i class="fas fa-lock" aria-hidden="true"></i>
          <input
            :type="showNewPass ? 'text' : 'password'"
            v-model="newPassword"
            placeholder="Senha"
            required
            aria-label="Senha"
          />
          <i
            :class="showNewPass ? 'fas fa-eye-slash' : 'fas fa-eye'"
            class="eye"
            @click="showNewPass = !showNewPass"
            role="button"
            aria-label="Alternar visibilidade da senha"
          ></i>
        </label>

        <label class="input-group">
          <i class="fas fa-lock" aria-hidden="true"></i>
          <input
            :type="showConfirmPass ? 'text' : 'password'"
            v-model="confirmPassword"
            placeholder="Confirmar senha"
            required
            aria-label="Confirmar senha"
          />
          <i
            :class="showConfirmPass ? 'fas fa-eye-slash' : 'fas fa-eye'"
            class="eye"
            @click="showConfirmPass = !showConfirmPass"
            role="button"
            aria-label="Alternar visibilidade da confirmação de senha"
          ></i>
        </label>

        <button
          type="submit"
          class="btn pulse"
          :disabled="isLoading || !isRegisterValid"
          aria-label="Enviar formulário de registro"
        >
          <span v-if="isLoading">Cadastrando...</span>
          <span v-else>Cadastrar</span>
        </button>
      </form>
    </transition>

    <div id="googleButton" class="google-login-btn"></div>

    <p class="info">© 2025 RPA Moçambique</p>
  </div>

  <FooterDefault />
</template>


<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap");
@import url("https://use.fontawesome.com/releases/v5.8.2/css/all.css");

* {
  font-family: "Poppins", sans-serif;
  box-sizing: border-box;
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

.switcher button:focus {
  outline: 2px solid #800080;
  outline-offset: 2px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 320px;
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

.btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.btn:hover:not(:disabled) {
  transform: scale(1.03);
  box-shadow: 0 4px 10px rgba(128, 0, 128, 0.4);
}

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

.forgot {
  text-align: center;
  margin-top: 0.6rem;
  font-size: 13px;
  color: #800080;
  text-decoration: none;
}

.forgot:hover {
  color: #5c005c;
}

.google-login-btn {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

.google-login-btn > div {
  border: 2px solid #800080 !important;
  border-radius: 8px !important;
  padding: 10px;
  width: 100% !important;
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

.info {
  margin-top: 2rem;
  font-size: 12px;
  color: #888;
  text-align: center;
}

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
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  to {
    width: 200px;
    height: 200px;
    opacity: 0;
  }
}
</style>