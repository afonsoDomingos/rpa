<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { Modal } from "bootstrap";
import Swal from "sweetalert2";
import api from "../api";
import eventBus from "@/eventBus";
import setNavPills from "@/assets/js/nav-pills.js";
import { useDocumentos } from "@/composables/useDocumentos";

// Verificando se os componentes existem antes de importar
import MaterialSwitch from "@/components/MaterialSwitch.vue";
import MaterialButton from "@/components/MaterialButton.vue";

// Chart.js Imports
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler
);

const router = useRouter();
const {
  documentosReportados,
  documentosProprietarios,
  documentosEncontrados,
  buscarDocumentos,
  buscarDocumentosReportados,
  buscarDocumentosProprietarios,
  procurarDocumento: apiProcurar,
  cadastrarDocumento: apiCadastrar
} = useDocumentos();

// Estado reativo
const activeTab = ref("procurar");
const tipoFiltro = ref("nome");

// Campos de Cadastro
const form = ref({
  nome_completo: "",
  tipo_documento: "",
  numero_documento: "",
  provincia: "",
  contacto: "",
  origem: "",
  concordaTermos: false
});

// Campos de Procura
const busca = ref({
  nome: "",
  tipo: "",
  provincia: "",
  numero: ""
});

const erroMensagem = ref("");
const mensagemErro = ref("");
const mensagemSucesso = ref("");
const nomeError = ref("");
const contactoError = ref("");

// Estado de Carregamento (Skeletons)
const isLoading = ref(false);

// Estatísticas de Pesquisa
const logsPesquisas = ref([]);

const isMilestone = (pos) => {
  if (pos <= 0) return false;
  if (pos <= 1000) return pos % 10 === 0;
  return pos % 100 === 0;
};

const formatUsuario = (u) => {
  if (!u || u === "undefined" || u === "null") return "Visitante";
  if (typeof u === 'object') return u.nome || u.name || "Usuário";
  if (typeof u === 'string' && /^[0-9a-fA-F]{24}$/.test(u)) return "Usuário";
  return u;
};

const verDetalhesUsuario = (log) => {
  const u = log.usuario;
  let nome = "Visitante";
  let email = "Não disponível";

  if (typeof u === 'object' && u !== null) {
    nome = u.nome || u.name || "Usuário";
    email = u.email || "Sem e-mail registrado";
  } else if (typeof u === 'string') {
    nome = u;
  }

  Swal.fire({
    title: '<i class="bi bi-person-badge text-purple me-2"></i> Detalhes do Usuário',
    html: `
      <div class="text-start p-3 bg-light rounded-4">
        <div class="mb-3">
          <small class="text-muted text-uppercase fw-bold" style="font-size: 0.7rem;">Nome Completo</small>
          <div class="fw-bold fs-5 text-dark">${nome}</div>
        </div>
        <div class="mb-3">
          <small class="text-muted text-uppercase fw-bold" style="font-size: 0.7rem;">E-mail de Contacto</small>
          <div class="text-purple fw-bold text-break" style="word-break: break-all;">${email}</div>
        </div>
        <div>
          <small class="text-muted text-uppercase fw-bold" style="font-size: 0.7rem;">Data da Atividade</small>
          <div class="text-dark">${new Date(log.data).toLocaleString()}</div>
        </div>
      </div>
    `,
    showCloseButton: true,
    confirmButtonText: 'Fechar',
    confirmButtonColor: '#800080',
    customClass: { popup: 'border-radius-20' }
  });
};
const statsLoading = ref(false);
const tipoVistaGrafico = ref('mensal'); // 'diaria' ou 'mensal'

const buscarLogsPesquisas = async () => {
  statsLoading.value = true;
  try {
    const res = await api.get('/documentos/pesquisas');
    // Aceita tanto array direto quanto objeto com chaves comuns
    if (Array.isArray(res.data)) {
      logsPesquisas.value = res.data;
    } else if (res.data && typeof res.data === 'object') {
      logsPesquisas.value = res.data.pesquisas || res.data.data || res.data.logs || [];
    }
  } catch (err) {
    console.error("Erro ao buscar logs:", err);
  } finally {
    statsLoading.value = false;
  }
};

const termoMaisProcurado = computed(() => {
  if (!logsPesquisas.value.length) return "Nenhum";
  const contagem = logsPesquisas.value.reduce((acc, log) => {
    acc[log.termo] = (acc[log.termo] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(contagem).reduce((a, b) => contagem[a] > contagem[b] ? a : b);
});

// Dados do Gráfico de Crescimento
const chartData = computed(() => {
  if (tipoVistaGrafico.value === 'diaria') {
    const ultimos7Dias = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const contagemPorDia = logsPesquisas.value.reduce((acc, log) => {
      const dia = new Date(log.data).toISOString().split('T')[0];
      acc[dia] = (acc[dia] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: ultimos7Dias.map(dia => new Date(dia).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })),
      datasets: [
        {
          label: 'Pesquisas Realizadas',
          backgroundColor: 'rgba(128, 0, 128, 0.1)',
          borderColor: '#800080',
          pointBackgroundColor: '#800080',
          data: ultimos7Dias.map(dia => contagemPorDia[dia] || 0),
          fill: true,
          tension: 0.4,
        }
      ]
    };
  } else {
    // Vista Mensal (Últimos 12 meses)
    const ultimos12Meses = [...Array(12)].map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      return d.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
    });

    const contagemPorMes = logsPesquisas.value.reduce((acc, log) => {
      const mes = new Date(log.data).toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
      acc[mes] = (acc[mes] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: ultimos12Meses,
      datasets: [
        {
          label: 'Pesquisas Mensais',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          borderColor: '#0d6efd',
          pointBackgroundColor: '#0d6efd',
          data: ultimos12Meses.map(mes => contagemPorMes[mes] || 0),
          fill: true,
          tension: 0.4,
        }
      ]
    };
  }
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: 'index',
      intersect: false,
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 }
    }
  }
};

const estatisticasPico = computed(() => {
  if (!logsPesquisas.value.length) return { dia: "N/A", mes: "N/A" };

  const contagemDias = {};
  const contagemMeses = {};
  
  logsPesquisas.value.forEach(log => {
    const dataObj = new Date(log.data);
    const dia = dataObj.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' });
    const mes = dataObj.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
    
    contagemDias[dia] = (contagemDias[dia] || 0) + 1;
    contagemMeses[mes] = (contagemMeses[mes] || 0) + 1;
  });

  const diaPico = Object.keys(contagemDias).reduce((a, b) => contagemDias[a] > contagemDias[b] ? a : b);
  const mesPico = Object.keys(contagemMeses).reduce((a, b) => contagemMeses[a] > contagemMeses[b] ? a : b);

  return { 
    dia: diaPico, 
    mes: mesPico,
    totalDia: contagemDias[diaPico],
    totalMes: contagemMeses[mesPico]
  };
});

// Paginação
const paginaAtual = ref(1);
const itensPorPagina = 5;

const totalPaginas = computed(() => {
  if (activeTab.value === 'estatisticas') {
    return Math.ceil(logsPesquisas.value.length / 10);
  }
  const lista = activeTab.value === 'procurar' ? documentosEncontrados.value :
                activeTab.value === 'documentosReportados' ? documentosReportados.value :
                documentosProprietarios.value;
  return Math.ceil(lista.length / itensPorPagina);
});

const documentosPaginados = computed(() => {
  if (activeTab.value === 'estatisticas') {
    const start = (paginaAtual.value - 1) * 10;
    return logsPesquisas.value.slice(start, start + 10);
  }
  const lista = activeTab.value === 'procurar' ? documentosEncontrados.value :
                activeTab.value === 'documentosReportados' ? documentosReportados.value :
                documentosProprietarios.value;
  const start = (paginaAtual.value - 1) * itensPorPagina;
  return lista.slice(start, start + itensPorPagina);
});

const mudarPagina = (p) => {
  if (p >= 1 && p <= totalPaginas.value) paginaAtual.value = p;
};

// Edição
const isEditModalOpen = ref(false);
const documentoEditado = ref({});

// Listas auxiliares
const provincias = ["Maputo", "Maputo Cidade", "Gaza", "Inhambane", "Sofala", "Manica", "Tete", "Zambézia", "Nampula", "Niassa", "Cabo Delgado"];
const tipo_documentos = ["Bilhete de Identidade", "Passaporte", "Cartão de Eleitor", "Cartão de Estudante", "Carta de Condução", "Seguro do Veículo", "Livrete", "Cartão de Identidade Militar", "Outro..."];

const outroTipoDocumento = ref("");

const labelNumeroDocumento = computed(() => {
  const labels = {
    "Bilhete de Identidade": "Número do BI",
    "Passaporte": "Número do Passaporte",
    "Cartão de Eleitor": "Número do Cartão de Eleitor",
    "Cartão de Estudante": "Número do Cartão de Estudante",
    "Carta de Condução": "Número da Carta de Condução",
    "Seguro do Veículo": "Número do Seguro",
    "Livrete": "Número do Livrete",
    "Cartão de Identidade Militar": "Número de ID Militar",
  };
  return labels[form.value.tipo_documento] || "Número do Documento";
});

// Validações
const validarNome = () => {
  const nomeRegex = /^[A-Za-zÀ-ÿ\s]+$/;
  if (!form.value.nome_completo) {
    nomeError.value = "O nome é obrigatório.";
    return false;
  }
  if (!nomeRegex.test(form.value.nome_completo)) {
    nomeError.value = "Nome inválido.";
    return false;
  }
  nomeError.value = "";
  return true;
};

const validarContacto = () => {
  const contactoRegex = /^(84|85|86|87|83)\d{7}$/;
  if (!form.value.contacto) {
    contactoError.value = "O contacto é obrigatório.";
    return false;
  }
  if (!contactoRegex.test(form.value.contacto)) {
    contactoError.value = "Contacto inválido.";
    return false;
  }
  contactoError.value = "";
  return true;
};

// Ações
const changeTab = (tabName) => { activeTab.value = tabName; };

const cadastrar = async () => {
  if (!validarNome() || !validarContacto()) return;
  if (!form.value.concordaTermos) {
    mensagemErro.value = "Aceite os termos.";
    return;
  }

  try {
    const payload = { 
      ...form.value, 
      tipo_documento: form.value.tipo_documento === "Outro..." ? outroTipoDocumento.value : form.value.tipo_documento,
      data_perda: new Date().toISOString().split('T')[0] 
    };

    if (form.value.tipo_documento === "Outro..." && !outroTipoDocumento.value) {
      mensagemErro.value = "Especifique o tipo de documento.";
      return;
    }

    const response = await apiCadastrar(payload);
    mensagemSucesso.value = `Sucesso: ${response.data.nome_completo}`;
    Object.keys(form.value).forEach(k => form.value[k] = k === 'concordaTermos' ? false : "");
    buscarDocumentos();
  } catch (error) {
    mensagemErro.value = error.response?.data?.message || "Erro ao cadastrar.";
  }
};

const procurar = async () => {
  erroMensagem.value = "";
  isLoading.value = true;
  let params = {};
  if (tipoFiltro.value === "nome") params.nome_completo = busca.value.nome;
  else if (tipoFiltro.value === "tipo") params.tipo_documento = busca.value.tipo;
  else if (tipoFiltro.value === "provincia") params.provincia = busca.value.provincia;
  else if (tipoFiltro.value === "numero") params.numero_documento = busca.value.numero;

  if (!Object.keys(params).length) {
    isLoading.value = false;
    return;
  }

  try {
    await apiProcurar(params);
    if (!documentosEncontrados.value.length) {
      erroMensagem.value = "A pesquisa não retornou nenhum documento registrado no sistema.";
    }
  } catch (err) {
    if (err.response && err.response.status === 404) {
      erroMensagem.value = "Pesquisa concluída: nenhum documento correspondente foi encontrado.";
      documentosEncontrados.value = [];
    } else {
      console.error("Erro Admin Search:", err);
      erroMensagem.value = "Erro de rede: Não foi possível alcançar a base de dados administrativa.";
    }
  } finally {
    isLoading.value = false;
  }
};

const partilharWhatsApp = (doc) => {
  const mensagem = `📢 *Documento Admin RPA!*%0A%0A👤 *Nome:* ${doc.nome_completo}%0A📄 *Tipo:* ${doc.tipo_documento}%0A📍 *Província:* ${doc.provincia}%0A%0AConfira em: ${window.location.origin}`;
  window.open(`https://wa.me/?text=${mensagem}`, '_blank');
};

const partilharFacebook = (doc) => {
  const url = encodeURIComponent(window.location.origin);
  const quote = encodeURIComponent(`📢 Documento Encontrado no RPA!\n👤 Nome: ${doc.nome_completo}\n📄 Tipo: ${doc.tipo_documento}\n📍 Província: ${doc.provincia}`);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank');
};

const partilharGeral = async (doc) => {
  const texto = `📢 Documento Encontrado!\n👤 Nome: ${doc.nome_completo}\n📄 Tipo: ${doc.tipo_documento}\n📍 Província: ${doc.provincia}`;
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'RPA Admin - Documentos',
        text: texto,
        url: window.location.origin,
      });
    } catch (err) {
      console.log('Erro ao partilhar', err);
    }
  } else {
    partilharWhatsApp(doc);
  }
};

// Funções Admin
const editarDocumento = (doc) => {
  documentoEditado.value = { ...doc };
  isEditModalOpen.value = true;
};

const salvarEdicao = async () => {
  try {
    await api.put(`/documentos/${documentoEditado.value._id}`, documentoEditado.value);
    Swal.fire("Salvo!", "Documento atualizado.", "success");
    buscarDocumentosReportados();
    isEditModalOpen.value = false;
  } catch (err) {
    Swal.fire("Erro", "Falha ao editar.", "error");
  }
};

const eliminarDocumento = async (doc) => {
  const res = await Swal.fire({
    title: "Confirmar?",
    text: "Esta ação é irreversível.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sim, eliminar"
  });

  if (res.isConfirmed) {
    try {
      await api.delete(`/documentos/${doc._id}`);
      Swal.fire("Eliminado", "", "success");
      buscarDocumentosReportados();
      buscarDocumentos();
    } catch (err) {
      Swal.fire("Erro", "Erro ao eliminar.", "error");
    }
  }
};

const atualizarStatus = async (doc) => {
  try {
    await api.patch(`/documentos/${doc._id}/status`, { status: doc.status, isAdmin: true });
    Swal.fire({ icon: "success", title: "Status Atualizado", timer: 1500, showConfirmButton: false });
  } catch (err) {
    Swal.fire("Erro", "Falha ao atualizar status.", "error");
  }
};

const refreshAll = async () => {
  isLoading.value = true;
  await Promise.all([
    buscarDocumentos(),
    buscarDocumentosReportados(),
    buscarDocumentosProprietarios(),
    buscarLogsPesquisas()
  ]);
  isLoading.value = false;
};

onMounted(async () => {
  eventBus.on("changeTab", changeTab);
  eventBus.on("refreshData", refreshAll);
  setNavPills();
  isLoading.value = true;
  await Promise.all([
    buscarDocumentos(),
    buscarDocumentosReportados(),
    buscarDocumentosProprietarios(),
    buscarLogsPesquisas()
  ]);
  isLoading.value = false;
});

onUnmounted(() => {
  eventBus.off("changeTab", changeTab);
  eventBus.off("refreshData", refreshAll);
});

watch(activeTab, () => { paginaAtual.value = 1; });

watch(tipoFiltro, () => { Object.keys(busca.value).forEach(k => busca.value[k] = ""); });
</script>

<template>
  <section class="verdocumentos-wrapper py-7">
    <div class="verdocumentos-container">
      <!-- Navegação Premium -->
      <div class="nav-wrapper border-bottom mb-4">
        <ul class="nav nav-pills custom-nav-admin p-2 flex-nowrap overflow-auto" role="tablist">
          <li class="nav-item">
            <a class="nav-link text-nowrap" :class="{ active: activeTab === 'procurar' }" @click.prevent="activeTab = 'procurar'" role="tab">
              <i class="bi bi-search me-2"></i> Procurar
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-nowrap" :class="{ active: activeTab === 'cadastrar' }" @click.prevent="activeTab = 'cadastrar'" role="tab">
              <i class="bi bi-file-plus me-2"></i> Reportar
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-nowrap" :class="{ active: activeTab === 'documentosReportados' }" @click.prevent="activeTab = 'documentosReportados'" role="tab">
              <i class="bi bi-file-earmark-text me-2"></i> Reportados
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-nowrap" :class="{ active: activeTab === 'documentosProprietarios' }" @click.prevent="activeTab = 'documentosProprietarios'" role="tab">
              <i class="bi bi-person-badge me-2"></i> Proprietários
            </a>
          </li>
          <li class="nav-item text-nowrap">
            <a class="nav-link text-nowrap" :class="{ active: activeTab === 'estatisticas' }" @click.prevent="activeTab = 'estatisticas'" role="tab">
              <i class="bi bi-bar-chart-line me-2"></i> Estatísticas
            </a>
          </li>
        </ul>
      </div>

      <!-- Conteúdo dinâmico das abas -->
      <div class="tab-content animate-fade-in">
        
        <!-- Aba Procurar -->
        <div v-if="activeTab === 'procurar'" class="tab-pane fade show active">
          <form @submit.prevent="procurar" class="form-container shadow-lg p-4 rounded-4 bg-white">
            <div class="row">
              <div class="col-md-12 mb-4">
                <label class="form-label fw-bold">Selecione o filtro</label>
                <select class="form-select zoom-field" v-model="tipoFiltro">
                  <option value="nome">Nome Completo</option>
                  <option value="tipo">Tipo de Documento</option>
                  <option value="provincia">Província</option>
                  <option value="numero">Número de Documento</option>
                </select>
              </div>

              <!-- Campos de busca dinâmicos -->
              <div v-if="tipoFiltro === 'nome'" class="col-md-12 mb-3">
                <input type="text" class="form-control zoom-field" v-model="busca.nome" placeholder="Digite o nome completo..." />
              </div>
              <div v-if="tipoFiltro === 'tipo'" class="col-md-12 mb-3">
                <select class="form-select zoom-field" v-model="busca.tipo">
                  <option disabled value="">Selecione o tipo...</option>
                  <option v-for="t in tipo_documentos" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <div v-if="tipoFiltro === 'provincia'" class="col-md-12 mb-3">
                <select class="form-select zoom-field" v-model="busca.provincia">
                  <option disabled value="">Selecione a província...</option>
                  <option v-for="p in provincias" :key="p" :value="p">{{ p }}</option>
                </select>
              </div>
              <div v-if="tipoFiltro === 'numero'" class="col-md-12 mb-3">
                <input type="text" class="form-control zoom-field" v-model="busca.numero" placeholder="Digite o número do documento..." />
              </div>

              <div class="text-center mt-3">
                <button type="submit" class="btn btn-purple btn-lg w-100">Procurar</button>
              </div>
            </div>

            <!-- Feedback de busca vazia -->
            <div v-if="erroMensagem" class="alert alert-warning mt-4 text-center animate-pulse">
              {{ erroMensagem }}
            </div>
          </form>

          <!-- Resultados da Busca -->
          <div v-if="isLoading" class="mt-5">
            <div v-for="i in 3" :key="i" class="skeleton-row mb-3"></div>
          </div>

          <div v-else-if="documentosEncontrados.length > 0" class="mt-5 table-responsive shadow-sm rounded-4">
            <table class="table table-hover align-middle bg-white overflow-hidden custom-table-admin">
              <thead class="bg-purple text-white">
                <tr class="d-none d-lg-table-row">
                  <th class="ps-4">Nome</th>
                  <th>Documento</th>
                  <th>Província</th>
                  <th class="text-end pe-4">Ação</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="doc in documentosPaginados" :key="doc._id" class="table-row">
                  <td data-label="Nome" class="ps-4 fw-bold text-dark">{{ doc.nome_completo }}</td>
                  <td data-label="Documento"><span class="badge bg-purple-soft">{{ doc.tipo_documento }}</span></td>
                  <td data-label="Província">{{ doc.provincia }}</td>
                  <td data-label="Ação" class="text-end pe-4">
                    <div class="d-flex justify-content-end gap-2 align-items-center">
                      <div class="btn-group btn-group-sm rounded-pill overflow-hidden shadow-sm">
                        <button class="btn btn-whatsapp px-2" @click="partilharWhatsApp(doc)" title="WhatsApp">
                          <i class="bi bi-whatsapp"></i>
                        </button>
                        <button class="btn btn-facebook px-2" @click="partilharFacebook(doc)" title="Facebook">
                           <i class="bi bi-facebook"></i>
                        </button>
                        <button class="btn btn-share px-2" @click="partilharGeral(doc)" title="Instagram / Outros">
                           <i class="bi bi-share"></i>
                        </button>
                      </div>
                      <MaterialButton color="success" size="sm" @click="editarDocumento(doc)">Gerenciar</MaterialButton>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-else-if="!isLoading && erroMensagem && activeTab === 'procurar'" class="empty-state text-center py-5 mt-4 animate-fade-in shadow-sm">
            <i class="bi bi-search text-muted opacity-25" style="font-size: 4rem;"></i>
            <h5 class="mt-3 fw-bold">Nenhum resultado encontrado</h5>
            <p class="text-muted">Tente ajustar seus filtros ou verifique se o nome está correto.</p>
            <div class="mt-4">
              <button @click="router.push('/comunidade')" class="btn btn-outline-purple btn-sm">
                <i class="bi bi-people-fill me-1"></i> Verificar na Comunidade
              </button>
            </div>
          </div>
        </div>

        <!-- Aba Cadastrar (Formulário Dinâmico) -->
        <div v-if="activeTab === 'cadastrar'" class="tab-pane fade show active">
          <form @submit.prevent="cadastrar" class="form-container shadow-lg p-5 rounded-4 bg-white">
            <h4 class="mb-4 text-purple fw-bold">Registrar Novo Documento</h4>
            <div class="row">
              <div class="col-md-6 mb-4">
                <label class="form-label fw-bold">Nome Completo</label>
                <input type="text" class="form-control zoom-field" v-model="form.nome_completo" placeholder="Como consta no documento" required />
              </div>
              <div class="col-md-6 mb-4">
                <label class="form-label fw-bold">Tipo de Documento</label>
                <select class="form-select zoom-field" v-model="form.tipo_documento" required>
                  <option disabled value="">Selecione...</option>
                  <option v-for="t in tipo_documentos" :key="t" :value="t">{{ t }}</option>
                </select>
                <!-- Campo para Tipo Customizado -->
                <div v-if="form.tipo_documento === 'Outro...'" class="mt-3 animate-fade-in">
                  <input type="text" class="form-control zoom-field" v-model="outroTipoDocumento" placeholder="Especifique o tipo..." required />
                </div>
              </div>
              <div class="col-md-6 mb-4">
                <label class="form-label fw-bold">{{ labelNumeroDocumento }}</label>
                <input type="text" class="form-control zoom-field" v-model="form.numero_documento" required />
              </div>
              <div class="col-md-6 mb-4">
                <label class="form-label fw-bold">Província</label>
                <select class="form-select zoom-field" v-model="form.provincia" required>
                  <option disabled value="">Local da ocorrência...</option>
                  <option v-for="p in provincias" :key="p" :value="p">{{ p }}</option>
                </select>
              </div>
              <div class="col-md-6 mb-4">
                <label class="form-label fw-bold">Contacto (9 dígitos)</label>
                <input type="tel" class="form-control zoom-field" v-model="form.contacto" maxlength="9" placeholder="Ex: 841234567" required />
              </div>
              <div class="col-md-6 mb-4">
                <label class="form-label fw-bold">Origem do Registro</label>
                <select class="form-select zoom-field" v-model="form.origem" required>
                  <option value="proprietario">Perdi meu documento</option>
                  <option value="reportado">Encontrei um documento</option>
                </select>
              </div>
              <div class="col-12 mb-4">
                <MaterialSwitch id="termosSwitch" v-model:checked="form.concordaTermos">
                  Eu concordo com os <a href="#" class="text-purple">termos de uso</a>.
                </MaterialSwitch>
              </div>
              <div class="col-12">
                <button type="submit" class="btn btn-purple btn-lg w-100 py-3 shadow">Finalizar Registro Admin</button>
              </div>
            </div>
            <div v-if="mensagemSucesso" class="alert alert-success mt-4 animate-fade-in">{{ mensagemSucesso }}</div>
            <div v-if="mensagemErro" class="alert alert-danger mt-4 animate-fade-in">{{ mensagemErro }}</div>
          </form>
        </div>

        <!-- Tabelas Administrativas (Reportados e Proprietários) -->
        <div v-if="['documentosReportados', 'documentosProprietarios'].includes(activeTab)" class="tab-pane fade show active">
          <div class="table-responsive shadow-lg rounded-4 bg-white overflow-hidden">
            <table class="table table-hover align-middle mb-0 custom-table-admin">
              <thead class="bg-purple-gradient text-white d-none d-lg-table-header-group">
                <tr class="shadow-sm">
                  <th class="ps-4 py-3 border-0 rounded-start-4"><i class="bi bi-person me-2 opacity-75"></i>Nome</th>
                  <th class="py-3 border-0"><i class="bi bi-file-earmark me-2 opacity-75"></i>Tipo</th>
                  <th class="py-3 border-0"><i class="bi bi-hash me-2 opacity-75"></i>Número</th>
                  <th class="py-3 border-0"><i class="bi bi-telephone me-2 opacity-75"></i>Contacto</th>
                  <th class="py-3 border-0"><i class="bi bi-geo-alt me-2 opacity-75"></i>Província</th>
                  <th v-if="activeTab === 'documentosProprietarios'" class="py-3 border-0"><i class="bi bi-stoplights me-2 opacity-75"></i>Status</th>
                  <th class="text-end pe-4 py-3 border-0 rounded-end-4"><i class="bi bi-gear me-2 opacity-75"></i>Ações</th>
                </tr>
              </thead>
              <tbody class="border-top-0">
                <tr v-if="isLoading" v-for="i in 5" :key="i">
                  <td colspan="7"><div class="skeleton-row-small my-2 rounded-3"></div></td>
                </tr>
                <tr v-else v-for="doc in documentosPaginados" :key="doc._id" class="table-row-responsive transition-all hover-shadow-md">
                  
                  <!-- DESKTOP VIEW (mantém igual) -->
                  <td data-label="Nome" class="ps-4 fw-bold text-dark d-none d-lg-table-cell">
                    <div class="d-flex align-items-center">
                      <div class="avatar-sm bg-purple-soft text-purple rounded-circle me-2 d-flex align-items-center justify-content-center fw-bold">
                        {{ doc.nome_completo.charAt(0) }}
                      </div>
                      <span class="text-break">{{ doc.nome_completo }}</span>
                    </div>
                  </td>
                  <td data-label="Tipo" class="d-none d-lg-table-cell"><span class="badge bg-purple-soft text-purple border border-purple-light shadow-sm">{{ doc.tipo_documento }}</span></td>
                  <td data-label="Número" class="d-none d-lg-table-cell">
                    <code class="bg-light px-2 py-1 rounded border text-muted d-inline-block">{{ doc.numero_documento }}</code>
                  </td>
                  <td data-label="Contacto" class="d-none d-lg-table-cell">
                    <span class="text-muted"><i class="bi bi-whatsapp text-success me-1"></i> {{ doc.contacto }}</span>
                  </td>
                  <td data-label="Província" class="d-none d-lg-table-cell">
                    <span class="text-muted"><i class="bi bi-geo-alt-fill text-danger opacity-75 me-1"></i> {{ doc.provincia }}</span>
                  </td>
                  <td data-label="Status" v-if="activeTab === 'documentosProprietarios'" class="d-none d-lg-table-cell">
                    <div class="position-relative d-inline-block">
                      <select 
                        class="form-select form-select-sm status-select fw-bold border-0 shadow-sm ps-3 pe-5" 
                        :class="doc.status === 'Entregue' || doc.status === 'Recuperado' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning-dark'"
                        style="cursor: pointer; appearance: none;"
                        v-model="doc.status" 
                        @change="atualizarStatus(doc)"
                      >
                        <option value="Pendente" class="bg-white text-dark">⏳ Pendente</option>
                        <option value="Recuperado" class="bg-white text-dark">✅ Entregue</option>
                      </select>
                      <i class="bi bi-chevron-down position-absolute top-50 end-0 translate-middle-y me-2 small opacity-50" style="pointer-events: none;"></i>
                    </div>
                  </td>
                  <td data-label="Ações" class="text-end pe-4 d-none d-lg-table-cell">
                    <div class="d-flex justify-content-end gap-2 align-items-center action-buttons-wrapper">
                      <div class="btn-group btn-group-sm rounded-pill overflow-hidden shadow-sm me-2">
                        <button class="btn btn-whatsapp px-2" @click="partilharWhatsApp(doc)" title="WhatsApp"><i class="bi bi-whatsapp"></i></button>
                        <button class="btn btn-facebook px-2" @click="partilharFacebook(doc)" title="Facebook"><i class="bi bi-facebook"></i></button>
                        <button class="btn btn-share px-2" @click="partilharGeral(doc)" title="Outros"><i class="bi bi-share"></i></button>
                      </div>
                      <div class="btn-group shadow-sm rounded-3">
                        <button class="btn btn-link text-warning btn-sm p-1" @click="editarDocumento(doc)" title="Editar"><i class="bi bi-pencil-square fs-6"></i></button>
                        <button class="btn btn-link text-danger btn-sm p-1" @click="eliminarDocumento(doc)" title="Apagar"><i class="bi bi-trash fs-6"></i></button>
                      </div>
                    </div>
                  </td>

                  <!-- MOBILE VIEW (Design Simples e Limpo) -->
                  <td class="d-lg-none border-0 p-0" colspan="7">
                    <div class="mobile-doc-card">
                      <!-- Nome em Destaque -->
                      <div class="mobile-doc-header">
                        <div class="mobile-avatar">{{ doc.nome_completo.charAt(0) }}</div>
                        <div class="mobile-name">{{ doc.nome_completo }}</div>
                      </div>

                      <!-- Lista de Informações -->
                      <div class="mobile-info-list">
                        <div class="mobile-info-row">
                          <span class="info-label"><i class="bi bi-file-earmark"></i> Tipo</span>
                          <span class="info-value">{{ doc.tipo_documento }}</span>
                        </div>
                        <div class="mobile-info-row">
                          <span class="info-label"><i class="bi bi-hash"></i> Número</span>
                          <span class="info-value">{{ doc.numero_documento }}</span>
                        </div>
                        <div class="mobile-info-row">
                          <span class="info-label"><i class="bi bi-whatsapp text-success"></i> Contacto</span>
                          <span class="info-value">{{ doc.contacto }}</span>
                        </div>
                        <div class="mobile-info-row">
                          <span class="info-label"><i class="bi bi-geo-alt text-danger"></i> Província</span>
                          <span class="info-value">{{ doc.provincia }}</span>
                        </div>
                        <div v-if="activeTab === 'documentosProprietarios'" class="mobile-info-row status-row">
                          <span class="info-label"><i class="bi bi-check-circle"></i> Status</span>
                          <select 
                            class="mobile-status-select" 
                            :class="doc.status === 'Recuperado' ? 'status-entregue' : 'status-pendente'"
                            v-model="doc.status" 
                            @change="atualizarStatus(doc)"
                          >
                            <option value="Pendente">⏳ Pendente</option>
                            <option value="Recuperado">✅ Entregue</option>
                          </select>
                        </div>
                      </div>

                      <!-- Botões de Ação -->
                      <div class="mobile-doc-actions">
                        <button class="mobile-btn whatsapp" @click="partilharWhatsApp(doc)"><i class="bi bi-whatsapp"></i></button>
                        <button class="mobile-btn facebook" @click="partilharFacebook(doc)"><i class="bi bi-facebook"></i></button>
                        <button class="mobile-btn share" @click="partilharGeral(doc)"><i class="bi bi-share"></i></button>
                        <div class="mobile-actions-divider"></div>
                        <button class="mobile-btn edit" @click="editarDocumento(doc)"><i class="bi bi-pencil"></i></button>
                        <button class="mobile-btn delete" @click="eliminarDocumento(doc)"><i class="bi bi-trash"></i></button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-muted mt-3 ms-2 fst-italic">
            Mostrando {{ activeTab === 'documentosReportados' ? 'documentos reportados por terceiros' : 'documentos reportados pelos próprios donos' }}.
          </p>
        </div>

        <!-- Aba Estatísticas -->
        <div v-if="activeTab === 'estatisticas'" class="tab-pane fade show active">
          <div class="row mb-5">
            <div class="col-12 mb-4">
              <div class="card shadow-sm border-0 bg-white p-4 rounded-4">
                <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
                  <div class="d-flex align-items-center gap-3">
                    <h6 class="fw-bold text-dark mb-0">Progresso de Pesquisas</h6>
                    <button class="btn btn-outline-purple btn-sm rounded-pill py-1 px-3" @click="buscarLogsPesquisas" :disabled="statsLoading">
                      <i class="bi bi-arrow-clockwise me-1" :class="{'spin': statsLoading}"></i>
                      {{ statsLoading ? 'A carregar...' : 'Atualizar' }}
                    </button>
                  </div>
                  <div class="btn-group btn-group-sm rounded-pill overflow-hidden border">
                    <button class="btn" :class="tipoVistaGrafico === 'diaria' ? 'btn-purple' : 'btn-light'" @click="tipoVistaGrafico = 'diaria'">Diário (7d)</button>
                    <button class="btn" :class="tipoVistaGrafico === 'mensal' ? 'btn-purple' : 'btn-light'" @click="tipoVistaGrafico = 'mensal'">Mensal (12m)</button>
                  </div>
                </div>
                <div style="height: 300px;">
                  <Line :data="chartData" :options="chartOptions" />
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-4">
              <div class="card shadow-sm border-0 bg-white p-4 rounded-4">
                <div class="d-flex align-items-center">
                  <div class="icon-shape bg-purple-soft rounded-3 p-3 me-3 text-purple">
                    <i class="bi bi-search" style="font-size: 1.5rem;"></i>
                  </div>
                  <div>
                    <h6 class="text-muted mb-1 text-uppercase small fw-bold">Total de Pesquisas</h6>
                    <h3 class="fw-bold mb-0 text-dark">{{ logsPesquisas.length }}</h3>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-4">
              <div class="card shadow-sm border-0 bg-white p-4 rounded-4">
                <div class="d-flex align-items-center">
                  <div class="icon-shape bg-success-soft rounded-3 p-3 me-3 text-success">
                    <i class="bi bi-trophy" style="font-size: 1.5rem;"></i>
                  </div>
                  <div>
                    <h6 class="text-muted mb-1 text-uppercase small fw-bold">Termo mais Popular</h6>
                    <h3 class="fw-bold mb-0 text-dark">{{ termoMaisProcurado }}</h3>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-6 mb-4">
              <div class="card shadow-sm border-0 bg-white p-4 rounded-4">
                <div class="d-flex align-items-center">
                  <div class="icon-shape bg-warning-soft rounded-3 p-3 me-3 text-warning">
                    <i class="bi bi-calendar-check" style="font-size: 1.5rem;"></i>
                  </div>
                  <div>
                    <h6 class="text-muted mb-1 text-uppercase small fw-bold">Mês de Pico</h6>
                    <h3 class="fw-bold mb-0 text-dark">{{ estatisticasPico.mes }}</h3>
                    <small class="text-muted">{{ estatisticasPico.totalMes }} pesquisas</small>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-6 mb-4">
              <div class="card shadow-sm border-0 bg-white p-4 rounded-4">
                <div class="d-flex align-items-center">
                  <div class="icon-shape bg-info-soft rounded-3 p-3 me-3 text-info">
                    <i class="bi bi-graph-up-arrow" style="font-size: 1.5rem;"></i>
                  </div>
                  <div>
                    <h6 class="text-muted mb-1 text-uppercase small fw-bold">Dia de Maior Tráfego</h6>
                    <h3 class="fw-bold mb-0 text-dark">{{ estatisticasPico.dia }}</h3>
                    <small class="text-muted">{{ estatisticasPico.totalDia }} pesquisas</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="table-responsive shadow-lg rounded-4 bg-white overflow-hidden">
            <table class="table table-hover align-middle mb-0 border-0">
              <thead>
                <tr class="d-none d-lg-table-row bg-purple-gradient text-white border-0">
                  <th class="ps-4 py-3 rounded-start-4 border-0">Data e Hora</th>
                  <th class="py-3 rounded-end-4 border-0">Pesquisa Realizada</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(log, idx) in documentosPaginados" :key="idx" class="table-row-responsive mb-3" :class="{'is-milestone-row': isMilestone(logsPesquisas.length - ((paginaAtual - 1) * itensPorPagina + idx))}">
                  
                  <!-- DESKTOP: DATA -->
                  <td class="ps-4 d-none d-lg-table-cell meta-column border-0">
                    <div class="d-flex align-items-center">
                      <div class="bg-purple-soft p-2 rounded-3 me-3">
                        <i class="bi bi-calendar2-check text-purple"></i>
                      </div>
                      <div>
                        <div class="text-dark fw-bold" style="font-size: 0.85rem;">{{ new Date(log.data).toLocaleDateString() }}</div>
                        <small class="text-muted" style="font-size: 0.75rem;">{{ new Date(log.data).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</small>
                      </div>
                    </div>
                  </td>

                  <!-- DESKTOP: PESQUISA -->
                  <td class="d-none d-lg-table-cell term-column border-0">
                    <div class="d-flex align-items-center justify-content-between pe-4">
                      <div class="d-flex align-items-center">
                        <div class="search-term-pill">
                          <span class="text-dark fw-bold">{{ log.termo }}</span>
                        </div>
                        <span v-if="isMilestone(logsPesquisas.length - ((paginaAtual - 1) * itensPorPagina + idx))" class="ms-3 badge bg-gold-gradient text-dark animate-bounce-soft shadow-sm rounded-pill px-3">
                          <i class="bi bi-trophy-fill me-1"></i> 
                          MARCO #{{ logsPesquisas.length - ((paginaAtual - 1) * itensPorPagina + idx) }}
                        </span>
                      </div>
                      <div class="user-peek-option" @click="verDetalhesUsuario(log)" title="Ver detalhes do usuário">
                        <i class="bi bi-person-circle text-purple opacity-40 hover-opacity-100 fs-5 transition-all cursor-pointer"></i>
                      </div>
                    </div>
                  </td>

                  <!-- LAYOUT MOBILE EXCLUSIVO (Design Cartão Premium) -->
                  <td class="d-lg-none p-0 mobile-card-cell border-0">
                    <div class="mobile-card-inner p-3">
                      <!-- Status Bar -->
                      <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="badge bg-purple-soft text-purple rounded-pill px-3 py-2 font-monospace" style="font-size: 0.7rem;">
                          <i class="bi bi-clock me-1"></i> {{ new Date(log.data).toLocaleString() }}
                        </span>
                        <span v-if="isMilestone(logsPesquisas.length - ((paginaAtual - 1) * itensPorPagina + idx))" class="badge bg-gold-gradient text-dark px-3 py-2 rounded-pill shadow-sm fw-bold">
                           <i class="bi bi-trophy-fill me-1"></i> 
                           #{{ logsPesquisas.length - ((paginaAtual - 1) * itensPorPagina + idx) }}
                        </span>
                      </div>
                      
                      <!-- Item Titular -->
                      <div class="p-3 rounded-4 bg-purple-card-highlight border-start border-5 border-purple shadow-sm position-relative overflow-hidden">
                        <div class="card-glass-effect"></div>
                        <small class="text-purple fw-bolder text-uppercase d-block mb-1" style="font-size: 0.6rem; letter-spacing: 1px;">Termo de Pesquisa</small>
                        <span class="text-dark fw-800 fs-4 position-relative d-block text-break" style="word-break: break-word;">{{ log.termo }}</span>
                        
                        <!-- Usuário (Opção de clique discreta) -->
                        <div class="position-absolute bottom-0 end-0 p-2 opacity-10 hover-opacity-100 cursor-pointer" @click="verDetalhesUsuario(log)" title="Ver usuário">
                           <i class="bi bi-person-bounding-box" style="font-size: 1.5rem;"></i>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr v-if="logsPesquisas.length === 0">
                  <td colspan="3" class="text-center py-4 text-muted">Ainda não foram registrados logs de pesquisa.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- Controles de Paginação -->
      <div v-if="totalPaginas > 1 && activeTab !== 'cadastrar'" class="pagination-container d-flex justify-content-center mt-5 gap-2">
        <button class="btn btn-outline-purple btn-sm" :disabled="paginaAtual === 1" @click="mudarPagina(paginaAtual - 1)">
          <i class="bi bi-chevron-left"></i>
        </button>
        <span class="align-self-center mx-3 fw-bold text-dark">Página {{ paginaAtual }} de {{ totalPaginas }}</span>
        <button class="btn btn-outline-purple btn-sm" :disabled="paginaAtual === totalPaginas" @click="mudarPagina(paginaAtual + 1)">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Modal de Edição -->
    <div v-if="isEditModalOpen" class="modal-overlay">
      <div class="modal-dialog">
        <div class="modal-content shadow-2xl rounded-4">
          <div class="modal-header bg-purple text-white">
            <h5 class="modal-title">Editar Documento Admin</h5>
            <button type="button" class="btn-close btn-close-white" @click="isEditModalOpen = false"></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="salvarEdicao">
              <div class="mb-3">
                <label class="form-label">Nome Completo</label>
                <input v-model="documentoEditado.nome_completo" type="text" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Província</label>
                <select class="form-select" v-model="documentoEditado.provincia">
                  <option v-for="p in provincias" :key="p" :value="p">{{ p }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Contacto</label>
                <input v-model="documentoEditado.contacto" type="text" class="form-control" required />
              </div>
              <button type="submit" class="btn btn-purple w-100 mt-3 py-3">Salvar Alterações</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css");
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap');

.verdocumentos-wrapper {
  background: #f8f9fa;
  min-height: 80vh;
}

.verdocumentos-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.custom-nav-admin {
  background: #fff;
  border-radius: 50px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.custom-nav-admin .nav-link {
  color: #6c757d;
  font-weight: 600;
  border-radius: 50px;
  padding: 12px 25px;
  transition: all 0.3s ease;
}

.custom-nav-admin .nav-link:hover {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.custom-nav-admin .nav-link.active {
  background: linear-gradient(135deg, #800080, #b000b0);
  color: #fff !important;
  box-shadow: 0 8px 15px rgba(128, 0, 128, 0.2);
}

.custom-nav-admin .nav-link i {
  font-size: 1.1rem;
  vertical-align: middle;
}

.custom-table-admin {
  font-family: 'Poppins', sans-serif;
}

.custom-table-admin th {
  font-weight: 900;
  text-transform: uppercase;
  font-size: 0.85rem;
  color: #6c757d;
  letter-spacing: 0.5px;
}

.custom-table-admin td {
  vertical-align: middle;
  font-weight: 600;
}

.hover-row-admin {
  transition: all 0.3s ease;
}

.hover-row-admin:hover {
  background-color: #f8f9fa;
  transform: translateX(4px);
}

.text-truncate-admin {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

.btn-purple {
  background: linear-gradient(135deg, #800080, #b000b0);
  color: white;
  border: none;
  font-weight: 700;
  border-radius: 12px;
  transition: all 0.3s ease;
  padding: 15px 25px;
  font-size: 1.1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.btn-purple:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(128, 0, 128, 0.3);
}

.bg-purple { background-color: #800080 !important; }
.text-purple { color: #800080 !important; }
.bg-purple-soft { background-color: rgba(128, 0, 128, 0.1); color: #800080; }
.bg-success-soft { background-color: rgba(40, 167, 69, 0.1); color: #28a745; }
.bg-warning-soft { background-color: rgba(255, 193, 7, 0.1); color: #ffc107; }
.bg-info-soft { background-color: rgba(13, 110, 253, 0.1); color: #0d6efd; }

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spin {
  display: inline-block;
  animation: spin 1s linear infinite;
}

.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  background-color: #fcf6ff !important;
}

.zoom-field {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  padding: 12px 20px;
  border-radius: 12px !important;
}

.zoom-field:focus {
  transform: scale(1.01);
  border-color: #800080;
  box-shadow: 0 0 0 0.25rem rgba(128, 0, 128, 0.1);
}

.status-select {
  border-radius: 8px;
  border: 1px solid #dee2e6;
  font-size: 0.85rem;
}

.form-label {
  font-weight: 700 !important;
  font-family: 'Poppins', sans-serif;
}

.btn-outline-purple {
  border: 2px solid #800080;
  color: #800080;
  font-weight: 700;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.btn-outline-purple:hover:not(:disabled) {
  background: #800080;
  color: white;
}

.btn-outline-purple:disabled {
  border-color: #ccc;
  color: #ccc;
}

/* Modal Overlay Premium */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* Responsividade Mobile Completa */
@media (max-width: 768px) {
  .custom-table-admin thead {
    display: none;
  }

  .custom-table-admin,
  .custom-table-admin tbody {
    display: block;
    width: 100%;
  }

  .custom-table-admin tr {
    display: block;
    margin-bottom: 1.25rem;
    border: none;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    background: white;
    padding: 0;
    overflow: hidden;
    position: relative;
  }

  .custom-table-admin tr::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #800080 0%, #6a006a 100%);
  }

  .custom-table-admin td {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 1rem 1.25rem;
    border: none;
    text-align: left !important;
    position: relative;
    gap: 0.75rem;
  }

  .custom-table-admin td::before {
    content: '';
    font-family: 'bootstrap-icons';
    font-size: 1.1rem;
    color: #667eea;
    min-width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .custom-table-admin td[data-icon="person-circle"]::before {
    content: '\f4da';
  }

  .custom-table-admin td[data-icon="envelope-fill"]::before {
    content: '\f32f';
  }

  .custom-table-admin td[data-icon="file-earmark"]::before {
    content: '\f341';
  }

  .custom-table-admin td[data-icon="hash"]::before {
    content: '\f3f2';
  }

  .custom-table-admin td[data-icon="telephone"]::before {
    content: '\f675';
  }

  .custom-table-admin td[data-icon="geo-alt"]::before {
    content: '\f3d2';
  }

  .custom-table-admin td[data-icon="calendar"]::before {
    content: '\f210';
  }

  .custom-table-admin td[data-icon="tools"]::before {
    content: '\f698';
  }

  .custom-table-admin td[data-icon="clipboard-check"]::before {
    content: '\f28d';
  }

  .custom-table-admin td > * {
    flex: 1;
  }

  .custom-table-admin td[data-label="Nome"] {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    font-weight: 700;
    font-size: 1.05rem;
    padding: 1.25rem;
    border-bottom: 2px solid #e0e0e0;
  }

  .custom-table-admin td[data-label="Ações"],
  .custom-table-admin td[data-label="Status"],
  .custom-table-admin td[data-label="Ação"] {
    background-color: #fafbfc;
    padding: 1rem 1.25rem;
    justify-content: center;
  }

  .custom-table-admin td[data-label="Ações"] .d-flex,
  .custom-table-admin td[data-label="Ação"] .d-flex {
    justify-content: center !important;
    gap: 0.75rem;
    width: 100%;
    flex-wrap: wrap;
  }

  .custom-table-admin td.ps-4 {
    padding-left: 1.25rem !important;
  }

  .custom-table-admin td.pe-4 {
    padding-right: 1.25rem !important;
  }

  .text-truncate-admin {
    max-width: 100%;
    white-space: normal;
    word-break: break-word;
  }
}

/* Outras animações e estilos mantidos */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.text-warning {
  animation: pulse 1s infinite;
}

.alert-success {
  animation: pulse 1s infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 1s ease-in-out;
}

.mensagem-motivacional {
  color: #856404;
  font-style: italic;
  font-size: 1rem;
  margin-bottom: 5px;
}

.btn-zoom {
  animation: zoomInOut 1.5s ease-in-out infinite;
}

@keyframes zoomInOut {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
/* Skeletons */
.skeleton-row {
  height: 70px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 12px;
}
.skeleton-row-small {
  height: 40px;
  background: linear-gradient(90deg, #f8f9fa 25%, #f1f3f5 50%, #f8f9fa 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 8px;
}
@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* WhatsApp */
.btn-whatsapp {
  background-color: #25d366;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 5px 10px;
  transition: all 0.3s ease;
}
.btn-whatsapp:hover {
  background-color: #128c7e;
  transform: translateY(-2px);
  color: white;
}

/* Facebook Button */
.btn-facebook {
  background-color: #1877f2;
  color: white;
  border: none;
  transition: all 0.3s ease;
}

.btn-facebook:hover {
  background-color: #166fe5;
  transform: translateY(-2px);
  color: white;
}

/* Instagram/Share Button */
.btn-share {
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  color: white;
  border: none;
  transition: all 0.3s ease;
}

.btn-share:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
  color: white;
}

/* Empty State */
.empty-state {
  background: white;
  border-radius: 20px;
  border: 2px dashed #e0e0e0;
}
.opacity-25 { opacity: 0.25; }
.is-milestone-row {
  background-color: rgba(255, 193, 7, 0.05) !important;
  border-left: 4px solid #ffc107;
}

/* Responsividade da Tabela de Logs */
@media (max-width: 991px) {
  .nav-wrapper {
    margin-left: -1rem;
    margin-right: -1rem;
    padding-bottom: 2px;
  }
  .custom-nav-admin {
    padding: 10px !important;
    mask-image: linear-gradient(to right, black 85%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
  }
  .custom-nav-admin .nav-link {
    padding: 0.8rem 1.2rem !important;
    font-size: 0.85rem;
    border-radius: 12px;
  }

  .table-responsive {
    border: none !important;
    background: transparent !important;
    overflow-x: hidden !important;
    width: 100% !important;
  }

  /* Transformação em Cards para todas as tabelas Admin */
  .custom-table-admin thead {
    display: none;
  }
  
  .custom-table-admin tbody tr {
    display: block;
    background: white;
    margin-bottom: 1.2rem;
    border-radius: 1rem !important;
    padding: 0.8rem;
    box-shadow: 0 8px 25px rgba(0,0,0,0.05);
    border: 1px solid #f0f0f0 !important;
  }

  .custom-table-admin td {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: none !important;
    padding: 0.6rem 0.8rem !important;
    text-align: center;
    font-size: 0.85rem;
    word-break: break-word;
  }

  .custom-table-admin td.d-lg-none {
    display: block !important;
  }

  .custom-table-admin td.d-none {
    display: none !important;
  }

  .custom-table-admin td::before {
    content: attr(data-label);
    font-weight: 800;
    color: #800080;
    text-transform: uppercase;
    font-size: 0.65rem;
    text-align: center;
    margin-bottom: 0.3rem;
    display: block;
    width: 100%;
  }

  .custom-table-admin td[data-label="Nome"] {
    display: block;
    text-align: center;
    background: linear-gradient(135deg, #f8f0fc 0%, #fff 100%);
    margin: -0.8rem -0.8rem 0.5rem -0.8rem;
    padding: 1rem 0.8rem !important;
    border-radius: 1rem 1rem 0 0;
    font-size: 1.1rem;
    border-bottom: 2px solid rgba(128, 0, 128, 0.1);
  }
  
  .custom-table-admin td[data-label="Nome"]::before {
    display: block;
    margin-bottom: 0.4rem;
    font-size: 0.6rem;
  }

  .custom-table-admin td[data-label="Ações"], 
  .custom-table-admin td[data-label="Ação"] {
    display: flex;
    flex-direction: row;
    background: linear-gradient(to top, #fafafa 0%, #fff 100%);
    margin: 0.5rem -0.8rem -0.8rem -0.8rem;
    padding: 1rem 0.8rem !important;
    border-radius: 0 0 1rem 1rem;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.8rem;
    border-top: 1px solid #f0f0f0;
  }
  
  .custom-table-admin td[data-label="Ações"]::before,
  .custom-table-admin td[data-label="Ação"]::before {
    display: none;
  }

  .custom-table-admin td[data-label="Status"] {
    padding: 0.8rem !important;
  }

  .custom-table-admin td[data-label="Status"]::before {
    margin-bottom: 0.5rem;
  }

  /* Outros ajustes de cards mobile */
  .table-row-responsive {
    display: block;
    background: white;
    margin-bottom: 1.5rem;
    border-radius: 1.5rem !important;
    padding: 1.2rem;
    box-shadow: 0 15px 35px rgba(128, 0, 128, 0.05);
    border: 1px solid rgba(128, 0, 128, 0.1);
    transition: transform 0.2s ease;
  }
  
  .table-row-responsive td {
    display: block;
    width: 100%;
    padding: 0 !important;
    text-align: left !important;
    border: none !important;
    font-size: 0.8rem;
  }

  .mobile-card-cell {
    display: block;
    width: 100%;
  }

  .mobile-card-inner {
    padding: 0.5rem;
  }

  .is-milestone-row {
    border: 2px solid #ffcc33 !important;
    background: linear-gradient(to bottom, rgba(255, 204, 51, 0.02), white) !important;
  }
}

/* Estilos Globais de Organização */
.meta-column { width: 180px; }
.user-column { width: 150px; }
.term-column { vertical-align: middle; }

.avatar-xs {
  width: 24px;
  height: 24px;
  font-size: 0.7rem;
  font-weight: bold;
}

.bg-purple-soft-light {
  background-color: rgba(128, 0, 128, 0.03);
}
.text-purple-dark {
  color: #4a004a;
}
.fw-800 { font-weight: 800; }

.bg-purple-gradient {
  background: linear-gradient(135deg, #800080 0%, #4a004a 100%) !important;
}

.bg-gold-gradient {
  background: linear-gradient(135deg, #ffcc33 0%, #ffb300 100%) !important;
}

.search-term-pill {
  background: #fdfbff;
  padding: 0.5rem 1.25rem;
  border-radius: 12px;
  border: 1px solid rgba(128, 0, 128, 0.08);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
}

.transition-all {
  transition: all 0.3s ease;
}

.opacity-40 { opacity: 0.4; }

.bg-purple-card-highlight {
  background: linear-gradient(to right, rgba(128, 0, 128, 0.03), rgba(128, 0, 128, 0.01));
}

.card-glass-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%);
  pointer-events: none;
}

.animate-bounce-soft {
  animation: bounce-soft 3s infinite;
}

@keyframes bounce-soft {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.hover-opacity-100:hover {
  opacity: 1 !important;
}

.right-2 { right: 0.5rem; }
.top-1 { top: 0.25rem; }
.cursor-help { cursor: help; }

.search-highlight-box {
  background: #fdfbff;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(128, 0, 128, 0.1);
  display: flex;
  align-items: center;
}

.animate-bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-5px); }
  60% { transform: translateY(-3px); }
}

.avatar-sm {
  width: 32px;
  height: 32px;
  font-size: 0.8rem;
}

/* Utilitários de Cores e Bordas */
.bg-purple-light {
  background-color: #f3e5f5;
}
.border-purple-light {
  border-color: rgba(128, 0, 128, 0.2) !important;
}
.bg-success-soft {
  background-color: rgba(25, 135, 84, 0.1) !important;
}
.bg-warning-soft {
  background-color: rgba(255, 193, 7, 0.1) !important;
}
.text-warning-dark {
  color: #d39e00 !important;
}

.hover-shadow-md:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  z-index: 1;
}

/* Modal Responsivo */
.swal2-popup.border-radius-20 {
  border-radius: 20px !important;
}

/* ====== MOBILE DOCUMENT CARD - DESIGN LIMPO ====== */
@media (max-width: 991px) {
  .table-row-responsive {
    display: block !important;
    width: 100% !important;
    padding: 0 !important;
    margin-bottom: 1rem !important;
  }
  
  .table-row-responsive td.d-lg-none {
    display: block !important;
    width: 100% !important;
    padding: 0 !important;
  }
}

.mobile-doc-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #eee;
  margin-bottom: 1rem;
  width: 100% !important;
  display: block !important;
}

.mobile-doc-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #800080, #6a006a);
  color: white;
  border-radius: 1rem 1rem 0 0;
  width: 100%;
  box-sizing: border-box;
  text-align: center;
}

.mobile-avatar {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.mobile-name {
  font-weight: 700;
  font-size: 0.85rem;
  line-height: 1.2;
  word-break: break-word;
}

.mobile-info-list {
  padding: 0.5rem 0.75rem;
}

.mobile-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.mobile-info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 0.7rem;
  color: #666;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.info-label i {
  font-size: 0.8rem;
}

.info-value {
  font-size: 0.75rem;
  color: #1a1a1a;
  font-weight: 500;
  text-align: right;
  word-break: break-all;
  max-width: 55%;
}

.status-row {
  padding-top: 0.75rem;
}

.mobile-status-select {
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  border: 2px solid #ddd;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
}

.mobile-status-select.status-pendente {
  background: #fff8e1;
  border-color: #ffc107;
  color: #b38600;
}

.mobile-status-select.status-entregue {
  background: #e8f5e9;
  border-color: #4caf50;
  color: #2e7d32;
}

.mobile-doc-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  background: #f8f8f8;
  border-top: 1px solid #eee;
}

.mobile-actions-divider {
  width: 1px;
  height: 20px;
  background: #ddd;
  margin: 0 0.3rem;
}

.mobile-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  cursor: pointer;
  transition: transform 0.2s;
  color: white;
}

.mobile-btn:active {
  transform: scale(0.9);
}

.mobile-btn.whatsapp { background: #25d366; }
.mobile-btn.facebook { background: #1877f2; }
.mobile-btn.share { background: linear-gradient(135deg, #f09433, #dc2743); }
.mobile-btn.edit { background: #ffc107; color: #333; }
.mobile-btn.delete { background: #dc3545; }
</style>
