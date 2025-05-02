import axios from 'axios';

// Aqui estamos configurando o endpoint da API
//const api = axios.create({
 // baseURL: 'http://localhost:5000/api',  // Endereço da sua API local
//});
//Usando a variável de para producao
const api = axios.create({
  baseURL: 'https://apirpa.onrender.com/api',  // Endereço da sua API no Render
});


// Usando a variável de ambiente para o baseURL
//const api = axios.create({
 // baseURL: process.env.VUE_APP_API_URL,  // Obtém o valor da variável de ambiente
//});


export default api;






