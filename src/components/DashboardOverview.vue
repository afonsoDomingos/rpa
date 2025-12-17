<template>
  <div class="dashboard-overview-wrapper">
    <div class="dashboard-overview-container">
      <!-- Header -->
      <div class="section-header mb-4">
        <h2 class="section-title">
          <i class="bi bi-speedometer2 me-2"></i> Visão Geral do Sistema
        </h2>
        <p class="section-subtitle">Métricas e indicadores de performance em tempo real</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner-border text-purple" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
        <p class="mt-2">Carregando métricas...</p>
      </div>

      <!-- KPI Cards Grid -->
      <div v-else class="kpi-grid">
        <!-- Card 1: Documentos Reportados -->
        <div class="kpi-card purple-card fade-in" style="animation-delay: 0.1s">
          <div class="kpi-icon-wrapper purple">
            <i class="bi bi-file-earmark-plus-fill"></i>
          </div>
          <div class="kpi-content">
            <h3 class="kpi-label">Documentos Reportados</h3>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ stats.totalReportados }}</span>
              <span class="kpi-trend" :class="stats.reportadosTrend >= 0 ? 'positive' : 'negative'">
                <i :class="stats.reportadosTrend >= 0 ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
                {{ Math.abs(stats.reportadosTrend) }}%
              </span>
            </div>
            <p class="kpi-description">Total de documentos encontrados</p>
          </div>
        </div>

        <!-- Card 2: Solicitações Pendentes -->
        <div class="kpi-card green-card fade-in" style="animation-delay: 0.2s">
          <div class="kpi-icon-wrapper green">
            <i class="bi bi-hourglass-split"></i>
          </div>
          <div class="kpi-content">
            <h3 class="kpi-label">Solicitações Ativas</h3>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ stats.totalSolicitacoes }}</span>
              <span class="kpi-trend" :class="stats.solicitacoesTrend >= 0 ? 'positive' : 'negative'">
                <i :class="stats.solicitacoesTrend >= 0 ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
                {{ Math.abs(stats.solicitacoesTrend) }}%
              </span>
            </div>
            <p class="kpi-description">Aguardando processamento</p>
          </div>
        </div>

        <!-- Card 3: Taxa de Recuperação -->
        <div class="kpi-card blue-card fade-in" style="animation-delay: 0.3s">
          <div class="kpi-icon-wrapper blue">
            <i class="bi bi-check-circle-fill"></i>
          </div>
          <div class="kpi-content">
            <h3 class="kpi-label">Taxa de Recuperação</h3>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ stats.taxaRecuperacao }}%</span>
              <span class="kpi-trend positive">
                <i class="bi bi-arrow-up"></i>
                {{ stats.recuperacaoTrend }}%
              </span>
            </div>
            <p class="kpi-description">Documentos entregues com sucesso</p>
          </div>
          <div class="progress-bar-wrapper">
            <div class="progress-bar" :style="{ width: stats.taxaRecuperacao + '%' }"></div>
          </div>
        </div>

        <!-- Card 4: Usuários Ativos -->
        <div class="kpi-card orange-card fade-in" style="animation-delay: 0.4s">
          <div class="kpi-icon-wrapper orange">
            <i class="bi bi-people-fill"></i>
          </div>
          <div class="kpi-content">
            <h3 class="kpi-label">Usuários Ativos</h3>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ stats.totalUsuarios }}</span>
              <span class="kpi-badge">+{{ stats.novosUsuarios }} novos</span>
            </div>
            <p class="kpi-description">Total de usuários cadastrados</p>
          </div>
        </div>

        <!-- Card 5: Províncias Atendidas -->
        <div class="kpi-card teal-card fade-in" style="animation-delay: 0.5s">
          <div class="kpi-icon-wrapper teal">
            <i class="bi bi-geo-alt-fill"></i>
          </div>
          <div class="kpi-content">
            <h3 class="kpi-label">Cobertura Territorial</h3>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ stats.totalProvincias }}/11</span>
              <span class="kpi-percentage">{{ Math.round((stats.totalProvincias / 11) * 100) }}%</span>
            </div>
            <p class="kpi-description">Províncias com documentos</p>
          </div>
        </div>

        <!-- Card 6: Tempo Médio de Resposta -->
        <div class="kpi-card red-card fade-in" style="animation-delay: 0.6s">
          <div class="kpi-icon-wrapper red">
            <i class="bi bi-clock-history"></i>
          </div>
          <div class="kpi-content">
            <h3 class="kpi-label">Tempo Médio</h3>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ stats.tempoMedio }}h</span>
              <span class="kpi-trend negative">
                <i class="bi bi-arrow-down"></i>
                15%
              </span>
            </div>
            <p class="kpi-description">Resposta às solicitações</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions mt-4">
        <h3 class="quick-actions-title">
          <i class="bi bi-lightning-fill me-2"></i>Ações Rápidas
        </h3>
        <div class="actions-grid">
          <button class="action-btn action-purple" @click="scrollToSection('verdocumentosadmin')">
            <i class="bi bi-file-earmark-plus"></i>
            <span>Reportar Documento</span>
          </button>
          <button class="action-btn action-green" @click="refresh" :disabled="loading">
            <i class="bi" :class="loading ? 'bi-arrow-clockwise spin' : 'bi-arrow-clockwise'"></i>
            <span>{{ loading ? 'Atualizando...' : 'Atualizar Dados' }}</span>
          </button>
          <button class="action-btn action-blue" @click="exportarRelatorio">
            <i class="bi bi-download"></i>
            <span>Exportar Relatório</span>
          </button>
          <button class="action-btn action-orange" @click="scrollToSection('charts')">
            <i class="bi bi-bar-chart"></i>
            <span>Ver Estatísticas</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/api";
import Swal from "sweetalert2";

defineEmits(['refresh']);

const loading = ref(true);
const stats = ref({
  totalReportados: 0,
  reportadosTrend: 0,
  totalSolicitacoes: 0,
  solicitacoesTrend: 0,
  taxaRecuperacao: 0,
  recuperacaoTrend: 0,
  totalUsuarios: 0,
  novosUsuarios: 0,
  totalProvincias: 0,
  tempoMedio: 0,
});

const calcularEstatisticas = async () => {
  try {
    loading.value = true;

    // Buscar documentos
    const { data: documentos } = await api.get("/documentos");
    
    // Buscar solicitações
    const { data: solicitacoes } = await api.get("/solicitacoes");
    
    // Buscar usuários
    const token = localStorage.getItem("token");
    const { data: usuarios } = await api.get("/auth/usuarios", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Calcular métricas
    const reportados = documentos.filter(doc => doc.origem === "reportado");
    const proprietarios = documentos.filter(doc => doc.origem === "proprietario");
    const entregues = documentos.filter(doc => doc.status === "Entregue" || doc.status === "Recuperado");
    
    // Províncias únicas
    const provinciasSet = new Set(documentos.map(doc => doc.provincia).filter(p => p));
    
    // Atualizar stats
    stats.value = {
      totalReportados: reportados.length,
      reportadosTrend: 12, // Simulado - você pode calcular com base em dados históricos
      totalSolicitacoes: solicitacoes.length,
      solicitacoesTrend: -5, // Simulado
      taxaRecuperacao: documentos.length > 0 
        ? Math.round((entregues.length / documentos.length) * 100) 
        : 0,
      recuperacaoTrend: 8, // Simulado
      totalUsuarios: usuarios.length,
      novosUsuarios: Math.floor(usuarios.length * 0.15), // 15% são novos (simulado)
      totalProvincias: provinciasSet.size,
      tempoMedio: Math.floor(Math.random() * 24) + 12, // Simulado: entre 12-36h
    };

  } catch (error) {
    console.error("Erro ao calcular estatísticas:", error);
  } finally {
    loading.value = false;
  }
};

// Função para scroll suave até uma seção
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId) || document.querySelector(`[data-section="${sectionId}"]`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// Função para exportar relatório
const exportarRelatorio = () => {
  Swal.fire({
    icon: 'info',
    title: 'Em breve!',
    html: 'Funcionalidade de exportação em desenvolvimento!<br><br>Em breve você poderá exportar:<br>- PDF com gráficos<br>- Excel com dados tabulares<br>- Filtros customizáveis'
  });
};

// Função de refresh
const refresh = async () => {
  await calcularEstatisticas();
};

onMounted(() => {
  calcularEstatisticas();
});

// Expor função para refresh externo
defineExpose({
  refresh: calcularEstatisticas
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap');
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css");

.dashboard-overview-wrapper {
  width: 100%;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 3rem 0;
}

.dashboard-overview-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  font-family: 'Poppins', sans-serif;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
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
  font-size: 1rem;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.text-purple {
  color: #800080 !important;
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.kpi-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.kpi-card.purple-card::before { background: linear-gradient(90deg, #800080, #6a006a); }
.kpi-card.green-card::before { background: linear-gradient(90deg, #4CAF50, #388E3C); }
.kpi-card.blue-card::before { background: linear-gradient(90deg, #2196F3, #1976D2); }
.kpi-card.orange-card::before { background: linear-gradient(90deg, #FF9800, #F57C00); }
.kpi-card.teal-card::before { background: linear-gradient(90deg, #00BCD4, #0097A7); }
.kpi-card.red-card::before { background: linear-gradient(90deg, #F44336, #D32F2F); }

.kpi-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.kpi-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  color: white;
  margin-bottom: 1rem;
}

.kpi-icon-wrapper.purple { background: linear-gradient(135deg, #800080, #6a006a); }
.kpi-icon-wrapper.green { background: linear-gradient(135deg, #4CAF50, #388E3C); }
.kpi-icon-wrapper.blue { background: linear-gradient(135deg, #2196F3, #1976D2); }
.kpi-icon-wrapper.orange { background: linear-gradient(135deg, #FF9800, #F57C00); }
.kpi-icon-wrapper.teal { background: linear-gradient(135deg, #00BCD4, #0097A7); }
.kpi-icon-wrapper.red { background: linear-gradient(135deg, #F44336, #D32F2F); }

.kpi-label {
  font-weight: 700;
  font-size: 0.875rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.kpi-value-row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.kpi-value {
  font-weight: 900;
  font-size: 2.5rem;
  color: #212529;
  line-height: 1;
}

.kpi-trend {
  font-weight: 700;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.kpi-trend.positive {
  background-color: rgba(76, 175, 80, 0.15);
  color: #4CAF50;
}

.kpi-trend.negative {
  background-color: rgba(244, 67, 54, 0.15);
  color: #F44336;
}

.kpi-badge {
  font-weight: 600;
  font-size: 0.875rem;
  background-color: rgba(255, 152, 0, 0.15);
  color: #FF9800;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
}

.kpi-percentage {
  font-weight: 700;
  font-size: 1.25rem;
  color: #00BCD4;
}

.kpi-description {
  font-size: 0.875rem;
  color: #6c757d;
  margin: 0;
}

.progress-bar-wrapper {
  width: 100%;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 1rem;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #2196F3, #1976D2);
  border-radius: 3px;
  transition: width 1s ease;
}

/* Quick Actions */
.quick-actions {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
}

.quick-actions-title {
  font-weight: 700;
  font-size: 1.1rem;
  color: #212529;
  margin-bottom: 1rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn i {
  font-size: 1.25rem;
}

.action-purple { background: linear-gradient(135deg, #800080, #6a006a); }
.action-green { background: linear-gradient(135deg, #4CAF50, #388E3C); }
.action-blue { background: linear-gradient(135deg, #2196F3, #1976D2); }
.action-orange { background: linear-gradient(135deg, #FF9800, #F57C00); }

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .section-title {
    font-size: 1.5rem;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .kpi-value {
    font-size: 2rem;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
