<template>
  <div v-if="documentos.length > 0" 
       class="floating-box animate-fade-in shadow-sm rounded p-1">
    <h6 class="fw-bold text-purple small-title">
      📄Encontrados 
      <span class="count">{{ displayCount }}</span>
    </h6>
    <p class="mb-1 tiny-text"><strong>Nome:</strong> {{ documentos[indexAtual].nome_completo }}</p>
    <p class="mb-1 tiny-text"><strong>Tipo:</strong> {{ documentos[indexAtual].tipo_documento }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import api from "../api";

const documentos = ref([]);
const indexAtual = ref(0);
let intervalo = null;
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
      displayCount.value = (displayCount.value + 1) % (documentos.value.length + 1);
    }
  }, 400);
};

onMounted(async () => {
  await buscarDocumentos();
  startCounting();

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
  width: 180px; /* menor largura */
  background: rgba(255, 255, 255, 0.75); 
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 9999;
  padding: 6px; /* menos padding */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.floating-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.small-title {
  font-size: 12px; /* menor */
  margin-bottom: 2px;
}

.tiny-text {
  font-size: 10px;
  line-height: 1.2;
  margin: 0;
}

.count {
  margin-left: 3px;
  font-weight: bold;
  color: #ff7a00;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}
</style>
