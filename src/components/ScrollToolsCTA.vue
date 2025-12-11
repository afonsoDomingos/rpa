<template>
  <!-- Botão pequeno "Ver Ferramentas" (aparece após scroll e some em 7s) -->
  <transition name="quick-fade">
    <div
      v-if="!isExpanded && showTrigger"
      class="mini-bar"
      @click.stop="isExpanded = true"
    >
      <i class="bi bi-stars"></i>
      Ver Ferramentas
    </div>
  </transition>

  <!-- Barra expandida com apenas ícones -->
  <transition name="fast-slide">
    <div v-if="isExpanded" class="tools-expanded" @click.stop>
      <div class="tools-grid">
        <div
          v-for="(tool, i) in tools"
          :key="i"
          class="tool-icon"
          @click.stop="goTo(tool.route)"
        >
          <i :class="tool.icon"></i>
          <span class="tooltip">{{ tool.name }}</span>
        </div>
      </div>

      <button @click.stop="isExpanded = false" class="close-btn">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
  </transition>

  <!-- Overlay invisível para fechar clicando fora -->
  <transition name="fade">
    <div v-if="isExpanded" class="overlay" @click="isExpanded = false" />
  </transition>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const isExpanded = ref(false);
const showTrigger = ref(false);

const tools = [
  {
    name: "Gerador de CV",
    icon: "bi bi-file-earmark-person",
    route: "CVGenerator",
  },
  { name: "Meus Anúncios", icon: "bi bi-megaphone", route: "MeusAnuncios" },
  {
    name: "Feed da Comunidade",
    icon: "bi bi-people-fill",
    route: "ComunidadeRpa",
  },
  {
    name: "Guardar Documentos",
    icon: "bi bi-folder-plus",
    route: "GuardarDocumentos",
  },
  {
    name: "Rastreador de Viaturas",
    icon: "bi bi-car-front",
    route: "Viaturas",
  },
];

onMounted(() => {
  let triggered = false;
  const handleScroll = () => {
    if (!triggered && window.scrollY > 280) {
      showTrigger.value = true;
      triggered = true;
      window.removeEventListener("scroll", handleScroll);

      // Some automaticamente em 7 segundos se não clicar
      setTimeout(() => {
        if (!isExpanded.value) {
          showTrigger.value = false;
        }
      }, 7000);
    }
  };
  window.addEventListener("scroll", handleScroll);
});

const goTo = (route) => {
  isExpanded.value = false;
  setTimeout(() => {
    router.push({ name: route });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 100);
};
</script>

<style scoped>
/* Botão pequeno e discreto – fundo branco, texto roxo */
.mini-bar {
  position: fixed;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.98);
  color: #800080;
  border: 1.8px solid #800080;
  padding: 8px 16px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 20px rgba(128, 0, 128, 0.32);
  backdrop-filter: blur(12px);
  cursor: pointer;
  z-index: 9999;
  white-space: nowrap;
  animation: float 3.5s ease-in-out infinite;
  transition: all 0.25s ease;
}

.mini-bar i {
  font-size: 1.15rem;
  color: #800080;
}

.mini-bar:hover {
  background: #800080;
  color: white;
  transform: translateX(-50%) translateY(-5px);
  box-shadow: 0 10px 28px rgba(128, 0, 128, 0.45);
}

.mini-bar:hover i {
  color: white;
}

/* Barra expandida com ícones */
.tools-expanded {
  position: fixed;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.34);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1.8px solid rgba(128, 0, 128, 0.45);
  border-radius: 32px;
  padding: 16px 26px;
  box-shadow: 0 12px 38px rgba(128, 0, 128, 0.3);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 18px;
}

.tools-grid {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.tool-icon {
  position: relative;
  width: 54px;
  height: 54px;
  background: rgba(128, 0, 128, 0.2);
  border: 1.6px solid rgba(128, 0, 128, 0.4);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.22s ease;
}

.tool-icon:hover {
  background: rgba(128, 0, 128, 0.45);
  transform: translateY(-7px) scale(1.14);
  border-color: #800080;
}

.tool-icon i {
  font-size: 1.55rem;
  color: #800080;
}

/* Tooltip */
.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-6px);
  background: #333;
  color: white;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.82rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.tool-icon:hover .tooltip {
  opacity: 1;
}

/* Botão X */
.close-btn {
  width: 42px;
  height: 42px;
  background: rgba(128, 0, 128, 0.25);
  border: 2px solid #800080;
  border-radius: 50%;
  color: #800080;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.22s;
}

.close-btn:hover {
  background: #800080;
  color: white;
  transform: scale(1.18);
}

/* Overlay para fechar ao clicar fora */
.overlay {
  position: fixed;
  inset: 0;
  background: transparent;
  z-index: 9998;
}

/* Animações rápidas */
@keyframes float {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-6px);
  }
}

.quick-fade-enter-active,
.quick-fade-leave-active {
  transition: all 0.28s ease;
}
.quick-fade-enter-from,
.quick-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) scale(0.88);
}

.fast-slide-enter-active,
.fast-slide-leave-active {
  transition: all 0.26s ease;
}
.fast-slide-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(50px);
}
.fast-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(30px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

/* Mobile */
@media (max-width: 480px) {
  .mini-bar {
    bottom: 14px;
    padding: 7px 14px;
    font-size: 0.85rem;
    gap: 6px;
  }
  .mini-bar i {
    font-size: 1.1rem;
  }
  .tools-expanded {
    padding: 12px 18px;
    gap: 14px;
    bottom: 14px;
  }
  .tool-icon {
    width: 48px;
    height: 48px;
  }
  .tool-icon i {
    font-size: 1.4rem;
  }
}
</style>
