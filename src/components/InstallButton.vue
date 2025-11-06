<template>
  <div v-if="showInstall" class="install-alert">
    <p>Instale o app no seu dispositivo!</p>
    <button @click="installPWA">Instalar</button>
  </div>
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

    // Desaparece automaticamente após 10 segundos
    setTimeout(() => {
      showInstall.value = false
    }, 10000)
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
.install-alert {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #800080;
  color: #fff;
  padding: 20px 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
  z-index: 9999;
  animation: fadeIn 0.5s;
}

.install-alert button {
  margin-top: 12px;
  background-color: #fff;
  color: #800080;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.install-alert button:hover {
  background-color: #f0f0f0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, -60%); }
  to { opacity: 1; transform: translate(-50%, -50%); }
}
</style>
