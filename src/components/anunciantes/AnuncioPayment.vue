<template>
  <div class="container">
    <main class="form-wrapper">
      <form @submit.prevent="handlePayment" class="grid">
        <!-- PACOTE -->
        <section class="section">
          <h2 class="section-title">
            <span class="num num-purple">1</span> Pacote
          </h2>
          <div class="package-info">
            <p class="package-name">{{ formData.name || 'Anúncio' }}</p>
            <p class="package-details">{{ totalPrice }} MZN</p>
          </div>
        </section>

        <!-- MÉTODO -->
        <section class="section">
          <h2 class="section-title">
            <span class="num num-green">2</span> Método
          </h2>
          <div class="payment-methods">
            <label class="method-label" :class="{ active: selectedMethod === 'mpesa' }">
              <input type="radio" v-model="selectedMethod" value="mpesa" class="hidden" />
              <div class="method-card mpesa">
                <img :src="mpesaIcon" alt="M-Pesa" class="method-logo" />
                <span>M-Pesa</span>
              </div>
            </label>
            <label class="method-label" :class="{ active: selectedMethod === 'emola' }">
              <input type="radio" v-model="selectedMethod" value="emola" class="hidden" />
              <div class="method-card emola">
                <img :src="emolaIcon" alt="Emola" class="method-logo" />
                <span>Emola</span>
              </div>
            </label>
          </div>
        </section>

        <!-- TELEFONE -->
        <section class="section">
          <h2 class="section-title">
            <span class="num num-blue">3</span> Telefone
          </h2>
          <div class="group">
            <div class="input-group" :class="{ 'error-border': phoneError }">
              <span class="country-code">+258</span>
              <input
                v-model="phone"
                @input="formatPhone"
                @blur="validatePhone"
                type="tel"
                class="input"
                :placeholder="placeholder"
                required
              />
            </div>
            <p v-if="phoneError" class="error-text">{{ phoneError }}</p>
          </div>
        </section>

        <!-- BOTÃO -->
        <button type="submit" class="btn" :disabled="loading || !isPhoneValid || !props.anuncioId">
          <span v-if="!loading">Pagar {{ totalPrice }} MZN</span>
          <span v-else>Processando...</span>
        </button>

        <!-- MENSAGENS -->
        <div v-if="successMessage" class="success-msg">
          <p>{{ successMessage }}</p>
        </div>
        <p v-if="errorMessage" class="error-text global-error">{{ errorMessage }}</p>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import mpesaIcon from '@/assets/img/Mpesa.png'
import emolaIcon from '@/assets/img/Emola.png'

const props = defineProps({
  weeks: { type: Number, required: true },
  formData: { type: Object, required: true },
  anuncioId: { type: String, required: true }
})

const router = useRouter()

// PREÇOS FIXOS (sem utils)
const PRICES = [500, 1000, 1500, 2000]

const totalPrice = computed(() => {
  const index = props.weeks - 1
  return (index >= 0 && index < PRICES.length) ? PRICES[index] : 500
})

// Estado
const selectedMethod = ref('mpesa')
const phone = ref('')
const phoneError = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const isPhoneValid = ref(false)

// Placeholder dinâmico
const placeholder = computed(() =>
  selectedMethod.value === 'mpesa' ? '84/85 XXXXXXX' : '86/87 XXXXXXX'
)

// Carregar telefone salvo + debug
onMounted(() => {
  const saved = localStorage.getItem('paymentPhone')
  if (saved) {
    phone.value = saved.replace(/^258/, '')
    validatePhone()
  }
  console.log('AnuncioPayment carregado:', {
    weeks: props.weeks,
    amount: totalPrice.value,
    anuncioId: props.anuncioId
  })
})

// Formatação do telefone
const formatPhone = () => {
  phone.value = phone.value.replace(/\D/g, '').slice(0, 9)
}

// Validação do telefone
const validatePhone = () => {
  const num = phone.value.trim()
  phoneError.value = ''
  isPhoneValid.value = false

  if (!num) return
  if (num.length !== 9) {
    phoneError.value = '9 dígitos obrigatórios'
    return
  }
  if (selectedMethod.value === 'mpesa' && !/^8[45]\d{7}$/.test(num)) {
    phoneError.value = 'M-Pesa: use 84 ou 85'
    return
  }
  if (selectedMethod.value === 'emola' && !/^8[67]\d{7}$/.test(num)) {
    phoneError.value = 'Emola: use 86 ou 87'
    return
  }
  isPhoneValid.value = true
}

// Revalidar ao mudar método
watch(selectedMethod, validatePhone)

// Processar pagamento
const handlePayment = async () => {
  validatePhone()
  if (!isPhoneValid.value) {
    errorMessage.value = 'Corrija o número de telefone.'
    return
  }
  if (!props.anuncioId) {
    errorMessage.value = 'Erro: Anúncio não foi criado.'
    return
  }

  const payload = {
    amount: Number(totalPrice.value),     // GARANTE NÚMERO
    method: selectedMethod.value,
    phone: `258${phone.value}`,
    type: 'anuncio',
    pacote: 'anuncio',
    anuncioId: props.anuncioId,
    dadosCartao: null
  }

  // Plano gratuito (se aplicável)
  if (payload.amount === 0) {
    payload.method = 'gratuito'
    payload.pacote = 'free'
  }

  console.log('ENVIANDO PAGAMENTO:', payload)

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const res = await api.post('/pagamentos/processar', payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })

    console.log('RESPOSTA DO PAGAMENTO:', res.data)

    if (res.data.sucesso) {
      successMessage.value = 'Pagamento iniciado! Aguarde confirmação no seu telemóvel.'
      localStorage.setItem('paymentPhone', `258${phone.value}`)
      localStorage.removeItem('anuncieState')
      setTimeout(() => router.push('/meus-anuncios'), 30000)
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.mensagem || 'Erro ao processar pagamento.'
    console.error('ERRO NO PAGAMENTO:', err.response?.data || err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Poppins', sans-serif; }

.input-group.error-border {
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.global-error {
  grid-column: 1 / -1;
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1.5px solid #ef4444;
  border-radius: 0.6rem;
  text-align: center;
}

.container {
  height: 100vh;
  width: 100vw;
  background: #0a0a0a;
  color: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.form-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  max-width: 900px;
  margin: 0 auto;
}

.section {
  background: rgba(30, 30, 30, 0.9);
  padding: 0.75rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(255,255,255,0.08);
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
}

.num {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.3rem;
  font-size: 0.65rem;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.num-purple { background: #7c3aed; }
.num-green { background: #10b981; }
.num-blue { background: #3b82f6; }

.package-info {
  padding: 0.75rem;
  background: rgba(124,58,237,0.1);
  border-radius: 0.5rem;
  border: 1.5px dashed rgba(124,58,237,0.35);
}

.package-name {
  font-weight: 600;
  color: #c4b5fd;
}

.package-details {
  margin-top: 0.3rem;
  font-size: 0.9rem;
}

.payment-methods {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.method-label {
  cursor: pointer;
  transition: all 0.3s;
}

.method-label.active {
  transform: scale(1.03);
}

.method-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 0.6rem;
  background: rgba(255,255,255,0.05);
  border: 1.5px solid rgba(255,255,255,0.1);
  transition: all 0.3s;
}

.method-card.mpesa { border-color: #10b981; }
.method-card.emola { border-color: #f59e0b; }

.method-label.active .method-card.mpesa { background: rgba(16,185,129,0.15); }
.method-label.active .method-card.emola { background: rgba(251,146,60,0.15); }

.method-logo {
  width: 2.5rem;
  height: 2.5rem;
  object-fit: contain;
}

.group { margin-bottom: 0.5rem; }

.input-group {
  display: flex;
  align-items: center;
  background: rgba(0,0,0,0.6);
  border: 1.25px solid rgba(255,255,255,0.12);
  border-radius: 0.4rem;
  overflow: hidden;
}

.country-code {
  padding: 0.5rem 0.75rem;
  color: #777;
  font-size: 0.85rem;
  border-right: 1px solid rgba(255,255,255,0.12);
}

.input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.5rem;
  color: white;
  font-size: 0.85rem;
  outline: none;
}

.input::placeholder { color: #777; }
.input:focus { box-shadow: none; }

.input-group:focus-within {
  border-color: #7c3aed;
  box-shadow: 0 0 0 2px rgba(124,58,237,0.1);
}

.hidden { display: none; }

.btn {
  grid-column: 1 / -1;
  margin-top: 0.5rem;
  width: 100%;
  padding: 0.65rem;
  background: linear-gradient(135deg, #7c3aed 0%, #10b981 100%);
  color: white;
  border: none;
  border-radius: 0.4rem;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  transition: all 0.3s ease;
}

.btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #10b981 0%, #7c3aed 100%);
  transform: scale(1.02);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-msg {
  grid-column: 1 / -1;
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(16,185,129,0.15);
  border: 1.5px solid #10b981;
  border-radius: 0.6rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #10b981;
  font-weight: 500;
}

.error-text {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  font-weight: 500;
}

@media (min-width: 768px) {
  .grid { grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
  .section { grid-column: span 1; }
  .btn, .success-msg { grid-column: 1 / -1; }
}
</style>