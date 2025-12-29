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
      <div class="d-flex justify-content-center mb-4 flex-wrap gap-2">
        <div class="d-flex align-items-center">
             <button @click="gerarRelatorioPDF" class="btn btn-outline-dark mb-0 me-3 d-flex align-items-center">
                <i class="bi bi-file-earmark-pdf-fill me-2 text-danger"></i> Exportar PDF
             </button>
        </div>
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
                :class="{ 
                  active: activeSector === setor.id,
                  'opacity-75': isSetorBloqueado(setor.id)
                }"
                @click="mudarSetor(setor.id)"
                href="javascript:;"
                role="tab"
                :style="isSetorBloqueado(setor.id) ? 'cursor: not-allowed' : ''"
              >
                <i class="bi" :class="setor.icone + ' me-2'"></i>
                <span class="ms-1">{{ setor.nome }}</span>
                <i v-if="isSetorBloqueado(setor.id)" class="bi bi-lock-fill ms-2 text-danger" title="Restrito a SuperAdmin"></i>
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
                  <button type="submit" class="btn bg-gradient-primary w-100 mt-2" :disabled="isSaving">
                    <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    <i v-else class="bi bi-plus-circle me-2"></i> 
                    {{ isSaving ? 'A guardar...' : 'Registar Atividade' }}
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
                <transition-group name="list" tag="ul" class="list-group">
                  <li
                    v-for="(ativ, index) in atividadesPaginadas"
                    :key="ativ?._id || ativ?.id || index"
                    class="list-group-item border-0 d-flex justify-content-between ps-0 mb-3 border-radius-lg bg-white shadow-sm"
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
                        <div class="d-flex align-items-center mt-1">
                          <small class="text-xxs text-secondary me-3">
                            <i class="bi bi-clock me-1"></i> {{ formatarData(ativ.data) }}
                          </small>
                          <small :class="statusClass(ativ.status)" class="text-xxs font-weight-bold">
                            <i class="bi bi-circle-fill me-1" style="font-size: 6px;"></i> {{ ativ.status }}
                          </small>
                        </div>
                      </div>
                    </div>
                    <div class="d-flex align-items-center pe-3">
                      <select
                        v-model="ativ.status"
                        @change="atualizarStatus(ativ)"
                        class="form-select form-select-sm border-0 bg-light fw-bold me-3 text-center rounded-pill px-3"
                        :class="statusClass(ativ.status)"
                        style="width: auto; font-size: 0.75rem;"
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Em Progresso">Em Progresso</option>
                        <option value="Concluído">Concluído</option>
                      </select>
                      <button
                        @click="removerAtividade(ativ.id, ativ._id)"
                        class="btn btn-icon-only btn-rounded btn-outline-danger mb-0 btn-sm ms-2"
                        title="Eliminar"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </li>
                </transition-group>

                <!-- Paginação -->
                <div v-if="totalPaginas > 1" class="d-flex justify-content-center align-items-center mt-4 gap-3">
                  <button 
                    @click="paginaAtual--" 
                    :disabled="paginaAtual === 1"
                    class="btn btn-outline-dark btn-sm mb-0 rounded-circle p-2"
                    style="width: 35px; height: 35px;"
                  >
                    <i class="bi bi-chevron-left"></i>
                  </button>
                  
                  <span class="text-sm font-weight-bold text-dark">
                    Página {{ paginaAtual }} de {{ totalPaginas }}
                  </span>
                  
                  <button 
                    @click="paginaAtual++" 
                    :disabled="paginaAtual === totalPaginas"
                    class="btn btn-outline-dark btn-sm mb-0 rounded-circle p-2"
                    style="width: 35px; height: 35px;"
                  >
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- STATISTICS VIEW -->
      <div v-else class="stats-view animate__animated animate__fadeIn">
        <!-- FILTROS DAS ESTATÍSTICAS -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card shadow-sm border-radius-lg bg-white p-3">
              <div class="d-flex align-items-center flex-wrap gap-3">
                <div class="d-flex align-items-center">
                  <i class="bi bi-funnel-fill text-primary me-2"></i>
                  <span class="fw-bold text-dark me-3">Filtrar:</span>
                </div>
                
                <div class="flex-grow-1 min-width-200">
                  <select v-model="filtroSetorStats" class="form-select form-select-sm border p-2">
                    <option value="todos">Todos os Setores</option>
                    <option v-for="setor in setores" :key="setor.id" :value="setor.id">
                      {{ setor.nome }}
                    </option>
                  </select>
                </div>
                
                <div class="flex-grow-1 min-width-200">
                  <select v-model="filtroPeriodoStats" class="form-select form-select-sm border p-2">
                    <option value="todos">Todo o Período</option>
                    <option value="hoje">Hoje</option>
                    <option value="semana">Últimos 7 dias</option>
                    <option value="mes">Último mês</option>
                  </select>
                </div>

                <button @click="resetFiltrosStats" class="btn btn-link text-secondary mb-0 p-2">
                  <i class="bi bi-x-circle me-1"></i> Limpar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <!-- Summary Cards -->
          <div class="col-md-3 mb-4">
            <div class="card shadow-sm border-radius-lg bg-white p-3 text-center border-left-primary h-100">
              <p class="text-sm mb-0 text-capitalize font-weight-bold">Total Filtrado</p>
              <h5 class="font-weight-bolder mb-0">{{ atividadesFiltradasStats.length }}</h5>
            </div>
          </div>
          <div class="col-md-3 mb-4">
            <div class="card shadow-sm border-radius-lg bg-white p-3 text-center border-left-success h-100">
              <p class="text-sm mb-0 text-capitalize font-weight-bold text-success">Concluídas</p>
              <h5 class="font-weight-bolder mb-0">{{ countByStatus('Concluído') }}</h5>
            </div>
          </div>
          <div class="col-md-3 mb-4">
            <div class="card shadow-sm border-radius-lg bg-white p-3 text-center border-left-info h-100">
              <p class="text-sm mb-0 text-capitalize font-weight-bold text-info">Em Progresso</p>
              <h5 class="font-weight-bolder mb-0">{{ countByStatus('Em Progresso') }}</h5>
            </div>
          </div>
          <div class="col-md-3 mb-4">
            <div class="card shadow-sm border-radius-lg bg-white p-3 text-center border-left-warning h-100">
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
                <Doughnut v-if="atividadesFiltradasStats.length > 0" :data="statusChartData" :options="chartOptions" />
                <div v-else class="text-center py-5">Sem dados para exibir.</div>
              </div>
            </div>
          </div>
          <!-- Chart Sectors -->
          <div class="col-lg-7 mb-4">
            <div class="card shadow-lg border-radius-lg p-3 h-100">
              <h6 class="font-weight-bold mb-4">Atividades por Sector</h6>
              <div class="chart-container" style="position: relative; height:250px;">
                <Bar v-if="atividadesFiltradasStats.length > 0" :data="sectorChartData" :options="chartOptions" />
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
import { ref, computed, onMounted, onUnmounted } from "vue";
import Swal from "sweetalert2";
import axios from "axios";
import { io } from "socket.io-client";

// Configuração de Toast do SweetAlert2
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});

// Configuração da API
const API_URL = "https://apirpa.onrender.com/api";
const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

// Chart.js imports
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { Doughnut, Bar } from 'vue-chartjs';

// PDF Export Imports
import jsPDF from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale);

const carregando = ref(false);
const isSaving = ref(false);
const viewMode = ref("registo"); // 'registo' ou 'stats'
const paginaAtual = ref(1);
const itensPorPagina = 5;

// Filtros de Estatísticas
const filtroSetorStats = ref("todos");
const filtroPeriodoStats = ref("todos"); // todos, hoje, semana, mes

// Setores e Tarefas
const setores = [
  { id: "ceo", nome: "CEO", icone: "bi-shield-shaded", tarefas: ["Definição de Visão e Metas", "Tomada de Decisão Estratégica", "Supervisão de Áreas", "Resolução de Casos Críticos", "Representação da Empresa", "Auditoria de Ética e Segurança"] },
  { id: "rh", nome: "RH", icone: "bi-people", tarefas: ["Recrutamento e Seleção", "Integração de Novos Membros (Onboarding)", "Processamento de Salários", "Gestão de Faltas e Férias", "Avaliação de Desempenho", "Plano de Formação e Treino"] },
  { id: "ti", nome: "TI", icone: "bi-laptop", tarefas: ["Manutenção de Sistemas", "Suporte Técnico Interno", "Gestão de Base de Dados", "Desenvolvimento de Novas Features", "Segurança da Informação", "Otimização de Servidores"] },
  { id: "marketing", nome: "Marketing", icone: "bi-megaphone", tarefas: ["Gestão de Redes Sociais", "Criação de Campanhas (Ads)", "Produção de Conteúdo", "Análise de Métricas de Tráfego", "Email Marketing", "Design Gráfico / Branding"] },
  { id: "vendas", nome: "Vendas", icone: "bi-cart-check", tarefas: ["Atendimento ao Cliente", "Explicação de Serviços e Prazos", "Criação de Pedidos", "Follow-up de Vendas", "Conversão de Leads", "Pós-Venda"] },
  { id: "processos", nome: "Processos", icone: "bi-gear-wide-connected", tarefas: ["Análise de Pedidos", "Organização de Fluxos", "Submissão de Documentação", "Acompanhamento de Prazos", "Atualização de Status", "Conclusão de Processos"] },
  { id: "operacoes", nome: "Operações", icone: "bi-globe", tarefas: ["Contacto com Entidades Oficiais", "Recolha de Documentos Externos", "Acompanhamento Externo", "Resolução de Bloqueios", "Entrega de Resultados Finais", "Validação de Requisitos"] },
  { id: "financeiro", nome: "Financeiro", icone: "bi-cash-coin", tarefas: ["Controle de Pagamentos", "Emissão de Recibos", "Organização de Dados Financeiros", "Geração de Relatórios", "Controle de Produtividade", "Apoio à Decisão (Dados)"] }
];

// SEGURANÇA: Controlo de acesso aos setores
const currentUserRole = ref(localStorage.getItem("role") || "cliente");
const setoresRestritos = ["ceo", "financeiro"]; // Bloqueados para Admin normal

const isSetorBloqueado = (setorId) => {
  if (currentUserRole.value === 'SuperAdmin') return false;
  return setoresRestritos.includes(setorId);
};

// Se não for SuperAdmin, começa no RH (evita erro de acesso ao CEO)
const activeSector = ref(isSetorBloqueado("ceo") ? "rh" : "ceo");
const listaAtividades = ref([]);
const novaAtividade = ref({ titulo: "", descricao: "", status: "Pendente" });

const setorNomeAtual = computed(() => setores.find(s => s.id === activeSector.value)?.nome || "");
const tarefasSetorAtual = computed(() => setores.find(s => s.id === activeSector.value)?.tarefas || []);
const atividadesSetorAtual = computed(() => {
  if (!listaAtividades.value) return [];
  return listaAtividades.value.filter(a => a && a.setorId === activeSector.value);
});

const totalPaginas = computed(() => {
  return Math.ceil(atividadesSetorAtual.value.length / itensPorPagina);
});

const atividadesPaginadas = computed(() => {
  const inicio = (paginaAtual.value - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  return atividadesSetorAtual.value.slice(inicio, fim);
});

const mudarSetor = (id) => {
  if (isSetorBloqueado(id)) {
    Swal.fire({
      icon: 'warning',
      title: 'Acesso Restrito',
      text: 'Este departamento é exclusivo para SuperAdmin.',
      confirmButtonColor: '#800080',
      toast: true,
      position: 'top-end',
      timer: 3000,
      showConfirmButton: false
    });
    return;
  }
  activeSector.value = id;
  paginaAtual.value = 1;
};

// Logica de Filtro de Estatísticas
const atividadesFiltradasStats = computed(() => {
  let filtradas = listaAtividades.value || [];
  
  // Filtro por Setor
  if (filtroSetorStats.value !== "todos") {
    filtradas = filtradas.filter(a => a && a.setorId === filtroSetorStats.value);
  }
  
  // Filtro por Período
  if (filtroPeriodoStats.value !== "todos") {
    const agora = new Date();
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    
    filtradas = filtradas.filter(a => {
      if (!a.data) return false;
      const dataAtiv = new Date(a.data);
      
      if (filtroPeriodoStats.value === "hoje") {
        return dataAtiv >= hoje;
      } else if (filtroPeriodoStats.value === "semana") {
        const umaSemanaAtras = new Date(hoje);
        umaSemanaAtras.setDate(hoje.getDate() - 7);
        return dataAtiv >= umaSemanaAtras;
      } else if (filtroPeriodoStats.value === "mes") {
        const umMesAtras = new Date(hoje);
        umMesAtras.setMonth(hoje.getMonth() - 1);
        return dataAtiv >= umMesAtras;
      }
      return true;
    });
  }
  
  return filtradas;
});

const resetFiltrosStats = () => {
  filtroSetorStats.value = "todos";
  filtroPeriodoStats.value = "todos";
};

// Estatísticas
const countByStatus = (status) => {
  if (!atividadesFiltradasStats.value) return 0;
  return atividadesFiltradasStats.value.filter(a => a && a.status === status).length;
};

const statusChartData = computed(() => ({
  labels: ['Pendente', 'Em Progresso', 'Concluído'],
  datasets: [{
    backgroundColor: ['#fb8c00', '#1a73e8', '#4caf50'],
    data: [countByStatus('Pendente'), countByStatus('Em Progresso'), countByStatus('Concluído')]
  }]
}));

const sectorChartData = computed(() => {
  // Se o filtro de setor estiver ativo, mostramos apenas aquele setor no gráfico de barras
  const setoresParaExibir = filtroSetorStats.value === "todos" 
    ? setores 
    : setores.filter(s => s.id === filtroSetorStats.value);

  const counts = setoresParaExibir.map(s => {
    if (!atividadesFiltradasStats.value) return 0;
    return atividadesFiltradasStats.value.filter(a => a && a.setorId === s.id).length;
  });

  return {
    labels: setoresParaExibir.map(s => s.nome),
    datasets: [{
      label: 'Atividades',
      backgroundColor: '#800080',
      data: counts
    }]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'bottom' }
  }
};

// Métodos de API
const carregarAtividades = async () => {
  carregando.value = true;
  try {
    const { data } = await axios.get(`${API_URL}/atividades`, getHeaders());
    listaAtividades.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Erro ao carregar do backend, tentando localStorage...", error);
    const salvas = localStorage.getItem("rpa_atividades_colaboradores");
    if (salvas) {
      try {
        const parsed = JSON.parse(salvas);
        listaAtividades.value = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Erro ao fazer parse do localStorage", e);
        listaAtividades.value = [];
      }
    }
  } finally {
    carregando.value = false;
  }
};

const adicionarAtividade = async () => {
  if (!novaAtividade.value.titulo || !novaAtividade.value.descricao) return;
  
  isSaving.value = true;
  const payload = {
    setorId: activeSector.value,
    titulo: novaAtividade.value.titulo,
    descricao: novaAtividade.value.descricao,
    status: novaAtividade.value.status
  };

  try {
    const { data } = await axios.post(`${API_URL}/atividades`, payload, getHeaders());
    if (data) {
      listaAtividades.value.unshift(data);
      Toast.fire({
        icon: 'success',
        title: 'Atividade registada com sucesso!'
      });
    }
    novaAtividade.value = { titulo: "", descricao: "", status: "Pendente" };
  } catch (error) {
    console.error("Erro ao salvar no backend, salvando localmente...", error);
    const novaLocal = { ...payload, id: Date.now(), data: new Date().toISOString() };
    listaAtividades.value.unshift(novaLocal);
    salvarLocal();
    novaAtividade.value = { titulo: "", descricao: "", status: "Pendente" };
    Toast.fire({
      icon: 'info',
      title: 'Salvo localmente (Servidor Offline)'
    });
  } finally {
    isSaving.value = false;
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
    title: "Tens a certeza?",
    text: "Esta atividade será eliminada permanentemente.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#800080",
    confirmButtonText: "Sim, eliminar",
    cancelButtonText: "Cancelar",
    reverseButtons: true
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        if (backendId || typeof id === 'string') {
          await axios.delete(`${API_URL}/atividades/${backendId || id}`, getHeaders());
        }
        listaAtividades.value = listaAtividades.value.filter(a => (a?._id || a?.id) !== (backendId || id));
        salvarLocal();
        Toast.fire({
          icon: 'success',
          title: 'Atividade eliminada'
        });
      } catch (error) {
        console.error("Erro ao eliminar no backend", error);
        listaAtividades.value = listaAtividades.value.filter(a => (a?._id || a?.id) !== (backendId || id));
        salvarLocal();
        Toast.fire({
          icon: 'success',
          title: 'Eliminado localmente'
        });
      }
    }
  });
};

const salvarLocal = () => localStorage.setItem("rpa_atividades_colaboradores", JSON.stringify(listaAtividades.value));
const formatarData = (isoDate) => new Date(isoDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const statusClass = (status) => {
  if (status === "Concluído") return "text-success";
  if (status === "Em Progresso") return "text-info";
  return "text-warning";
};


// --- GERAÇÃO DE RELATÓRIO PDF ---
const gerarRelatorioPDF = () => {
  if (listaAtividades.value.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Sem dados',
      text: 'Não há atividades para gerar relatório.',
      confirmButtonColor: '#800080'
    });
    return;
  }

  const doc = new jsPDF();
  
  // Header com cor da marca
  doc.setFillColor(128, 0, 128); // Roxo #800080
  doc.rect(0, 0, 210, 20, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Atividades - RPA", 105, 13, { align: "center" });
  
  // Informações do Relatório
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Data de Emissão: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
  doc.text(`Total de Registos: ${listaAtividades.value.length}`, 14, 35);
  
  // Preparar dados para tabela
  // Colunas: Status, Setor, Atividade, Descrição, Data
  const tableColumn = ["Status", "Setor", "Atividade", "Descrição", "Data"];
  const tableRows = [];
  
  listaAtividades.value.forEach(activity => {
    // Buscar nome do setor
    const setorObj = setores.find(s => s.id === activity.setorId);
    const nomeSetor = setorObj ? setorObj.nome : activity.setorId || "N/A";
    
    // Tratamento de dados
    const activityData = [
      activity.status,
      nomeSetor,
      activity.titulo,
      activity.descricao?.substring(0, 50) + (activity.descricao?.length > 50 ? '...' : ''), // Truncar descrição longa
      formatarData(activity.data)
    ];
    tableRows.push(activityData);
  });
  
  // Gerar Tabela
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: 'grid',
    headStyles: {
      fillColor: [128, 0, 128], // Roxo no header da tabela
      textColor: 255,
      halign: 'center',
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      valign: 'middle'
    },
    columnStyles: {
      0: { fontStyle: 'bold' }, // Status bold
      3: { cellWidth: 70 } // Descrição mais larga
    },
    didParseCell: function(data) {
       // Colorir texto baseado no status
       if (data.section === 'body' && data.column.index === 0) {
           const status = data.cell.raw;
           if (status === 'Concluído') data.cell.styles.textColor = [76, 175, 80]; // Verde
           else if (status === 'Em Progresso') data.cell.styles.textColor = [26, 115, 232]; // Azul
           else if (status === 'Pendente') data.cell.styles.textColor = [251, 140, 0]; // Laranja
       }
    }
  });

  // Footer com numeração
  const pageCount = doc.internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Página ' + i + ' de ' + pageCount, 196, 285, { align: 'right' });
    doc.text('Gerado pelo sistema RPA', 14, 285);
  }

  // Salvar
  doc.save(`Relatorio_Atividades_RPA_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
  
  Swal.fire({
    icon: 'success',
    title: 'Download Iniciado',
    text: 'O seu relatório PDF foi gerado com sucesso.',
    confirmButtonColor: '#800080',
    timer: 2000
  });
};

// --- SOCKET.IO REAL-TIME ---
let socket;

const iniciarSocket = () => {
  // Conectar ao backend
  socket = io("https://apirpa.onrender.com", {
    transports: ["websocket"],
    path: "/socket.io" // Ajuste conforme config backend, se necessário
  });

  socket.on("connect", () => {
    console.log("🟢 Conectado ao Socket.IO para atualizações em tempo real (Colaboradores)");
  });

  // Evento: Nova atividade criada
  socket.on("atividade:criada", (novaAtividade) => {
    console.log("🔔 Socket: Nova atividade recebida", novaAtividade);
    // Adiciona ao topo se não existir
    if (!listaAtividades.value.find(a => a._id === novaAtividade._id)) {
      listaAtividades.value.unshift(novaAtividade);
    }
  });

  // Evento: Atividade atualizada (status)
  socket.on("atividade:atualizada", (atividadeAtualizada) => {
    console.log("🔔 Socket: Atividade atualizada recebida", atividadeAtualizada);
    const index = listaAtividades.value.findIndex(a => a._id === atividadeAtualizada._id);
    if (index !== -1) {
      // Atualiza reativamente
      listaAtividades.value[index] = { ...listaAtividades.value[index], ...atividadeAtualizada };
    }
  });

  // Evento: Atividade removida
  socket.on("atividade:removida", (idRemovido) => {
    console.log("🔔 Socket: Atividade removida", idRemovido);
    listaAtividades.value = listaAtividades.value.filter(a => a._id !== idRemovido);
  });
};

onMounted(() => {
  carregarAtividades();
  iniciarSocket();
});

onUnmounted(() => {
  if (socket) {
    socket.disconnect();
    console.log("🔴 Socket desconectado (Gestão Colaboradores)");
  }
});
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

.min-width-200 {
  min-width: 200px;
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

/* Animations for Transition Group */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.list-move {
  transition: transform 0.4s ease;
}
</style>
