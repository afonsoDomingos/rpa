// src/api/index.js
import axios from 'axios';

// Aqui estamos configurando o endpoint da API
//const api = axios.create({
//  baseURL: 'http://localhost:5000/api',  // Endereço da sua API local
//});

// Usando a variável de ambiente para o baseURL
//const api = axios.create({
//  baseURL: process.env.VUE_APP_API_URL,  // Obtém o valor da variável de ambiente
//});

const api = axios.create({
  baseURL: 'https://apirpa.onrender.com/api',
  timeout: 60000,  // 60 SEGUNDOS - COBRE COLD START + RETRIES DO BACKEND
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para injetar o token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // certifique-se de usar a mesma chave usada no login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Opcional: um interceptor para injetar token em todas as requisições
//api.interceptors.request.use((config) => {
//  const token = localStorage.getItem('authToken');
//  if (token) {
//    config.headers.Authorization = `Bearer ${token}`;
//  }
//  return config;
//});

// (Opcional) Interceptor de resposta para log de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;