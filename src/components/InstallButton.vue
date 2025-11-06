<template>
  <transition name="install">
    <div v-if="showInstall" class="install-overlay" @click.stop>
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
      // Quando termina a contagem → fade + encolher
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
/* Overlay centralizado */
.install-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  pointer-events: none;
  padding: clamp(16px, 5vw, 40px);
  box-sizing: border-box;
}

/* Fundo transparente glassmorphism */
.banner-card {
  background: rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: clamp(24px, 5.5vw, 36px);
  padding: clamp(20px, 5vw, 30px) clamp(24px, 6vw, 36px);
  width: 100%;
  max-width: min(420px, 90vw);
  display: flex;
  align-items: center;
  gap: clamp(14px, 3.5vw, 20px);
  box-shadow: 
    0 20px 52px rgba(0, 0, 0, 0.1),
    0 6px 20px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.75);
  pointer-events: auto;
  font-family: 'SF Pro Display', 'Inter', system-ui, sans-serif;
}

/* Ícone */
.icon {
  font-size: clamp(30px, 6.5vw, 40px);
  background: linear-gradient(135deg, #7000ff, #d946ef);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
}

/* Textos */
.content {
  flex: 1;
  line-height: 1.45;
}
.title {
  margin: 0;
  font-size: clamp(15.5px, 4.2vw, 17.5px);
  font-weight: 700;
  color: #000000;
}
.subtitle {
  margin: 4px 0 0;
  font-size: clamp(13px, 3.3vw, 14.5px);
  color: #333333;
  font-weight: 500;
}

/* Botão */
.install-btn {
  background: linear-gradient(135deg, #7000ff, #a855f7);
  color: white;
  border: none;
  border-radius: clamp(14px, 3.2vw, 18px);
  padding: clamp(11px, 2.8vw, 15px) clamp(20px, 4.5vw, 26px);
  font-size: clamp(14px, 3.6vw, 15.5px);
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.2, 0, 0.2, 1);
  box-shadow: 0 8px 24px rgba(128, 0, 255, 0.35);
  min-width: clamp(88px, 22vw, 100px);
  text-align: center;
}

.install-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.35), transparent);
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.3s;
}

.install-btn:hover:not(:disabled)::before { opacity: 1; }
.install-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 14px 36px rgba(128, 0, 255, 0.5);
}
.install-btn:active { transform: translateY(-1px); }
.install-btn:disabled { opacity: 0.7; cursor: not-allowed; }

.loading { animation: pulse 1.4s infinite; }

/* Barra de progresso */
.progress-track {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  width: 100%;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 0 0 clamp(24px, 5.5vw, 36px) clamp(24px, 5.5vw, 36px);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8000ff, #d946ef);
  border-radius: inherit;
  transition: width 0.12s ease-out;
  box-shadow: 0 0 14px rgba(128, 0, 255, 0.4);
}

/* ANIMAÇÃO DE ENTRADA */
.install-enter-active {
  animation: scaleIn 0.75s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ANIMAÇÃO DE SAÍDA: FADE + ENCOLHER SUAVE */
.install-leave-active {
  animation: shrinkFadeOut 0.55s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes scaleIn {
  0% { opacity: 0; transform: scale(0.86); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes shrinkFadeOut {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.82); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
</style>