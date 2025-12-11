<template>
  <div class="anuncie-page">
    <header class="header">
      <button @click="goBack" class="back-btn" aria-label="Voltar">
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Voltar
      </button>
    </header>

    <!-- PASSO 1: FORMULÁRIO -->
    <AnuncieForm v-if="step === 1" @created="onAnuncioCreated" />

    <!-- PASSO 2: PACOTES -->
    <AnuncioPackages
      v-if="step === 2"
      :selected="selectedWeeks"
      @select="onSelectWeeks"
      @pay="goToPayment"
    />

    <!-- PASSO 3: PAGAMENTO -->
    <AnuncioPayment
      v-if="step === 3 && anuncioId"
      :weeks="selectedWeeks"
      :formData="anuncioData"
      :anuncioId="anuncioId"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

// Componentes
import AnuncieForm from "@/components/anunciantes/AnuncieForm.vue";
import AnuncioPackages from "@/components/anunciantes/AnuncioPackages.vue";
import AnuncioPayment from "@/components/anunciantes/AnuncioPayment.vue";

// A NOVA E ÚNICA FUNÇÃO DE TRACKING
import { sendMetaEvent } from "@/utils/meta";

const router = useRouter();

const step = ref(1);
const selectedWeeks = ref(1);
const anuncioId = ref("");
const anuncioData = ref(null);

// Carrega estado salvo (se o usuário voltou)
onMounted(() => {
  const saved = localStorage.getItem("anuncieState");
  if (saved) {
    const data = JSON.parse(saved);
    step.value = data.step || 1;
    selectedWeeks.value = data.selectedWeeks || 1;
    anuncioId.value = data.anuncioId || "";
    anuncioData.value = data.anuncioData || null;
  }

  // VIEWCONTENT — entrou na página de criar anúncio (Pixel + CAPI)
  sendMetaEvent("ViewContent", {
    content_name: "Criar Anúncio",
    content_category: "anuncios",
    content_type: "product",
  });
});

// Quando o anúncio é criado → vai para escolha de pacote
const onAnuncioCreated = (data) => {
  anuncioId.value = data.anuncioId;
  anuncioData.value = data.formData;
  step.value = 2;
  saveState();
};

// Escolha de semanas
const onSelectWeeks = (weeks) => {
  selectedWeeks.value = weeks;
  saveState();
};

// Vai para pagamento
const goToPayment = () => {
  if (!anuncioId.value) {
    alert("Erro: Anúncio não foi criado.");
    return;
  }
  const weeks = Number(selectedWeeks.value);
  if (!weeks || weeks < 1 || weeks > 4 || !Number.isInteger(weeks)) {
    alert("Selecione uma duração válida: 1 a 4 semanas.");
    return;
  }
  step.value = 3;
  saveState();
};

// Voltar
const goBack = () => {
  if (step.value > 1) {
    step.value--;
    saveState();
  } else {
    router.go(-1);
  }
};

// Salva estado no localStorage (para não perder se recarregar)
const saveState = () => {
  localStorage.setItem(
    "anuncieState",
    JSON.stringify({
      step: step.value,
      selectedWeeks: selectedWeeks.value,
      anuncioId: anuncioId.value,
      anuncioData: anuncioData.value,
    })
  );
};
</script>

<style scoped>
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
  transition: all 0.2s;
}
.back-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}
.back-btn svg {
  transition: transform 0.2s;
}
.back-btn:hover svg {
  transform: translateX(-2px);
}
@media (min-width: 768px) {
  .header {
    padding: 2rem 3rem;
  }
}
</style>
