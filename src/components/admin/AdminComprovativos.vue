<template>
  <div class="container-fluid position-sticky z-index-sticky top-0 px-0">
    <div class="row gx-0">
      <div class="col-12">
        <NavbarDefault :sticky="true" />
      </div>
    </div>
  </div>

  <div class="admin-comprovativos-container">
    <div class="container py-5">
      <!-- Header -->
      <div class="page-header mb-4">
        <button @click="goBack" class="btn-back">
          <i class="bi bi-arrow-left me-2"></i>
          Voltar
        </button>
        <h1 class="page-title mt-3">
          <i class="bi bi-receipt-cutoff me-2"></i>
          Gestão de Comprovativos
        </h1>
        <p class="page-subtitle">Analise e valide os comprovativos de pagamento enviados</p>
      </div>

      <!-- Estatísticas -->
      <div class="stats-grid mb-4">
        <div class="stat-card pending">
          <div class="stat-icon">
            <i class="bi bi-clock-history"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.pendentes }}</h3>
            <p>Pendentes</p>
          </div>
        </div>
        <div class="stat-card approved">
          <div class="stat-icon">
            <i class="bi bi-check-circle"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.aprovados }}</h3>
            <p>Aprovados</p>
          </div>
        </div>
        <div class="stat-card rejected">
          <div class="stat-icon">
            <i class="bi bi-x-circle"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.rejeitados }}</h3>
            <p>Rejeitados</p>
          </div>
        </div>
        <div class="stat-card total">
          <div class="stat-icon">
            <i class="bi bi-folder"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.total }}</h3>
            <p>Total</p>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-section mb-4">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Status</label>
            <select v-model="filtroStatus" class="form-select" @change="filtrarComprovativos">
              <option value="todos">Todos</option>
              <option value="pendente">Pendentes</option>
              <option value="aprovado">Aprovados</option>
              <option value="rejeitado">Rejeitados</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Método de Pagamento</label>
            <select v-model="filtroMetodo" class="form-select" @change="filtrarComprovativos">
              <option value="todos">Todos</option>
              <option value="M-Pesa">M-Pesa</option>
              <option value="Emola">Emola</option>
              <option value="NIB BIM">NIB BIM</option>
              <option value="PayPal">PayPal</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Buscar</label>
            <input
              v-model="busca"
              type="text"
              class="form-control"
              placeholder="Nome, email, referência..."
              @input="filtrarComprovativos"
            />
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-purple" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
        <p class="mt-3 text-muted">Carregando comprovativos...</p>
      </div>

      <!-- Lista de Comprovativos -->
      <div v-else-if="comprovativosFiltrados.length > 0" class="comprovativos-list">
        <div
          v-for="comp in comprovativosFiltrados"
          :key="comp.id"
          class="comprovativo-card"
        >
          <div class="comprovativo-header">
            <div class="user-info">
              <div class="user-avatar">
                <i class="bi bi-person-fill"></i>
              </div>
              <div>
                <h5 class="user-name">{{ comp.usuario?.nome || 'Usuário' }}</h5>
                <p class="user-email">{{ comp.usuario?.email || 'email@example.com' }}</p>
              </div>
            </div>
            <span :class="['status-badge', comp.status]">
              {{ statusLabel(comp.status) }}
            </span>
          </div>

          <div class="comprovativo-body">
            <div class="row">
              <!-- Informações do Pagamento -->
              <div class="col-md-6">
                <div class="info-section">
                  <h6 class="info-title">Detalhes do Pagamento</h6>
                  <div class="info-grid">
                    <div class="info-item">
                      <i class="bi bi-tag text-purple"></i>
                      <div>
                        <small class="text-muted">Serviço</small>
                        <p class="mb-0 fw-bold">{{ formatarTipo(comp.tipo) }}</p>
                      </div>
                    </div>
                    <div class="info-item">
                      <i class="bi bi-credit-card text-purple"></i>
                      <div>
                        <small class="text-muted">Método</small>
                        <p class="mb-0 fw-bold">{{ comp.metodo_pagamento }}</p>
                      </div>
                    </div>
                    <div class="info-item">
                      <i class="bi bi-cash text-success"></i>
                      <div>
                        <small class="text-muted">Valor</small>
                        <p class="mb-0 fw-bold">{{ comp.valor_pago }} MZN</p>
                      </div>
                    </div>
                    <div class="info-item" v-if="comp.referencia">
                      <i class="bi bi-hash text-info"></i>
                      <div>
                        <small class="text-muted">Referência</small>
                        <p class="mb-0">{{ comp.referencia }}</p>
                      </div>
                    </div>
                    <div class="info-item">
                      <i class="bi bi-calendar text-warning"></i>
                      <div>
                        <small class="text-muted">Data de Envio</small>
                        <p class="mb-0">{{ formatarData(comp.data_envio) }}</p>
                      </div>
                    </div>
                  </div>
                  <div v-if="comp.observacoes" class="mt-3">
                    <small class="text-muted">Observações do Usuário:</small>
                    <p class="obs-text">{{ comp.observacoes }}</p>
                  </div>
                </div>
              </div>

              <!-- Preview do Comprovativo -->
              <div class="col-md-6">
                <div class="preview-section">
                  <h6 class="info-title">Comprovativo</h6>
                  <div class="preview-container" @click="visualizarComprovativo(comp)">
                    <img
                      v-if="!isPDF(comp.arquivo_path)"
                      :src="getFileUrl(comp.arquivo_path)"
                      :alt="`Comprovativo ${comp.id}`"
                      class="preview-image"
                    />
                    <div v-else class="pdf-placeholder">
                      <i class="bi bi-file-earmark-pdf pdf-icon"></i>
                      <p class="mt-2">Clique para visualizar PDF</p>
                    </div>
                    <div class="preview-overlay">
                      <i class="bi bi-zoom-in"></i>
                      <p>Clique para ampliar</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Observações do Admin (se houver) -->
            <div v-if="comp.obs_admin" class="admin-obs-section mt-3">
              <i class="bi bi-shield-check text-purple me-2"></i>
              <strong>Observações do Admin:</strong>
              <p class="mb-0 mt-1">{{ comp.obs_admin }}</p>
            </div>

            <!-- Ações -->
            <div v-if="comp.status === 'pendente'" class="action-buttons mt-4">
              <button
                class="btn-action btn-approve"
                @click="abrirModalAprovacao(comp)"
              >
                <i class="bi bi-check-circle me-2"></i>
                Aprovar
              </button>
              <button
                class="btn-action btn-reject"
                @click="abrirModalRejeicao(comp)"
              >
                <i class="bi bi-x-circle me-2"></i>
                Rejeitar
              </button>
            </div>

            <div v-else class="status-info mt-3">
              <i :class="['bi', comp.status === 'aprovado' ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger']"></i>
              {{ comp.status === 'aprovado' ? 'Aprovado' : 'Rejeitado' }} por
              <strong>{{ comp.admin_responsavel || 'Admin' }}</strong>
              em {{ formatarData(comp.data_validacao) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Nenhum comprovativo encontrado -->
      <div v-else class="empty-state">
        <i class="bi bi-inbox empty-icon"></i>
        <h4>Nenhum comprovativo encontrado</h4>
        <p class="text-muted">
          Não há comprovativos {{ filtroStatus !== 'todos' ? statusLabel(filtroStatus).toLowerCase() : '' }}
        </p>
      </div>
    </div>

    <!-- Modal de Visualização -->
    <transition name="fade-modal">
      <div v-if="comprovantivoSelecionado" class="modal-backdrop" @click.self="fecharModal">
        <div class="modal-dialog-large">
          <div class="modal-content-viewer">
            <button class="btn-close-modal" @click="fecharModal">
              <i class="bi bi-x-lg"></i>
            </button>
            <h4 class="modal-title mb-3">Visualização do Comprovativo</h4>
            <div class="viewer-container">
              <img
                v-if="!isPDF(comprovantivoSelecionado.arquivo_path)"
                :src="getFileUrl(comprovantivoSelecionado.arquivo_path)"
                alt="Comprovativo"
                class="full-image"
              />
              <iframe
                v-else
                :src="getFileUrl(comprovantivoSelecionado.arquivo_path)"
                class="pdf-viewer"
              ></iframe>
            </div>
            <a
              :href="getFileUrl(comprovantivoSelecionado.arquivo_path)"
              download
              class="btn-download mt-3"
            >
              <i class="bi bi-download me-2"></i>
              Baixar Comprovativo
            </a>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal de Aprovação -->
    <transition name="fade-modal">
      <div v-if="modalAprovacao" class="modal-backdrop" @click.self="fecharModalAprovacao">
        <div class="modal-dialog-centered">
          <div class="modal-content-action">
            <button class="btn-close-modal" @click="fecharModalAprovacao">
              <i class="bi bi-x-lg"></i>
            </button>
            <div class="modal-icon success">
              <i class="bi bi-check-circle-fill"></i>
            </div>
            <h4 class="modal-title">Aprovar Comprovativo</h4>
            <p class="text-muted">Confirma a aprovação deste comprovativo?</p>
            
            <div class="form-group mt-3">
              <label class="form-label">Observações (opcional)</label>
              <textarea
                v-model="obsAdmin"
                class="form-control"
                rows="3"
                placeholder="Adicione observações sobre a aprovação..."
              ></textarea>
            </div>

            <div class="modal-actions">
              <button class="btn-secondary" @click="fecharModalAprovacao">
                Cancelar
              </button>
              <button
                class="btn-confirm approve"
                @click="aprovarComprovativo"
                :disabled="loadingAction"
              >
                <span v-if="loadingAction" class="spinner-border spinner-border-sm me-2"></span>
                {{ loadingAction ? 'Aprovando...' : 'Confirmar Aprovação' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal de Rejeição -->
    <transition name="fade-modal">
      <div v-if="modalRejeicao" class="modal-backdrop" @click.self="fecharModalRejeicao">
        <div class="modal-dialog-centered">
          <div class="modal-content-action">
            <button class="btn-close-modal" @click="fecharModalRejeicao">
              <i class="bi bi-x-lg"></i>
            </button>
            <div class="modal-icon danger">
              <i class="bi bi-x-circle-fill"></i>
            </div>
            <h4 class="modal-title">Rejeitar Comprovativo</h4>
            <p class="text-muted">Informe o motivo da rejeição</p>
            
            <div class="form-group mt-3">
              <label class="form-label">Motivo da Rejeição *</label>
              <textarea
                v-model="obsAdmin"
                class="form-control"
                rows="4"
                placeholder="Explique o motivo da rejeição..."
                required
              ></textarea>
            </div>

            <div class="modal-actions">
              <button class="btn-secondary" @click="fecharModalRejeicao">
                Cancelar
              </button>
              <button
                class="btn-confirm reject"
                @click="rejeitarComprovativo"
                :disabled="loadingAction || !obsAdmin"
              >
                <span v-if="loadingAction" class="spinner-border spinner-border-sm me-2"></span>
                {{ loadingAction ? 'Rejeitando...' : 'Confirmar Rejeição' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
  <FooterDefault />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NavbarDefault from '../../examples/navbars/NavbarDefault.vue';
import FooterDefault from '../../examples/footers/FooterDefault.vue';
import api from '@/api';
import Swal from 'sweetalert2';

const router = useRouter();

// ==================== ESTADO ====================
const comprovativos = ref([]);
const comprovantivoSelecionado = ref(null);
const modalAprovacao = ref(false);
const modalRejeicao = ref(false);
const comprovantivoAcao = ref(null);
const obsAdmin = ref('');
const loading = ref(true);
const loadingAction = ref(false);

// Filtros
const filtroStatus = ref('todos');
const filtroMetodo = ref('todos');
const busca = ref('');

// ==================== COMPUTED ====================
const stats = computed(() => {
  return {
    pendentes: comprovativos.value.filter(c => c.status === 'pendente').length,
    aprovados: comprovativos.value.filter(c => c.status === 'aprovado').length,
    rejeitados: comprovativos.value.filter(c => c.status === 'rejeitado').length,
    total: comprovativos.value.length,
  };
});

const comprovativosFiltrados = computed(() => {
  let resultado = comprovativos.value;

  // Filtro por status
  if (filtroStatus.value !== 'todos') {
    resultado = resultado.filter(c => c.status === filtroStatus.value);
  }

  // Filtro por método
  if (filtroMetodo.value !== 'todos') {
    resultado = resultado.filter(c => c.metodo_pagamento === filtroMetodo.value);
  }

  // Busca
  if (busca.value) {
    const termo = busca.value.toLowerCase();
    resultado = resultado.filter(c =>
      c.usuario?.nome?.toLowerCase().includes(termo) ||
      c.usuario?.email?.toLowerCase().includes(termo) ||
      c.referencia?.toLowerCase().includes(termo)
    );
  }

  return resultado;
});

// ==================== FUNÇÕES ====================
const carregarComprovativos = async () => {
  loading.value = true;
  try {
    const response = await api.get('/pagamentos/comprovativos', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    if (response.data.sucesso) {
      comprovativos.value = response.data.comprovativos || [];
    }
  } catch (error) {
    console.error('Erro ao carregar comprovativos:', error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro ao carregar comprovativos',
    });
  } finally {
    loading.value = false;
  }
};

const filtrarComprovativos = () => {
  // A filtragem é feita automaticamente pelo computed
};

const statusLabel = (status) => {
  const labels = {
    pendente: 'Pendente',
    aprovado: 'Aprovado',
    rejeitado: 'Rejeitado',
    todos: 'Todos',
  };
  return labels[status] || status;
};

const formatarTipo = (tipo) => {
  const tipos = {
    assinatura_mensal: 'Assinatura Mensal',
    assinatura_anual: 'Assinatura Anual',
    anuncio: 'Anúncio / Publicidade',
    assinatura: 'Assinatura (Geral)',
    documento: 'Documento',
  };
  return tipos[tipo] || tipo;
};

const formatarData = (data) => {
  if (!data) return '-';
  return new Date(data).toLocaleDateString('pt-MZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isPDF = (path) => {
  return path?.toLowerCase().endsWith('.pdf');
};

const getFileUrl = (path) => {
  // Ajuste conforme sua estrutura de backend
  return `${api.defaults.baseURL}/uploads/${path}`;
};

const visualizarComprovativo = (comp) => {
  comprovantivoSelecionado.value = comp;
};

const fecharModal = () => {
  comprovantivoSelecionado.value = null;
};

const abrirModalAprovacao = (comp) => {
  comprovantivoAcao.value = comp;
  obsAdmin.value = '';
  modalAprovacao.value = true;
};

const fecharModalAprovacao = () => {
  modalAprovacao.value = false;
  comprovantivoAcao.value = null;
  obsAdmin.value = '';
};

const abrirModalRejeicao = (comp) => {
  comprovantivoAcao.value = comp;
  obsAdmin.value = '';
  modalRejeicao.value = true;
};

const fecharModalRejeicao = () => {
  modalRejeicao.value = false;
  comprovantivoAcao.value = null;
  obsAdmin.value = '';
};

const aprovarComprovativo = async () => {
  if (!comprovantivoAcao.value) return;

  loadingAction.value = true;
  try {
    const response = await api.post(
      `/pagamentos/comprovativos/${comprovantivoAcao.value.id}/aprovar`,
      { obs_admin: obsAdmin.value },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );

    if (response.data.sucesso) {
      await Swal.fire({
        icon: 'success',
        title: 'Aprovado!',
        text: 'Comprovativo aprovado com sucesso',
        timer: 2000,
      });
      fecharModalAprovacao();
      await carregarComprovativos();
    }
  } catch (error) {
    console.error('Erro ao aprovar:', error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro ao aprovar comprovativo',
    });
  } finally {
    loadingAction.value = false;
  }
};

const rejeitarComprovativo = async () => {
  if (!comprovantivoAcao.value || !obsAdmin.value) return;

  loadingAction.value = true;
  try {
    const response = await api.post(
      `/pagamentos/comprovativos/${comprovantivoAcao.value.id}/rejeitar`,
      { obs_admin: obsAdmin.value },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );

    if (response.data.sucesso) {
      await Swal.fire({
        icon: 'success',
        title: 'Rejeitado',
        text: 'Comprovativo rejeitado',
        timer: 2000,
      });
      fecharModalRejeicao();
      await carregarComprovativos();
    }
  } catch (error) {
    console.error('Erro ao rejeitar:', error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro ao rejeitar comprovativo',
    });
  } finally {
    loadingAction.value = false;
  }
};

const goBack = () => {
  router.push('/dashboard/admin');
};

// ==================== LIFECYCLE ====================
onMounted(() => {
  carregarComprovativos();
});
</script>

<style scoped>
@import "bootstrap-icons/font/bootstrap-icons.css";
@import "@fontsource/poppins/500.css";
@import "@fontsource/poppins/600.css";
@import "@fontsource/poppins/700.css";

* {
  font-family: 'Poppins', sans-serif;
}

.admin-comprovativos-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%);
  padding: 6rem 0 2rem 0; /* Aumentado o padding superior para dar espaço à navbar */
}

/* Header */
.page-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.btn-back {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.2);
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.75rem;
  letter-spacing: -0.5px;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(128, 0, 128, 0.3);
}

.stat-card.pending { border-left: 4px solid #ffc107; }
.stat-card.approved { border-left: 4px solid #198754; }
.stat-card.rejected { border-left: 4px solid #dc3545; }
.stat-card.total { border-left: 4px solid #0dcaf0; }

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-card.pending .stat-icon {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.stat-card.approved .stat-icon {
  background: rgba(25, 135, 84, 0.2);
  color: #198754;
}

.stat-card.rejected .stat-icon {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
}

.stat-card.total .stat-icon {
  background: rgba(13, 202, 240, 0.2);
  color: #0dcaf0;
}

.stat-info h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.15rem;
  line-height: 1.2;
}

.stat-info p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* Filters */
.filters-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
}

.form-label {
  color: #fff;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-select,
.form-control {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
}

.form-select:focus,
.form-control:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: #800080;
  color: #fff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(128, 0, 128, 0.2);
}

.form-select option {
  background: #2d004d;
  color: #fff;
}

/* Comprovativos List */
.comprovativos-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comprovativo-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.comprovativo-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(128, 0, 128, 0.3);
}

.comprovativo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #800080, #9b30ff);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.5rem;
}

.user-name {
  color: #fff;
  font-weight: 600;
  margin-bottom: 0.15rem;
  font-size: 1.1rem;
}

.user-email {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 600;
  font-size: 0.85rem;
}

.status-badge.pendente {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.status-badge.aprovado {
  background: rgba(25, 135, 84, 0.2);
  color: #198754;
  border: 1px solid #198754;
}

.status-badge.rejeitado {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border: 1px solid #dc3545;
}

.comprovativo-body {
  padding: 1.5rem;
}

.info-section,
.preview-section {
  height: 100%;
}

.info-title {
  color: #fff;
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.info-item i {
  font-size: 1.25rem;
  margin-top: 0.25rem;
}

.info-item small {
  display: block;
  font-size: 0.75rem;
  margin-bottom: 0.2rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item p {
  color: #fff;
  font-size: 0.95rem;
}

.obs-text {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.75rem;
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  border-left: 3px solid #800080;
  margin-top: 0.5rem;
}

/* Preview */
.preview-container {
  position: relative;
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  max-height: 300px;
  background: rgba(255, 255, 255, 0.05);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.pdf-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  color: #dc3545;
}

.pdf-icon {
  font-size: 4rem;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(128, 0, 128, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.preview-container:hover .preview-overlay {
  opacity: 1;
}

.preview-overlay i {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

/* Admin Obs */
.admin-obs-section {
  background: rgba(128, 0, 128, 0.1);
  border-left: 3px solid #9b30ff;
  padding: 1rem;
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-action {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-approve {
  background: #198754;
  color: #fff;
}

.btn-approve:hover {
  background: #157347;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 135, 84, 0.4);
}

.btn-reject {
  background: #dc3545;
  color: #fff;
}

.btn-reject:hover {
  background: #bb2d3b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

.status-info {
  color: rgba(255, 255, 255, 0.8);
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 2rem 1rem; /* Reduzido padding para subir o conteúdo */
  color: #ffffff; /* Branco total */
}

.empty-state h4 {
  color: #ffffff;
  margin-top: 1rem;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.7) !important;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  opacity: 0.8; /* Aumentada a visibilidade */
  color: #ffffff;
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow-y: auto;
}

.modal-dialog-large {
  width: 100%;
  max-width: 900px;
}

.modal-dialog-centered {
  width: 100%;
  max-width: 500px;
}

.modal-content-viewer,
.modal-content-action {
  background: #fff;
  border-radius: 1rem;
  padding: 2rem;
  position: relative;
  animation: modalSlideIn 0.3s ease-out;
}

.viewer-container {
  max-height: 70vh;
  overflow-y: auto;
  border-radius: 0.75rem;
  background: #f8f9fa;
}

.full-image {
  width: 100%;
  display: block;
}

.pdf-viewer {
  width: 100%;
  height: 70vh;
  border: none;
}

.btn-download {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #800080;
  color: #fff;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-download:hover {
  background: #9b30ff;
  transform: translateY(-2px);
}

.btn-close-modal {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #f8f9fa;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.btn-close-modal:hover {
  background: #dc3545;
  color: #fff;
  transform: rotate(90deg);
}

.modal-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 3rem;
}

.modal-icon.success {
  background: rgba(25, 135, 84, 0.1);
  color: #198754;
}

.modal-icon.danger {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.modal-title {
  text-align: center;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-secondary {
  flex: 1;
  padding: 0.75rem;
  background: #6c757d;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-confirm {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #fff;
}

.btn-confirm.approve {
  background: #198754;
}

.btn-confirm.approve:hover:not(:disabled) {
  background: #157347;
}

.btn-confirm.reject {
  background: #dc3545;
}

.btn-confirm.reject:hover:not(:disabled) {
  background: #bb2d3b;
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Animations */
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.3s ease;
}

.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}

.text-purple {
  color: #800080 !important;
}

/* Responsive */
@media (max-width: 1024px) {
  .admin-comprovativos-container {
    padding: 1.5rem 0;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .admin-comprovativos-container {
    padding: 1rem 0;
  }

  .container {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 0.9rem;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .stat-info h3 {
    font-size: 1.5rem;
  }

  .stat-info p {
    font-size: 0.85rem;
  }

  .filters-section {
    padding: 1rem;
  }

  .form-label {
    font-size: 0.9rem;
  }

  .form-select,
  .form-control {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }

  .comprovativo-header {
    padding: 1rem;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .user-name {
    font-size: 0.95rem;
  }

  .user-email {
    font-size: 0.8rem;
  }

  .status-badge {
    font-size: 0.75rem;
    padding: 0.4rem 0.8rem;
  }

  .comprovativo-body {
    padding: 1rem;
  }

  .info-title {
    font-size: 1rem;
  }

  .info-item {
    font-size: 0.85rem;
  }

  .info-item small {
    font-size: 0.75rem;
  }

  .preview-container {
    max-height: 200px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-action {
    width: 100%;
    justify-content: center;
  }

  .modal-dialog-large {
    max-width: 95%;
  }

  .modal-dialog-centered {
    max-width: 95%;
  }

  .modal-content-viewer,
  .modal-content-action {
    padding: 1.5rem;
  }

  .modal-icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }

  .modal-title {
    font-size: 1.1rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-confirm {
    width: 100%;
  }

  .viewer-container {
    max-height: 60vh;
  }
}

@media (max-width: 480px) {
  .admin-comprovativos-container {
    padding: 0.5rem 0;
  }

  .container {
    padding-left: 0.75rem !important;
    padding-right: 0.75rem !important;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .page-subtitle {
    font-size: 0.85rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .stat-card {
    padding: 0.85rem;
  }

  .stat-icon {
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
  }

  .stat-info h3 {
    font-size: 1.35rem;
  }

  .filters-section {
    padding: 0.85rem;
  }

  .row {
    margin: 0;
  }

  .col-md-4 {
    padding: 0.5rem 0;
  }

  .comprovativo-card {
    border-radius: 0.75rem;
  }

  .comprovativo-header {
    padding: 0.85rem;
  }

  .comprovativo-body {
    padding: 0.85rem;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }

  .user-name {
    font-size: 0.9rem;
  }

  .user-email {
    font-size: 0.75rem;
  }

  .status-badge {
    font-size: 0.7rem;
    padding: 0.35rem 0.65rem;
    width: 100%;
    text-align: center;
  }

  .info-title {
    font-size: 0.95rem;
  }

  .pdf-icon {
    font-size: 2.5rem;
  }

  .btn-action {
    padding: 0.6rem;
    font-size: 0.9rem;
  }

  .modal-content-viewer,
  .modal-content-action {
    padding: 1rem;
  }

  .modal-icon {
    width: 50px;
    height: 50px;
    font-size: 1.75rem;
  }

  .modal-title {
    font-size: 1rem;
  }

  .form-group {
    margin-bottom: 0.75rem;
  }

  .btn-close-modal {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }

  .empty-icon {
    font-size: 3.5rem;
  }

  .empty-state h4 {
    font-size: 1.1rem;
  }
}
</style>
