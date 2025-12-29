<template>
  <transition name="fade">
    <div v-if="!online" class="offline-overlay d-flex flex-column align-items-center justify-content-center text-center">
      <div class="content p-5 rounded-4 shadow-lg bg-white position-relative overflow-hidden">
        <!-- Efeito de fundo -->
        <div class="bg-blur"></div>

        <div class="z-index-2 position-relative">
          <!-- Logo Olho Animado -->
          <div class="mb-2 d-flex justify-content-center">
             <OlhoDeDeus style="transform: scale(2);" />
          </div>

          <div class="icon-container mb-4">
            <i class="bi bi-wifi-off text-gradient display-1"></i>
          </div>
          
          <h2 class="fw-black mb-3 text-dark">Sem Conexão</h2>
          <p class="text-muted mb-4 lead">
            Parece que perdeu a conexão com a internet.<br>
            Verifique sua rede Wi-Fi ou cabos.
          </p>

          <button @click="verificarConexao" class="btn bg-gradient-dark text-white btn-lg px-5 shadow-sm">
            <span v-if="verificando" class="spinner-border spinner-border-sm me-2"></span>
            {{ verificando ? 'Verificando...' : 'Tentar Novamente' }}
          </button>
        </div>
      </div>
      
      <div class="mt-4 text-white opacity-75 small fw-bold text-shadow">
        Tentando reconectar automaticamente...
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import OlhoDeDeus from "@/examples/navbars/olhodedeus.vue";
import Swal from "sweetalert2";

const online = ref(navigator.onLine);
const verificando = ref(false);

const updateOnlineStatus = () => {
  const isNowOnline = navigator.onLine;
  
  // Se estava offline e agora está online, avisa o usuário
  if (isNowOnline && online.value === false) {
    Swal.fire({
      icon: 'success',
      title: 'Conexão Restaurada',
      text: 'Você está online novamente.',
      toast: true,
      position: 'top-end',
      timer: 4000,
      showConfirmButton: false,
      timerProgressBar: true
    });
  }
  
  online.value = isNowOnline;
  online.value = isNowOnline;
};

// Monitoramento de Conexão Lenta
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
const jaAvisouLentidao = ref(false);

const verificarVelocidade = () => {
  if (connection && online.value) {
    const { downlink, rtt } = connection;
    // Critério: Menos de 1Mbps ou Ping > 2000ms
    const isSlow = (downlink && downlink < 1) || (rtt && rtt > 2000);

    if (isSlow && !jaAvisouLentidao.value) {
      Swal.fire({
        icon: 'warning',
        title: 'Conexão Instável',
        text: 'Sua internet parece estar lenta.',
        toast: true,
        position: 'bottom-end', // Canto inferior para não sobrepor o menu
        timer: 6000,
        showConfirmButton: false,
        timerProgressBar: true,
        background: '#fff3cd',
        color: '#856404'
      });
      jaAvisouLentidao.value = true;
    } else if (!isSlow) {
      jaAvisouLentidao.value = false; // Reset se melhorar
    }
  }
};

const verificarConexao = () => {
  verificando.value = true;
  // Simula verificação ou força check
  setTimeout(() => {
    online.value = navigator.onLine;
    verificarVelocidade(); // Checa velocidade ao tentar reconectar
    verificando.value = false;
  }, 1000);
};

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  if (connection) {
    connection.addEventListener('change', verificarVelocidade);
    verificarVelocidade(); // Checagem inicial
  }
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
  
  if (connection) {
    connection.removeEventListener('change', verificarVelocidade);
  }
});
</script>

<style scoped>
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css");

.offline-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999; /* Fica acima de tudo, inclusive navbar e modais */
  background: rgba(40, 40, 40, 0.95); /* Fundo escuro */
  backdrop-filter: blur(8px);
  font-family: 'Poppins', sans-serif;
}

.content {
  max-width: 500px;
  width: 90%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.text-gradient {
  background: linear-gradient(135deg, #ff6a88 0%, #800080 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.fw-black {
  font-weight: 900;
}

.btn:active {
  transform: scale(0.98);
}

.text-shadow {
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

/* Animação Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
