<template>
  <transition name="fade-scale">
    <div v-if="showInstall" class="install-toast">
      <div class="toast-content">
        <p>🚀 Instale o app e tenha acesso rápido!</p>
        <button @click="installPWA">Instalar</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showInstall = ref(false)
let deferredPrompt

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    showInstall.value = true

    // Desaparece automaticamente após 6 segundos
    setTimeout(() => {
      showInstall.value = false
    }, 6000)
  })
})

function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null
    })
  }
  showInstall.value = false
}
</script>

<style>
.install-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  width: 300px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.toast-content {
  padding: 20px;
  text-align: center;
  color: #333;
}

.toast-content p {
  font-size: 16px;
  margin-bottom: 16px;
  font-weight: 500;
}

/* Botão moderno com opacidade */
.toast-content button {
  background-color: #8000ff;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  opacity: 0.85;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.toast-content button:hover {
  transform: scale(1.05);
  opacity: 1;
  box-shadow: 0 6px 16px rgba(0,0,0,0.3);
}

/* Animação de entrada e saída do toast */
.fade-scale-enter-active {
  animation: fadeInScale 0.5s ease forwards;
}
.fade-scale-leave-active {
  animation: fadeOutScale 0.4s ease forwards;
}

@keyframes fadeInScale {
  0% { opacity: 0; transform: translate(-50%, -60%) scale(0.8); }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

@keyframes fadeOutScale {
  0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -60%) scale(0.8); }
}
</style>
