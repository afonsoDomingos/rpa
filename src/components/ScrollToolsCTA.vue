<template>
  <transition name="slide-up">
    <div v-if="isVisible" class="tools-bar">
      <div class="main-cta">
        <i class="bi bi-stars"></i>
        <span>Ferramentas</span>
      </div>

      <div class="tools-list">
        <div
          v-for="(tool, i) in tools"
          :key="i"
          class="tool-item"
          :style="{ animationDelay: i * 0.09 + 0.4 + 's' }"
          @click.stop="goTo(tool.route)"
        >
          <i :class="tool.icon"></i>
          <span class="tool-label">{{ tool.short }}</span>
        </div>
      </div>

      <button @click.stop="closeCTA" class="close-btn">
        <i class="bi bi-x"></i>
      </button>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isVisible = ref(false)

const tools = [
  { short: 'CV',       name: 'Gerador de CV',      icon: 'bi bi-file-earmark-person', route: 'CVGenerator' },
  { short: 'Anúncios', name: 'Meus Anúncios',      icon: 'bi bi-megaphone',           route: 'MeusAnuncios' },
  { short: 'Feed',     name: 'Feed da Comunidade', icon: 'bi bi-people-fill',         route: 'ComunidadeRpa' },
  { short: 'Docs',     name: 'Guardar Documentos', icon: 'bi bi-folder-plus',         route: 'GuardarDocumentos' },
  { short: 'Carro',    name: 'Rastreador',         icon: 'bi bi-car-front',           route: 'Viaturas' },
]

const showCTA = () => {
  if (isVisible.value) return
  isVisible.value = true
  setTimeout(() => { isVisible.value = false }, 15000)
}

onMounted(() => {
  let triggered = false
  const handle = () => {
    if (!triggered && window.scrollY > 250) {
      showCTA()
      triggered = true
      window.removeEventListener('scroll', handle)
    }
  }
  window.addEventListener('scroll', handle)
})

const closeCTA = () => { isVisible.value = false }
const goTo = (route) => {
  closeCTA()
  router.push({ name: route })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.tools-bar {
  position: fixed;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100vw - 60px);     /* largura bem maior */
  max-width: 620px;              /* mais espaço confortável */
  height: 56px;
  background: rgba(255, 255, 255, 0.28);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1.6px solid rgba(128, 0, 128, 0.4);
  border-radius: 32px;
  box-shadow: 0 10px 30px rgba(128, 0, 128, 0.2);
  z-index: 9999;
  display: flex;
  align-items: center;
  padding: 0 28px;               /* mais padding interno */
  gap: 20px;                     /* espaço generoso entre itens */
  color: #000;
  animation: float 6s ease-in-out infinite;
}

/* CTA */
.main-cta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 0.94rem;
  color: #000;
  background: rgba(128, 0, 128, 0.22);
  padding: 7px 14px;
  border-radius: 20px;
  white-space: nowrap;
}

.main-cta i { font-size: 1.2rem; color: #800080; }

/* Ferramentas com bom espaçamento */
.tools-list {
  display: flex;
  gap: 18px;                     /* mais espaço entre ferramentas */
  flex: 1;
  justify-content: flex-end;
}

.tool-item {
  opacity: 0;
  transform: translateY(12px);
  animation: slideUpFade 0.5s ease forwards;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 14px;
  background: rgba(128, 0, 128, 0.18);
  border: 1px solid rgba(128, 0, 128, 0.32);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 56px;
}

.tool-item:hover {
  background: rgba(128, 0, 128, 0.36);
  transform: translateY(-5px);
}

.tool-item i {
  font-size: 1.15rem;
  color: #800080;
}

.tool-label {
  font-size: 0.74rem;
  font-weight: 600;
  color: #000;
}

/* Botão X com bom espaçamento */
.close-btn {
  margin-left: 16px;             /* espaço confortável à esquerda */
  background: rgba(128, 0, 128, 0.25);
  border: 1.6px solid #800080;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: #000;
  font-size: 1.4rem;
  font-weight: bold;
  flex-shrink: 0;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #800080;
  color: white;
  transform: scale(1.15);
}

/* Animações */
@keyframes float { 0%,100%{transform:translateX(-50%)translateY(0)} 50%{transform:translateX(-50%)translateY(-7px)} }
@keyframes slideUpFade { to { opacity:1; transform:translateY(0) } }
.slide-up-enter-active { transition: all 0.6s cubic-bezier(0.22,1,0.36,1); }
.slide-up-enter-from   { opacity:0; transform:translateX(-50%)translateY(100px); }

/* Mobile – ainda confortável */
@media (max-width: 480px) {
  .tools-bar {
    width: calc(100vw - 40px);
    max-width: 560px;
    padding: 0 20px;
    gap: 14px;
    height: 54px;
  }
  .tool-item { padding: 7px 10px; min-width: 50px; }
  .tool-label { font-size: 0.7rem; }
}
</style>