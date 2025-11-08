<!-- src/components/anunciantes/AnuncioPackages.vue -->
<template>
  <div class="packages">
    <h2>Escolha a duração</h2>
    <div class="grid">
      <button v-for="n in 4" :key="n" :class="['pkg', { active: selected === n }]" @click="$emit('select', n)">
        <strong>{{ n }} {{ n === 1 ? 'semana' : 'semanas' }}</strong>
        <span>MZN {{ prices[n-1] }}</span>
      </button>
    </div>
    <button @click="$emit('pay')" class="pay-btn" :disabled="!selected">Pagar Agora</button>
  </div>
</template>

<script setup>
defineProps({ selected: Number })
defineEmits(['select', 'pay'])
const prices = [500, 900, 1200, 1500]
</script>

<style scoped>
.packages h2 { font-size: 1.5rem; margin-bottom: 1.5rem; color: #fff; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 2rem; }
.pkg { padding: 1.5rem; background: #1a1a1a; border: 2px solid transparent; border-radius: 1rem; color: #fff; cursor: pointer; }
.pkg.active, .pkg:hover { border-color: #800080; background: rgba(128,0,128,0.1); }
.pay-btn { width: 100%; padding: 1rem; background: #800080; color: #fff; border: none; border-radius: 0.5rem; font-weight: 600; }
.pay-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>