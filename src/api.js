import axios from "axios";

export const ROOT_URL = "https://apirpa.onrender.com";
export const BASE_URL = `${ROOT_URL}/api`;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para injetar o token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta para log de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Em produção, não expomos detalhes internos da API no console
    const isProduction = import.meta.env.PROD;

    if (isProduction) {
      console.error("Erro na comunicação com o servidor. Por favor, tente novamente mais tarde.");
    } else {
      console.error("API Error Detail:", error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
