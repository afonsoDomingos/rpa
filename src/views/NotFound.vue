<template>
  <div class="not-found-container position-relative overflow-hidden">
    <!-- Círculos Decorativos de Fundo -->
    <div class="decoration-circle circle-1"></div>
    <div class="decoration-circle circle-2"></div>

    <div class="container d-flex flex-column align-items-center justify-content-center min-vh-100 text-center z-index-2 position-relative">
      
      <!-- Conteúdo Principal -->
      <div class="content-wrapper p-4 animate-up">
        
        <!-- Logo Olho Animado -->
        <div class="mb-4 d-flex justify-content-center">
             <OlhoDeDeus style="transform: scale(2.5);" />
        </div>

        <h1 class="display-1 fw-black text-gradient">404</h1>
        
        <h2 class="mb-3 fw-bold text-dark">Oops! Página não encontrada.</h2>
        
        <p class="lead text-muted mb-5 mx-auto" style="max-width: 500px;">
          Parece que você navegou para uma área desconhecida da nossa plataforma.
          A página que você procura não existe ou foi movida.
        </p>

        <div class="d-flex justify-content-center gap-3">
          <router-link :to="{ name: 'presentation' }" class="btn btn-lg bg-gradient-primary text-white shadow-lg btn-glow">
            <i class="bi bi-house-door-fill me-2"></i>
            Voltar ao Início
          </router-link>
          
          <button @click="$router.go(-1)" class="btn btn-lg btn-outline-dark shadow-sm">
            <i class="bi bi-arrow-left me-2"></i>
            Voltar
          </button>
        </div>
      </div>

    </div>

    <!-- Rodapé Discreto -->
    <div class="position-absolute bottom-0 w-100 text-center pb-4 text-muted small opacity-50">
      RPA - Plataforma de Gestão Inteligente
    </div>
  </div>
</template>

<script setup>
import OlhoDeDeus from "@/examples/navbars/olhodedeus.vue";
</script>

<style scoped>
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css");

.not-found-container {
  background: #f8f9fa; /* Fundo claro */
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
}

/* Tipografia */
.fw-black {
  font-weight: 900;
}

.text-gradient {
  background: linear-gradient(135deg, #800080 0%, #ff6a88 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 8rem;
  line-height: 1;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 4px 12px rgba(128, 0, 128, 0.2));
}

@media (max-width: 768px) {
  .text-gradient {
    font-size: 5rem;
  }
}

/* Botões */
.bg-gradient-primary {
  background: linear-gradient(135deg, #800080 0%, #6a006a 100%);
  border: none;
  transition: all 0.3s ease;
}

.btn-glow:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(128, 0, 128, 0.4) !important;
}

.btn-outline-dark:hover {
  transform: translateY(-2px);
  background-color: #343a40;
  color: white;
}

/* Animação de Entrada */
.animate-up {
  animation: fadeUp 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Decoração de Fundo (Bolhas) */
.decoration-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  filter: blur(60px);
  z-index: 1;
}

.circle-1 {
  width: 400px;
  height: 400px;
  background: #800080;
  top: -100px;
  left: -100px;
  animation: float 6s infinite ease-in-out;
}

.circle-2 {
  width: 500px;
  height: 500px;
  background: #ff6a88;
  bottom: -150px;
  right: -150px;
  animation: float 8s infinite ease-in-out reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, 30px); }
}

.z-index-2 {
  z-index: 2;
}
</style>
