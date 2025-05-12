<template>
  <div class="custom-cursor" :class="{ active: isHovering }" :style="cursorStyle"></div>
  <div
    v-for="(pulse, index) in pulses"
    :key="index"
    class="click-pulse"
    :style="{ left: pulse.x + 'px', top: pulse.y + 'px' }"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import clickSoundFile from '@/assets/sounds/click.mp3' // coloque o som nessa pasta

// Posições do cursor
const mouseX = ref(0)
const mouseY = ref(0)
const cursorX = ref(0)
const cursorY = ref(0)

// Controle de hover e clique
const isHovering = ref(false)
const pulses = ref([])

// Som de clique
const clickSound = new Audio(clickSoundFile)

const cursorStyle = computed(() => ({
  left: `${cursorX.value}px`,
  top: `${cursorY.value}px`,
}))

function updateMouse(e) {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

function animateCursor() {
  const speed = 0.12
  cursorX.value += (mouseX.value - cursorX.value) * speed
  cursorY.value += (mouseY.value - cursorY.value) * speed
  requestAnimationFrame(animateCursor)
}

function checkHover(e) {
  const target = e.target
  isHovering.value = !!target.closest('button, a, input, textarea, select, [data-cursor-hover]')
}

function triggerClickPulse(e) {
  // Cria o efeito visual
  pulses.value.push({ x: e.clientX, y: e.clientY })
  setTimeout(() => {
    pulses.value.shift()
  }, 500)

  // Toca o som
  clickSound.currentTime = 0
  clickSound.play()
}

onMounted(() => {
  window.addEventListener('mousemove', updateMouse)
  window.addEventListener('mousemove', checkHover)
  window.addEventListener('click', triggerClickPulse)
  animateCursor()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', updateMouse)
  window.removeEventListener('mousemove', checkHover)
  window.removeEventListener('click', triggerClickPulse)
})
</script>

<style scoped>
.custom-cursor {
  position: fixed;
  width: 16px;
  height: 16px;
  background-color: rgba(128, 0, 128, 0.4);
  border: 2px solid #800080;
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 9999;
  transition: width 0.2s ease, height 0.2s ease, background-color 0.2s ease, transform 0.1s ease;
}

.custom-cursor.active {
  width: 40px;
  height: 40px;
  background-color: rgba(128, 0, 128, 0.1);
  transform: translate(-50%, -50%) scale(1.1);
}

.click-pulse {
  position: fixed;
  width: 20px;
  height: 20px;
  border: 2px solid #800080;
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 9998;
  animation: pulse-animation 0.5s ease-out forwards;
}

@keyframes pulse-animation {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
  }
}
</style>
