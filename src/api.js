import axios from 'axios';
// Aqui estamos configurando o endpoint da API
//const api = axios.create({
 // baseURL: 'http://localhost:5000/api',  // Endereço da sua API local
//});

// Usando a variável de ambiente para o baseURL
//const api = axios.create({
 // baseURL: process.env.VUE_APP_API_URL,  // Obtém o valor da variável de ambiente
//});

const api = axios.create({
  baseURL: 'https://apirpa.onrender.com/api',
  // poderia colocar o token aqui como default, por exemplo:
  // headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

// Opcional: um interceptor para injetar token em todas as requisições
//api.interceptors.request.use((config) => {
  //const token = localStorage.getItem('authToken');
  //if (token) {
  //  config.headers.Authorization = `Bearer ${token}`;
  //}
  //return config;
//});


export default api;







