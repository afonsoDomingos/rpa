<template> 
  <div 
    class="floating-eye"
    @click="changeColor"
    :style="{
      transform: `translate(${eyeTilt.x}px, ${eyeTilt.y}px) rotate(${eyeTilt.rotate}deg)`
    }"
  >
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
          <div class="pupil"></div>
          <div class="reflection-main"></div>
          <div class="reflection-small"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"

const iris = ref({ x: 0, y: 0 })
const eyeTilt = ref({ x: 0, y: 0, rotate: 0 }) // movimento do olho inteiro
let eyeElement = null
const isBlinking = ref(false)
const irisColor = ref("radial-gradient(circle at 50% 55%, #a855f7 0%, #6b21a8 90%)")

const colors = [
  "radial-gradient(circle at 50% 55%, #a855f7 0%, #6b21a8 90%)",
  "radial-gradient(circle at 50% 55%, #f472b6 0%, #be185d 90%)",
  "radial-gradient(circle at 50% 55%, #60a5fa 0%, #1e3a8a 90%)",
  "radial-gradient(circle at 50% 55%, #34d399 0%, #047857 90%)"
]

// === Movimento da íris com o rato ===
const handleMouseMove = (event) => {
  if (!eyeElement) return
  const rect = eyeElement.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  const dx = event.clientX - centerX
  const dy = event.clientY - centerY

  const maxDistance = 8
  const distance = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance)
  const angle = Math.atan2(dy, dx)

  iris.value = {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance
  }
}

// === Movimento do olho + íris com o dispositivo ===
const handleDeviceOrientation = (event) => {
  const { beta, gamma, alpha } = event // beta = frente/trás, gamma = esquerda/direita

  const maxTilt = 30
  const irisMax = 8
  const eyeMax = 12

  const tiltX = Math.max(-maxTilt, Math.min(gamma, maxTilt))
  const tiltY = Math.max(-maxTilt, Math.min(beta, maxTilt))

  // Movimento da íris (interno)
  iris.value = {
    x: (tiltX / maxTilt) * irisMax,
    y: (tiltY / maxTilt) * irisMax
  }

  // Movimento do olho (externo)
  eyeTilt.value = {
    x: (tiltX / maxTilt) * eyeMax,
    y: (tiltY / maxTilt) * eyeMax,
    rotate: (tiltX / maxTilt) * 5 // rotação leve
  }
}

// === Piscar aleatoriamente ===
const blink = () => {
  isBlinking.value = true
  setTimeout(() => {
    isBlinking.value = false
    setTimeout(blink, 2000 + Math.random() * 3000)
  }, 150)
}

// === Mudar cor da íris ===
const changeColor = () => {
  const next = colors[Math.floor(Math.random() * colors.length)]
  irisColor.value = next
}

// === Reagir a qualquer clique de botão global ===
const handleGlobalButtonClick = (event) => {
  if (event.target.closest("button")) {
    changeColor()
  }
}

onMounted(() => {
  eyeElement = document.querySelector(".eye")
  window.addEventListener("mousemove", handleMouseMove)
  document.addEventListener("click", handleGlobalButtonClick)
  blink()

  // Ativar sensores móveis
  if (window.DeviceOrientationEvent) {
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      // iOS exige permissão
      const btn = document.createElement("button")
      btn.textContent = "Ativar Movimento 👁️"
      Object.assign(btn.style, {
        position: "fixed",
        bottom: "10px",
        left: "10px",
        zIndex: "10000",
        padding: "8px 14px",
        borderRadius: "8px",
        background: "#6b21a8",
        color: "#fff",
        border: "none",
        cursor: "pointer"
      })
      btn.onclick = async () => {
        try {
          const response = await DeviceOrientationEvent.requestPermission()
          if (response === "granted") {
            window.addEventListener("deviceorientation", handleDeviceOrientation)
            btn.remove()
          } else {
            btn.textContent = "Permissão negada ❌"
          }
        } catch (err) {
          console.error(err)
        }
      }
      document.body.appendChild(btn)
    } else {
      // Android / Laptops com sensor
      window.addEventListener("deviceorientation", handleDeviceOrientation)
    }
  }
})

onUnmounted(() => {
  window.removeEventListener("mousemove", handleMouseMove)
  document.removeEventListener("click", handleGlobalButtonClick)
  window.removeEventListener("deviceorientation", handleDeviceOrientation)
})
</script>

<style scoped>
.floating-eye {
  position: fixed;
  top: 15px;
  left: 15px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 9999;
  animation: float 4s ease-in-out infinite;
  transition: transform 0.25s ease-out; /* suaviza o movimento do tilt */
}

@keyframes float {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

.eye {
  width: 50px;
  height: 30px;
  border-radius: 50% / 50%;
  background: radial-gradient(circle at 50% 55%, #ffffff 0%, #e1e1e1 95%);
  position: relative;
  box-shadow:
    inset 0 3px 6px rgba(0, 0, 0, 0.2),
    0 2px 5px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transition: height 0.15s ease;
}
.eye.blinking { height: 5px; }

.sclera {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
  background: radial-gradient(circle at 50% 55%, #ffffff 0%, #f0f0f0 80%, #e1e1e1 95%);
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1), inset 0 -1px 2px rgba(0,0,0,0.05);
}

.iris {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  position: relative;
  transition: transform 0.15s ease-out, background 1.2s ease-in-out, box-shadow 1s ease-in-out;
  background: radial-gradient(circle at 50% 55%, #a855f7 0%, #6b21a8 90%);
  box-shadow:
    0 0 10px rgba(168, 85, 247, 0.6),
    inset 0 2px 4px rgba(255, 255, 255, 0.15),
    inset 0 -2px 4px rgba(0, 0, 0, 0.6);
}
.iris-core { position: absolute; inset: 0; border-radius: 50%; background: radial-gradient(circle at 50% 50%, #d8b4fe 0%, #5b21b6 85%); mix-blend-mode: overlay; }
.iris-fibers { position: absolute; inset: 0; border-radius: 50%; background: repeating-conic-gradient(rgba(255,255,255,0.08) 0deg 8deg, transparent 8deg 16deg); mix-blend-mode: overlay; animation: rotateFibers 25s linear infinite; opacity: 0.8; }
.iris-glow { position: absolute; inset: 0; border-radius: 50%; background: radial-gradient(circle at 45% 60%, rgba(168,85,247,0.7), transparent 80%); filter: blur(2px); mix-blend-mode: screen; }
.pupil { position: absolute; top: 50%; left: 50%; width: 10px; height: 10px; transform: translate(-50%, -50%); background: radial-gradient(circle at 40% 40%, #000 0%, #111 100%); border-radius: 50%; }
.reflection-main { position: absolute; top: 18%; left: 25%; width: 5px; height: 5px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,0.95), transparent); filter: blur(0.5px); }
.reflection-small { position: absolute; top: 28%; right: 25%; width: 3px; height: 3px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,0.4), transparent); filter: blur(0.7px); }

@keyframes rotateFibers { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
