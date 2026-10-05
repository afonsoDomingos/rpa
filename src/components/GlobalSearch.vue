<template>
  <div class="search-wrapper">
    <!-- Botão Gatilho (Navbar) -->
    <button
      class="search-trigger"
      type="button"
      @click="openSearch"
      title="Pesquisar (Ctrl + K)"
      aria-label="Abrir pesquisa global"
    >
      <i class="bi bi-search search-trigger-icon"></i>
      <span class="search-trigger-text d-none d-xl-inline">Buscar...</span>
      <kbd class="search-trigger-badge d-none d-xl-inline">⌘K</kbd>
    </button>

    <!-- Modal Overlay Teleportado diretamente para o body para evitar restrições de CSS da Navbar -->
    <Teleport to="body">
      <transition name="search-fade">
        <div
          v-if="isOpen"
          class="search-overlay"
          @click.self="closeSearch"
          role="dialog"
          aria-modal="true"
        >
          <div class="search-modal">
            <!-- Header da Busca -->
            <div class="search-header">
              <div class="search-input-icon">
                <i class="bi bi-search"></i>
              </div>
              <input
                ref="searchInput"
                v-model="query"
                type="text"
                placeholder="Pesquisar páginas, ferramentas, colaboradores..."
                class="search-input"
                autocomplete="off"
                spellcheck="false"
                @keydown.down.prevent="navigateResults(1)"
                @keydown.up.prevent="navigateResults(-1)"
                @keydown.enter.prevent="selectResult"
                @keydown.esc="closeSearch"
              />
              <button
                class="btn-close-search"
                type="button"
                @click="closeSearch"
                aria-label="Fechar busca"
              >
                <span class="kbd-esc d-none d-md-inline">ESC</span>
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

            <!-- Resultados -->
            <div class="search-body custom-scrollbar">
              <!-- Loading -->
              <div v-if="loading" class="search-feedback">
                <div class="spinner-border spinner-border-sm text-purple mb-2" role="status"></div>
                <p class="text-sm m-0 text-muted">Procurando...</p>
              </div>

              <!-- Sem resultados -->
              <div v-else-if="query && filteredResults.length === 0" class="search-feedback">
                <i class="bi bi-search-heart fs-3 text-muted mb-2 d-block"></i>
                <p class="text-sm m-0 text-dark fw-bold">Nenhum resultado para "{{ query }}"</p>
                <small class="text-muted">Tente palavras como "currículo", "anúncios" ou "pagamentos"</small>
              </div>

              <!-- Lista de Resultados -->
              <div v-else class="results-list">
                <div
                  v-for="(group, groupName) in groupedResults"
                  :key="groupName"
                  class="result-group"
                >
                  <div class="group-title">{{ groupName }}</div>

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
                      <div class="result-title">{{ item.title }}</div>
                      <div v-if="item.description" class="result-desc">
                        {{ item.description }}
                      </div>
                    </div>
                    <div class="result-arrow">
                      <i class="bi bi-chevron-right"></i>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <!-- Rodapé -->
            <div class="search-footer">
              <div class="footer-desktop d-none d-md-flex">
                <div class="footer-item">
                  <kbd>↵</kbd> <span>Selecionar</span>
                </div>
                <div class="footer-item">
                  <kbd>↓</kbd><kbd>↑</kbd> <span>Navegar</span>
                </div>
                <div class="footer-item">
                  <kbd>ESC</kbd> <span>Fechar</span>
                </div>
              </div>
              <div class="footer-mobile d-md-none text-center w-100">
                <span class="text-muted">💡 Toque em um item para acessar</span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const isOpen = ref(false);
const query = ref('');
const searchInput = ref(null);
const activeIndex = ref(0);
const loading = ref(false);

// Itens indexados para pesquisa inteligente
const navigationItems = [
  // Páginas Públicas
  { title: 'Início', description: 'Página principal e introdução', icon: 'bi bi-house-door', route: 'presentation', group: 'Navegação' },
  { title: 'Sobre Nós', description: 'Conheça o projeto e nossa missão', icon: 'bi bi-info-circle', route: 'about', group: 'Navegação' },
  { title: 'Contactos', description: 'Fale diretamente com nossa equipe', icon: 'bi bi-envelope', route: 'contactus', group: 'Navegação' },
  { title: 'Autor', description: 'Desenvolvedor e responsáveis pela plataforma', icon: 'bi bi-person-workspace', route: 'author', group: 'Navegação' },

  // Ferramentas RPA
  { title: 'Gerador de Currículo', description: 'Crie seu CV profissional em PDF', icon: 'bi bi-file-earmark-person', route: 'CVGenerator', group: 'Ferramentas' },
  { title: 'Meus Anúncios', description: 'Gerencie suas publicações e anúncios', icon: 'bi bi-megaphone', route: 'MeusAnuncios', group: 'Ferramentas' },
  { title: 'Feed & Comunidade', description: 'Interações e publicações da comunidade RPA', icon: 'bi bi-people', route: 'ComunidadeRpa', group: 'Ferramentas' },
  { title: 'Armazenar Documentos', description: 'Guarde seus documentos com segurança', icon: 'bi bi-folder-plus', route: 'GuardarDocumentos', group: 'Ferramentas' },
  { title: 'Rastreador de Viaturas', description: 'Localização e acompanhamento de veículos', icon: 'bi bi-car-front', route: 'Viaturas', group: 'Ferramentas' },
  { title: 'Guia de Documentos', description: 'Instruções e modelos de documentação', icon: 'bi bi-journal-check', route: 'GuiaDocumentos', group: 'Ferramentas' },

  // Conta & Assinaturas
  { title: 'Assinaturas & Planos', description: 'Planos mensais e benefícios VIP', icon: 'bi bi-gem', route: 'Assinaturas', group: 'Conta' },
  { title: 'Meus Pagamentos', description: 'Histórico de transações e comprovativos', icon: 'bi bi-credit-card', route: 'MeusPagamentos', group: 'Conta' },
  { title: 'Meus Documentos', description: 'Documentos cadastrados na sua conta', icon: 'bi bi-folder2-open', route: 'MeusDocumentos', group: 'Conta' },

  // Admin
  { title: 'Dashboard Administrativo', description: 'Métricas e visão geral do sistema', icon: 'bi bi-speedometer2', route: 'dashboard', group: 'Administração' },
  { title: 'Gestão de Pagamentos', description: 'Validação e controle financeiro', icon: 'bi bi-wallet2', route: 'AdminAssinaturas', group: 'Administração' },
  { title: 'Gestão de Colaboradores', description: 'Equipe interna e permissões', icon: 'bi bi-person-badge', route: 'AdminGestao', group: 'Administração' },
  { title: 'Gerenciar Anúncios', description: 'Moderação de anúncios da plataforma', icon: 'bi bi-megaphone-fill', route: 'AdminAnuncios', group: 'Administração' },
  { title: 'Validar Comprovativos', description: 'Aprovação de comprovantes enviados', icon: 'bi bi-receipt-cutoff', route: 'AdminComprovativos', group: 'Administração' },
];

// Filtra resultados com base na pesquisa
const filteredResults = computed(() => {
  if (!query.value.trim()) return navigationItems.slice(0, 7); // Sugestões iniciais

  const term = query.value.toLowerCase().trim();
  return navigationItems.filter(item =>
    item.title.toLowerCase().includes(term) ||
    item.description.toLowerCase().includes(term) ||
    item.group.toLowerCase().includes(term)
  );
});

// Agrupa resultados por categoria
const groupedResults = computed(() => {
  const groups = {};
  filteredResults.value.forEach(item => {
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group].push(item);
  });
  return groups;
});

const getItemGlobalIndex = (targetItem) => {
  return filteredResults.value.findIndex(item => item === targetItem);
};

const navigateResults = (direction) => {
  const max = filteredResults.value.length - 1;
  if (max < 0) return;
  const newIndex = activeIndex.value + direction;
  if (newIndex < 0) activeIndex.value = max;
  else if (newIndex > max) activeIndex.value = 0;
  else activeIndex.value = newIndex;
};

const executeAction = (item) => {
  if (item.route) {
    router.push({ name: item.route }).catch(() => {});
    closeSearch();
  }
};

const selectResult = () => {
  const item = filteredResults.value[activeIndex.value];
  if (item) executeAction(item);
};

const openSearch = () => {
  isOpen.value = true;
  query.value = '';
  activeIndex.value = 0;
  nextTick(() => {
    if (searchInput.value) {
      searchInput.value.focus();
    }
  });
};

const closeSearch = () => {
  isOpen.value = false;
};

const handleKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (isOpen.value) closeSearch();
    else openSearch();
  }
};

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
.search-wrapper {
  display: inline-flex;
  align-items: center;
}

/* BOTÃO GATILHO NA NAVBAR */
.search-trigger {
  background: rgba(128, 0, 128, 0.08);
  border: 1px solid rgba(128, 0, 128, 0.18) !important;
  color: #800080 !important;
  border-radius: 10px;
  height: 38px;
  min-width: 38px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  outline: none !important;
  box-shadow: 0 2px 6px rgba(128, 0, 128, 0.08);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent !important;
}

.search-trigger:hover {
  background: rgba(128, 0, 128, 0.14);
  border-color: #800080 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(128, 0, 128, 0.18);
}

.search-trigger:active {
  transform: scale(0.95);
}

.search-trigger-icon {
  font-size: 1rem;
  line-height: 1;
}

.search-trigger-text {
  font-size: 0.84rem;
  font-weight: 500;
  color: #555;
}

.search-trigger-badge {
  font-size: 0.68rem;
  background: rgba(128, 0, 128, 0.12);
  color: #800080;
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid rgba(128, 0, 128, 0.2);
  font-family: inherit;
  font-weight: 600;
}

/* OVERLAY DO MODAL */
.search-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(15, 10, 25, 0.65) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  z-index: 999999 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: flex-start !important;
  padding: 16px !important;
}

/* MODAL CARD */
.search-modal {
  background: #ffffff !important;
  width: 100% !important;
  max-width: 580px !important;
  margin-top: clamp(20px, 8vh, 80px) !important;
  border-radius: 18px !important;
  box-shadow: 0 25px 60px -10px rgba(80, 0, 80, 0.35), 0 0 0 1px rgba(128, 0, 128, 0.15) !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  animation: searchModalSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

@keyframes searchModalSlide {
  from {
    opacity: 0;
    transform: translateY(-16px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* HEADER */
.search-header {
  display: flex !important;
  align-items: center !important;
  padding: 14px 18px !important;
  gap: 12px !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07) !important;
  background: #ffffff !important;
}

.search-input-icon {
  color: #800080 !important;
  font-size: 1.25rem !important;
  display: flex !important;
  align-items: center !important;
  flex-shrink: 0 !important;
}

.search-input {
  flex: 1 !important;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  font-size: 1rem !important;
  font-weight: 500 !important;
  color: #1e293b !important;
  padding: 4px 0 !important;
}

.search-input::placeholder {
  color: #94a3b8 !important;
  font-weight: 400 !important;
}

.btn-close-search {
  background: rgba(0, 0, 0, 0.05) !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  border-radius: 8px !important;
  padding: 6px 10px !important;
  color: #64748b !important;
  font-size: 0.82rem !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  outline: none !important;
}

.btn-close-search:hover {
  background: rgba(128, 0, 128, 0.1) !important;
  color: #800080 !important;
  border-color: rgba(128, 0, 128, 0.2) !important;
}

.kbd-esc {
  font-family: inherit;
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.5px;
}

/* CORPO DE RESULTADOS */
.search-body {
  max-height: 52vh !important;
  overflow-y: auto !important;
  padding: 8px 0 !important;
  background: #ffffff !important;
  overscroll-behavior: contain !important;
}

.search-feedback {
  padding: 36px 20px !important;
  text-align: center !important;
}

.group-title {
  padding: 10px 18px 4px !important;
  font-size: 0.72rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.6px !important;
  color: #800080 !important;
}

.result-item {
  display: flex !important;
  align-items: center !important;
  padding: 11px 18px !important;
  gap: 14px !important;
  text-decoration: none !important;
  color: #1e293b !important;
  transition: background 0.15s ease, transform 0.15s ease !important;
  border-left: 3px solid transparent !important;
  cursor: pointer !important;
}

.result-item:hover,
.result-item.active {
  background: rgba(128, 0, 128, 0.06) !important;
  border-left-color: #800080 !important;
}

.result-icon {
  width: 38px !important;
  height: 38px !important;
  border-radius: 10px !important;
  background: rgba(128, 0, 128, 0.08) !important;
  color: #800080 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 1.15rem !important;
  flex-shrink: 0 !important;
  transition: transform 0.2s ease !important;
}

.result-item:hover .result-icon,
.result-item.active .result-icon {
  transform: scale(1.08);
  background: #800080 !important;
  color: #ffffff !important;
}

.result-content {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

.result-title {
  font-weight: 600 !important;
  font-size: 0.94rem !important;
  color: #1e293b !important;
  line-height: 1.35 !important;
}

.result-desc {
  font-size: 0.8rem !important;
  color: #64748b !important;
  margin-top: 2px !important;
  line-height: 1.3 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.result-arrow {
  color: #94a3b8 !important;
  font-size: 0.9rem !important;
  opacity: 0.5 !important;
  transition: all 0.2s ease !important;
  flex-shrink: 0 !important;
}

.result-item:hover .result-arrow,
.result-item.active .result-arrow {
  opacity: 1 !important;
  color: #800080 !important;
  transform: translateX(3px) !important;
}

/* RODAPÉ */
.search-footer {
  padding: 10px 18px !important;
  background: #f8fafc !important;
  border-top: 1px solid rgba(0, 0, 0, 0.06) !important;
  font-size: 0.75rem !important;
  color: #64748b !important;
}

.footer-desktop {
  display: flex !important;
  gap: 16px !important;
}

.footer-item {
  display: flex !important;
  align-items: center !important;
  gap: 5px !important;
}

.footer-item kbd {
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
  border-radius: 4px !important;
  padding: 1px 5px !important;
  font-size: 0.72rem !important;
  color: #475569 !important;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05) !important;
}

/* TRANSIÇÃO DO MODAL */
.search-fade-enter-active,
.search-fade-leave-active {
  transition: opacity 0.2s ease;
}

.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
}

/* SCROLLBAR CUSTOMIZADA */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(128, 0, 128, 0.2);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(128, 0, 128, 0.4);
}

/* RESPONSIVO MOBILE */
@media (max-width: 768px) {
  .search-modal {
    margin-top: 10px !important;
    border-radius: 16px !important;
    max-height: 82vh !important;
  }
  .search-header {
    padding: 12px 14px !important;
  }
  .search-input {
    font-size: 0.94rem !important;
  }
  .result-item {
    padding: 10px 14px !important;
    gap: 12px !important;
  }
  .result-icon {
    width: 36px !important;
    height: 36px !important;
    font-size: 1.05rem !important;
  }
  .result-title {
    font-size: 0.9rem !important;
  }
}
</style>
