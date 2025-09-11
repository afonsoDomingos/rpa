<template>
  <div>
    <!-- Botão reaparecer discreto -->
    <button v-if="!visivel" @click="visivel = true" class="reaparecer-btn">
      📄
    </button>

    <!-- Componente flutuante -->
    <div
      v-if="documentos.length > 0 && visivel"
      class="floating-box animate-fade-in shadow-sm rounded p-1"
    >
      <!-- Botão de esconder dentro do box -->
      <button @click="fecharBox" class="hide-btn">✖</button>

      <h6 class="fw-bold text-purple small-title">
        📄Encontrados
        <span class="count">{{ displayCount }}</span>
      </h6>
      <!-- Nome anonimizado -->
      <p class="mb-1 tiny-text">
        <strong>Nome:</strong>
        {{ anonimizarNome(documentos[indexAtual].nome_completo) }}
      </p>
      <p class="mb-1 tiny-text">
        <strong>Tipo:</strong> {{ documentos[indexAtual].tipo_documento }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import api from "../api";

const documentos = ref([]);
const indexAtual = ref(0);
const displayCount = ref(0);
const visivel = ref(true); // controla visibilidade
let intervalo = null;
let countInterval = null;
let timerReaparecer = null; // timer para reaparecer automático

// Função para anonimizar nome
const anonimizarNome = (nomeCompleto) => {
  if (!nomeCompleto) return "";

  const partes = nomeCompleto.trim().split(" ");

  if (partes.length === 1) {
    // Se só houver um nome
    return partes[0].charAt(0) + ".";
  }

  if (partes.length === 2) {
    // Se tiver dois nomes
    return `${partes[0]} ${partes[1].charAt(0)}.`;
  }

  // Caso comum: três ou mais nomes
  return `${partes[0]} ${partes[1].charAt(0)}. ${partes[partes.length - 1]}`;
};

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
      displayCount.value =
        (displayCount.value + 1) % (documentos.value.length + 1);
    }
  }, 400);
};

// função para fechar box e iniciar timer de reaparecer
const fecharBox = () => {
  visivel.value = false;
  if (timerReaparecer) clearTimeout(timerReaparecer);

  // reaparecer automaticamente após 1 minuto (60000 ms)
  timerReaparecer = setTimeout(() => {
    visivel.value = true;
  }, 60000);
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
  if (timerReaparecer) clearTimeout(timerReaparecer);
});
</script>

<style scoped>
.text-purple {
  color: #6f42c1;
}

.floating-box {
  position: fixed;
  top: 400px;
  left: 25px;
  width: 180px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 9999;
  padding: 6px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.floating-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.small-title {
  font-size: 12px;
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

/* Botão dentro do box para esconder */
.hide-btn {
  position: absolute;
  top: 2px;
  right: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  color: #999;
}
.hide-btn:hover {
  color: #ff0000;
}

/* Botão reaparecer discreto e transparente */
.reaparecer-btn {
  position: fixed;
  top: 400px;
  left: 25px;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #6f42c1;
  width: 24px;
  height: 24px;
  padding: 0;
  font-size: 14px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.reaparecer-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}
</style>
