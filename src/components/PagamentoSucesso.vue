<template>
  <div class="success-page">
    <div class="success-container">
      <!-- Animação de Sucesso -->
      <div class="success-animation">
        <div class="checkmark-circle">
          <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle class="checkmark-circle-path" cx="26" cy="26" r="25" fill="none"/>
            <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
      </div>

      <!-- Mensagem Principal -->
      <h1 class="success-title">Pagamento Confirmado!</h1>
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
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

* {
  font-family: 'Poppins', sans-serif;
  box-sizing: border-box;
}

.success-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a0a1f 0%, #2d1b3d 50%, #1a0a1f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

.success-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, rgba(128, 0, 128, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.success-container {
  max-width: 650px;
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(128, 0, 128, 0.2);
  border-radius: 24px;
  padding: 2.5rem;
  text-align: center;
  position: relative;
  z-index: 1;
  box-shadow: 0 20px 60px rgba(128, 0, 128, 0.2);
}

/* Animação de Sucesso */
.success-animation {
  margin-bottom: 2rem;
}

.checkmark-circle {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  position: relative;
}

.checkmark {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: block;
  stroke-width: 3;
  stroke: #800080;
  stroke-miterlimit: 10;
  box-shadow: inset 0 0 0 #800080;
  animation: fill 0.4s ease-in-out 0.4s forwards, scale 0.3s ease-in-out 0.9s both;
}

.checkmark-circle-path {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 3;
  stroke-miterlimit: 10;
  stroke: #800080;
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke: #fff;
  stroke-width: 3;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes scale {
  0%, 100% {
    transform: none;
  }
  50% {
    transform: scale3d(1.1, 1.1, 1);
  }
}

@keyframes fill {
  100% {
    box-shadow: inset 0 0 0 60px #800080;
  }
}

/* Textos */
.success-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #a855f7, #d946ef);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.success-subtitle {
  font-size: 1.125rem;
  color: #c4b5d0;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

/* Detalhes do Pagamento */
.payment-details {
  background: rgba(128, 0, 128, 0.1);
  border: 1px solid rgba(128, 0, 128, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.payment-details:hover {
  background: rgba(128, 0, 128, 0.15);
  border-color: rgba(128, 0, 128, 0.4);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 0;
  border-bottom: 1px solid rgba(128, 0, 128, 0.15);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 0.9rem;
  color: #b8a5c9;
  font-weight: 500;
}

.detail-value {
  font-size: 1.05rem;
  color: #ffffff;
  font-weight: 600;
  background: linear-gradient(135deg, #a855f7, #d946ef);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Próximos Passos */
.next-steps {
  margin-bottom: 2rem;
  text-align: left;
}

.steps-title {
  font-size: 1.35rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 1.5rem 0;
  text-align: center;
  background: linear-gradient(135deg, #a855f7, #d946ef);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1.25rem;
  background: rgba(128, 0, 128, 0.08);
  border: 1px solid rgba(128, 0, 128, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.step-item:hover {
  background: rgba(128, 0, 128, 0.15);
  border-color: rgba(128, 0, 128, 0.4);
  transform: translateX(8px);
  box-shadow: 0 4px 16px rgba(128, 0, 128, 0.2);
}

.step-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #800080, #a855f7);
  border-radius: 50%;
  color: #ffffff;
  font-size: 1.35rem;
  box-shadow: 0 4px 12px rgba(128, 0, 128, 0.3);
}

.step-content h4 {
  font-size: 1.05rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.35rem 0;
}

.step-content p {
  font-size: 0.9rem;
  color: #b8a5c9;
  margin: 0;
  line-height: 1.5;
}

/* Botões de Ação */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.1rem 1.75rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #800080, #a855f7);
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(128, 0, 128, 0.3);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(128, 0, 128, 0.5);
  background: linear-gradient(135deg, #9333ea, #c084fc);
}

.btn-primary:active {
  transform: translateY(-1px);
}

.btn-secondary {
  background: rgba(128, 0, 128, 0.1);
  color: #ffffff;
  border: 1px solid rgba(128, 0, 128, 0.3);
}

.btn-secondary:hover {
  background: rgba(128, 0, 128, 0.2);
  border-color: rgba(128, 0, 128, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(128, 0, 128, 0.2);
}

.btn-secondary:active {
  transform: translateY(0);
}

/* Link de Suporte */
.support-link {
  font-size: 0.9rem;
  color: #b8a5c9;
}

.support-link a {
  color: #a855f7;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border-bottom: 1px solid transparent;
}

.support-link a:hover {
  color: #d946ef;
  border-bottom-color: #d946ef;
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
    padding: 1.5rem 1rem;
  }

  .success-container {
    padding: 2rem 1.5rem;
    border-radius: 20px;
  }

  .success-title {
    font-size: 2.2rem;
  }

  .success-subtitle {
    font-size: 1.05rem;
  }

  .checkmark-circle,
  .checkmark {
    width: 110px;
    height: 110px;
  }

  .step-icon {
    width: 44px;
    height: 44px;
    font-size: 1.25rem;
  }

  .step-content h4 {
    font-size: 1rem;
  }

  .step-content p {
    font-size: 0.875rem;
  }

  .payment-details {
    padding: 1.25rem;
  }

  .detail-row {
    padding: 0.75rem 0;
  }
}

/* Responsivo - Mobile */
@media (max-width: 640px) {
  .success-page {
    padding: 1rem 0.75rem;
  }

  .success-container {
    padding: 1.75rem 1.25rem;
    border-radius: 16px;
  }

  .success-title {
    font-size: 1.85rem;
    margin-bottom: 0.75rem;
  }

  .success-subtitle {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }

  .checkmark-circle,
  .checkmark {
    width: 90px;
    height: 90px;
  }

  .success-animation {
    margin-bottom: 1.5rem;
  }

  .payment-details {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .detail-row {
    padding: 0.65rem 0;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .detail-label {
    font-size: 0.85rem;
  }

  .detail-value {
    font-size: 0.95rem;
  }

  .steps-title {
    font-size: 1.2rem;
    margin-bottom: 1.25rem;
  }

  .step-item {
    padding: 1rem;
    gap: 0.875rem;
  }

  .step-icon {
    width: 40px;
    height: 40px;
    font-size: 1.15rem;
  }

  .step-content h4 {
    font-size: 0.95rem;
  }

  .step-content p {
    font-size: 0.85rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.875rem;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    min-width: unset;
    padding: 1rem 1.5rem;
    font-size: 0.95rem;
  }

  .support-link {
    font-size: 0.85rem;
  }
}

/* Responsivo - Mobile Pequeno */
@media (max-width: 400px) {
  .success-container {
    padding: 1.5rem 1rem;
  }

  .success-title {
    font-size: 1.65rem;
  }

  .success-subtitle {
    font-size: 0.95rem;
  }

  .checkmark-circle,
  .checkmark {
    width: 80px;
    height: 80px;
  }

  .step-item {
    padding: 0.875rem;
  }

  .step-icon {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.875rem 1.25rem;
    font-size: 0.9rem;
  }
}

/* Landscape Mobile */
@media (max-height: 600px) and (orientation: landscape) {
  .success-page {
    padding: 1rem;
  }

  .success-container {
    padding: 1.5rem;
    max-width: 90%;
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
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .payment-details,
  .next-steps {
    margin-bottom: 1rem;
  }

  .steps-title {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }

  .step-item {
    padding: 0.75rem;
  }
}
</style>
