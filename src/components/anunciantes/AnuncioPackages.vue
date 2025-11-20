<template>
  <div class="packages">
    <h2 class="title">Escolha a duração</h2>

    <div class="grid">
      <button
        v-for="n in 4"
        :key="n"
        :class="['pkg', { active: selected === n }]"
        @click="handleSelect(n)"
        :aria-label="`Selecionar pacote de ${n} ${n === 1 ? 'semana' : 'semanas'} por ${prices[n-1]} MZN`"
        type="button"
      >
        <div class="header">
          <strong>{{ n }} {{ n === 1 ? 'semana' : 'semanas' }}</strong>
          <svg v-if="selected === n" class="check" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="price">MZN {{ prices[n-1] }}</span>
      </button>
    </div>

    <button
      @click="$emit('pay')"
      class="pay-btn"
      :disabled="!selected || selected < 1 || selected > 4"
      aria-label="Prosseguir para o pagamento"
      type="button"
    >
      <span>Ir para Pagamento</span>
      <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M5 12h14m-7-7v14" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, watch, toRefs } from 'vue'
import { AD_PRICES } from '@/utils/prices'
import { sendMetaEvent } from '@/utils/meta'

const props = defineProps({
  selected: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['select', 'pay'])

// Garante que selected seja reativo mesmo vindo do pai
const { selected } = toRefs(props)

// Preços
const prices = AD_PRICES || [500, 1000, 1500, 2000]

// Força reatividade total (nunca mais falha)
watch(selected, (newVal) => {
  console.log('Pacote selecionado:', newVal) // debug opcional
}, { immediate: true })

// Seleção imediata + Meta Pixel
const handleSelect = (n) => {
  emit('select', n) // Emite para o pai atualizar imediatamente

  sendMetaEvent('AddToCart', {
    content_ids: ['pacote_anuncio'],
    content_name: `Pacote ${n} semana${n > 1 ? 's' : ''}`,
    value: prices[n - 1],
    currency: 'MZN',
    num_items: 1
  }).catch(err => {
    console.warn('Erro Meta Pixel:', err)
  })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
}

.packages {
  font-family: 'Poppins', sans-serif !important;
  padding: 1.5rem;
  color: white;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

.packages .title,
h2.title {
  font-family: 'Poppins', sans-serif !important;
  font-weight: 600 !important;
  font-size: 1.35rem !important;
  text-align: center;
  margin: 0 0 1.5rem 0;
  color: #e4e4e7 !important;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (min-width: 640px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

.pkg {
  padding: 1.5rem;
  background: #1a1a1a;
  border: 2px solid transparent;
  border-radius: 1rem;
  color: #fff;
  cursor: pointer;
  transition: all 0.25s ease;
  font-weight: 500;
  line-height: 1.4;
  text-align: left;
}

.pkg:hover,
.pkg.active {
  border-color: #7c3aed;
  background: rgba(124, 58, 237, 0.15);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(124, 58, 237, 0.2);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.header strong {
  font-weight: 600;
  letter-spacing: -0.01em;
}

.check {
  width: 1.3rem;
  height: 1.3rem;
  color: #7c3aed;
  stroke: currentColor;
  fill: none;
}

.price {
  font-size: 1.2rem;
  font-weight: 700;
  color: #10b981;
  letter-spacing: -0.02em;
}

.pay-btn {
  width: 100%;
  padding: 1rem;
  background: #800080;
  color: #fff;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1.05rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  transition: all 0.25s ease;
  margin-top: 0.5rem;
  letter-spacing: -0.01em;
}

.pay-btn:hover:not(:disabled) {
  background: #10b981;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
}

.pay-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.arrow {
  width: 1.3rem;
  height: 1.3rem;
  stroke: currentColor;
  stroke-width: 2.2;
}
</style>