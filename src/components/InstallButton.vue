<template>
  <transition name="fade-scale">
    <div v-if="showInstall" class="install-toast">
      <div class="toast-content">
        <p>🚀 Instale o app e tenha acesso rápido!</p>
        <button @click="installPWA">Instalar</button>
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showInstall = ref(false)
const progress = ref(100)
let deferredPrompt
let timer

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    showInstall.value = true
    progress.value = 100

    // Anima contagem regressiva
    const duration = 6000 // 6 segundos
    const interval = 50
    let elapsed = 0

    timer = setInterval(() => {
      elapsed += interval
      progress.value = 100 - (elapsed / duration) * 100
      if (elapsed >= duration) {
        clearInterval(timer)
        showInstall.value = false
      }
    }, interval)
  })
})

function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null
    })
  }
  clearInterval(timer)
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
  width: 320px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 28px rgba(0,0,0,0.3);
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.toast-content {
  padding: 20px;
  text-align: center;
  color: #333;
  position: relative;
}

.toast-content p {
  font-size: 16px;
  margin-bottom: 16px;
  font-weight: 500;
}

.toast-content button {
  background-color: #8000ff;
  color: #fff;
  border: none;
  padding: 10px 28px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  opacity: 0.9;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.toast-content button:hover {
  transform: scale(1.05);
  opacity: 1;
  box-shadow: 0 6px 16px rgba(0,0,0,0.3);
}

/* Barra de contagem regressiva */
.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  background: #8000ff;
  border-radius: 0 0 12px 12px;
  transition: width 0.05s linear;
}

/* Animação do toast */
.fade-scale-enter-active {
  animation: fadeInScale 0.4s ease forwards;
}
.fade-scale-leave-active {
  animation: fadeOutScale 0.3s ease forwards;
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
