<template>
  <transition name="fade">
    <div v-if="showInstall" class="install-toast">
      <button @click="installPWA">
        Instalar App
        <span class="progress-bar" :style="{ width: progress + '%' }"></span>
      </button>
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

    // Contagem regressiva
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
  top: 70px; /* ajusta a distância abaixo da navbar */
  right: 20px;
  z-index: 9999;
}

.install-toast button {
  position: relative;
  background-color: #8000ff;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 14px;
  opacity: 0.5;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  overflow: hidden;
}

.install-toast button:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: #fff;
  border-radius: 0 0 10px 10px;
  transition: width 0.05s linear;
}

/* Fade animation */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
