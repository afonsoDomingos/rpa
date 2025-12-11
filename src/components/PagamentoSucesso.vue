<template>
  <div class="success-page">
    <div class="success-container">
      <!-- Mensagem Principal -->
      <p class="success-subtitle">
        {{ mensagem || 'Sua assinatura foi ativada com sucesso.' }}
      </p>

      <!-- Detalhes do Pagamento -->
      <div class="payment-details" v-if="detalhes">
        <div class="detail-row">
          <span class="detail-label">Plano</span>
          <span class="detail-value">{{ detalhes.plano }}</span>
        </div>
        <div class="detail-row" v-if="detalhes.valor > 0">
          <span class="detail-label">Valor</span>
          <span class="detail-value">{{ formatarValor(detalhes.valor) }} MZN</span>
        </div>
        <div class="detail-row" v-if="detalhes.metodo">
          <span class="detail-label">Método</span>
          <span class="detail-value">{{ detalhes.metodo }}</span>
        </div>
        <div class="detail-row" v-if="detalhes.validade">
          <span class="detail-label">Válido até</span>
          <span class="detail-value">{{ detalhes.validade }}</span>
        </div>
      </div>

      <!-- Próximos Passos -->
      <div class="next-steps">
        <h3 class="steps-title">Próximos Passos</h3>
        <div class="steps-list">
          <div class="step-item">
            <div class="step-icon">
              <i class="bi bi-check-circle-fill"></i>
            </div>
            <div class="step-content">
              <h4>Acesso Liberado</h4>
              <p>Todas as funcionalidades já estão disponíveis para você</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-icon">
              <i class="bi bi-envelope-fill"></i>
            </div>
            <div class="step-content">
              <h4>Confirmação por Email</h4>
              <p>Enviamos um recibo para o seu email</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-icon">
              <i class="bi bi-headset"></i>
            </div>
            <div class="step-content">
              <h4>Suporte Disponível</h4>
              <p>Qualquer dúvida, estamos aqui para ajudar</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Botões de Ação -->
      <div class="action-buttons">
        <button @click="irParaHome" class="btn-primary">
          <i class="bi bi-house-fill"></i>
          Ir para Página Inicial
        </button>
        <button @click="verMeusPagamentos" class="btn-secondary">
          <i class="bi bi-credit-card"></i>
          Ver Meus Pagamentos
        </button>
      </div>

      <!-- Link de Suporte -->
      <div class="support-link">
        <p>Precisa de ajuda? <a href="tel:258847877405">Entre em contato</a></p>
      </div>
    </div>

    <!-- Confetti Animation (opcional) -->
    <div class="confetti" v-if="mostrarConfetti">
      <div class="confetti-piece" v-for="i in 50" :key="i" :style="getConfettiStyle(i)"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const mensagem = ref('');
const detalhes = ref(null);
const mostrarConfetti = ref(true);

onMounted(() => {
  // Pega os dados da query string ou do state
  const { plano, valor, metodo, validade, msg } = route.query;
  
  if (msg) {
    mensagem.value = msg;
  }

  if (plano) {
    detalhes.value = {
      plano: plano,
      valor: parseFloat(valor) || 0,
      metodo: metodo || '',
      validade: validade || ''
    };
  }

  // Remove confetti após 5 segundos
  setTimeout(() => {
    mostrarConfetti.value = false;
  }, 5000);
});

const formatarValor = (valor) => {
  return new Intl.NumberFormat('pt-MZ').format(valor);
};

const irParaHome = () => {
  router.push('/home');
};

const verMeusPagamentos = () => {
  router.push({ name: 'MeusPagamentos' });
};

const getConfettiStyle = (index) => {
  const colors = ['#800080', '#66bb6a', '#14b8a6', '#f59e0b', '#ef4444'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomLeft = Math.random() * 100;
  const randomDelay = Math.random() * 3;
  const randomDuration = 3 + Math.random() * 2;
  
  return {
    left: `${randomLeft}%`,
    backgroundColor: randomColor,
    animationDelay: `${randomDelay}s`,
    animationDuration: `${randomDuration}s`
  };
};
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.success-page {
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  overflow: hidden;
  position: relative;
}

.success-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(128, 0, 128, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(128, 0, 128, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(128, 0, 128, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.success-page::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 60px,
    rgba(128, 0, 128, 0.02) 60px,
    rgba(128, 0, 128, 0.02) 120px
  );
  pointer-events: none;
}

.success-container {
  width: 100%;
  max-width: 900px;
  height: auto;
  max-height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 1rem 0;
  overflow-y: auto;
  position: relative;
  z-index: 1;
}



/* Textos */

.success-subtitle {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

/* Detalhes do Pagamento */
.payment-details {
  background: #f8f8f8;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 500px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.65rem 0;
  border-bottom: 1px solid #e5e5e5;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 0.875rem;
  color: #666666;
  font-weight: 500;
}

.detail-value {
  font-size: 0.95rem;
  color: #1a1a1a;
  font-weight: 600;
}

/* Próximos Passos */
.next-steps {
  margin-bottom: 2rem;
  width: 100%;
  max-width: 600px;
}

.steps-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
}

.steps-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.step-item:hover {
  border-color: #800080;
  box-shadow: 0 4px 12px rgba(128, 0, 128, 0.1);
}

.step-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #800080;
  border-radius: 50%;
  color: #ffffff;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.step-content {
  text-align: center;
}

.step-content h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
}

.step-content p {
  font-size: 0.8rem;
  color: #666666;
  margin: 0;
  line-height: 1.4;
}

/* Botões de Ação */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 500px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #800080;
  color: #ffffff;
}

.btn-primary:hover {
  background: #9333ea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(128, 0, 128, 0.3);
}

.btn-secondary {
  background: #ffffff;
  color: #1a1a1a;
  border: 1px solid #e5e5e5;
}

.btn-secondary:hover {
  border-color: #800080;
  color: #800080;
}

/* Link de Suporte */
.support-link {
  font-size: 0.875rem;
  color: #666666;
}

.support-link a {
  color: #800080;
  text-decoration: none;
  font-weight: 600;
}

.support-link a:hover {
  text-decoration: underline;
}

/* Confetti Animation */
.confetti {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.confetti-piece {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -10px;
  opacity: 0;
  animation: confetti-fall linear forwards;
}

@keyframes confetti-fall {
  0% {
    top: -10px;
    opacity: 1;
    transform: rotate(0deg);
  }
  100% {
    top: 100vh;
    opacity: 0;
    transform: rotate(720deg);
  }
}

/* Responsivo - Tablets */
@media (max-width: 768px) {
  .success-page {
    padding: 1rem;
  }

  .success-title {
    font-size: 1.85rem;
  }

  .success-subtitle {
    font-size: 0.95rem;
  }

  .checkmark-circle,
  .checkmark {
    width: 85px;
    height: 85px;
  }

  .steps-list {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .step-item {
    flex-direction: row;
    text-align: left;
    padding: 0.875rem;
  }

  .step-content {
    text-align: left;
  }

  .step-icon {
    width: 42px;
    height: 42px;
    font-size: 1.1rem;
  }

  .payment-details {
    padding: 1rem;
  }
}

/* Responsivo - Mobile */
@media (max-width: 640px) {
  .success-page {
    padding: 0.75rem;
  }

  .success-animation {
    margin-bottom: 1rem;
  }

  .checkmark-circle,
  .checkmark {
    width: 70px;
    height: 70px;
  }

  .success-title {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .success-subtitle {
    font-size: 0.875rem;
    margin-bottom: 1.25rem;
  }

  .payment-details {
    padding: 0.875rem;
    margin-bottom: 1.25rem;
  }

  .detail-row {
    padding: 0.5rem 0;
  }

  .detail-label {
    font-size: 0.8rem;
  }

  .detail-value {
    font-size: 0.875rem;
  }

  .steps-title {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }

  .step-item {
    padding: 0.75rem;
    gap: 0.65rem;
  }

  .step-icon {
    width: 38px;
    height: 38px;
    font-size: 1rem;
  }

  .step-content h4 {
    font-size: 0.85rem;
  }

  .step-content p {
    font-size: 0.75rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.75rem 1.25rem;
    font-size: 0.875rem;
  }

  .support-link {
    font-size: 0.8rem;
  }
}

/* Landscape Mobile - Sem Scroll */
@media (max-height: 650px) and (orientation: landscape) {
  .success-page {
    padding: 0.5rem;
  }

  .success-container {
    max-width: 95%;
  }

  .success-animation {
    margin-bottom: 0.5rem;
  }

  .checkmark-circle,
  .checkmark {
    width: 60px;
    height: 60px;
  }

  .success-title {
    font-size: 1.35rem;
    margin-bottom: 0.35rem;
  }

  .success-subtitle {
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
  }

  .payment-details {
    padding: 0.65rem;
    margin-bottom: 0.75rem;
  }

  .detail-row {
    padding: 0.4rem 0;
  }

  .next-steps {
    margin-bottom: 0.75rem;
  }

  .steps-title {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .steps-list {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .step-item {
    padding: 0.5rem;
    flex-direction: column;
  }

  .step-icon {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }

  .step-content h4 {
    font-size: 0.75rem;
  }

  .step-content p {
    font-size: 0.65rem;
  }

  .action-buttons {
    margin-bottom: 0.5rem;
    gap: 0.5rem;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }

  .support-link {
    font-size: 0.7rem;
  }
}
</style>
