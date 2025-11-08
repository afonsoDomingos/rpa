<template>
  <div class="anuncie-page">
    <header class="header">
      <button @click="goBack" class="back-btn" aria-label="Voltar para a página anterior">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Voltar
      </button>
    </header>

    <AnuncieForm v-if="step === 1" @next="onFormSubmit" />
    <AnuncioPackages
      v-if="step === 2"
      :selected="selectedWeeks"
      @select="onSelectWeeks"
      @pay="goToPayment"
    />
    <AnuncioPayment
      v-if="step === 3"
      :weeks="selectedWeeks"
      :amount="getPrice(selectedWeeks)"
      :formData="formData"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPrice } from '@/utils/prices'
import { AnuncieForm, AnuncioPackages, AnuncioPayment } from '@/components/anunciantes'

const router = useRouter()
const step = ref(1)
const selectedWeeks = ref(null)
const formData = ref(null)

onMounted(() => {
  const savedState = localStorage.getItem('anuncieState')
  if (savedState) {
    const { step: savedStep, formData: savedFormData, selectedWeeks: savedWeeks } = JSON.parse(savedState)
    step.value = savedStep || 1
    formData.value = savedFormData || null
    selectedWeeks.value = savedWeeks || null
  }
})

const onFormSubmit = (data) => {
  formData.value = data
  step.value = 2
  saveState()
}

const onSelectWeeks = (weeks) => {
  selectedWeeks.value = weeks
  saveState()
}

const goToPayment = () => {
  if (!selectedWeeks.value || selectedWeeks.value < 1 || selectedWeeks.value > 4) {
    alert('Selecione um pacote válido (1 a 4 semanas).')
    return
  }
  if (!formData.value) {
    alert('Preencha o formulário primeiro.')
    step.value = 1
    return
  }
  step.value = 3
  saveState()
}

const goBack = () => {
  if (step.value > 1) {
    step.value--
    saveState()
  } else {
    router.go(-1)
  }
}

const saveState = () => {
  localStorage.setItem('anuncieState', JSON.stringify({
    step: step.value,
    formData: formData.value,
    selectedWeeks: selectedWeeks.value
  }))
}

onUnmounted(() => {
  // Opcional: limpar estado ao sair
  // localStorage.removeItem('anuncieState')
})
</script>

<style scoped>
/* Estilos originais mantidos */
.anuncie-page {
  width: 100%;
  min-height: 100vh;
  background: #0a0a0a;
}

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

@media (min-width: 768px) { .header { padding: 2rem 3rem; } }
@media (min-width: 1024px) { .header { padding: 2rem 4rem; } }
@media (min-width: 1536px) { .header { padding: 2rem 6rem; } }
</style>