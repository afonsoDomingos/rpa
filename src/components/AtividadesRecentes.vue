<template>
  <div class="atividades-wrapper">
    <div class="atividades-container">
      <!-- Header -->
      <div class="section-header mb-4">
        <div class="title-section">
          <h2 class="section-title">
            <i class="bi bi-clock-history me-2"></i> Atividades Recentes
          </h2>
          <p class="section-subtitle">Acompanhe as últimas ações do sistema em tempo real</p>
        </div>
        <button class="btn-refresh" @click="buscarAtividades" :disabled="loading">
          <i class="bi" :class="loading ? 'bi-arrow-clockwise spin' : 'bi-arrow-clockwise'"></i>
          Atualizar
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading && atividades.length === 0" class="loading-state">
        <div class="spinner-border text-purple" role="status"></div>
        <p class="mt-2">Carregando atividades...</p>
      </div>

      <!-- Timeline -->
      <div v-else-if="atividades.length > 0" class="timeline">
        <div
          v-for="(atividade, index) in atividadesVisiveis"
          :key="index"
          class="timeline-item"
          :class="`type-${atividade.tipo}`"
        >
          <div class="timeline-marker" :class="`marker-${atividade.tipo}`">
            <i class="bi" :class="atividade.icone"></i>
          </div>
          <div class="timeline-content">
            <div class="timeline-header">
              <h4 class="timeline-title">{{ atividade.titulo }}</h4>
              <span class="timeline-time">
                <i class="bi bi-clock me-1"></i>
                {{ formatarTempo(atividade.timestamp) }}
              </span>
            </div>
            <p class="timeline-description">{{ atividade.descricao }}</p>
            <div v-if="atividade.detalhes" class="timeline-details">
              <span class="detail-badge" v-for="(valor, chave) in atividade.detalhes" :key="chave">
                <strong>{{ chave }}:</strong> {{ valor }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <i class="bi bi-inbox empty-icon"></i>
        <h4>Nenhuma Atividade Recente</h4>
        <p>As atividades aparecerão aqui assim que houver movimentação no sistema.</p>
      </div>

      <!-- Show More Button -->
      <div v-if="atividades.length > limitePorPagina" class="text-center mt-4">
        <button class="btn-show-more" @click="mostrarMais">
          <i class="bi bi-plus-circle me-2"></i>
          {{ mostrandoTodas ? 'Mostrar Menos' : `Mostrar Mais (${atividades.length - limitePorPagina} restantes)` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/api";

const loading = ref(false);
const atividades = ref([]);
const limitePorPagina = 10;
const mostrandoTodas = ref(false);

const atividadesVisiveis = computed(() => {
  return mostrandoTodas.value ? atividades.value : atividades.value.slice(0, limitePorPagina);
});

const mostrarMais = () => {
  mostrandoTodas.value = !mostrandoTodas.value;
};

const formatarTempo = (timestamp) => {
  const agora = new Date();
  const data = new Date(timestamp);
  const diffMs = agora - data;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMs / 3600000);
  const diffDias = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora mesmo';
  if (diffMins < 60) return `Há ${diffMins} min`;
  if (diffHoras < 24) return `Há ${diffHoras}h`;
  if (diffDias < 7) return `Há ${diffDias} dia(s)`;
  
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const buscarAtividades = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem("token");
    
    // Buscar dados de várias fontes
    const [documentosRes, solicitacoesRes, usuariosRes] = await Promise.all([
      api.get("/documentos"),
      api.get("/solicitacoes"),
      api.get("/auth/usuarios", { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    const documentos = documentosRes.data;
    const solicitacoes = solicitacoesRes.data;
    const usuarios = usuariosRes.data;

    const todasAtividades = [];

    // Processar documentos
    documentos.slice(0, 15).forEach(doc => {
      const isReportado = doc.origem === "reportado";
      todasAtividades.push({
        tipo: isReportado ? 'documento' : 'proprietario',
        icone: isReportado ? 'bi-file-earmark-plus-fill' : 'bi-person-check-fill',
        titulo: isReportado ? 'Documento Reportado' : 'Documento do Proprietário',
        descricao: `${doc.nome_completo} ${isReportado ? 'reportou' : 'cadastrou'} um ${doc.tipo_documento}`,
        timestamp: doc.createdAt || new Date(Date.now() - Math.random() * 10000000000),
        detalhes: {
          Província: doc.provincia,
          Tipo: doc.tipo_documento,
        }
      });

      // Se tem status de entregue
      if (doc.status === 'Entregue' || doc.status === 'Recuperado') {
        todasAtividades.push({
          tipo: 'sucesso',
          icone: 'bi-check-circle-fill',
          titulo: 'Documento Entregue',
          descricao: `Documento #${doc.numero_documento?.substring(0, 8) || 'N/A'} foi marcado como entregue`,
          timestamp: new Date(Date.now() - Math.random() * 5000000000),
          detalhes: {
            Proprietário: doc.nome_completo,
          }
        });
      }
    });

    // Processar solicitações
    solicitacoes.slice(0, 10).forEach(sol => {
      todasAtividades.push({
        tipo: 'solicitacao',
        icone: 'bi-clipboard-check-fill',
        titulo: 'Nova Solicitação',
        descricao: `${sol.nome_completo} solicitou um ${sol.tipo_documento}`,
        timestamp: sol.createdAt || new Date(Date.now() - Math.random() * 8000000000),
        detalhes: {
          Contacto: sol.contacto,
          Tipo: sol.tipo_documento,
        }
      });
    });

    // Processar usuários novos
    usuarios.slice(0, 5).forEach(user => {
      todasAtividades.push({
        tipo: 'usuario',
        icone: 'bi-person-plus-fill',
        titulo: 'Novo Usuário',
        descricao: `${user.nome} foi adicionado ao sistema como ${user.role}`,
        timestamp: user.createdAt || new Date(Date.now() - Math.random() * 15000000000),
        detalhes: {
          Email: user.email,
          Perfil: user.role.toUpperCase(),
        }
      });
    });

    // Ordenar por timestamp (mais recente primeiro)
    atividades.value = todasAtividades.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  } catch (error) {
    console.error("Erro ao buscar atividades:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  buscarAtividades();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap');
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css");

.atividades-wrapper {
  width: 100%;
  background-color: #ffffff;
  padding: 3rem 0;
}

.atividades-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  font-family: 'Poppins', sans-serif;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.title-section {
  flex: 1;
}

.section-title {
  font-weight: 900;
  color: #800080;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-weight: 400;
  color: #6c757d;
  margin: 0;
}

.btn-refresh {
  background: linear-gradient(135deg, #800080, #6a006a);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-refresh:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(128, 0, 128, 0.3);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.text-purple {
  color: #800080 !important;
}

/* Timeline */
.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 19px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, #e0e0e0 0%, transparent 100%);
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
  animation: slideInLeft 0.5s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.timeline-marker {
  position: absolute;
  left: -2rem;
  top: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

.marker-documento {
  background: linear-gradient(135deg, #800080, #6a006a);
}

.marker-solicitacao {
  background: linear-gradient(135deg, #4CAF50, #388E3C);
}

.marker-usuario {
  background: linear-gradient(135deg, #FF9800, #F57C00);
}

.marker-sucesso {
  background: linear-gradient(135deg, #2196F3, #1976D2);
}

.marker-proprietario {
  background: linear-gradient(135deg, #00BCD4, #0097A7);
}

.timeline-content {
  background: white;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  margin-left: 1rem;
}

.timeline-content:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  transform: translateX(4px);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.timeline-title {
  font-weight: 700;
  font-size: 1.1rem;
  color: #212529;
  margin: 0;
}

.timeline-time {
  font-weight: 600;
  font-size: 0.75rem;
  color: #6c757d;
  white-space: nowrap;
  background-color: #f8f9fa;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
}

.timeline-description {
  font-size: 0.95rem;
  color: #495057;
  margin: 0 0 0.75rem 0;
}

.timeline-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.detail-badge {
  font-size: 0.8rem;
  background-color: rgba(128, 0, 128, 0.1);
  color: #800080;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-weight: 600;
}

.detail-badge strong {
  font-weight: 900;
}

/* Botão Show More */
.btn-show-more {
  background: white;
  color: #800080;
  border: 2px solid #800080;
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
}

.btn-show-more:hover {
  background: linear-gradient(135deg, #800080, #6a006a);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(128, 0, 128, 0.3);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #f8f9fa;
  border-radius: 16px;
  border: 2px dashed #dee2e6;
}

.empty-icon {
  font-size: 4rem;
  color: #dee2e6;
  margin-bottom: 1rem;
}

.empty-state h4 {
  font-weight: 700;
  color: #495057;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6c757d;
}

/* Responsive */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .btn-refresh {
    width: 100%;
    justify-content: center;
  }

  .timeline {
    padding-left: 1.5rem;
  }

  .timeline::before {
    left: 14px;
  }

  .timeline-marker {
    width: 32px;
    height: 32px;
    left: -1.5rem;
    font-size: 0.9rem;
  }

  .timeline-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .timeline-time {
    align-self: flex-start;
  }
}
</style>
