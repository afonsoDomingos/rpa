<template>
  <transition name="install" @leave="onLeave">
    <div v-if="showInstall" class="install-overlay" @click.stop>
      <div class="banner-card">
        <div class="icon">🚀</div>
        <div class="content">
          <p class="title">Instale o app</p>
          <p class="subtitle">Toque para adicionar</p>
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

  <!-- Partículas ao sumir -->
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
        '--color': p.color,
      }"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const showInstall = ref(false);
const progress = ref(100);
const installing = ref(false);
const particles = ref([]);
let deferredPrompt = null;
let timer = null;

const startProgress = () => {
  const duration = 7000;
  const startTime = Date.now();

  const tick = () => {
    const elapsed = Date.now() - startTime;
    progress.value = Math.max(0, 100 - (elapsed / duration) * 100);

    if (progress.value > 0 && showInstall.value) {
      timer = requestAnimationFrame(tick);
    } else {
      showInstall.value = false;
    }
  };
  timer = requestAnimationFrame(tick);
};

onMounted(() => {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstall.value = true;
    progress.value = 100;
    startProgress();
  });
});

onUnmounted(() => {
  if (timer) cancelAnimationFrame(timer);
});

const installPWA = async () => {
  if (!deferredPrompt) return;

  installing.value = true;
  deferredPrompt.prompt();

  const { outcome } = await deferredPrompt.userChoice;
  installing.value = false;
  deferredPrompt = null;

  if (outcome === "accepted") {
    showInstall.value = false;
  } else {
    progress.value = 0;
    setTimeout(() => (showInstall.value = false), 400);
  }

  if ("vibrate" in navigator) navigator.vibrate(30);
};

// === PARTÍCULAS AO SUMIR ===
const onLeave = (el, done) => {
  const rect = el.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const particleCount = 14;
  const newParticles = [];

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount;
    const velocity = 3 + Math.random() * 4;
    const size = 2 + Math.random() * 3;
    const duration = 0.5 + Math.random() * 0.3;
    const delay = Math.random() * 0.12;

    newParticles.push({
      x: centerX + Math.cos(angle) * velocity * 15,
      y: centerY + Math.sin(angle) * velocity * 15,
      size,
      duration,
      delay,
      color: Math.random() > 0.5 ? "#a855f7" : "#d946ef",
    });
  }

  particles.value = newParticles;

  setTimeout(() => {
    particles.value = [];
    done();
  }, 800);
};
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
  padding: clamp(12px, 4vw, 32px);
  box-sizing: border-box;
}

/* CARD COMPACTO E LEVE */
.banner-card {
  background: rgba(255, 255, 255, 0.48);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: clamp(18px, 4.5vw, 28px);
  padding: clamp(12px, 3vw, 18px) clamp(14px, 4vw, 20px);
  width: 100%;
  max-width: min(340px, 88vw);
  display: flex;
  align-items: center;
  gap: clamp(10px, 2.5vw, 14px);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.75);
  pointer-events: auto;
  font-family: "SF Pro Display", "Inter", system-ui, sans-serif;
}

/* Ícone menor */
.icon {
  font-size: clamp(24px, 5.5vw, 32px);
  background: linear-gradient(135deg, #7000ff, #d946ef);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1));
}

/* Textos compactos */
.content {
  flex: 1;
  line-height: 1.3;
}
.title {
  margin: 0;
  font-size: clamp(13.5px, 3.6vw, 15px);
  font-weight: 700;
  color: #000;
}
.subtitle {
  margin: 2px 0 0;
  font-size: clamp(11px, 2.8vw, 12.5px);
  color: #333;
  font-weight: 500;
}

/* Botão menor */
.install-btn {
  background: linear-gradient(135deg, #7000ff, #a855f7);
  color: white;
  border: none;
  border-radius: clamp(10px, 2.5vw, 14px);
  padding: clamp(6px, 1.8vw, 10px) clamp(12px, 3vw, 16px);
  font-size: clamp(12px, 3vw, 13.5px);
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 6px 16px rgba(128, 0, 255, 0.3);
  min-width: clamp(68px, 18vw, 80px);
  text-align: center;
}
.install-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(128, 0, 255, 0.42);
}
.install-btn:active {
  transform: translateY(0);
}
.install-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.loading {
  animation: pulse 1.3s infinite;
}

/* Barra de progresso fina */
.progress-track {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: rgba(0, 0, 0, 0.07);
  border-radius: 0 0 clamp(18px, 4.5vw, 28px) clamp(18px, 4.5vw, 28px);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8000ff, #d946ef);
  border-radius: inherit;
  transition: width 0.1s ease-out;
  box-shadow: 0 0 10px rgba(128, 0, 255, 0.35);
}

/* ANIMAÇÕES */
.install-enter-active {
  animation: zoomInFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.install-leave-active {
  animation: shrinkFadeOut 0.55s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes zoomInFade {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes shrinkFadeOut {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
}
@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* PARTÍCULAS MENOR E RÁPIDAS */
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
  box-shadow: 0 0 6px var(--color);
  animation: particleBurst var(--duration) ease-out forwards;
  animation-delay: var(--delay);
  left: var(--x);
  top: var(--y);
}
@keyframes particleBurst {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0);
  }
  60% {
    opacity: 0.7;
    transform: translate(-50%, -50%) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.7);
  }
}
</style>
