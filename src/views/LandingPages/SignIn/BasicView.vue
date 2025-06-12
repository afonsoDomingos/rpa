<template>
  <div>
    <h1 v-if="isRegistering">Cadastro de Usuário</h1>
    <h1 v-else>Login</h1>

    <form @submit.prevent="handleSubmit">
      <div>
        <label for="emailOrUsername">Email ou Nome de Usuário</label>
        <input
          type="text"
          id="emailOrUsername"
          v-model="emailOrUsername"
          required
        />
      </div>

      <div>
        <label for="senha">Senha</label>
        <input
          type="password"
          id="senha"
          v-model="senha"
          required
        />
      </div>

      <div v-if="isRegistering">
        <label for="role">Role</label>
        <select v-model="role">
          <option value="cliente">Cliente</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <button type="submit">{{ isRegistering ? 'Cadastrar' : 'Entrar' }}</button>
    </form>

    <div>
      <button @click="toggleForm">
        {{ isRegistering ? 'Já tenho conta, faça login' : 'Ainda não tem conta? Cadastre-se' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

// Estado para controlar o formulário (Cadastro ou Login)
const isRegistering = ref(true); // true -> Cadastro, false -> Login

// Campos de entrada
const emailOrUsername = ref('');
const senha = ref('');
const role = ref('cliente'); // Só será usado no cadastro
const successMessage = ref('');
const errorMessage = ref('');

// Função para alternar entre o formulário de cadastro e login
const toggleForm = () => {
  isRegistering.value = !isRegistering.value;
  errorMessage.value = '';
  successMessage.value = '';
};

// Função para enviar os dados para o backend (Cadastro ou Login)
const handleSubmit = async () => {
  const url = isRegistering.value
    ? 'https://apirpa.onrender.com/api/auth/register'
    : 'https://apirpa.onrender.com/api/auth/login';

  const data = {
    emailOrUsername: emailOrUsername.value,
    senha: senha.value,
    role: isRegistering.value ? role.value : undefined,
  };

  try {
    const response = await axios.post(url, data);
    if (isRegistering.value) {
      successMessage.value = response.data.msg;
      errorMessage.value = '';
    } else {
      const token = response.data.token;
      successMessage.value = 'Login bem-sucedido!';
      errorMessage.value = '';
      console.log('Token JWT:', token);
      // Aqui você pode armazenar o token (localStorage ou Vuex, por exemplo)
    }
  } catch (error) {
    if (error.response) {
      errorMessage.value = error.response.data.msg;
    } else {
      errorMessage.value = 'Erro ao se comunicar com o servidor';
    }
  }
};
</script>

<style scoped>
.error-message {
  color: red;
}

.success-message {
  color: green;
}
</style>
