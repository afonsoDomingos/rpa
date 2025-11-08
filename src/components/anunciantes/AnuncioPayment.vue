<!-- src/components/anunciantes/AnuncioPayment.vue -->
<template>
  <div class="payment-container">
    <!-- HEADER -->
    <header class="header">
      <button @click="$router.go(-1)" class="back-button">
        <i class="bi bi-arrow-left"></i>
        Voltar
      </button>
      <h1 class="title">Pagamento do Anúncio</h1>
    </header>

    <!-- CONTEÚDO -->
    <div class="content-wrapper">
      <!-- RESUMO DO ANÚNCIO -->
      <div class="summary-card">
        <img :src="adImage" alt="Anúncio" class="summary-image" @error="handleImageError" />
        <div class="summary-info">
          <h3 class="package-name">{{ adName }}</h3>
          <p class="package-description">{{ adDescription }}</p>
          <div class="summary-meta">
            <span class="duration">
              <i class="bi bi-clock"></i>
              {{ weeks }} {{ weeks === 1 ? 'semana' : 'semanas' }}
            </span>
            <span class="price">
              MZN {{ amount.toLocaleString('pt-MZ') }}
            </span>
          </div>
        </div>
      </div>

      <!-- SUCESSO -->
      <div v-if="success" class="success-message">
        <div class="success-icon">
          <i class="bi bi-check-circle-fill"></i>
        </div>
        <h2 class="success-title">Anúncio Ativado!</h2>
        <p class="success-text">Seu anúncio já está no ar e visível para milhares de usuários.</p>
        <button @click="$router.push('/meus-anuncios')" class="home-button">
          Ver Meus Anúncios
        </button>
      </div>

      <!-- PAGAMENTO -->
      <div v-else class="payment-section">
        <h2 class="section-title">Método de Pagamento</h2>

        <div class="payment-methods-grid">
          <button
            :class="['payment-method-card', { selected: selectedMethod === 'mpesa' }]"
            @click="selectedMethod = 'mpesa'"
          >
            <img src="/img/Mpesa.png" alt="M-Pesa" class="payment-method-icon-img" />
            <span class="payment-method-name">M-Pesa</span>
          </button>

          <button
            :class="['payment-method-card', { selected: selectedMethod === 'emola' }]"
            @click="selectedMethod = 'emola'"
          >
            <img src="/img/Emola.png" alt="Emola" class="payment-method-icon-img" />
            <span class="payment-method-name">Emola</span>
          </button>
        </div>

        <!-- FORMULÁRIO DE PAGAMENTO -->
        <form v-if="selectedMethod" @submit.prevent="handlePayment" class="payment-form">
          <div class="form-group">
            <label class="form-label">
              Número {{ selectedMethod === 'mpesa' ? 'M-Pesa' : 'Emola' }}
            </label>
            <input
              v-model="phone"
              type="tel"
              class="form-input"
              :placeholder="selectedMethod === 'mpesa' ? '84 123 4567' : '86 123 4567'"
              required
            />
            <p class="form-hint">Você receberá um pedido de confirmação no seu telemóvel.</p>
          </div>

          <button type="submit" :disabled="loading" class="submit-button">
            <span v-if="!loading">Pagar Agora</span>
            <span v-else>Processando...</span>
            <i v-if="!loading" class="bi bi-arrow-right"></i>
            <div v-else class="spinner"></div>
          </button>
        </form>

        <!-- ERRO -->
        <div v-if="error" class="error-message">
          {{ error }}
          <div class="error-actions">
            <button @click="handlePayment" class="retry-button">Tentar Novamente</button>
            <button @click="openSupport" class="support-button">Falar com Suporte</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const weeks = ref(1)
const amount = ref(500)
const adName = ref('Recuperação de BI em 24h')
const adDescription = ref('Entrega rápida e segura')
const adImage = ref('/img/anuncio-exemplo.jpg')

const selectedMethod = ref(null)
const phone = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

onMounted(() => {
  weeks.value = Number(route.query.weeks) || 1
  amount.value = Number(route.query.amount) || 500
  adName.value = route.query.name || adName.value
  adDescription.value = route.query.description || adDescription.value
  adImage.value = route.query.image || adImage.value
})

const handlePayment = async () => {
  loading.value = true
  error.value = ''
  await new Promise(r => setTimeout(r, 2000))
  if (Math.random() > 0.2) {
    success.value = true
  } else {
    error.value = 'Pagamento recusado. Verifique o número ou saldo.'
  }
  loading.value = false
}

const handleImageError = (e) => {
  e.target.src = '/img/placeholder-ad.jpg'
}

const openSupport = () => {
  window.open('https://wa.me/258841234567', '_blank')
}
</script>

<style scoped>
/* === IMPORTS === */
@import 'bootstrap-icons/font/bootstrap-icons.css';
@import '@fontsource/poppins/500.css';
@import '@fontsource/poppins/600.css';
@import '@fontsource/poppins/700.css';

/* === GLOBAL === */
* { box-sizing: border-box; }
.payment-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #0a0a0a, #1a1a1a);
  color: #ffffff;
  font-family: 'Poppins', sans-serif;
  padding: 2rem;
  padding-bottom: calc(140px + env(safe-area-inset-bottom));
}

/* === HEADER === */
.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: #a0a0a0;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.5rem 0;
  transition: color 0.2s;
}

.back-button:hover {
  color: #ffffff;
}

.back-button i {
  font-size: 1.1rem;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(to right, #ffffff, #a0a0a0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* === CONTENT === */
.content-wrapper {
  max-width: 600px;
  margin: 0 auto;
}

/* === RESUMO DO ANÚNCIO === */
.summary-card {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.summary-card:hover {
  border-color: #800080;
  box-shadow: 0 8px 24px rgba(128, 0, 128, 0.15);
}

.summary-image {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 0.75rem;
  flex-shrink: 0;
}

.summary-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.package-name {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #ffffff;
}

.package-description {
  font-size: 0.875rem;
  color: #a0a0a0;
  margin: 0 0 1rem 0;
}

.summary-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.duration {
  color: #a0a0a0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.duration i {
  color: #66bb6a;
}

.price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
}

/* === MÉTODOS DE PAGAMENTO === */
.payment-section {
  margin-top: 1rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  color: #ffffff;
}

.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.payment-method-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: #1a1a1a;
  border: 2px solid transparent;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-method-card:hover {
  border-color: #800080;
  transform: translateY(-2px);
}

.payment-method-card.selected {
  border-color: #800080;
  background: rgba(128, 0, 128, 0.1);
}

.payment-method-icon-img {
  width: 48px;
  height: auto;
}

.payment-method-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
}

/* === FORMULÁRIO === */
.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #d0d0d0;
}

.form-input {
  padding: 0.875rem;
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #ffffff;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  outline: none;
}

.form-input::placeholder {
  color: #a0a0a0;
}

.form-input:focus {
  border-color: #800080;
  box-shadow: 0 0 0 3px rgba(128, 0, 128, 0.1);
}

.form-hint {
  font-size: 0.8rem;
  color: #a0a0a0;
  margin: 0;
}

/* === BOTÃO PAGAR === */
.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #800080, #66bb6a);
  color: #ffffff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #66bb6a, #800080);
  transform: scale(1.02);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-button i {
  font-size: 1.1rem;
  transition: transform 0.2s ease;
}

.submit-button:hover i {
  transform: translateX(3px);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* === SUCESSO === */
.success-message {
  text-align: center;
  padding: 3rem 1rem;
}

.success-icon {
  display: inline-flex;
  padding: 1.5rem;
  background: rgba(20, 184, 166, 0.1);
  border-radius: 50%;
  margin-bottom: 1.5rem;
}

.success-icon i {
  font-size: 3rem;
  color: #14b8a6;
}

.success-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #ffffff;
}

.success-text {
  font-size: 1.125rem;
  color: #a0a0a0;
  margin: 0 0 1.5rem 0;
}

.home-button {
  padding: 0.875rem 2rem;
  background: #14b8a6;
  color: #ffffff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.home-button:hover {
  background: #0d9488;
  transform: scale(1.02);
}

/* === ERRO === */
.error-message {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  color: #ef4444;
  margin-top: 1rem;
  font-size: 0.875rem;
  text-align: center;
}

.error-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.retry-button,
.support-button {
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button {
  background: #800080;
  color: #ffffff;
  border: none;
}

.retry-button:hover {
  background: #9900cc;
}

.support-button {
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
}

.support-button:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* === RESPONSIVO === */
@media (max-width: 640px) {
  .payment-container { padding: 1.5rem; }
  .title { font-size: 1.5rem; }
  .summary-card { padding: 1.25rem; }
  .summary-image { width: 70px; height: 70px; }
  .payment-methods-grid { grid-template-columns: 1fr; }
}
</style>