<script setup>
import { ref, onMounted, computed } from "vue";
import api from "@/api";
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const solicitacoes = ref([]);
const mensagemErro = ref("");
const solicitanteSelecionado = ref(null);
const termoBusca = ref("");
const paginaAtual = ref(1);
const porPagina = 8;

onMounted(async () => {
  try {
    const { data } = await api.get("/solicitacoes");
    solicitacoes.value = data;
  } catch (error) {
    mensagemErro.value = "Erro ao carregar as solicitações.";
  }
});

const filtradas = computed(() => {
  return solicitacoes.value.filter(
    (item) =>
      item.nome_completo?.toLowerCase().includes(termoBusca.value.toLowerCase()) ||
      item.tipo_documento?.toLowerCase().includes(termoBusca.value.toLowerCase())
  );
});

const totalPaginas = computed(() => Math.ceil(filtradas.value.length / porPagina));

const paginadas = computed(() => {
  const inicio = (paginaAtual.value - 1) * porPagina;
  return filtradas.value.slice(inicio, inicio + porPagina);
});

function irParaPagina(pagina) {
  if (pagina >= 1 && pagina <= totalPaginas.value) {
    paginaAtual.value = pagina;
  }
}

const chartData = computed(() => {
  const contagem = {};
  solicitacoes.value.forEach((s) => {
    const tipo = s.tipo_documento || "Não especificado";
    contagem[tipo] = (contagem[tipo] || 0) + 1;
  });

  const colors = [
    "rgba(128, 0, 128, 0.9)",
    "rgba(76, 175, 80, 0.9)",
    "rgba(255, 152, 0, 0.9)",
    "rgba(33, 150, 243, 0.9)",
    "rgba(244, 67, 54, 0.9)",
    "rgba(156, 39, 176, 0.9)",
    "rgba(0, 188, 212, 0.9)",
    "rgba(255, 193, 7, 0.9)",
  ];

  return {
    labels: Object.keys(contagem),
    datasets: [
      {
        data: Object.values(contagem),
        backgroundColor: colors,
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverOffset: 15,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "65%",
  plugins: {
    legend: {
      position: "right",
      labels: {
        font: {
          family: "Poppins",
          size: 11,
          weight: "600",
        },
        padding: 12,
        usePointStyle: true,
        pointStyle: "circle",
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      padding: 12,
      titleFont: {
        family: "Poppins",
        size: 14,
        weight: "bold",
      },
      bodyFont: {
        family: "Poppins",
        size: 13,
      },
    },
  },
  animation: {
    animateRotate: true,
    animateScale: true,
    duration: 2000,
    easing: "easeInOutElastic",
  },
};

function selecionarSolicitante(solicitante) {
  solicitanteSelecionado.value = solicitante;
}

function fecharDetalhes() {
  solicitanteSelecionado.value = null;
}
</script>

<template>
  <div class="solicitacoes-wrapper">
    <div class="solicitacoes-container">
      <!-- Header -->
      <div class="section-header mb-4">
        <div class="title-section">
          <h2 class="section-title">
            <i class="bi bi-clipboard-check-fill me-2"></i> Documentos Solicitados
          </h2>
          <p class="section-subtitle">Gerenciamento e visualização de solicitações de documentos</p>
        </div>
        <div v-if="solicitacoes.length > 0" class="total-badge">
          <span class="badge-label">Total</span>
          <span class="badge-count">{{ solicitacoes.length }}</span>
        </div>
      </div>

      <!-- Erro -->
      <div v-if="mensagemErro" class="alert-custom alert-danger">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        {{ mensagemErro }}
      </div>

      <!-- Gráfico e Stats -->
      <div v-if="solicitacoes.length > 0" class="chart-stats-section mb-4">
        <div class="chart-card-modern">
          <div class="chart-header">
            <h3 class="chart-title-small">
              <i class="bi bi-pie-chart-fill me-2"></i>
              Distribuição por Tipo
            </h3>
          </div>
          <div class="chart-body-modern">
            <Doughnut :data="chartData" :options="chartOptions" />
          </div>
        </div>
      </div>

      <!-- Campo de busca -->
      <div class="search-section mb-4">
        <div class="search-bar-modern position-relative">
          <i class="bi bi-search search-icon-modern"></i>
          <input
            v-model="termoBusca"
            type="text"
            class="form-control search-input-modern"
            placeholder="Buscar por nome ou tipo de documento..."
          />
        </div>
      </div>

      <!-- Tabela -->
      <div v-if="paginadas.length > 0" class="table-section">
        <div class="table-responsive shadow-sm rounded-4 bg-white mb-4">
          <table class="table mb-0 align-middle custom-table-solicitacoes">
            <thead class="bg-light">
              <tr>
                <th class="py-3 ps-4 border-0">Nome</th>
                <th class="py-3 border-0">Tipo de Documento</th>
                <th class="py-3 pe-4 text-end border-0">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in paginadas"
                :key="item._id || item.id"
                class="hover-row-solicitacoes"
              >
                <td class="ps-4" data-label="Nome">
                  <div class="d-flex align-items-center gap-2">
                    <div class="avatar-initials">{{ item.nome_completo.charAt(0).toUpperCase() }}</div>
                    <span class="fw-semibold text-dark text-truncate-solicitacoes">{{ item.nome_completo }}</span>
                  </div>
                </td>
                <td data-label="Tipo de Documento">
                  <span class="badge badge-tipo">{{ item.tipo_documento }}</span>
                </td>
                <td class="pe-4 text-end" data-label="Ações">
                  <button
                    class="btn btn-purple-modern btn-sm"
                    @click="selecionarSolicitante(item)"
                  >
                    <i class="bi bi-eye-fill me-1"></i>
                    Ver Detalhes
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginação -->
        <div class="d-flex justify-content-center align-items-center p-3">
          <div class="pagination-container-modern d-flex align-items-center gap-2">
            <button
              class="btn btn-pagination"
              @click="irParaPagina(paginaAtual - 1)"
              :disabled="paginaAtual === 1"
            >
              <i class="bi bi-chevron-left"></i>
            </button>
            <span class="pagination-info">
              Pág. {{ paginaAtual }} / {{ totalPaginas || 1 }}
            </span>
            <button
              class="btn btn-pagination"
              @click="irParaPagina(paginaAtual + 1)"
              :disabled="paginaAtual === totalPaginas || totalPaginas === 0"
            >
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Estado vazio -->
      <div v-else-if="!mensagemErro" class="empty-state">
        <i class="bi bi-inbox empty-icon"></i>
        <h4>Nenhuma Solicitação Encontrada</h4>
        <p>{{ termoBusca ? 'Tente ajustar os filtros de busca.' : 'Não há solicitações no momento.' }}</p>
      </div>

      <!-- Detalhes do solicitante - Modal Style -->
      <transition name="modal-fade">
        <div v-if="solicitanteSelecionado" class="modal-backdrop-solicitante" @click.self="fecharDetalhes">
          <div class="modal-content-solicitante">
            <div class="modal-header-solicitante">
              <div>
                <h4 class="modal-title-solicitante">
                  <i class="bi bi-person-circle me-2"></i>
                  Detalhes da Solicitação
                </h4>
                <p class="modal-subtitle-solicitante">Informações completas do solicitante</p>
              </div>
              <button class="btn-close-modal" @click="fecharDetalhes">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

            <div class="modal-body-solicitante">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="detail-label">
                    <i class="bi bi-person-fill me-1"></i> Nome Completo
                  </label>
                  <div class="detail-value">{{ solicitanteSelecionado.nome_completo }}</div>
                </div>
                <div class="col-md-6">
                  <label class="detail-label">
                    <i class="bi bi-file-earmark-text-fill me-1"></i> Tipo de Documento
                  </label>
                  <div class="detail-value">{{ solicitanteSelecionado.tipo_documento }}</div>
                </div>
                <div class="col-md-6">
                  <label class="detail-label">
                    <i class="bi bi-telephone-fill me-1"></i> Contacto
                  </label>
                  <div class="detail-value">{{ solicitanteSelecionado.contacto }}</div>
                </div>
                <div class="col-md-6">
                  <label class="detail-label">
                    <i class="bi bi-people-fill me-1"></i> Afiliação
                  </label>
                  <div class="detail-value">{{ solicitanteSelecionado.afiliacao || "-" }}</div>
                </div>
                <div class="col-md-6">
                  <label class="detail-label">
                    <i class="bi bi-geo-alt-fill me-1"></i> Local de Emissão
                  </label>
                  <div class="detail-value">{{ solicitanteSelecionado.local_emissao || "-" }}</div>
                </div>
                <div class="col-md-6">
                  <label class="detail-label">
                    <i class="bi bi-calendar-fill me-1"></i> Data de Nascimento
                  </label>
                  <div class="detail-value">{{ solicitanteSelecionado.data_nascimento || "-" }}</div>
                </div>
                <div class="col-md-6">
                  <label class="detail-label">
                    <i class="bi bi-card-text me-1"></i> Número do BI
                  </label>
                  <div class="detail-value">{{ solicitanteSelecionado.numero_bi || "-" }}</div>
                </div>
                <div class="col-md-6">
                  <label class="detail-label">
                    <i class="bi bi-chat-left-text-fill me-1"></i> Motivo
                  </label>
                  <div class="detail-value">{{ solicitanteSelecionado.motivo || "-" }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap');
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css");

.solicitacoes-wrapper {
  width: 100%;
  background-color: #ffffff;
  padding: 3rem 0;
}

.solicitacoes-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  font-family: 'Poppins', sans-serif;
}

/* Header */
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
  font-family: 'Poppins', sans-serif;
  font-weight: 900;
  color: #800080;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
  color: #6c757d;
  margin: 0;
}

.total-badge {
  background: linear-gradient(135deg, #800080 0%, #6a006a 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 12px rgba(128, 0, 128, 0.25);
}

.badge-label {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.9;
}

.badge-count {
  font-family: 'Poppins', sans-serif;
  font-weight: 900;
  font-size: 1.75rem;
}

/* Chart Section */
.chart-stats-section {
  max-width: 700px;
  margin: 0 auto;
}

.chart-card-modern {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.chart-header {
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 1px solid #e0e0e0;
}

.chart-title-small {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  color: #212529;
  margin: 0;
}

.chart-body-modern {
  padding: 2rem;
  height: 350px;
}

/* Search */
.search-bar-modern .search-icon-modern {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #adb5bd;
  font-size: 1.1rem;
}

.search-input-modern {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  padding: 0.875rem 1rem 0.875rem 3.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  transition: all 0.3s ease;
  background-color: #ffffff;
  font-size: 0.95rem;
}

.search-input-modern:focus {
  border-color: #800080;
  box-shadow: 0 4px 12px rgba(128, 0, 128, 0.15);
  transform: translateY(-2px);
}

/* Table */
.custom-table-solicitacoes th {
  font-family: 'Poppins', sans-serif;
  font-weight: 900;
  text-transform: uppercase;
  font-size: 0.85rem;
  color: #6c757d;
  letter-spacing: 0.5px;
}

.custom-table-solicitacoes td {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
}

.hover-row-solicitacoes {
  transition: all 0.3s ease;
}

.hover-row-solicitacoes:hover {
  background-color: #f8f9fa !important;
  transform: translateX(4px);
}

.avatar-initials {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #800080 0%, #6a006a 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1rem;
  box-shadow: 0 4px 8px rgba(128, 0, 128, 0.2);
  flex-shrink: 0;
}

.text-truncate-solicitacoes {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge-tipo {
  background-color: rgba(76, 175, 80, 0.15);
  color: #4CAF50;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  font-family: 'Poppins', sans-serif;
}

.btn-purple-modern {
  background: linear-gradient(135deg, #800080 0%, #6a006a 100%);
  border: none;
  color: white;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-purple-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(128, 0, 128, 0.3);
  background: linear-gradient(135deg, #6a006a 0%, #800080 100%);
  color: white;
}

/* Pagination */
.btn-pagination {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
  background-color: #ffffff;
  color: #495057;
  font-weight: 700;
  transition: all 0.3s ease;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-pagination:hover:not(:disabled) {
  background-color: #800080;
  border-color: #800080;
  color: white;
  transform: scale(1.1);
}

.btn-pagination:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-info {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  color: #495057;
  font-size: 0.9rem;
  padding: 0 1rem;
}

/* Modal */
.modal-backdrop-solicitante {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  backdrop-filter: blur(5px);
  padding: 1rem;
}

.modal-content-solicitante {
  background: white;
  border-radius: 20px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

.modal-header-solicitante {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 1px solid #e0e0e0;
}

.modal-title-solicitante {
  font-family: 'Poppins', sans-serif;
  font-weight: 900;
  color: #800080;
  font-size: 1.5rem;
  margin: 0;
}

.modal-subtitle-solicitante {
  font-family: 'Poppins', sans-serif;
  color: #6c757d;
  margin: 0;
  font-size: 0.9rem;
}

.btn-close-modal {
  background: #f8f9fa;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #495057;
}

.btn-close-modal:hover {
  background: #800080;
  color: white;
  transform: rotate(90deg);
}

.modal-body-solicitante {
  padding: 2rem;
}

.detail-label {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 0.875rem;
  color: #495057;
  margin-bottom: 0.5rem;
  display: block;
}

.detail-value {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  background: #f8f9fa;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: #212529;
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
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  color: #495057;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-family: 'Poppins', sans-serif;
  color: #6c757d;
}

/* Animations */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
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

  .total-badge {
    justify-content: center;
  }

  .chart-body-modern {
    height: 300px;
    padding: 1rem;
  }

  .custom-table-solicitacoes thead {
    display: none;
  }

  .custom-table-solicitacoes tbody tr {
    display: block;
    margin-bottom: 1rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 1rem;
    border: 1px solid #e0e0e0;
  }

  .custom-table-solicitacoes td {
    display: block;
    padding: 0.75rem 0 !important;
    border: none;
    text-align: left !important;
  }

  .custom-table-solicitacoes td::before {
    content: attr(data-label);
    font-weight: 700;
    color: #495057;
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.75rem;
    text-transform: uppercase;
  }

  .custom-table-solicitacoes td[data-label="Ações"] {
    text-align: center !important;
    padding-top: 1rem !important;
  }

  .text-truncate-solicitacoes {
    max-width: 100%;
  }
}
</style>
