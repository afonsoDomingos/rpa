<template>
  <transition name="slide-fade">
    <div v-if="showInstall" class="install-toast">
      <div class="toast-card">
        <p>🚀 Instale nosso app para acesso rápido!</p>
        <div class="actions">
          <button @click="installPWA">Instalar</button>
          <span class="progress-bar" :style="{ width: progress + '%' }"></span>
        </div>
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

    const duration = 6000
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
  top: 80px; /* abaixo da navbar */
  right: 20px;
  z-index: 9999;
}

.toast-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  padding: 14px 20px;
  width: 260px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-family: 'Inter', sans-serif;
}

.toast-card p {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.actions {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.actions button {
  background-color: #8000ff;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  opacity: 0.8;
  transition: all 0.25s ease;
}

.actions button:hover {
  opacity: 1;
  transform: scale(1.05);
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  border-radius: 0 0 10px 10px;
  background: #8000ff;
  transition: width 0.05s linear;
  width: 100%;
  z-index: 1;
}

/* Slide + fade animation */
.slide-fade-enter-active {
  animation: slideIn 0.4s ease forwards;
}
.slide-fade-leave-active {
  animation: slideOut 0.3s ease forwards;
}

@keyframes slideIn {
  0% { opacity: 0; transform: translateY(-20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes slideOut {
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}
</style>
