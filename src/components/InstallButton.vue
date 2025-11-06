<template>
  <transition name="install">
    <div v-if="showInstall" class="install-banner" @click.stop>
      <div class="banner-card">
        <div class="icon">🚀</div>
        <div class="content">
          <p class="title">Instale o app</p>
          <p class="subtitle">Adicione à tela inicial em 1 toque</p>
        </div>
        <button @click="installPWA" class="install-btn" :disabled="installing">
          <span v-if="!installing">Instalar</span>
          <span v-else class="loading">⋯</span>
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
  const duration = 7000
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
  } else {
    progress.value = 0
    setTimeout(() => showInstall.value = false, 400)
  }

  if ('vibrate' in navigator) navigator.vibrate(30)
}
</script>

<style scoped>
/* CENTRALIZADO NO MEIO DA TELA */
.install-banner {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  pointer-events: none;
  width: 100%;
  max-width: 380px;
  padding: 0 20px;
  box-sizing: border-box;
}

/* Card premium com glassmorphism */
.banner-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 26px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 
    0 16px 40px rgba(0, 0, 0, 0.16),
    0 6px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  pointer-events: auto;
  font-family: 'SF Pro Display', 'Inter', system-ui, sans-serif;
  animation: scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Ícone com gradiente */
.icon {
  font-size: 36px;
  background: linear-gradient(135deg, #7000ff, #d946ef);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
}

/* Textos */
.content {
  flex: 1;
  line-height: 1.4;
}
.title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #000;
}
.subtitle {
  margin: 4px 0 0;
  font-size: 13.5px;
  color: #555;
  font-weight: 500;
}

/* Botão com efeito premium */
.install-btn {
  background: linear-gradient(135deg, #7000ff, #a855f7);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 11px 20px;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.2, 0, 0.2, 1);
  box-shadow: 0 8px 20px rgba(128, 0, 255, 0.4);
  min-width: 88px;
  text-align: center;
}

.install-btn::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
  border-radius: 16px;
  opacity: 0;
  transition: opacity 0.3s;
}

.install-btn:hover:not(:disabled)::before {
  opacity: 1;
}

.install-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(128, 0, 255, 0.5);
}

.install-btn:active {
  transform: translateY(-1px);
}

.install-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  animation: pulse 1.4s infinite;
}

/* Barra de progresso */
.progress-track {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  width: 100%;
  background: rgba(0, 0, 0, 0.12);
  border-radius: 0 0 26px 26px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8000ff, #d946ef);
  border-radius: 0 0 26px 26px;
  transition: width 0.12s ease-out;
  box-shadow: 0 0 8px rgba(128, 0, 255, 0.4);
}

/* Animações */
.install-enter-active { animation: scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
.install-leave-active { animation: scaleOut 0.4s ease forwards; }

@keyframes scaleIn {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.88);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
@keyframes scaleOut {
  to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
}
@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Mobile */
@media (max-width: 480px) {
  .install-banner {
    padding: 0 16px;
  }
  .banner-card {
    padding: 18px 20px;
    gap: 14px;
  }
  .icon { font-size: 32px; }
  .title { font-size: 15.5px; }
}
</style>