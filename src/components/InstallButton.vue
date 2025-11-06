<template>
  <button
    v-if="showInstall"
    @click="installPWA"
    class="install-btn"
  >
    Instalar App
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showInstall = ref(false)
let deferredPrompt

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()       // evita o prompt automático
    deferredPrompt = e       // guarda o evento
    showInstall.value = true // mostra o botão
  })
})

function installPWA() {
  showInstall.value = false
  if (deferredPrompt) {
    deferredPrompt.prompt()           // mostra o prompt do Chrome
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null
    })
  }
}
</script>

<style>
.install-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #800080;
  color: #fff;
  padding: 12px 20px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  z-index: 9999;
}
.install-btn:hover {
  background-color: #9a2ecc;
}
</style>
