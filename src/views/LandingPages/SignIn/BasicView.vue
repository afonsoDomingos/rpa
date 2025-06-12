<template>
  <div>
    <!-- Formulário de Registro -->
    <form @submit.prevent="handleRegisterSubmit">
      <h2>Registro</h2>
      <div>
        <label for="emailOrUsername">Email ou Nome de Usuário</label>
        <input
          v-model="emailOrUsername"
          type="text"
          id="emailOrUsername"
          placeholder="Email ou Nome de Usuário"
        />
      </div>
      
      <div>
        <label for="senha">Senha</label>
        <input
          v-model="senha"
          type="password"
          id="senha"
          placeholder="Senha"
        />
      </div>
      
      <div>
        <label for="role">Role</label>
        <input
          v-model="role"
          type="text"
          id="role"
          placeholder="Role (cliente, admin, etc.)"
        />
      </div>

      <button type="submit">Cadastrar</button>
    </form>

    <!-- Mensagens de erro e sucesso -->
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    <div v-if="successMessage" class="success">{{ successMessage }}</div>

    <!-- Formulário de Login -->
    <form @submit.prevent="handleLoginSubmit">
      <h2>Login</h2>
      <div>
        <label for="emailOrUsername">Email ou Nome de Usuário</label>
        <input
          v-model="loginEmailOrUsername"
          type="text"
          id="loginEmailOrUsername"
          placeholder="Email ou Nome de Usuário"
        />
      </div>

      <div>
        <label for="loginSenha">Senha</label>
        <input
          v-model="loginSenha"
          type="password"
          id="loginSenha"
          placeholder="Senha"
        />
      </div>

      <button type="submit">Entrar</button>
    </form>

    <!-- Mensagem de erro no Login -->
    <div v-if="loginErrorMessage" class="error">{{ loginErrorMessage }}</div>
    <div v-if="loginSuccessMessage" class="success">{{ loginSuccessMessage }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

// Dados do formulário de registro
const emailOrUsername = ref('');
const senha = ref('');
const role = ref('');
const successMessage = ref('');
const errorMessage = ref('');

// Dados do formulário de login
const loginEmailOrUsername = ref('');
const loginSenha = ref('');
const loginSuccessMessage = ref('');
const loginErrorMessage = ref('');

// Função para enviar os dados do formulário de registro
const handleRegisterSubmit = async () => {
  const url = 'https://apirpa.onrender.com/api/auth/register'; // URL da API de registro

  // Decida se o campo emailOrUsername é um email ou nome
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrUsername.value);

  // Prepara os dados a serem enviados
  const data = {
    emailOrUsername: emailOrUsername.value,  // Email ou Nome de Usuário
    senha: senha.value,                      // Senha
    role: role.value || 'cliente',           // Role, se não for enviado, define como 'cliente'
    nome: isEmail ? undefined : emailOrUsername.value, // Se for um e-mail, não envia nome
    email: isEmail ? emailOrUsername.value : undefined, // Se for um nome de usuário, não envia email
  };

  try {
    // Envia a requisição para o backend
    const response = await axios.post(url, data);

    // Exibe a mensagem de sucesso
    successMessage.value = response.data.msg;
    errorMessage.value = ''; // Limpa qualquer mensagem de erro anterior
  } catch (error) {
    // Captura erro da requisição
    if (error.response) {
      // Exibe erro detalhado no console (para depuração)
      console.error('Erro no servidor:', error.response.data);
      errorMessage.value = error.response.data.msg || 'Erro desconhecido';  // Mensagem de erro
    } else {
      // Erro ao se comunicar com o servidor
      errorMessage.value = 'Erro ao se comunicar com o servidor';
    }
  }
};

// Função para enviar os dados do formulário de login
const handleLoginSubmit = async () => {
  const url = 'https://apirpa.onrender.com/api/auth/login'; // URL da API de login

  // Prepara os dados a serem enviados
  const data = {
    emailOrUsername: loginEmailOrUsername.value,  // Email ou Nome de Usuário
    senha: loginSenha.value,                      // Senha
  };

  try {
    // Envia a requisição para o backend
    const response = await axios.post(url, data);

    // Exibe a mensagem de sucesso
    loginSuccessMessage.value = response.data.msg;
    loginErrorMessage.value = ''; // Limpa qualquer mensagem de erro anterior

    // Armazena o token JWT no localStorage ou Cookie (aqui é no localStorage)
    localStorage.setItem('authToken', response.data.token);

    // Redireciona o usuário baseado na role (admin ou cliente)
    window.location.href = response.data.redirectUrl;
  } catch (error) {
    // Captura erro da requisição
    if (error.response) {
      console.error('Erro no servidor:', error.response.data);
      loginErrorMessage.value = error.response.data.msg || 'Erro desconhecido';
    } else {
      loginErrorMessage.value = 'Erro ao se comunicar com o servidor';
    }
  }
};
</script>

<style scoped>
/* Estilos para a exibição das mensagens de erro e sucesso */
.error {
  color: red;
  margin-top: 10px;
}

.success {
  color: green;
  margin-top: 10px;
}

/* Estilos básicos para o formulário */
form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
}

form div {
  margin-bottom: 10px;
}

input {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

h2 {
  text-align: center;
}
</style>
