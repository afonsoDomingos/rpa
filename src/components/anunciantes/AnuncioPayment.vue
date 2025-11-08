<template>
  <div class="container">
    <main class="form-wrapper">
      <form @submit.prevent="handlePayment" class="grid">
        <!-- Pacote Escolhido -->
        <section class="section">
          <h2 class="section-title">
            <span class="num num-purple">1</span> Pacote
          </h2>
          <div class="package-info">
            <p class="package-name">{{ formData.name || 'Anúncio Sem Nome' }}</p>
            <p class="package-details">
              {{ weeks }} semana(s) × 500 MZN = 
              <strong class="amount">{{ props.weeks * 500 }} MZN</strong>
            </p>
          </div>
        </section>

        <!-- Método de Pagamento -->
        <section class="section">
          <h2 class="section-title">
            <span class="num num-green">2</span> Método
          </h2>
          <div class="payment-methods">
            <label class="method-label" :class="{ active: selectedMethod === 'mpesa' }">
              <input
                type="radio"
                v-model="selectedMethod"
                value="mpesa"
                class="hidden"
                aria-label="Pagar com M-Pesa"
              />
              <div class="method-card mpesa">
                <img :src="mpesaIcon" alt="M-Pesa" class="method-logo" />
                <span>M-Pesa</span>
              </div>
            </label>
            <label class="method-label" :class="{ active: selectedMethod === 'emola' }">
              <input
                type="radio"
                v-model="selectedMethod"
                value="emola"
                class="hidden"
                aria-label="Pagar com Emola"
              />
              <div class="method-card emola">
                <img :src="emolaIcon" alt="Emola" class="method-logo" />
                <span>Emola</span>
              </div>
            </label>
          </div>
        </section>

        <!-- Número de Telefone -->
        <section class="section">
          <h2 class="section-title">
            <span class="num num-blue">3</span> Telefone
          </h2>
          <div class="group">
            <label for="phone" class="sr-only">Número de telefone para pagamento</label>
            <div class="input-group">
              <span class="country-code">+258</span>
              <input
                v-model="phone"
                id="phone"
                type="tel"
                class="input"
                :placeholder="selectedMethod === 'mpesa' ? '84/85 XXXXXXX' : '86/87 XXXXXXX'"
                required
                @input="formatPhone"
              />
            </div>
            <p v-if="phoneError" class="error-text">{{ phoneError }}</p>
          </div>
        </section>

        <!-- Botão Pagar -->
        <button
          type="submit"
          class="btn"
          :disabled="loading || phoneError || !phone"
          aria-label="Iniciar pagamento"
        >
          <span v-if="!loading">Pagar {{ props.weeks * 500 }} MZN</span>
          <span v-else>Processando...</span>
          <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M13 7l5 5m0 0l-5 5m5-5H6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
          </svg>
        </button>

        <!-- Mensagens -->
        <div v-if="success" class="success-msg">
          <svg class="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
          </svg>
          <p>Pagamento iniciado! Aguarde a confirmação no seu telemóvel.</p>
        </div>
        <p v-if="error" class="error-text">{{ error }}</p>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import mpesaIcon from '@/assets/img/Mpesa.png'
import emolaIcon from '@/assets/img/Emola.png'

const props = defineProps({
  weeks: { type: Number, required: true, validator: (value) => value > 0 },
  amount: { type: Number, required: true, validator: (value) => value >= 0 },
  formData: {
    type: Object,
    required: true,
    validator: (formData) => {
      return (
        typeof formData.name === 'string' &&
        formData.name.trim() !== '' &&
        typeof formData.description === 'string' &&
        typeof formData.price === 'number' &&
        formData.price >= 0 &&
        typeof formData.ctaLink === 'string' &&
        formData.ctaLink.trim() !== '' &&
        (typeof formData.image === 'string' || formData.image instanceof File)
      )
    }
  }
})

const router = useRouter()
const selectedMethod = ref('mpesa')
const phone = ref('')
const phoneError = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')

onMounted(() => {
  console.log('Props recebidas em AnuncioPayment:', {
    weeks: props.weeks,
    amount: props.amount,
    formData: props.formData,
    imageDetails: props.formData.image instanceof File ? {
      name: props.formData.image.name,
      size: props.formData.image.size,
      type: props.formData.image.type
    } : props.formData.image
  })
  // Verificar consistência entre amount e weeks
  if (props.amount !== props.weeks * 500) {
    console.warn(`Inconsistência: amount (${props.amount}) não corresponde a weeks (${props.weeks}) * 500`);
  }
  const savedPhone = localStorage.getItem('paymentPhone')
  if (savedPhone) {
    phone.value = savedPhone.replace(/^258/, '') // Remover 258 se presente
    validatePhone()
  }
})

const formatPhone = () => {
  phone.value = phone.value.replace(/\D/g, '').slice(0, 9)
  validatePhone()
}

const validatePhone = () => {
  const num = phone.value
  phoneError.value = ''
  if (!num) return
  if (selectedMethod.value === 'mpesa' && !/^8[45]/.test(num)) {
    phoneError.value = 'M-Pesa: use 84 ou 85'
  } else if (selectedMethod.value === 'emola' && !/^8[67]/.test(num)) {
    phoneError.value = 'Emola: use 86 ou 87'
  } else if (num.length !== 9) {
    phoneError.value = 'Número deve ter 9 dígitos'
  }
}

const handlePayment = async () => {
  validatePhone()
  if (phoneError.value || !phone.value) {
    error.value = 'Corrija o número de telefone antes de prosseguir.'
    return
  }

  if (!props.formData.name || !props.formData.price || !props.formData.ctaLink) {
    error.value = 'Dados do anúncio incompletos: nome, preço ou link de contato ausentes.'
    return
  }

  loading.value = true
  error.value = ''
  success.value = false

  try {
    // Criar o anúncio
    const anuncioPayload = new FormData()
    anuncioPayload.append('name', props.formData.name.trim())
    anuncioPayload.append('description', props.formData.description || '')
    anuncioPayload.append('price', props.formData.price.toString())
    anuncioPayload.append('ctaLink', props.formData.ctaLink.trim())
    anuncioPayload.append('weeks', props.weeks.toString())
    anuncioPayload.append('amount', (props.weeks * 500).toString()) // Enviar amount no payload do anúncio
    if (props.formData.image instanceof File) {
      anuncioPayload.append('image', props.formData.image)
    } else if (typeof props.formData.image === 'string' && props.formData.image.trim()) {
      anuncioPayload.append('imageUrl', props.formData.image.trim())
    } else {
      error.value = 'Imagem do anúncio não fornecida.'
      return
    }

    console.log('Enviando POST /anuncios com payload:', {
      name: props.formData.name,
      description: props.formData.description,
      price: props.formData.price,
      ctaLink: props.formData.ctaLink,
      weeks: props.weeks,
      amount: props.weeks * 500,
      image: props.formData.image instanceof File ? props.formData.image.name : props.formData.image
    })

    const anuncioResponse = await api.post('/anuncios', anuncioPayload, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      timeout: 15000
    })

    console.log('Resposta de POST /anuncios:', anuncioResponse.data)

    if (!anuncioResponse.data.sucesso || !anuncioResponse.data.anuncioId) {
      throw new Error(anuncioResponse.data.mensagem || 'Falha ao criar anúncio.')
    }

    const anuncioId = anuncioResponse.data.anuncioId

    // Processar pagamento
    const pagamentoPayload = {
      amount: props.weeks * 500, // Dinâmico: weeks * 500
      dadosCartao: null,
      method: selectedMethod.value,
      pacote: 'anuncio',
      phone: `258${phone.value}`,
      type: 'anuncio',
      anuncioId
    }

    console.log('Enviando POST /pagamentos/processar com payload:', pagamentoPayload)

    const pagamentoResponse = await api.post('/pagamentos/processar', pagamentoPayload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      timeout: 15000
    })

    console.log('Resposta de POST /pagamentos/processar:', pagamentoResponse.data)

    if (pagamentoResponse.data.sucesso) {
      success.value = true
      localStorage.setItem('paymentPhone', `258${phone.value}`)
      localStorage.removeItem('anuncieState')
      localStorage.removeItem('anuncieForm')
      window.dispatchEvent(new Event('newAdCreated'))
      setTimeout(() => {
        router.push('/meus-anuncios')
      }, 3000)
    } else {
      throw new Error(pagamentoResponse.data.mensagem || 'Erro ao processar pagamento.')
    }
  } catch (err) {
    console.error('Erro no pagamento:', err.response?.data || err)
    error.value = err.response?.data?.mensagem || `Erro ao processar: ${err.message}`
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Estilos atualizados para suportar +258 */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Poppins', sans-serif; }

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

.amount {
  color: #10b981;
  font-weight: 700;
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

.arrow { width: 0.9rem; height: 0.9rem; transition: transform 0.3s; }
.btn:hover .arrow { transform: translateX(3px); }

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

.icon-check {
  width: 1.5rem;
  height: 1.5rem;
  stroke: #10b981;
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

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>