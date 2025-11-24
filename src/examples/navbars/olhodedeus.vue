<template>
  <div class="floating-eye" @click="changeColor">
    <div class="eye" :class="{ blinking: isBlinking }">
      <div class="sclera">
        <div 
          class="iris"
          :style="{ 
            transform: `translate(${iris.x}px, ${iris.y}px)`,
            background: irisColor
          }"
        >
          <div class="iris-core"></div>
          <div class="iris-fibers"></div>
          <div class="iris-glow"></div>
          <div class="iris-veins"></div>
          <div class="pupil"></div>
          <div class="reflection-main"></div>
          <div class="reflection-small"></div>
          <div class="reflection-tiny"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"

const iris = ref({ x: 0, y: 0 })
let eyeElement = null
const isBlinking = ref(false)
const irisColor = ref("radial-gradient(circle at 50% 55%, #a855f7 0%, #6b21a8 90%)")

const colors = [
  "radial-gradient(circle at 50% 55%, #a855f7 0%, #6b21a8 90%)",
  "radial-gradient(circle at 50% 55%, #f472b6 0%, #be185d 90%)",
  "radial-gradient(circle at 50% 55%, #60a5fa 0%, #1e3a8a 90%)",
  "radial-gradient(circle at 50% 55%, #34d399 0%, #047857 90%)"
]

let targetIris = { x: 0, y: 0 }
let lastMoveTime = Date.now()

const updateIris = () => {
  const now = Date.now()
  if (now - lastMoveTime > 1000) targetIris = { x: 0, y: 0 }

  iris.value.x += (targetIris.x - iris.value.x) * 0.1
  iris.value.y += (targetIris.y - iris.value.y) * 0.1

  requestAnimationFrame(updateIris)
}

const handleMouseMove = (event) => {
  if (!eyeElement) return
  const rect = eyeElement.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  const dx = event.clientX - centerX
  const dy = event.clientY - centerY

  const maxDistance = 8
  const distance = Math.min(Math.hypot(dx, dy), maxDistance * 12)
  const angle = Math.atan2(dy, dx)

  targetIris = {
    x: Math.cos(angle) * (distance / (maxDistance * 12)) * maxDistance,
    y: Math.sin(angle) * (distance / (maxDistance * 12)) * maxDistance
  }
  lastMoveTime = Date.now()
}

const handleDeviceOrientation = (event) => {
  if (!eyeElement) return
  const maxDistance = 6
  const x = (event.gamma || 0) / 30
  const y = (event.beta || 0) / 30

  targetIris = {
    x: Math.max(Math.min(x * maxDistance, maxDistance), -maxDistance),
    y: Math.max(Math.min(y * maxDistance, maxDistance), -maxDistance)
  }
  lastMoveTime = Date.now()
}

const blink = () => {
  isBlinking.value = true
  setTimeout(() => {
    isBlinking.value = false
    setTimeout(blink, 2200 + Math.random() * 3800)
  }, 150)
}

const changeColor = () => {
  const next = colors[Math.floor(Math.random() * colors.length)]
  irisColor.value = next
}

const handleGlobalButtonClick = (event) => {
  if (event.target.closest("button")) changeColor()
}

onMounted(() => {
  eyeElement = document.querySelector(".eye")
  window.addEventListener("mousemove", handleMouseMove)
  document.addEventListener("click", handleGlobalButtonClick)
  blink()
  updateIris()

  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", handleDeviceOrientation)
  }
})

onUnmounted(() => {
  window.removeEventListener("mousemove", handleMouseMove)
  document.removeEventListener("click", handleGlobalButtonClick)
  if (window.DeviceOrientationEvent) {
    window.removeEventListener("deviceorientation", handleDeviceOrientation)
  }
})
</script>

<style scoped>





/* ==================== OLHO (GRANDE + PEQUENO NO CANTO) ==================== */
.loading-eye {
  transform: scale(4.4);
  cursor: pointer;
  animation: float 5s ease-in-out infinite;
}

.corner-eye {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 9999;
  cursor: pointer;
  animation: float-small 5s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(4.4); }
  50%     { transform: translateY(-12px) scale(4.4); }
}

@keyframes float-small {
  0%, 100% { transform: translateY(0); }
  50%     { transform: translateY(-4px); }
}

/* Estrutura e detalhes do olho */
.eye {
  width: 50px;
  height: 30px;
  border-radius: 50%/50%;
  background: radial-gradient(circle at 50% 55%, #fff 0%, #eaeaea 95%);
  position: relative;
  overflow: hidden;
  box-shadow: 
    inset 0 4px 12px rgba(0,0,0,0.3),
    0 5px 15px rgba(0,0,0,0.25);
  transition: height 0.16s ease;
}

.eye.blinking {
  height: 4px; /* fecha o olho */
}

.sclera {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.iris {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  position: relative;
  background: v-bind(irisColor); /* ou troque por qualquer radial-gradient roxo que quiser */
  box-shadow: 
    0 0 22px rgba(168,85,247,0.9),
    inset 0 3px 6px rgba(255,255,255,0.3),
    inset 0 -4px 8px rgba(0,0,0,0.7);
  transition: transform 0.1s ease-out; /* movimento suave da íris */
}

.pupil {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 11px;
  height: 11px;
  transform: translate(-50%, -50%);
  background: #000;
  border-radius: 50%;
}

.reflection-main {
  position: absolute;
  top: 16%;
  left: 24%;
  width: 7px;
  height: 7px;
  background: rgba(255,255,255,0.98);
  border-radius: 50%;
}

.reflection-small {
  position: absolute;
  top: 32%;
  right: 20%;
  width: 4px;
  height: 4px;
  background: rgba(255,255,255,0.6);
  border-radius: 50%;
}

.iris-fibers {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: repeating-conic-gradient(
    rgba(255,255,255,0.12) 0deg 10deg,
    transparent 10deg 20deg
  );
  animation: rotateFibers 28s linear infinite;
  opacity: 0.75;
}

.iris-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 55%, rgba(168,85,247,0.7), transparent 70%);
  filter: blur(4px);
  mix-blend-mode: screen;
}

@keyframes rotateFibers {
  to { transform: rotate(360deg); }
}

/* Animação de zoom-out quando some (opcional) */
.zoom-out-leave-active {
  animation: zoomOut 1s cubic-bezier(0.2,0.8,0.4,1) both;
}

@keyframes zoomOut {
  to {
    opacity: 0;
    transform: scale(0.1);
  }
}
</style>