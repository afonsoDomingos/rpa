import axios from "axios";

// Pega a URL do .env se existir, caso contrário usa o fallback
export const ROOT_URL = import.meta.env.VITE_APP_API_URL || "https://apirpa.onrender.com";
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
    const isProduction = import.meta.env.PROD;
    const isSilentAuth = error.config?.url?.includes("/auth/me");

    // Se for 401 em uma rota de "me", é esperado (não logado)
    if (error.response?.status === 401 && isSilentAuth) {
      return Promise.reject(error);
    }

    if (isProduction) {
      // Loga um erro um pouco mais descritivo se não for auth silencioso
      console.error(`Erro na comunicação (${error.response?.status || 'Network'}): Por favor, tente novamente mais tarde.`);
    } else {
      console.error("API Error Detail:", error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
