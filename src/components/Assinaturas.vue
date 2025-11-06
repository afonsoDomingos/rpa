<template>
  <div class="subscription-container">
    <header class="header">
      <button @click="goBack" class="back-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Voltar
      </button>
      <h1 class="title">Escolha seu Plano</h1>
    </header>

    <div class="content-wrapper">
      <main class="main-content">
        <!-- Passo 1: Pacotes -->
        <div v-if="currentStep === 1" class="packages-grid">
          <div v-for="pkg in packages" :key="pkg.id" :class="['package-card', { 'selected': selectedPackage?.id === pkg.id, 'recommended': pkg.recommended }]" @click="selectPackage(pkg)">
            <div v-if="pkg.recommended" class="recommended-badge">Recomendado</div>
            <h3 class="package-name">{{ pkg.name }}</h3>
            <div class="package-price">
              <span v-if="pkg.price > 0" class="currency">MZN</span>
              <span class="amount">{{ pkg.price > 0 ? pkg.price.toLocaleString('pt-MZ') : 'Gratuito' }}</span>
              <span v-if="pkg.price > 0" class="period">{{ pkg.period }}</span>
            </div>
            <ul class="benefits-list">
              <li v-for="(benefit, index) in pkg.benefits" :key="index" class="benefit-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="check-icon">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                {{ benefit }}
              </li>
            </ul>
            <button :class="['select-button', { 'selected': selectedPackage?.id === pkg.id }]" @click.stop="selectPackage(pkg)">
              {{ selectedPackage?.id === pkg.id ? 'Selecionado' : 'Selecionar' }}
            </button>
          </div>
        </div>

        <!-- Passo 2: Pagamento -->
        <div v-if="currentStep === 2" class="payment-methods">
          <h2 class="section-title">Escolha o Método de Pagamento</h2>
          <div class="payment-methods-grid">
            <button v-for="method in paymentMethods" :key="method.id" :class="['payment-method-card', { 'selected': selectedPaymentMethod === method.id }]" @click="selectPaymentMethod(method.id)">
              <img v-if="method.img" :src="method.img" class="payment-method-icon-img" />
              <i v-else :class="method.iconClass" class="payment-method-icon"></i>
              <span class="payment-method-name">{{ method.name }}</span>
            </button>
          </div>

          <form v-if="selectedPaymentMethod" @submit.prevent="handleSubmit" class="form">
            <!-- M-Pesa / Emola -->
            <div v-if="['mpesa', 'emola'].includes(selectedPaymentMethod)" class="form-group phone-input-group">
              <label class="form-label">Número {{ selectedPaymentMethod === 'mpesa' ? 'M-Pesa' : 'Emola' }}</label>
              <input
                ref="phoneInput"
                v-model="mobileDetails.phone"
                type="tel"
                inputmode="numeric"
                autocomplete="tel"
                :placeholder="selectedPaymentMethod === 'mpesa' ? '84 123 4567' : '86 123 4567'"
                required
                class="form-input"
                @focus="onInputFocus"
                @blur="onInputBlur"
                @input="debouncedNormalize"
              />
            </div>

            <!-- Cartão -->
            <div v-if="selectedPaymentMethod === 'card'">
              <div class="form-group">
                <label class="form-label">Número do Cartão</label>
                <input
                  ref="cardInput"
                  v-model="cardDetails.number"
                  type="text"
                  inputmode="numeric"
                  autocomplete="cc-number"
                  placeholder="0000 0000 0000 0000"
                  required
                  class="form-input"
                  @focus="onInputFocus"
                  @blur="onInputBlur"
                />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Validade</label>
                  <input v-model="cardDetails.expiry" type="text" placeholder="MM/AA" required class="form-input"/>
                </div>
                <div class="form-group">
                  <label class="form-label">CVV</label>
                  <input v-model="cardDetails.cvv" type="text" inputmode="numeric" placeholder="123" required class="form-input"/>
                </div>
              </div>
            </div>

            <p class="form-hint">Você receberá uma notificação no seu telefone para confirmar o pagamento.</p>
            <button type="submit" :disabled="loading" class="submit-button">
              <span v-if="loading" class="spinner"></span>
              {{ loading ? 'Processando...' : 'Enviar Pedido' }}
            </button>
          </form>

          <!-- Mensagem de erro com ações -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
            <div class="error-actions">
              <button @click="retryPayment" class="retry-button">Tentar Novamente</button>
              <button @click="contactSupport" class="support-button">Contactar Suporte</button>
            </div>
          </div>
        </div>

        <!-- Tela de Sucesso -->
        <div v-if="showSuccess" class="success-message">
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <path d="m9 11 3 3L22 4"/>
            </svg>
          </div>
          <h2 class="success-title">Pagamento Confirmado!</h2>
          <p class="success-text">Sua assinatura foi ativada com sucesso.</p>
          <button @click="goToHome" class="home-button">Voltar à Página Inicial</button>
        </div>
      </main>

      <!-- RESUMO DESKTOP: SEMPRE VISÍVEL -->
      <aside class="order-summary-desktop" v-if="selectedPackage && currentStep < 3">
        <h3 class="summary-title">Resumo do Pedido</h3>
        <div class="summary-section">
          <div class="summary-label">Plano Selecionado</div>
          <div class="summary-value">{{ selectedPackage.name }}</div>
        </div>
        <div v-if="selectedPaymentMethod" class="summary-section">
          <div class="summary-label">Método de Pagamento</div>
          <div class="summary-value">{{ paymentMethods.find(m => m.id === selectedPaymentMethod)?.name }}</div>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-total">
          <span class="total-label">Total</span>
          <span class="total-amount">{{ selectedPackage.price > 0 ? 'MZN ' + selectedPackage.price.toLocaleString('pt-MZ') : 'Gratuito' }}</span>
        </div>
        <button v-if="currentStep === 1" @click="nextStep" class="continue-button">Continuar para Pagamento</button>
        <button v-if="currentStep === 2" @click="previousStep" class="back-step-button">Voltar aos Planos</button>
      </aside>
    </div>

    <!-- RESUMO MOBILE: SOME AO DIGITAR -->
    <aside class="order-summary-mobile" v-if="selectedPackage && !inputFocused && currentStep < 3 && isMobile">
      <div class="summary-content">
        <div class="summary-row">
          <span class="summary-label">Plano</span>
          <span class="summary-value">{{ selectedPackage.name }}</span>
        </div>
        <div v-if="selectedPaymentMethod" class="summary-row">
          <span class="summary-label">Pagamento</span>
          <span class="summary-value">{{ paymentMethods.find(m => m.id === selectedPaymentMethod)?.name }}</span>
        </div>
        <div class="summary-total">
          <span class="total-label">Total</span>
          <span class="total-amount">{{ selectedPackage.price > 0 ? 'MZN ' + selectedPackage.price.toLocaleString('pt-MZ') : 'Gratuito' }}</span>
        </div>
      </div>
      <div class="summary-actions">
        <button v-if="currentStep === 1" @click="nextStep" class="continue-button">Continuar</button>
        <button v-if="currentStep === 2" @click="previousStep" class="back-step-button">Voltar</button>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import mpesaIcon from '@/assets/img/Mpesa.png'
import emolaIcon from '@/assets/img/Emola.png'
import axios from 'axios'

// Configuração global
axios.defaults.timeout = 12000
axios.defaults.headers.common['Content-Type'] = 'application/json'

const router = useRouter()

// Estado
const currentStep = ref(1)
const selectedPackage = ref(null)
const selectedPaymentMethod = ref(null)
const loading = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')
const phoneInput = ref(null)
const cardInput = ref(null)
const inputFocused = ref(false)
const isMobile = ref(false)

// Detectar mobile
onMounted(() => {
  isMobile.value = window.innerWidth <= 1024
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 1024
  })
})

// Pacotes
const packages = [
  { id: 'free', name: 'Gratuito', price: 0, period: '', benefits: ['Permite fazer pesquisas', 'Gerar CV', '1 GB de armazenamento'], recommended: false },
  { id: 'mensal', name: 'Mensal', price: 150, period: '/mês', benefits: ['Tudo do plano gratuito', 'Solicitar documentos', '3 GB de armazenamento', 'Suporte prioritário', 'Atualizações semanais'], recommended: true },
  { id: 'anual', name: 'Anual', price: 1500, period: '/ano', benefits: ['Tudo do plano mensal', 'Delivery de documentos', 'Atualizações diárias'], recommended: false }
]

const paymentMethods = [
  { id: 'mpesa', name: 'M-Pesa', img: mpesaIcon },
  { id: 'emola', name: 'Emola', img: emolaIcon },
  { id: 'card', name: 'Cartão', iconClass: 'bi bi-credit-card' }
]

const mobileDetails = reactive({ phone: '' })
const cardDetails = reactive({ number: '', expiry: '', cvv: '' })

// Normalização de telefone
function normalizarTelefone(phone) {
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '')
  if (/^(84|85|86|87|82)\d{7}$/.test(cleaned)) return '258' + cleaned
  if (/^258\d{9}$/.test(cleaned)) return cleaned
  return null
}

// Debounce para normalização
let debounceTimer
const debouncedNormalize = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (mobileDetails.phone.length >= 9) {
      const normalized = normalizarTelefone(mobileDetails.phone)
      if (normalized) mobileDetails.phone = normalized.slice(3)
    }
  }, 400)
}

// Foco no input (mobile)
const onInputFocus = async () => {
  if (isMobile.value) {
    inputFocused.value = true
    await nextTick()
    const input = phoneInput.value || cardInput.value
    if (input) input.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}
const onInputBlur = () => { inputFocused.value = false }

// Logs coloridos (como no script antigo)
function logInfo(title, data) {
  console.groupCollapsed(`%cℹ️ INFO: ${title}`, 'background: #e0f7fa; color: #006064; font-weight: bold; padding: 2px 6px; border-radius: 4px;')
  console.log(data)
  console.groupEnd()
}
function logSuccess(title, data) {
  console.groupCollapsed(`%c✅ SUCCESS: ${title}`, 'background: #e8f5e9; color: #2e7d32; font-weight: bold; padding: 2px 6px; border-radius: 4px;')
  console.log(data)
  console.groupEnd()
}
function logWarning(title, data) {
  console.groupCollapsed(`%c⚠️ WARNING: ${title}`, 'background: #fff8e1; color: #ff6f00; font-weight: bold; padding: 2px 6px; border-radius: 4px;')
  console.warn(data)
  console.groupEnd()
}
function logError(title, data) {
  console.groupCollapsed(`%c❌ ERROR: ${title}`, 'background: #ffebee; color: #c62828; font-weight: bold; padding: 2px 6px; border-radius: 4px;')
  console.error(data)
  console.groupEnd()
}

// Seleções
const selectPackage = (pkg) => {
  selectedPackage.value = pkg
  errorMessage.value = ''
  logInfo('Pacote selecionado', pkg)
}
const selectPaymentMethod = (id) => {
  selectedPaymentMethod.value = id
  errorMessage.value = ''
  logInfo('Método de pagamento selecionado', id)
}

// Ações finais
const goToHome = () => router.push('/')
const retryPayment = () => { errorMessage.value = ''; loading.value = false }
const contactSupport = () => window.location.href = 'tel:258841234567'

// Plano gratuito
const ativarPlanoGratuito = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token') || ''
    const payload = { pacote: 'free', method: 'gratuito', amount: 0, type: 'assinatura' }
    const API_URL = 'https://apirpa.onrender.com/api/pagamentos'
    const response = await axios.post(`${API_URL}/processar`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response.data?.sucesso) {
      showSuccess.value = true
      logSuccess('Plano gratuito ativado com sucesso', response.data)
    } else {
      errorMessage.value = response.data?.mensagem || 'Erro ao ativar plano gratuito.'
      logError('Falha ao ativar plano gratuito', response.data)
    }
  } catch (err) {
    errorMessage.value = 'Erro ao ativar plano gratuito.'
    logError('Erro ao ativar plano gratuito', err.response?.data || err)
  } finally {
    loading.value = false
    logInfo('Processamento finalizado', { loading: loading.value })
  }
}

// Navegação
const nextStep = async () => {
  errorMessage.value = ''
  if (!selectedPackage.value) {
    errorMessage.value = 'Por favor, selecione um pacote.'
    logWarning('Tentativa de avançar sem pacote selecionado', null)
    return
  }
  if (selectedPackage.value.price === 0) {
    await ativarPlanoGratuito()
    return
  }
  currentStep.value = 2
  logInfo('Avançando para passo 2 - escolha do pagamento', selectedPaymentMethod.value)
}
const previousStep = () => {
  currentStep.value = 1
  selectedPaymentMethod.value = null
  logInfo('Voltando para passo 1 - seleção de pacote', null)
}
const goBack = () => {
  if (currentStep.value === 2) {
    previousStep()
  } else {
    window.history.back()
    logInfo('Voltando na navegação do navegador', null)
  }
}

// Envio do pagamento
const handleSubmit = async () => {
  errorMessage.value = ''
  if (loading.value) {
    logWarning('Tentativa de enviar pedido enquanto já processando', null)
    return
  }
  if (!selectedPackage.value || !selectedPaymentMethod.value) {
    errorMessage.value = 'Selecione um pacote e método de pagamento.'
    logWarning('Envio falhou - pacote ou método não selecionado', {
      pacote: selectedPackage.value,
      metodo: selectedPaymentMethod.value
    })
    return
  }

  loading.value = true
  logInfo('Iniciando submissão do pedido', {
    pacote: selectedPackage.value.id,
    metodo: selectedPaymentMethod.value
  })

  // Validação M-Pesa / Emola
  if (['mpesa', 'emola'].includes(selectedPaymentMethod.value)) {
    const telefoneValido = normalizarTelefone(mobileDetails.phone)
    if (!telefoneValido) {
      errorMessage.value = 'Número inválido. Formato: 258XXXXXXXX'
      logError('Número de telefone inválido', mobileDetails.phone)
      loading.value = false
      return
    }
    mobileDetails.phone = telefoneValido
    logInfo('Telefone normalizado', mobileDetails.phone)
  }

  // Validação Cartão
  if (selectedPaymentMethod.value === 'card') {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
      errorMessage.value = 'Preencha todos os dados do cartão.'
      logError('Dados do cartão incompletos', cardDetails)
      loading.value = false
      return
    }
  }

  try {
    const token = localStorage.getItem('token') || ''
    const payload = {
      pacote: selectedPackage.value.id,
      method: selectedPaymentMethod.value,
      phone: mobileDetails.phone || null,
      amount: selectedPackage.value.price,
      type: 'assinatura',
      dadosCartao: selectedPaymentMethod.value === 'card' ? cardDetails : null
    }

    console.groupCollapsed('%c📦 Payload a ser enviado para a API', 'background: #f3e5f5; color: #6a1b9a; font-weight: bold; padding: 2px 6px; border-radius: 4px;')
    console.log(payload)
    console.groupEnd()

    const API_URL = 'https://apirpa.onrender.com/api/pagamentos'
    const paymentResponse = await axios.post(`${API_URL}/processar`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    })

    logInfo('Resposta da API recebida', paymentResponse.data)

    if (paymentResponse.data?.sucesso) {
      showSuccess.value = true
      logSuccess('Pagamento realizado com sucesso', paymentResponse.data)
    } else {
      errorMessage.value = paymentResponse.data?.mensagem || 'Erro desconhecido no pagamento.'
      logError('Falha no pagamento', paymentResponse.data)
    }
  } catch (err) {
    const serverMsg = err.response?.data?.mensagem
    errorMessage.value = serverMsg ? `Erro: ${serverMsg}` : 'Erro de conexão. Por favor, tente novamente.'
    logError('Erro de conexão com API', err.response?.data || err)
  } finally {
    loading.value = false
    logInfo('Processamento finalizado', { loading: loading.value })
  }
}
</script>

<style scoped>
@import 'bootstrap-icons/font/bootstrap-icons.css';
@import '@fontsource/poppins/500.css';
@import '@fontsource/poppins/600.css';
@import '@fontsource/poppins/700.css';

.payment-method-icon-img { width: 48px; height: auto; }
.payment-method-icon { font-size: 2.5rem; color: #ffffff; }
.title, .package-name, .summary-title, .section-title, .success-title { font-family: 'Poppins', sans-serif !important; }

* { box-sizing: border-box; }

.subscription-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #0a0a0a, #1a1a1a);
  color: #ffffff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  scroll-padding-bottom: 300px;
  padding-bottom: env(safe-area-inset-bottom);
}

.header { padding: 1.5rem 2rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
.back-button { display: inline-flex; align-items: center; gap: 0.5rem; background: transparent; border: none; color: #a0a0a0; cursor: pointer; font-size: 0.875rem; padding: 0.5rem 0; transition: color 0.2s; }
.back-button:hover { color: #ffffff; }

.title {
  font-size: 2rem; font-weight: 700; margin: 1rem 0 0 0;
  background: linear-gradient(to right, #ffffff, #a0a0a0);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

.content-wrapper {
  display: flex; gap: 2rem; padding: 2rem; max-width: 1400px; margin: 0 auto;
  padding-bottom: calc(140px + env(safe-area-inset-bottom));
}

.main-content { flex: 1; min-width: 0; }

.packages-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }

.package-card { position: relative; background: #1a1a1a; border: 2px solid transparent; border-radius: 1rem; padding: 2rem; cursor: pointer; transition: all 0.3s ease; }
.package-card:hover { border-color: #800080; transform: translateY(-4px); box-shadow: 0 8px 24px rgba(128, 0, 128, 0.2); }
.package-card.selected { border-color: #800080; background: linear-gradient(135deg, rgba(128, 0, 128, 0.1), rgba(128, 0, 128, 0.05)); }
.package-card.recommended { border-color: #14b8a6; }

.recommended-badge { position: absolute; top: -12px; right: 1rem; background: linear-gradient(135deg, #14b8a6, #0d9488); color: #ffffff; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }

.package-name { font-size: 1.5rem; font-weight: 700; margin: 0 0 1rem 0; color: #ffffff; }
.package-price { display: flex; align-items: baseline; gap: 0.25rem; margin-bottom: 1.5rem; }
.currency, .period { font-size: 1rem; color: #a0a0a0; }
.amount { font-size: 2.5rem; font-weight: 700; color: #ffffff; }

.benefits-list { list-style: none; padding: 0; margin: 0 0 2rem 0; }
.benefit-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; color: #d0d0d0; font-size: 0.875rem; }
.check-icon { color: #14b8a6; flex-shrink: 0; }

.select-button { width: 100%; padding: 0.875rem; background: #800080; color: #ffffff; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.select-button:hover { background: #9900cc; transform: scale(1.02); }
.select-button.selected { background: #14b8a6; }

.payment-methods { max-width: 600px; }
.section-title { font-size: 1.5rem; font-weight: 700; margin: 0 0 1.5rem 0; color: #ffffff; }
.payment-methods-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem; }

.payment-method-card { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 1.5rem; background: #1a1a1a; border: 2px solid transparent; border-radius: 0.75rem; cursor: pointer; transition: all 0.2s; }
.payment-method-card:hover { border-color: #800080; }
.payment-method-card.selected { border-color: #800080; background: rgba(128, 0, 128, 0.1); }

.payment-method-name { font-size: 0.875rem; font-weight: 600; color: #ffffff; }

.form { display: flex; flex-direction: column; gap: 1.5rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-label { font-size: 0.875rem; font-weight: 600; color: #d0d0d0; }

.form-input {
  padding: 0.875rem;
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #ffffff;
  font-size: 1.1rem;
  transition: all 0.2s;
  margin-bottom: 1rem;
}
.form-input:focus { outline: none; border-color: #800080; box-shadow: 0 0 0 3px rgba(128, 0, 128, 0.1); }

.form-hint { font-size: 0.875rem; color: #a0a0a0; margin: 0; }

.submit-button { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 1rem; background: #800080; color: #ffffff; border: none; border-radius: 0.5rem; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
.submit-button:hover:not(:disabled) { background: #9900cc; transform: scale(1.02); }
.submit-button:disabled { opacity: 0.6; cursor: not-allowed; }

.spinner { width: 16px; height: 16px; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: #ffffff; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.success-message { text-align: center; padding: 3rem; }
.success-icon { display: inline-flex; padding: 1.5rem; background: rgba(20, 184, 166, 0.1); border-radius: 50%; margin-bottom: 1.5rem; }
.success-icon svg { color: #14b8a6; }
.success-title { font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem 0; color: #ffffff; }
.success-text { font-size: 1.125rem; color: #a0a0a0; margin: 0 0 1.5rem 0; }

.home-button {
  padding: 0.875rem 2rem;
  background: #14b8a6;
  color: #ffffff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}
.home-button:hover { background: #0d9488; transform: scale(1.02); }

.error-message {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  color: #ef4444;
  margin-top: 1rem;
  font-size: 0.875rem;
}
.error-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}
.retry-button, .support-button {
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.retry-button { background: #800080; color: #ffffff; border: none; }
.retry-button:hover { background: #9900cc; }
.support-button { background: transparent; color: #ef4444; border: 1px solid #ef4444; }
.support-button:hover { background: rgba(239, 68, 68, 0.1); }

/* RESUMO DESKTOP */
.order-summary-desktop { 
  width: 350px; background: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.1); 
  border-radius: 1rem; padding: 2rem; height: fit-content; position: sticky; top: 2rem; flex-shrink: 0;
}
.summary-title { font-size: 1.25rem; font-weight: 700; margin: 0 0 1.5rem 0; color: #ffffff; }
.summary-section { margin-bottom: 1.5rem; }
.summary-label { font-size: 0.875rem; color: #a0a0a0; margin-bottom: 0.25rem; }
.summary-value { font-size: 1rem; font-weight: 600; color: #ffffff; }
.summary-divider { height: 1px; background: rgba(255, 255, 255, 0.1); margin: 1.5rem 0; }
.summary-total { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.total-label { font-size: 1rem; font-weight: 600; color: #d0d0d0; }
.total-amount { font-size: 1.5rem; font-weight: 700; color: #ffffff; }

.order-summary-mobile {
  position: fixed; bottom: 0; left: 0; right: 0; background: #1a1a1a;
  border-top: 1px solid rgba(255, 255, 255, 0.1); padding: 1rem;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom)); z-index: 1000;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3); transition: transform 0.3s ease;
}

.summary-content { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem; }
.summary-row { display: flex; justify-content: space-between; font-size: 0.875rem; }
.summary-row .summary-label { color: #a0a0a0; }
.summary-row .summary-value { color: #ffffff; font-weight: 600; }
.summary-total { display: flex; justify-content: space-between; font-weight: 600; font-size: 1.125rem; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.summary-actions { display: flex; gap: 0.5rem; }
.summary-actions button { flex: 1; padding: 0.875rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.875rem; }

.continue-button { background: #800080; color: #ffffff; border: none; }
.continue-button:hover { background: #9900cc; transform: scale(1.02); }
.back-step-button { background: transparent; color: #a0a0a0; border: 1px solid rgba(255, 255, 255, 0.1); }
.back-step-button:hover { color: #ffffff; border-color: rgba(255, 255, 255, 0.3); }

@media (max-width: 1024px) {
  .content-wrapper { flex-direction: column; padding: 1.5rem; padding-bottom: 300px; }
  .order-summary-desktop { display: none; }
}

@media (max-width: 640px) {
  .content-wrapper { padding: 1rem; padding-bottom: 320px; }
  .packages-grid, .payment-methods-grid, .form-row { grid-template-columns: 1fr; }
  .title { font-size: 1.5rem; }
  .package-card { padding: 1.5rem; }
  .form-input { font-size: 1.2rem; }
}
</style>