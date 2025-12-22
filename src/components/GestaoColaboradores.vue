<template>
  <div class="gestao-wrapper">
    <div class="gestao-container">
      <!-- Header -->
      <div class="section-header mb-5 text-center">
        <h2 class="section-title">
          <i class="bi bi-person-workspace me-2"></i> Gestão de Colaboradores
        </h2>
        <p class="section-subtitle">Registo de atividades e controlo de processos internos</p>
      </div>

      <!-- Main Navigation Tabs -->
      <div class="d-flex justify-content-center mb-4">
        <div class="nav-wrapper position-relative end-0">
          <ul class="nav nav-pills nav-fill p-1" role="tablist">
            <li class="nav-item">
              <a
                class="nav-link mb-0 px-4 py-1"
                :class="{ active: viewMode === 'registo' }"
                @click="viewMode = 'registo'"
                href="javascript:;"
              >
                <i class="bi bi-pencil-square me-2"></i> Registo
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link mb-0 px-4 py-1"
                :class="{ active: viewMode === 'stats' }"
                @click="viewMode = 'stats'"
                href="javascript:;"
              >
                <i class="bi bi-graph-up-arrow me-2"></i> Estatísticas
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- REGISTO VIEW -->
      <div v-if="viewMode === 'registo'">
        <!-- Sector Tabs -->
        <div class="nav-wrapper position-relative end-0 mb-4 overflow-auto">
          <ul class="nav nav-pills nav-fill p-1 flex-nowrap" role="tablist">
            <li v-for="setor in setores" :key="setor.id" class="nav-item min-width-150">
              <a
                class="nav-link mb-0 px-0 py-1"
                :class="{ active: activeSector === setor.id }"
                @click="activeSector = setor.id"
                href="javascript:;"
                role="tab"
              >
                <i class="bi" :class="setor.icone + ' me-2'"></i>
                <span class="ms-1">{{ setor.nome }}</span>
              </a>
            </li>
          </ul>
        </div>

        <div class="row">
          <!-- Activity Form -->
          <div class="col-lg-4 mb-4">
            <div class="card shadow-lg border-radius-lg p-3">
              <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                <div class="bg-gradient-primary shadow-primary border-radius-lg py-3 pe-1 text-center">
                  <h6 class="text-white font-weight-bolder mb-0">Novo Registo</h6>
                </div>
              </div>
              <div class="card-body px-2 pb-2">
                <form @submit.prevent="adicionarAtividade">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Atividade/Função</label>
                    <select v-model="novaAtividade.titulo" class="form-select border p-2" required>
                      <option value="" disabled>Selecione uma tarefa</option>
                      <option v-for="tarefa in tarefasSetorAtual" :key="tarefa" :value="tarefa">
                        {{ tarefa }}
                      </option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">Descrição / Detalhes</label>
                    <textarea
                      v-model="novaAtividade.descricao"
                      class="form-control border p-2"
                      rows="3"
                      placeholder="Detalhes adicionais..."
                      required
                    ></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">Status Inicial</label>
                    <select v-model="novaAtividade.status" class="form-select border p-2">
                      <option value="Pendente">Pendente</option>
                      <option value="Em Progresso">Em Progresso</option>
                      <option value="Concluído">Concluído</option>
                    </select>
                  </div>
                  <button type="submit" class="btn bg-gradient-primary w-100 mt-2">
                    <i class="bi bi-plus-circle me-2"></i> Registar Atividade
                  </button>
                </form>
              </div>
            </div>
          </div>

          <!-- Activity List -->
          <div class="col-lg-8">
            <div class="card shadow-lg border-radius-lg">
              <div class="card-header pb-0 p-3">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">Atividades de {{ setorNomeAtual }}</h6>
                  <div class="badge bg-gradient-info">{{ atividadesSetorAtual.length }} Registos</div>
                </div>
              </div>
              <div class="card-body p-3">
                <div v-if="atividadesSetorAtual.length === 0" class="text-center py-5">
                  <i class="bi bi-clipboard-x display-1 text-lighter opacity-2"></i>
                  <p class="text-secondary mt-3">Nenhuma atividade registada neste setor.</p>
                </div>
                <ul v-else class="list-group">
                  <li
                    v-for="(ativ, index) in atividadesSetorAtual"
                    :key="ativ._id || ativ.id"
                    class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg bg-white shadow-sm"
                  >
                    <div class="d-flex align-items-center ps-3">
                      <div
                        class="icon icon-shape icon-sm me-3 bg-gradient-dark shadow text-center border-radius-md"
                      >
                        <i class="bi bi-journal-text text-white opacity-10"></i>
                      </div>
                      <div class="d-flex flex-column">
                        <h6 class="mb-1 text-dark text-sm font-weight-bold">{{ ativ.titulo }}</h6>
                        <span class="text-xs text-muted">{{ ativ.descricao }}</span>
                        <small class="text-xxs text-secondary mt-1">
                          <i class="bi bi-clock me-1"></i> {{ formatarData(ativ.data) }}
                        </small>
                      </div>
                    </div>
                    <div class="d-flex align-items-center pe-3">
                      <select
                        v-model="ativ.status"
                        @change="atualizarStatus(ativ)"
                        class="form-select form-select-sm border-0 bg-transparent fw-bold me-3 text-end"
                        :class="statusClass(ativ.status)"
                        style="width: auto;"
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Em Progresso">Em Progresso</option>
                        <option value="Concluído">Concluído</option>
                      </select>
                      <button
                        @click="removerAtividade(ativ.id, ativ._id)"
                        class="btn btn-link text-danger mb-0 px-0"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- STATISTICS VIEW -->
      <div v-else class="stats-view animate__animated animate__fadeIn">
        <div class="row">
          <!-- Summary Cards -->
          <div class="col-md-3 mb-4">
            <div class="card shadow-sm border-radius-lg bg-white p-3 text-center border-left-primary">
              <p class="text-sm mb-0 text-capitalize font-weight-bold">Total Atividades</p>
              <h5 class="font-weight-bolder mb-0">{{ atividades.length }}</h5>
            </div>
          </div>
          <div class="col-md-3 mb-4">
            <div class="card shadow-sm border-radius-lg bg-white p-3 text-center border-left-success">
              <p class="text-sm mb-0 text-capitalize font-weight-bold text-success">Concluídas</p>
              <h5 class="font-weight-bolder mb-0">{{ countByStatus('Concluído') }}</h5>
            </div>
          </div>
          <div class="col-md-3 mb-4">
            <div class="card shadow-sm border-radius-lg bg-white p-3 text-center border-left-info">
              <p class="text-sm mb-0 text-capitalize font-weight-bold text-info">Em Progresso</p>
              <h5 class="font-weight-bolder mb-0">{{ countByStatus('Em Progresso') }}</h5>
            </div>
          </div>
          <div class="col-md-3 mb-4">
            <div class="card shadow-sm border-radius-lg bg-white p-3 text-center border-left-warning">
              <p class="text-sm mb-0 text-capitalize font-weight-bold text-warning">Pendentes</p>
              <h5 class="font-weight-bolder mb-0">{{ countByStatus('Pendente') }}</h5>
            </div>
          </div>
        </div>

        <div class="row mt-4">
          <!-- Chart Status -->
          <div class="col-lg-5 mb-4">
            <div class="card shadow-lg border-radius-lg p-3 h-100">
              <h6 class="font-weight-bold mb-4">Distribuição por Status</h6>
              <div class="chart-container" style="position: relative; height:250px;">
                <Doughnut v-if="atividades.length > 0" :data="statusChartData" :options="chartOptions" />
                <div v-else class="text-center py-5">Sem dados para exibir.</div>
              </div>
            </div>
          </div>
          <!-- Chart Sectors -->
          <div class="col-lg-7 mb-4">
            <div class="card shadow-lg border-radius-lg p-3 h-100">
              <h6 class="font-weight-bold mb-4">Atividades por Sector</h6>
              <div class="chart-container" style="position: relative; height:250px;">
                <Bar v-if="atividades.length > 0" :data="sectorChartData" :options="chartOptions" />
                <div v-else class="text-center py-5">Sem dados para exibir.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="row mt-2">
          <div class="col-12 text-center">
            <p class="text-secondary text-sm">
              <i class="bi bi-info-circle me-1"></i>
              As estatísticas são baseadas em todos os registos feitos pelos colaboradores.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import Swal from "sweetalert2";
import axios from "axios";

// Configuração da API
const API_URL = "https://apirpa.onrender.com/api";
const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

const carregando = ref(false);
const viewMode = ref("registo"); // 'registo' ou 'stats'

// ... (imports do Chart.js permanecem os mesmos)

// Métodos de API
const carregarAtividades = async () => {
  carregando.ref = true;
  try {
    const { data } = await axios.get(`${API_URL}/atividades`, getHeaders());
    atividades.value = data;
  } catch (error) {
    console.warn("Erro ao carregar do backend, tentando localStorage...", error);
    const salvas = localStorage.getItem("rpa_atividades_colaboradores");
    if (salvas) atividades.value = JSON.parse(salvas);
  } finally {
    carregando.value = false;
  }
};

const adicionarAtividade = async () => {
  if (!novaAtividade.value.titulo || !novaAtividade.value.descricao) return;
  
  const payload = {
    setorId: activeSector.value,
    titulo: novaAtividade.value.titulo,
    descricao: novaAtividade.value.descricao,
    status: novaAtividade.value.status
  };

  try {
    const { data } = await axios.post(`${API_URL}/atividades`, payload, getHeaders());
    atividades.value.unshift(data);
    novaAtividade.value = { titulo: "", descricao: "", status: "Pendente" };
    Swal.fire({ icon: "success", title: "Sucesso", text: "Atividade registada no servidor.", timer: 1500, showConfirmButton: false });
  } catch (error) {
    console.error("Erro ao salvar no backend, salvando localmente...", error);
    const novaLocal = { ...payload, id: Date.now(), data: new Date().toISOString() };
    atividades.value.unshift(novaLocal);
    salvarLocal();
    novaAtividade.value = { titulo: "", descricao: "", status: "Pendente" };
    Swal.fire({ icon: "info", title: "Nota", text: "Salvo localmente (Backend indisponível).", timer: 1500 });
  }
};

const atualizarStatus = async (ativ) => {
  try {
    await axios.patch(`${API_URL}/atividades/${ativ._id || ativ.id}`, { status: ativ.status }, getHeaders());
  } catch (error) {
    console.error("Erro ao atualizar status no backend", error);
    salvarLocal();
  }
};

const removerAtividade = (id, backendId) => {
  Swal.fire({
    title: "Tem a certeza?",
    text: "Esta ação não pode ser revertida.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#800080",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sim, eliminar",
    cancelButtonText: "Cancelar"
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        if (backendId || typeof id === 'string') {
          await axios.delete(`${API_URL}/atividades/${backendId || id}`, getHeaders());
        }
        atividades.value = atividades.value.filter(a => (a._id || a.id) !== (backendId || id));
        salvarLocal();
      } catch (error) {
        console.error("Erro ao eliminar no backend", error);
        atividades.value = atividades.value.filter(a => (a._id || a.id) !== (backendId || id));
        salvarLocal();
      }
    }
  });
};

const salvarLocal = () => localStorage.setItem("rpa_atividades_colaboradores", JSON.stringify(atividades.value));
const formatarData = (isoDate) => new Date(isoDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const statusClass = (status) => {
  if (status === "Concluído") return "text-success";
  if (status === "Em Progresso") return "text-info";
  return "text-warning";
};

onMounted(() => carregarAtividades());
</script>

<style scoped>
.gestao-wrapper {
  padding: 1.5rem 0;
  background-color: transparent;
}

.gestao-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-weight: 800;
  color: #800080;
  font-size: 2.2rem;
}

.section-subtitle {
  color: #6c757d;
  font-weight: 400;
}

.nav-pills .nav-link {
  border-radius: 0.75rem;
  font-weight: 600;
  color: #800080;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.nav-pills .nav-link.active {
  background: linear-gradient(135deg, #800080, #6a006a) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(128, 0, 128, 0.3);
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #800080, #5c005c) !important;
}

.shadow-primary {
  box-shadow: 0 4px 20px 0 rgba(128, 0, 128, 0.14), 0 7px 10px -5px rgba(128, 0, 128, 0.4) !important;
}

.text-lighter {
  color: #e9ecef;
}

.list-group-item {
  transition: all 0.2s ease;
  border: none;
}

.list-group-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
}

.border-left-primary { border-left: 4px solid #800080; }
.border-left-success { border-left: 4px solid #4caf50; }
.border-left-info { border-left: 4px solid #1a73e8; }
.border-left-warning { border-left: 4px solid #fb8c00; }

.icon-shape {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.min-width-150 {
  min-width: 150px;
}

.animate__fadeIn {
  animation-duration: 0.5s;
}

@media (max-width: 991px) {
  .nav-pills {
    flex-wrap: nowrap;
  }
}
</style>
