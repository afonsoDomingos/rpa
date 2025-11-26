<script setup>
import { RouterView } from "vue-router";
import CustomCursor from "./views/Presentation/CustomCursor.vue";
import SocialIcons from "./components/SocialIcons.vue";
import ChatAssistente from "./components/ChatAssistente.vue";
import InstallButton from "./components/InstallButton.vue";
import ScrollToolsCTA from "./components/ScrollToolsCTA.vue";


import { ref, onMounted, onUnmounted } from 'vue';

const showLoading = ref(true);
const showEye = ref(true);
const activeDot = ref(0);
const showScrollTop = ref(false);

const handleScroll = () => showScrollTop.value = window.scrollY > 200;
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

// OLHO ROXO #800080
const iris = ref({ x: 0, y: 0 });
const isBlinking = ref(false);
const irisColor = ref("radial-gradient(circle at 50% 55%, #c000c0 0%, #800080 90%)");

const colors = [
  "radial-gradient(circle at 50% 55%, #b000b0 0%, #800080 90%)",
  "radial-gradient(circle at 50% 55%, #aa00aa 0%, #700080 90%)",
  "radial-gradient(circle at 50% 55%, #cc00cc 0%, #900090 90%)",
  "radial-gradient(circle at 50% 55%, #990099 0%, #660066 90%)",
];

let targetIris = { x: 0, y: 0 };
let lastMoveTime = Date.now();

const updateIris = () => {
  const now = Date.now();
  if (now - lastMoveTime > 1000) targetIris = { x: 0, y: 0 };
  iris.value.x += (targetIris.x - iris.value.x) * 0.16;
  iris.value.y += (targetIris.y - iris.value.y) * 0.16;
  requestAnimationFrame(updateIris);
};

const handleMouseMove = (e) => {
  const eye = document.querySelector('.loading-eye .eye');
  if (!eye) return;
  const rect = eye.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = e.clientX - centerX;
  const dy = e.clientY - centerY;
  const dist = Math.min(Math.hypot(dx, dy), 380);
  const angle = Math.atan2(dy, dx);

  targetIris = {
    x: Math.cos(angle) * (dist / 380) * 26,
    y: Math.sin(angle) * (dist / 380) * 26,
  };
  lastMoveTime = Date.now();
};

const blink = () => {
  isBlinking.value = true;
  setTimeout(() => {
    isBlinking.value = false;
    setTimeout(blink, 3000 + Math.random() * 4000);
  }, 140);
};

const changeColor = () => {
  irisColor.value = colors[Math.floor(Math.random() * colors.length)];
};

const openLinkedIn = () => {
  window.open("https://www.linkedin.com/in/afonso-domingos-6b59361a5/", "_blank");
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('mousemove', handleMouseMove);
  blink();
  updateIris();

  let step = 0;
  const interval = setInterval(() => {
    step++;
    activeDot.value = step % 4;
    if (step >= 7) {
      clearInterval(interval);
      setTimeout(() => showEye.value = false, 100);
      setTimeout(() => showLoading.value = false, 500);
    }
  }, 280);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('mousemove', handleMouseMove);
});
</script>

<template>
  <div style="min-height: 100vh; overflow-x: hidden; position: relative;">

    <!-- LOADING SCREEN -->
    <transition name="curtain-up">
      <div v-if="showLoading" class="loading-screen">

        <!-- By: + Logo no CANTO INFERIOR DIREITO (bem encostado) -->
        <div class="powered-by" @click="openLinkedIn">
          
          <img src="@/assets/img/byvibe.png" alt="Vibe" />
        </div>

        <!-- Pontinhos roxos suaves -->
        <div class="dots-container">
          <div class="dot" :class="{ active: activeDot >= 1 }"></div>
          <div class="dot" :class="{ active: activeDot >= 2 }"></div>
          <div class="dot" :class="{ active: activeDot >= 3 }"></div>
        </div>

        <!-- Olho roxo -->
        <transition name="gentle-fade">
          <div v-if="showEye" class="loading-eye" @click="changeColor">
            <div class="eye" :class="{ blinking: isBlinking }">
              <div class="sclera">
                <div class="iris"
                  :style="{ transform: `translate(${iris.x}px, ${iris.y}px)`, background: irisColor }">
                  <div class="iris-core"></div>
                  <div class="iris-fibers"></div>
                  <div class="iris-glow"></div>
                  <div class="pupil"></div>
                  <div class="reflection-main"></div>
                  <div class="reflection-small"></div>
                </div>
              </div>
            </div>
          </div>
        </transition>

      </div>
    </transition>

    <div v-show="!showLoading">
      <router-view />
    </div>


    
    <ScrollToolsCTA />
    <CustomCursor />
    <SocialIcons :size="14" />
    <InstallButton />
    <ChatAssistente :hide-fab-when-scrolled="showScrollTop" />

    <button v-show="showScrollTop" @click="scrollToTop" class="scroll-top-btn">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="10" fill="white" fill-opacity="0.13"/>
        <path d="M10 15V5" stroke="#800080" stroke-width="2" stroke-linecap="round"/>
        <path d="M6.5 8.5L10 5L13.5 8.5" stroke="#800080" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.loading-screen {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #1f001f, #330033, #4d004d);
  background-size: 300% 300%;
  animation: softFlow 14s ease infinite;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 120px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  overflow: hidden;
}

@keyframes softFlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* By: + Logo no CANTO INFERIOR DIREITO (bem encostado mesmo na borda) */
.powered-by {
  position: absolute;
  bottom: 16px;   /* bem encostado em baixo */
  right: 16px;    /* bem encostado à direita */
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  z-index: 100000;
  padding: 10px 14px;
  border-radius: 12px;
  
  backdrop-filter: blur(8px);
  transition: all 0.35s ease;
}
.powered-by:hover {
  transform: translateY(-2px);


}
.by-text {
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 19px;
  font-weight: 600;
  color: #e0aaff;
  text-shadow: 0 1px 4px rgba(0,0,0,0.6);
}
.powered-by img {
  height: 56px;   /* logo maior e bem visível */
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.7));
}

/* Pontinhos roxos suaves */
.dots-container {
  display: flex;
  gap: 22px;
  position: fixed;
  bottom: 100px;
}
.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(128, 0, 128, 0.4);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.dot.active {
  background: #c000c0;
  transform: scale(1.4);
  box-shadow: 0 0 14px rgba(192, 0, 192, 0.5);
}

/* Animações */
.curtain-up-leave-active { transition: transform 1.1s cubic-bezier(0.4, 0, 0.2, 1); }
.curtain-up-leave-to { transform: translateY(-100vh); }
.gentle-fade-leave-active { transition: opacity 0.7s ease-out; }
.gentle-fade-leave-to { opacity: 0; }

.loading-eye { transform: scale(4.6); cursor: pointer; animation: float 7s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0) scale(4.6); } 50% { transform: translateY(-10px) scale(4.6); } }

/* Olho roxo */
.eye { width: 50px; height: 30px; border-radius: 50%/50%; background: radial-gradient(circle at 50% 55%, #fff 0%, #f5f5f5 95%); position: relative; overflow: hidden; box-shadow: inset 0 4px 12px rgba(0,0,0,0.25), 0 6px 16px rgba(0,0,0,0.2); transition: height 0.16s ease; }
.eye.blinking { height: 4px; }
.sclera { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.iris { width: 24px; height: 24px; border-radius: 50%; position: relative; background: v-bind(irisColor); box-shadow: 0 0 28px #800080, inset 0 3px 6px rgba(255,255,255,0.4), inset 0 -4px 8px rgba(0,0,0,0.7); }
.pupil { position: absolute; top: 50%; left: 50%; width: 11px; height: 11px; transform: translate(-50%,-50%); background: #000; border-radius: 50%; }
.reflection-main { position: absolute; top: 16%; left: 24%; width: 8px; height: 8px; background: rgba(255,255,255,0.98); border-radius: 50%; }
.reflection-small { position: absolute; top: 32%; right: 20%; width: 4px; height: 4px; background: rgba(255,255,255,0.7); border-radius: 50%; }
.iris-fibers { position: absolute; inset: 0; border-radius: 50%; background: repeating-conic-gradient(rgba(255,255,255,0.14) 0deg 12deg, transparent 12deg 24deg); animation: rotateFibers 32s linear infinite; opacity: 0.8; }
.iris-glow { position: absolute; inset: 0; border-radius: 50%; background: radial-gradient(circle at 40% 55%, rgba(128, 0, 128, 0.8), transparent 70%); filter: blur(5px); mix-blend-mode: screen; }
@keyframes rotateFibers { to { transform: rotate(360deg); } }

/* Botão scroll */
.scroll-top-btn {
  position: fixed; right: 18px; bottom: 22px; z-index: 9999;
  background: linear-gradient(135deg, #800080 60%, #b000b0 100%);
  border: 2px solid #fff; border-radius: 50%; width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3); transition: all 0.3s ease;
}
.scroll-top-btn:hover {
  background: linear-gradient(135deg, #b000b0 60%, #800080 100%);
  transform: scale(1.2) rotate(-15deg);
}
</style>