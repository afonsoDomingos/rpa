<template>
  <transition name="install" @leave="onLeave">
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
  <!-- Partículas mágicas -->
  <div v-if="particles.length" class="particles-container">
    <div
      v-for="(p, i) in particles"
      :key="i"
      class="particle"
      :style="{
        '--x': p.x + 'px',
        '--y': p.y + 'px',
        '--size': p.size + 'px',
        '--delay': p.delay + 's',
        '--duration': p.duration + 's',
        '--color': p.color
      }"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const showInstall = ref(false)
const progress = ref(100)
const installing = ref(false)
const particles = ref([])
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

// === PARTÍCULAS AO SUMIR ===
const onLeave = (el, done) => {
  const rect = el.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  const particleCount = 18
  const newParticles = []

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount
    const velocity = 4 + Math.random() * 6
    const size = 3 + Math.random() * 5
    const duration = 0.6 + Math.random() * 0.4
    const delay = Math.random() * 0.15

    newParticles.push({
      x: centerX + Math.cos(angle) * velocity * 20,
      y: centerY + Math.sin(angle) * velocity * 20,
      size,
      duration,
      delay,
      color: Math.random() > 0.5 ? '#a855f7' : '#e0a8ff'
    })
  }

  particles.value = newParticles

  // Limpa após animação
  setTimeout(() => {
    particles.value = []
    done()
  }, 1000)
}
</script>

<style scoped>
/* Overlay */
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

/* Card ultra-transparente */
.banner-card {
  background: rgba(255, 255, 255, 0.48);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: clamp(26px, 6vw, 38px);
  padding: clamp(22px, 5.5vw, 32px) clamp(26px, 6.5vw, 38px);
  width: 100%;
  max-width: min(420px, 90vw);
  display: flex;
  align-items: center;
  gap: clamp(16px, 4vw, 22px);
  box-shadow: 
    0 22px 56px rgba(0, 0, 0, 0.09),
    0 8px 22px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  pointer-events: auto;
  font-family: 'SF Pro Display', 'Inter', system-ui, sans-serif;
}

/* Ícone + Textos + Botão (mantidos) */
.icon {
  font-size: clamp(32px, 7vw, 42px);
  background: linear-gradient(135deg, #7000ff, #d946ef);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.1));
}
.content { flex: 1; line-height: 1.45; }
.title { margin: 0; font-size: clamp(16px, 4.5vw, 18px); font-weight: 700; color: #000; }
.subtitle { margin: 4px 0 0; font-size: clamp(13.5px, 3.5vw, 15px); color: #222; font-weight: 500; }

.install-btn {
  background: linear-gradient(135deg, #7000ff, #a855f7);
  color: white;
  border: none;
  border-radius: clamp(15px, 3.5vw, 19px);
  padding: clamp(12px, 3vw, 16px) clamp(22px, 5vw, 28px);
  font-size: clamp(14.5px, 3.8vw, 16px);
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.2, 0, 0.2, 1);
  box-shadow: 0 8px 26px rgba(128, 0, 255, 0.32);
  min-width: clamp(92px, 24vw, 104px);
  text-align: center;
}
.install-btn::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.38), transparent);
  border-radius: inherit; opacity: 0; transition: opacity 0.3s;
}
.install-btn:hover:not(:disabled)::before { opacity: 1; }
.install-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(128, 0, 255, 0.48); }
.install-btn:active { transform: translateY(-1px); }
.install-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.loading { animation: pulse 1.4s infinite; }

.progress-track {
  position: absolute; bottom: 0; left: 0; height: 4px; width: 100%;
  background: rgba(0, 0, 0, 0.07);
  border-radius: 0 0 clamp(26px, 6vw, 38px) clamp(26px, 6vw, 38px);
  overflow: hidden;
}
.progress-fill {
  height: 100%; background: linear-gradient(90deg, #8000ff, #d946ef);
  border-radius: inherit; transition: width 0.12s ease-out;
  box-shadow: 0 0 16px rgba(128, 0, 255, 0.38);
}

/* ANIMAÇÕES */
.install-enter-active { animation: zoomInFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.install-leave-active { animation: shrinkFadeOut 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

@keyframes zoomInFade {
  0% { opacity: 0; transform: scale(0.78); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes shrinkFadeOut {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.78); }
}
@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }

/* === PARTÍCULAS MÁGICAS === */
.particles-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9998;
  overflow: hidden;
}
.particle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: var(--color);
  border-radius: 50%;
  opacity: 0;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 8px var(--color);
  animation: particleBurst var(--duration) ease-out forwards;
  animation-delay: var(--delay);
  left: var(--x);
  top: var(--y);
}
@keyframes particleBurst {
  0% { opacity: 1; transform: translate(-50%, -50%) scale(0); }
  70% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.2); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
}
</style>