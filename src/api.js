import axios from 'axios';

// Aqui estamos configurando o endpoint da API
const api = axios.create({
  baseURL: 'http://localhost:5000/api',  // Endereço da sua API local
});

export default api;
