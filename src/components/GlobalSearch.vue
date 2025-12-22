<template>
  <div>
    <!-- Botão Gatilho (Navbar) -->
    <button class="search-trigger" @click="isOpen = true" title="Pesquisar (Ctrl + K)">
      <i class="bi bi-search"></i>
      <span class="d-none d-md-inline ms-2 text-xs opacity-7">Ctrl + K</span>
    </button>

    <!-- Modal Overlay -->
    <transition name="fade">
      <div v-if="isOpen" class="search-overlay" @click.self="closeSearch">
        <div class="search-modal">
          <!-- Header Busca -->
          <div class="search-header">
            <i class="bi bi-search search-icon"></i>
            <input
              ref="searchInput"
              v-model="query"
              type="text"
              placeholder="Pesquisar páginas, ferramentas ou colaboradores..."
              class="search-input"
              @keydown.down.prevent="navigateResults(1)"
              @keydown.up.prevent="navigateResults(-1)"
              @keydown.enter.prevent="selectResult"
              @keydown.esc="closeSearch"
            />
            <button class="btn-close-search" @click="closeSearch">ESC</button>
          </div>

          <!-- Resultados -->
          <div class="search-body custom-scrollbar">
            <!-- Loading -->
            <div v-if="loading" class="p-4 text-center text-muted">
              <div class="spinner-border spinner-border-sm text-purple mb-2" role="status"></div>
              <p class="text-xs m-0">Procurando...</p>
            </div>

            <!-- Sem resultados -->
            <div v-else-if="query && filteredResults.length === 0" class="p-5 text-center text-muted">
              <i class="bi bi-emoji-frown fs-4 mb-2 d-block"></i>
              <p class="text-sm m-0">Nenhum resultado encontrado para "{{ query }}"</p>
            </div>

            <!-- Lista de Resultados -->
            <div v-else class="results-list">
              <div v-for="(group, groupName) in groupedResults" :key="groupName" class="result-group">
                <h6 class="group-title">{{ groupName }}</h6>
                
                <a
                  v-for="(item, index) in group"
                  :key="index"
                  href="#"
                  class="result-item"
                  :class="{ 'active': activeIndex === getItemGlobalIndex(item) }"
                  @click.prevent="executeAction(item)"
                  @mouseenter="activeIndex = getItemGlobalIndex(item)"
                >
                  <div class="result-icon">
                    <i :class="item.icon"></i>
                  </div>
                  <div class="result-content">
                    <span class="result-title">{{ item.title }}</span>
                    <span v-if="item.description" class="result-desc">{{ item.description }}</span>
                  </div>
                  <i class="bi bi-arrow-return-left action-icon"></i>
                </a>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="search-footer">
            <div class="footer-item">
              <i class="bi bi-arrow-return-left"></i> <span class="ms-1">Selecionar</span>
            </div>
            <div class="footer-item">
              <i class="bi bi-arrow-down-short"></i><i class="bi bi-arrow-up-short"></i> <span class="ms-1">Navegar</span>
            </div>
            <div class="footer-item">
              <span class="kbd">ESC</span> <span class="ms-1">Fechar</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isOpen = ref(false);
const query = ref('');
const searchInput = ref(null);
const activeIndex = ref(0);
const loading = ref(false);

// Banco de dados simulado de navegação (Spotlight)
const navigationItems = [
  // Páginas Públicas
  { title: 'Início', description: 'Página principal', icon: 'bi bi-house-door', route: 'presentation', group: 'Navegação' },
  { title: 'Sobre Nós', description: 'Conheça a nossa história', icon: 'bi bi-info-circle', route: 'about', group: 'Navegação' },
  { title: 'Contactos', description: 'Fale com a equipe', icon: 'bi bi-envelope', route: 'contactus', group: 'Navegação' },
  
  // Ferramentas
  { title: 'Gerador de Currículo', description: 'Crie seu CV profissional', icon: 'bi bi-file-earmark-person', route: 'CVGenerator', group: 'Ferramentas' },
  { title: 'Meus Anúncios', description: 'Gerencie suas publicações', icon: 'bi bi-megaphone', route: 'MeusAnuncios', group: 'Ferramentas' },
  { title: 'Comunidade', description: 'Feed de interações', icon: 'bi bi-people', route: 'ComunidadeRpa', group: 'Ferramentas' },
  { title: 'Rastreador de Viaturas', description: 'Localize veículos', icon: 'bi bi-car-front', route: 'Viaturas', group: 'Ferramentas' },
  
  // Admin (Protegido - só deveria aparecer se admin, mas por UX mostramos tudo com redirect no guard)
  { title: 'Dashboard Administrativo', description: 'Visão geral do sistema', icon: 'bi bi-speedometer2', route: 'dashboard', group: 'Admin' },
  { title: 'Gestão de Pagamentos', description: 'Controle financeiro', icon: 'bi bi-wallet2', route: 'AdminAssinaturas', group: 'Admin' },
  { title: 'Gestão de Colaboradores', description: 'Equipe e RH', icon: 'bi bi-person-badge', route: 'AdminGestao', group: 'Admin' },
];

// Computed: Filtra resultados baseados na query
const filteredResults = computed(() => {
  if (!query.value) return navigationItems.slice(0, 5); // Mostrar 5 sugestões iniciais se vazio
  
  const term = query.value.toLowerCase();
  return navigationItems.filter(item => 
    item.title.toLowerCase().includes(term) || 
    item.description.toLowerCase().includes(term)
  );
});

// Computed: Agrupa resultados por categoria
const groupedResults = computed(() => {
  const groups = {};
  filteredResults.value.forEach(item => {
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group].push(item);
  });
  return groups;
});

// Calcula índice global para navegação teclado
const getItemGlobalIndex = (targetItem) => {
  return filteredResults.value.findIndex(item => item === targetItem);
};

// Navegação teclado (Cima/Baixo)
const navigateResults = (direction) => {
  const max = filteredResults.value.length - 1;
  const newIndex = activeIndex.value + direction;
  
  if (newIndex < 0) activeIndex.value = max;
  else if (newIndex > max) activeIndex.value = 0;
  else activeIndex.value = newIndex;
  
  // Scroll automático para item ativo pode ser adicionado aqui
};

// Executar ação
const executeAction = (item) => {
  if (item.route) {
    router.push({ name: item.route });
    closeSearch();
  }
};

const selectResult = () => {
  const item = filteredResults.value[activeIndex.value];
  if (item) executeAction(item);
};

// Abrir/Fechar
const openSearch = () => {
  isOpen.value = true;
  query.value = '';
  activeIndex.value = 0;
  nextTick(() => {
    if (searchInput.value) searchInput.value.focus();
  });
};

const closeSearch = () => {
  isOpen.value = false;
};

// Atalho de Teclado (Ctrl + K)
const handleKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openSearch();
  }
};

// Watcher para resetar index ao buscar
watch(query, () => {
  activeIndex.value = 0;
});

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/* Gatilho na Navbar */
.search-trigger {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  color: var(--text-secondary, #6c757d);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Poppins', sans-serif;
}

[data-theme="dark"] .search-trigger {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.1);
}

.search-trigger:hover {
  background: rgba(128, 0, 128, 0.1);
  border-color: rgba(128, 0, 128, 0.3);
  color: var(--accent-purple, #800080);
}

/* Modal Overlay */
.search-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 10vh;
}

.search-modal {
  background: var(--bg-card, #ffffff);
  width: 100%;
  max-width: 600px;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-color, #dee2e6);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Header */
.search-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color, #dee2e6);
}

.search-icon {
  font-size: 1.2rem;
  color: var(--text-secondary, #6c757d);
  margin-right: 12px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 1.1rem;
  color: var(--text-primary, #212529);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-secondary, #adb5bd);
}

.btn-close-search {
  background: var(--bg-secondary, #f8f9fa);
  border: 1px solid var(--border-color, #dee2e6);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
}

/* Body */
.search-body {
  max-height: 400px;
  overflow-y: auto;
  padding: 12px 0;
}

.group-title {
  padding: 8px 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-secondary, #6c757d);
  margin: 0;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  text-decoration: none;
  color: var(--text-primary);
  transition: background 0.1s;
  cursor: pointer;
  border-left: 3px solid transparent;
}

.result-item:hover, .result-item.active {
  background: var(--bg-secondary, #f8f9fa);
  border-left-color: var(--accent-purple, #800080);
}

.result-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(128, 0, 128, 0.1);
  color: var(--accent-purple, #800080);
  border-radius: 8px;
  margin-right: 14px;
}

.result-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.result-title {
  font-weight: 500;
  font-size: 0.95rem;
}

.result-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.action-icon {
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.2s;
  color: var(--text-secondary);
}

.result-item:hover .action-icon, .result-item.active .action-icon {
  opacity: 1;
  transform: translateX(0);
}

/* Footer */
.search-footer {
  padding: 10px 20px;
  background: var(--bg-secondary, #f8f9fa);
  border-top: 1px solid var(--border-color, #dee2e6);
  display: flex;
  gap: 20px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.footer-item {
  display: flex;
  align-items: center;
}

.kbd {
  background: var(--bg-primary, #fff);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 1px 4px;
  font-family: monospace;
}

.text-purple { color: var(--accent-purple, #800080); }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
</style>
