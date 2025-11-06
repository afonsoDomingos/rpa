<template>
  <transition name="install">
    <div v-if="showInstall" class="install-banner" @click.stop>
      <div class="banner-card">
        <div class="icon">🚀</div>
        <div class="content">
          <p class="title">Acesse mais rápido</p>
          <p class="subtitle">Instale o app na sua tela inicial</p>
        </div>
        <button @click="installPWA" class="install-btn" :disabled="installing">
          <span v-if="!installing">Instalar</span>
          <span v-else class="loading">...</span>
        </button>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const showInstall = ref(false)
const progress = ref(100)
const installing = ref(false)
let deferredPrompt = null
let timer = null

const startProgress = () => {
  const duration = 7000 // 7 segundos
  const startTime = Date.now()

  const tick = () => {
    const elapsed = Date.now() - startTime
    progress.value = Math.max(0, 100 - (elapsed / duration) * 100)

    if (progress.value > 0 && showInstall.value) {
      timer = requestAnimationFrame(tick)
    } else {
      showInstall.value = false
    }
  }

  timer = requestAnimationFrame(tick)
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    showInstall.value = true
    progress.value = 100
    startProgress()
  })
})

onUnmounted(() => {
  if (timer) cancelAnimationFrame(timer)
})

const installPWA = async () => {
  if (!deferredPrompt) return

  installing.value = true
  deferredPrompt.prompt()

  const { outcome } = await deferredPrompt.userChoice
  installing.value = false
  deferredPrompt = null

  if (outcome === 'accepted') {
    showInstall.value = false
  }
}
</script>

<style scoped>
.install-banner {
  position: fixed;
  top: 88px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.banner-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  padding: 16px 18px;
  width: 300px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08);
  pointer-events: auto;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  animation: floatIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.icon {
  font-size: 28px;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
}

.content {
  flex: 1;
  line-height: 1.3;
}

.title {
  margin: 0;
  font-size: 14.5px;
  font-weight: 600;
  color: #1a1a1a;
}

.subtitle {
  margin: 2px 0 0 0;
  font-size: 12.5px;
  color: #555;
  font-weight: 500;
}

.install-btn {
  background: linear-gradient(135deg, #7000ff, #a033ff);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.2, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(128, 0, 255, 0.3);
}

.install-btn:hover:not(:disabled) {
  transform: translateY(-1px) scale(1.03);
  box-shadow: 0 6px 16px rgba(128, 0, 255, 0.4);
}

.install-btn:active {
  transform: translateY(0) scale(0.98);
}

.install-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading {
  display: inline-block;
  animation: pulse 1.5s infinite;
}

.progress-track {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 0 0 20px 20px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8000ff, #a855f7);
  border-radius: 0 0 20px 20px;
  transition: width 0.1s linear;
  transform-origin: left;
}

/* Animações de entrada/saída */
.install-enter-active {
  animation: floatIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.install-leave-active {
  animation: floatOut 0.35s cubic-bezier(0.4, 0, 1, 1) forwards;
}

@keyframes floatIn {
  0% {
    opacity: 0;
    transform: translateY(-16px) scale(0.94);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes floatOut {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-12px) scale(0.92);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* Responsivo */
@media (max-width: 480px) {
  .install-banner {
    left: 16px;
    right: 16px;
    top: 16px;
  }
  .banner-card {
    width: auto;
  }
}
</style>