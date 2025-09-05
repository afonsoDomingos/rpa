<template>
  <div v-if="documentos.length > 0" 
       class="floating-box animate-fade-in shadow-sm rounded p-2">
    <h6 class="fw-bold text-purple small-title">
      📄 Documentos Encontrados 
      <span class="count">{{ displayCount }}</span>
    </h6>
    <p class="mb-1 small-text"><strong>Nome:</strong> {{ documentos[indexAtual].nome_completo }}</p>
    <p class="mb-1 small-text"><strong>Tipo:</strong> {{ documentos[indexAtual].tipo_documento }}</p>
    <p class="mb-0 small-text"><strong>Província:</strong> {{ documentos[indexAtual].provincia }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import api from "../api";

const documentos = ref([]);
const indexAtual = ref(0);
let intervalo = null;

// efeito de contagem
const displayCount = ref(0);
let countInterval = null;

const buscarDocumentos = async () => {
  try {
    const response = await api.get("/documentos");
    documentos.value = response.data;
  } catch (error) {
    console.error("Erro ao carregar documentos:", error);
  }
};

const startCounting = () => {
  if (countInterval) clearInterval(countInterval);
  displayCount.value = 0;

  countInterval = setInterval(() => {
    if (documentos.value.length > 0) {
      if (displayCount.value < documentos.value.length) {
        displayCount.value++;
      } else {
        displayCount.value = 0; // reinicia a contagem (efeito infinito)
      }
    }
  }, 400); // velocidade da contagem
};

onMounted(async () => {
  await buscarDocumentos();
  startCounting();

  // Rotação automática a cada 5s
  intervalo = setInterval(() => {
    if (documentos.value.length > 0) {
      indexAtual.value = (indexAtual.value + 1) % documentos.value.length;
    }
  }, 5000);
});

onUnmounted(() => {
  if (intervalo) clearInterval(intervalo);
  if (countInterval) clearInterval(countInterval);
});
</script>

<style scoped>
.text-purple {
  color: #6f42c1;
}

.floating-box {
  position: fixed;
  top: 15px;  
  left: 15px; 
  width: 220px;
  background: rgba(255, 255, 255, 0.75); 
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 9999;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.floating-box:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.small-title {
  font-size: 13px;
  margin-bottom: 4px;
}

.small-text {
  font-size: 11px;
  line-height: 1.3;
}

.count {
  margin-left: 4px;
  font-weight: bold;
  color: #ff7a00;
  animation: pulse 1s infinite;
}

/* animação do número */
@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

/* efeito fade-in ao aparecer */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-in-out;
}
</style>
