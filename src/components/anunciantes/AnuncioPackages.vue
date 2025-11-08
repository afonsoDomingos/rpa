<template>
  <div class="packages">
    <h2 class="title">Escolha a duração</h2>

    <div class="grid">
      <button
        v-for="n in 4"
        :key="n"
        :class="['pkg', { active: selected === n }]"
        @click="$emit('select', n)"
        :aria-label="`Selecionar pacote de ${n} ${n === 1 ? 'semana' : 'semanas'} por ${prices[n-1]} MZN`"
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
      :disabled="!selected"
      aria-label="Prosseguir para o pagamento"
    >
      Ir para Pagamento
    </button>
  </div>
</template>

<script setup>
import { AD_PRICES } from '@/utils/prices'
defineProps({ selected: Number })
defineEmits(['select', 'pay'])

const prices = AD_PRICES || [500, 1000, 1500, 2000]
</script>

<style scoped>
/* Estilos originais mantidos */
.packages {
  padding: 1.5rem;
  color: white;
}

.title {
  font-size: 1.35rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 1.5rem;
  color: #e4e4e7;
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
  transition: all 0.2s ease;
}

.pkg.active,
.pkg:hover {
  border-color: #7c3aed;
  background: rgba(124, 58, 237, 0.1);
  transform: translateY(-2px);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.check {
  width: 1.2rem;
  height: 1.2rem;
  color: #7c3aed;
}

.price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #10b981;
}

.pay-btn {
  width: 100%;
  padding: 1rem;
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.pay-btn:hover:not(:disabled) {
  background: #6d28d9;
}

.pay-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>