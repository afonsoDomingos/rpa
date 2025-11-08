<!-- src/components/anunciantes/AnunciePage.vue -->
<template>
  <div class="anuncie-page">
    <header class="header">
      <button @click="$router.go(-1)" class="back-btn">Voltar</button>
      <h1>Criar Anúncio</h1>
    </header>

    <AnuncieForm @next="onFormSubmit" v-if="!showPackages" />
    <AnuncioPackages v-if="showPackages" :selected="selectedWeeks" @select="selectedWeeks = $event" @pay="goToPayment" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AnuncieForm, AnuncioPackages } from '@/components/anunciantes'  // OK

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
.anuncie-page { max-width: 600px; margin: 2rem auto; padding: 0 1rem; }
.header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
.back-btn { background: none; border: none; color: #a0a0a0; cursor: pointer; }
h1 { font-size: 1.8rem; font-weight: 700; color: #fff; }
</style>