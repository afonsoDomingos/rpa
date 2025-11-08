<!-- src/components/anunciantes/AnunciePage.vue -->
<template>
  <div class="anuncie-page">
    <header class="header">
      <button @click="$router.go(-1)" class="back-btn">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Voltar
      </button>
     
    </header>

    <AnuncieForm @next="onFormSubmit" v-if="!showPackages" />
    <br/>
    <AnuncioPackages v-if="showPackages" :selected="selectedWeeks" @select="selectedWeeks = $event" @pay="goToPayment" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AnuncieForm, AnuncioPackages } from '@/components/anunciantes'

const router = useRouter()
const showPackages = ref(false)
const selectedWeeks = ref(null)
let formData = null

const onFormSubmit = (data) => {
  formData = data
  showPackages.value = true
}

const goToPayment = () => {
  const prices = [500, 900, 1200, 1500]
  router.push({
    path: '/pagamento-anuncio',
    query: {
      weeks: selectedWeeks.value,
      amount: prices[selectedWeeks.value - 1],
      ...formData
    }
  })
}
</script>

<style scoped>
/* === CONTAINER PRINCIPAL - SEM MAX-WIDTH === */
.anuncie-page {
  width: 100%;
  min-height: 100vh;
  background: #0a0a0a;
}

/* === HEADER === */
.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1rem;
  background: rgba(26, 26, 26, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #a0a0a0;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.back-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
}

.back-btn svg {
  transition: transform 0.2s ease;
}

.back-btn:hover svg {
  transform: translateX(-2px);
}

h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

/* === RESPONSIVO === */
@media (min-width: 768px) {
  .header {
    padding: 2rem 3rem;
  }

  h1 {
    font-size: 1.8rem;
  }
}

@media (min-width: 1024px) {
  .header {
    padding: 2rem 4rem;
  }

  h1 {
    font-size: 2rem;
  }
}

@media (min-width: 1536px) {
  .header {
    padding: 2rem 6rem;
  }
}
</style>