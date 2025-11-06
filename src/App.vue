<script setup>
/*
=========================================================
* Vue Material Kit 2 - v2.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/vue-material-kit
* Copyright 2022 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
import { RouterView } from "vue-router";
import CustomCursor from "./views/Presentation/CustomCursor.vue";
import SocialIcons from "./components/SocialIcons.vue";
import ChatAssistente from "./components/ChatAssistente.vue";
import InstallButton from "./components/InstallButton.vue";

/*import olhodedeus from "./examples/navbars/olhodedeus.vue";*/

import { ref, onMounted, onUnmounted } from 'vue';



const showScrollTop = ref(false);
const showIcon = ref(true);
const barWidth = ref(0);

function handleScroll() {
  showScrollTop.value = window.scrollY > 200;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  let progress = 0;
  const interval = setInterval(() => {
    progress += 2.5;
    barWidth.value = Math.min(progress, 100);
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        showIcon.value = false;
      }, 350);
    }
  }, 50); // 50ms * 40 = ~2s
});
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});





const props = defineProps({
  size: {
    type: [Number, String],
    default: 6, // valor original
  },
});

</script>
<template>
  <div style="min-height: 100vh; max-width: 100vw; overflow-x: hidden; overflow-y: auto; position: relative;">
    <transition name="zoom-in">
      <div v-if="showIcon" class="zoom-icon-wrapper">
        <div class="zoom-icon-content">
          <img src="/src/assets/img/rPa.png" alt="RPA Icon" class="zoom-icon" />
          <div class="zoom-bar-wrapper">
            <div class="zoom-bar-bg">
              <div class="zoom-bar-fill" :style="{ width: barWidth + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <div v-show="!showIcon">
      <!--<olhodedeus />-->
      <router-view />
      <CustomCursor />
      <ChatAssistente v-if="!showScrollTop" />
     <SocialIcons :size="14" />
     <InstallButton />

    

     


      
      <button
        v-show="showScrollTop"
        @click="scrollToTop"
        class="scroll-top-btn"
        aria-label="Voltar ao topo"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="10" fill="white" fill-opacity="0.13"/>
          <path d="M10 15V5" stroke="#198754" stroke-width="2" stroke-linecap="round"/>
          <path d="M6.5 8.5L10 5L13.5 8.5" stroke="#800080" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
<!-- Fim do template -->
</template>
<style scoped>
/* Botão voltar ao topo menor e mais atraente */
.scroll-top-btn {
  position: fixed;
  right: 18px;
  bottom: 22px;
  z-index: 9999;
  background: linear-gradient(135deg, #198754 60%, #800080 100%);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.1rem;
  box-shadow: 0 2px 10px rgba(60,60,60,0.18);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.2s;
  outline: none;
  border: 2px solid #fff;
}
.scroll-top-btn:hover {
  background: linear-gradient(135deg, #800080 60%, #198754 100%);
  color: #fff;
  box-shadow: 0 4px 18px rgba(128,0,128,0.18);
  transform: scale(1.13) rotate(-10deg);
}

/* Efeito zoom-in para o ícone */
.zoom-in-enter-active {
  animation: zoomIn 0.7s cubic-bezier(0.23, 1.01, 0.32, 1) both;
}
.zoom-in-leave-active {
  animation: zoomOut 0.4s cubic-bezier(0.23, 1.01, 0.32, 1) both;
}
@keyframes zoomIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes zoomOut {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.3);
  }
}

.zoom-icon-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255,255,255,0.97);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.zoom-icon-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.zoom-icon {
  width: 110px;
  height: 110px;
  object-fit: contain;
  filter: drop-shadow(0 2px 12px rgba(60,60,60,0.18));
  margin-bottom: 18px;
}
.zoom-bar-wrapper {
  width: 120px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.zoom-bar-bg {
  width: 100%;
  height: 10px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(60,60,60,0.10);
}
.zoom-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #198754 60%, #800080 100%);
  border-radius: 6px;
  transition: width 0.18s cubic-bezier(0.4,0,0.2,1);
  width: 0%;
}

/* ...existing styles... */
</style>

