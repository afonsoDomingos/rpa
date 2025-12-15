<template>
  <!-- Botão pequeno "Ver Ferramentas" (aparece após scroll e some em 7s) -->
  <transition name="quick-fade">
    <div v-if="!isExpanded && showTrigger" class="mini-bar-container">
      <div class="mini-bar" @click.stop="isExpanded = true">
        <i class="bi bi-stars"></i>
        Ver Ferramentas
      </div>
      <button class="mini-close-btn" @click.stop="closeAll">
        <i class="bi bi-x"></i>
      </button>
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
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const isExpanded = ref(false);
const showTrigger = ref(false);
let autoHideTimer = null;
let intervalLoop = null;

// Ferramentas disponíveis
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

// Mostra a barra e agenda o desaparecimento em 15s
const showBar = () => {
  if (isExpanded.value) return; // Se já tiver aberto, não mexe
  showTrigger.value = true;
  
  // Limpa timer anterior se existir
  if (autoHideTimer) clearTimeout(autoHideTimer);
  
  // Esconde após 15 segundos se não for expandido
  autoHideTimer = setTimeout(() => {
    if (!isExpanded.value) {
      showTrigger.value = false;
    }
  }, 15000);
};

// Fecha manualmente (X no mini-bar ou na barra expandida)
const closeAll = () => {
  isExpanded.value = false;
  showTrigger.value = false;
  if (autoHideTimer) clearTimeout(autoHideTimer);
};

onMounted(() => {
  // 1. Mostrar ao fazer scroll inicial (> 280px)
  const handleScroll = () => {
    if (window.scrollY > 280) {
      showBar();
      window.removeEventListener("scroll", handleScroll); // Remove listener de scroll inicial
    }
  };
  window.addEventListener("scroll", handleScroll);

  // 2. Repetir a cada 15 minutos (900.000 ms)
  intervalLoop = setInterval(() => {
    showBar();
  }, 15 * 60 * 1000);
});

onUnmounted(() => {
  if (intervalLoop) clearInterval(intervalLoop);
  if (autoHideTimer) clearTimeout(autoHideTimer);
});

const goTo = (route) => {
  isExpanded.value = false;
  showTrigger.value = false; // Fecha também o trigger
  setTimeout(() => {
    router.push({ name: route });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 100);
};
</script>

<style scoped>
/* Container para alinhar o botão e o X */
.mini-bar-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 9999;
  animation: float 4s ease-in-out infinite;
}

/* Botão pequeno e discreto – Branco puro */
.mini-bar {
  background: #ffffff;
  color: #555;
  border: 1px solid #eee;
  padding: 8px 16px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* Sombra suave */
  backdrop-filter: blur(10px);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.mini-bar i {
  font-size: 1rem;
  color: #800080; /* Apenas o ícone mantém a cor da marca */
}

.mini-bar:hover {
  background: #f9f9f9;
  color: #333;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  border-color: #e0e0e0;
}

/* Botão X pequeno fora da barra */
.mini-close-btn {
  width: 24px;
  height: 24px;
  background: white;
  border: 1px solid #eee;
  border-radius: 50%;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.2s;
  padding: 0;
}

.mini-close-btn:hover {
  background: #fff;
  color: #e53935;
  border-color: #e53935;
  transform: scale(1.1);
}

/* Barra expandida Branca */
.tools-expanded {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 24px;
  padding: 12px 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 90vw;
}

.tools-grid {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.tool-icon {
  position: relative;
  width: 42px;
  height: 42px;
  background: #f8f9fa; /* Cinza super claro */
  border: 1px solid #eee;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-icon:hover {
  background: #ffffff;
  border-color: #800080;
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(128, 0, 128, 0.1);
}

.tool-icon i {
  font-size: 1.25rem;
  color: #666;
  transition: color 0.2s;
}

.tool-icon:hover i {
  color: #800080;
}

/* Tooltip (Apenas Desktop) */
.tooltip {
  position: absolute;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  color: #333;
  border: 1px solid #eee;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  font-weight: 500;
}

.tool-icon:hover .tooltip {
  opacity: 1;
}

/* Botão X */
.close-btn {
  width: 32px;
  height: 32px;
  background: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 50%;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.close-btn:hover {
  background: #fff;
  color: #e53935; /* Fica vermelho ao passar o rato para indicar fechar */
  border-color: #e53935;
  box-shadow: 0 2px 8px rgba(229, 57, 53, 0.15);
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.1); /* Overlay super leve */
  backdrop-filter: blur(1px);
  z-index: 9998;
}

/* Animações */
@keyframes float {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-5px); }
}

.quick-fade-enter-active, .quick-fade-leave-active { transition: all 0.3s ease; }
.quick-fade-enter-from, .quick-fade-leave-to { opacity: 0; transform: translateX(-50%) scale(0.9); }

.fast-slide-enter-active, .fast-slide-leave-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.fast-slide-enter-from, .fast-slide-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }

/* Mobile Otimizações */
@media (max-width: 600px) {
  .tools-expanded {
    bottom: 16px;
    padding: 8px 10px;
    gap: 6px;
    border-radius: 18px;
    overflow-x: auto;
    justify-content: flex-start;
  }
  
  .tools-grid {
    flex-wrap: nowrap;
    gap: 6px;
  }
  
  .tool-icon {
    width: 34px; /* Menor */
    height: 34px; /* Menor */
    border-radius: 8px;
    flex-shrink: 0;
  }
  
  .tool-icon i {
    font-size: 1rem; /* Menor */
  }
  
  .tooltip {
    display: none;
  }
  
  .close-btn {
    width: 28px; /* Menor */
    height: 28px; /* Menor */
    font-size: 0.9rem;
    margin-left: auto;
  }
}
</style>
