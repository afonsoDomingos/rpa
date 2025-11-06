<template>
  <transition name="fade">
    <div v-if="showInstall" class="install-toast">
      <div class="toast-content">
        <p>Instale o app no seu dispositivo!</p>
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

    // Desaparece automaticamente após 8 segundos
    setTimeout(() => {
      showInstall.value = false
    }, 8000)
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
/* Container centralizado com efeito de pop */
.install-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  max-width: 90%;
  width: 320px;
  background: linear-gradient(135deg, #8000ff, #b347ff);
  border-radius: 16px;
  box-shadow: 0 12px 28px rgba(0,0,0,0.4);
  overflow: hidden;
  animation: pop 0.5s ease-out;
}

/* Conteúdo do toast */
.toast-content {
  padding: 20px;
  text-align: center;
  color: #fff;
  font-family: 'Segoe UI', sans-serif;
}

.toast-content p {
  font-size: 16px;
  margin-bottom: 14px;
  font-weight: 500;
}

/* Botão moderno */
.toast-content button {
  background-color: #fff;
  color: #8000ff;
  border: none;
  padding: 10px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.toast-content button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0,0,0,0.3);
}

/* Efeitos de entrada e saída */
@keyframes pop {
  0% { transform: translate(-50%, -60%) scale(0.8); opacity: 0; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
