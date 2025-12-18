<template>
  <!-- Fix Style Tag Error -->
  <div class="container-fluid position-sticky z-index-sticky top-0 px-0">
    <div class="row gx-0">
      <div class="col-12">
        <NavbarDefault :sticky="true" />
      </div>
    </div>
  </div>

  <div class="admin-dashboard">
    <div class="container custom-container py-5 mt-5 pt-5 px-4 px-lg-0">
      <!-- Toasts -->
      <div class="toast-container">
        <div
          v-for="(msg, index) in toasts"
          :key="index"
          class="toast"
          :class="[msg.tipo, msg.show ? 'show' : 'hide']"
        >
          {{ msg.texto }}
        </div>
      </div>

      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-3">
        <div>
          <h1 class="h3 mb-1 text-white">Gestão de Assinaturas.</h1>
          <p class="text-muted mb-0">Painel administrativo de controle</p>
        </div>
        <div class="d-flex align-items-center gap-3">
          <!-- Botão Ativar Notificações Push -->
          <button 
            v-if="pushPermission !== 'granted'" 
            class="btn btn-sm btn-success d-flex align-items-center" 
            @click="ativarPushNotifications"
            title="Ativar notificações push"
          >
            <i class="bi bi-bell-fill me-2"></i>Ativar
          </button>
          
          <!-- Badge de Notificações Circular -->
          <button class="btn btn-bell position-relative mx-1" @click="toggleNotifications" title="Notificações">
            <i class="bi bi-bell fs-5"></i>
            <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
          </button>

          <!-- Botão Atualizar Circular -->
          <button class="btn btn-bell mx-1" @click="carregarPagamentos" title="Atualizar dados">
            <i class="bi bi-arrow-clockwise fs-5" :class="{ 'spin-anim': carregando }"></i>
          </button>
        </div>
      </div>

      <!-- Painel de Notificações -->
      <div v-if="showNotifications" class="notifications-panel">
        <div class="notifications-header">
          <h5 class="mb-0">Notificações</h5>
          <button class="btn btn-sm btn-link text-white" @click="clearAll">Limpar todas</button>
        </div>
        <div class="notifications-body">
          <div v-if="notifications.length === 0" class="text-center py-4 text-muted">
            Nenhuma notificação
          </div>
          <div 
            v-for="notif in notifications" 
            :key="notif.id"
            class="notification-item"
            :class="{ unread: !notif.read }"
            @click="markAsRead(notif.id)"
          >
            <div class="notification-icon">💰</div>
            <div class="notification-content">
              <p class="mb-1">{{ notif.message }}</p>
              <small class="text-muted">{{ formatTime(notif.timestamp) }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="carregando" class="text-center py-5">
        <div class="spinner-border text-purple" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
      </div>

      <!-- Erro -->
      <div v-else-if="erro" class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>{{ erro }}
      </div>

      <!-- Conteúdo -->
      <div v-else>
        <!-- KPIs -->
        <div class="row g-4 mb-5">
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="kpi-card">
              <div class="kpi-icon bg-purple">
                <i class="bi bi-currency-dollar"></i>
              </div>
              <div class="kpi-content">
                <div class="kpi-label">Receita Total</div>
                <div class="kpi-value">{{ formatarMoeda(receitaTotal) }}</div>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="kpi-card">
              <div class="kpi-icon bg-success">
                <i class="bi bi-people"></i>
              </div>
              <div class="kpi-content">
                <div class="kpi-label">Assinantes Ativos</div>
                <div class="kpi-value">{{ assinantesAtivos }}</div>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="kpi-card">
              <div class="kpi-icon bg-warning">
                <i class="bi bi-clock-history"></i>
              </div>
              <div class="kpi-content">
                <div class="kpi-label">Expirando (7 dias)</div>
                <div class="kpi-value">{{ assinaturasExpirando }}</div>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="kpi-card">
              <div class="kpi-icon bg-danger">
                <i class="bi bi-x-circle"></i>
              </div>
              <div class="kpi-content">
                <div class="kpi-label">Expirados</div>
                <div class="kpi-value">{{ assinantesExpirados }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtros -->
        <div class="card-dark mb-5">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-12 col-md-4">
                <label class="form-label text-white">Status</label>
                <select
                  v-model="filtroStatus"
                  class="form-select form-select-dark"
                >
                  <option value="">Todos</option>
                  <option value="pago">Ativos</option>
                  <option value="expirado">Expirados</option>
                </select>
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label text-white">Pacote</label>
                <select
                  v-model="filtroPacote"
                  class="form-select form-select-dark"
                >
                  <option value="">Todos</option>
                  <option value="mensal">Mensal</option>
                  <option value="anual">Anual</option>
                </select>
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label text-white">Buscar</label>
                <input
                  v-model="busca"
                  type="text"
                  class="form-control form-control-dark"
                  placeholder="Nome ou email..."
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Tabela vs Cards -->
        <div class="card-dark mb-5 border-0 bg-transparent">
          <div class="card-body p-0">
            
            <!-- VERSION DESKTOP: Tabela -->
            <div class="table-responsive d-none d-md-block rounded-3 overflow-hidden border border-dark-subtle">
              <table class="table table-dark-custom mb-0">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Pacote</th>
                    <th>Valor</th>
                    <th>Método</th>
                    <th>Data Pagamento</th>
                    <th>Validade</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="pagamento in pagamentosFiltrados"
                    :key="pagamento._id"
                  >
                    <td>
                      <div class="user-info">
                        <div class="user-avatar">
                          {{ obterIniciais(pagamento.usuario?.nome) }}
                        </div>
                        <div>
                          <div class="user-name">
                            {{ pagamento.usuario?.nome || "N/A" }}
                          </div>
                          <div class="user-email">
                            {{ pagamento.usuario?.email || "N/A" }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        class="badge-pacote"
                        :class="pagamento.pacote?.toLowerCase()"
                      >
                        {{ pagamento.pacote }}
                      </span>
                    </td>
                    <td class="text-white fw-semibold">
                      {{ formatarMoeda(pagamento.valor) }}
                    </td>
                    <td>
                      <span class="text-muted">{{
                        pagamento.metodoPagamento
                      }}</span>
                    </td>
                    <td>{{ formatarData(pagamento.dataPagamento) }}</td>
                    <td>
                      <div class="validade-info">
                        <div class="text-white">
                          {{ formatarData(pagamento.validade) }}
                        </div>
                        <div
                          :class="
                            getClasseDiasRestantes(pagamento.diasRestantes)
                          "
                        >
                          {{
                            pagamento.diasRestantes > 0
                              ? `${pagamento.diasRestantes} dias`
                              : "Expirado"
                          }}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge-status" :class="pagamento.status">
                        {{ pagamento.status === "pago" ? "Ativo" : "Expirado" }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button
                          class="btn btn-outline-light btn-sm"
                          @click="visualizarDetalhes(pagamento)"
                          title="Ver detalhes"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                        <button
                          class="btn btn-outline-danger btn-sm"
                          @click="excluirPagamento(pagamento._id)"
                          title="Excluir"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- VERSION MOBILE: Cards -->
            <div class="d-md-none d-flex flex-column gap-3">
              <div 
                v-for="pagamento in pagamentosFiltrados" 
                :key="'mobile-'+pagamento._id"
                class="mobile-card"
              >
                <!-- Topo: User + Status -->
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div class="d-flex align-items-center gap-3">
                    <div class="user-avatar mobile">
                      {{ obterIniciais(pagamento.usuario?.nome) }}
                    </div>
                    <div>
                      <div class="text-white fw-bold text-truncate" style="max-width: 160px;">
                        {{ pagamento.usuario?.nome || "N/A" }}
                      </div>
                      <div class="text-muted small text-truncate" style="max-width: 160px;">
                        {{ pagamento.usuario?.email }}
                      </div>
                    </div>
                  </div>
                  <span class="badge-status small" :class="pagamento.status">
                    {{ pagamento.status === "pago" ? "Ativo" : "Expirado" }}
                  </span>
                </div>

                <!-- Meio: Info Grid -->
                <div class="mobile-info-grid mb-3">
                  <div class="info-item">
                    <span class="label">Pacote</span>
                    <span class="value">
                      <span class="badge-pacote small" :class="pagamento.pacote?.toLowerCase()">
                        {{ pagamento.pacote }}
                      </span>
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="label">Valor</span>
                    <span class="value text-white">{{ formatarMoeda(pagamento.valor) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Validade</span>
                    <div class="value lh-1">
                      <div class="text-white small">{{ formatarData(pagamento.validade) }}</div>
                      <div class="tiny-text" :class="getClasseDiasRestantes(pagamento.diasRestantes)">
                        {{ pagamento.diasRestantes > 0 ? `${pagamento.diasRestantes} dias` : "Expirado" }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footer: Ações -->
                <div class="d-flex gap-2">
                  <button class="btn btn-dark-custom flex-grow-1" @click="visualizarDetalhes(pagamento)">
                    <i class="bi bi-eye me-2"></i> Detalhes
                  </button>
                  <button class="btn btn-outline-danger flex-grow-0 px-3" @click="excluirPagamento(pagamento._id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>

            <div
              v-if="pagamentosFiltrados.length === 0"
              class="text-center py-5"
            >
              <i class="bi bi-inbox display-1 text-muted"></i>
              <p class="text-muted mt-3">Nenhum pagamento encontrado</p>
            </div>
          </div>
        </div>



        <!-- Paginação -->
        <!-- Paginação -->
        <div v-if="totalPaginas > 1" class="d-flex flex-column flex-md-row justify-content-between align-items-center mt-5 gap-3">
          
          <div class="text-muted small text-center text-md-start order-2 order-md-1">
            Mostrando <span class="text-white fw-bold">{{ ((paginaAtual - 1) * itensPorPagina) + 1 }}</span> a 
            <span class="text-white fw-bold">{{ Math.min(paginaAtual * itensPorPagina, todosOsFiltrados.length) }}</span> 
            de <span class="text-white fw-bold">{{ todosOsFiltrados.length }}</span> resultados
          </div>

          <div class="btn-group order-1 order-md-2 p-1 rounded-pill" style="background: #0a0a0a; border: 1px solid #1a1a1a;" role="group">
            <button 
              @click="mudarPagina(paginaAtual - 1)"
              :disabled="paginaAtual === 1"
              class="btn btn-dark-custom rounded-pill me-1"
              title="Anterior"
              style="min-width: 40px;"
            >
              <i class="bi bi-chevron-left"></i>
            </button>

            <button 
              v-for="p in paginasVisiveis" 
              :key="p"
              @click="mudarPagina(p)"
              class="btn rounded-pill mx-1 px-3 d-flex align-items-center justify-content-center"
              :class="p === paginaAtual ? 'btn-purple fw-bold shadow-sm' : 'btn-dark-custom'"
              style="min-width: 40px; height: 38px;"
            >
              {{ p }}
            </button>

            <button 
              @click="mudarPagina(paginaAtual + 1)"
              :disabled="paginaAtual === totalPaginas"
              class="btn btn-dark-custom rounded-pill ms-1"
              title="Próxima"
              style="min-width: 40px;"
            >
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>



        <!-- Estatísticas -->
        <div class="row g-3 mt-4">
          <div class="col-12 col-md-6">
            <div class="card-dark">
              <div class="card-body">
                <h5 class="card-title text-white mb-3">
                  <i class="bi bi-graph-up text-purple me-2"></i>Receita por
                  Pacote
                </h5>
                <div
                  class="d-flex justify-content-between align-items-center mb-3"
                >
                  <span class="text-muted">Mensal</span>
                  <span class="text-white fw-semibold">{{
                    formatarMoeda(receitaMensal)
                  }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-muted">Anual</span>
                  <span class="text-white fw-semibold">{{
                    formatarMoeda(receitaAnual)
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="card-dark">
              <div class="card-body">
                <h5 class="card-title text-white mb-3">
                  <i class="bi bi-pie-chart text-purple me-2"></i>Distribuição
                  de Pacotes
                </h5>
                <div
                  class="d-flex justify-content-between align-items-center mb-3"
                >
                  <span class="text-muted">Assinantes Mensais</span>
                  <span class="text-white fw-semibold">{{
                    assinantesMensais
                  }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-muted">Assinantes Anuais</span>
                  <span class="text-white fw-semibold">{{
                    assinantesAnuais
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="pagamentoSelecionado" class="modal-overlay" @click="fecharModal">
      <div class="modal-content-custom" @click.stop>
        <div class="modal-header-custom">
          <h5 class="text-white mb-0">Detalhes do Pagamento</h5>
          <button class="btn-close-custom" @click="fecharModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body-custom">
          <div
            class="detail-row"
            v-for="(valor, chave) in detalhesPagamento"
            :key="chave"
          >
            <span class="detail-label">{{ chave }}</span>
            <span class="detail-value">{{ valor }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <FooterDefault />
</template>

<script setup>
import NavbarDefault from "../examples/navbars/NavbarDefault.vue";
import FooterDefault from "../examples/footers/FooterDefault.vue";
import { ref, computed, onMounted, watch } from "vue";
import { useSocketNotifications } from "@/composables/useSocketNotifications";
import { usePushNotifications } from "@/composables/usePushNotifications";
import Swal from "sweetalert2";

// Socket.IO Notifications
const { notifications, unreadCount, markAsRead, clearAll } = useSocketNotifications();
const showNotifications = ref(false);

// Push Notifications
const { permission: pushPermission, requestPermission, sendTestNotification } = usePushNotifications();

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

const ativarPushNotifications = async () => {
  const granted = await requestPermission();
  if (granted) {
    mostrarToast('✅ Notificações push ativadas! Você receberá alertas de novos pagamentos.', 'sucesso', 5000);
    sendTestNotification();
  } else {
    mostrarToast('❌ Permissão negada. Ative nas configurações do navegador.', 'erro', 5000);
  }
};

const formatTime = (timestamp) => {
  const now = new Date();
  const diff = Math.floor((now - timestamp) / 1000);
  
  if (diff < 60) return 'Agora mesmo';
  if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return timestamp.toLocaleDateString('pt-BR');
};

// Watch para recarregar pagamentos quando houver nova notificação
watch(notifications, (newVal) => {
  if (newVal.length > 0) {
    // Recarregar automaticamente quando houver novo pagamento
    carregarPagamentos();
  }
});

// Estado
const pagamentos = ref([]);
const carregando = ref(false);
const erro = ref(null);
const filtroStatus = ref("");
const filtroPacote = ref("");
const busca = ref("");
const pagamentoSelecionado = ref(null);
const toasts = ref([]);

// Paginação
const paginaAtual = ref(1);
const itensPorPagina = 10;

// API
const API_URL = "https://apirpa.onrender.com/api/pagamentos";

// Toasts animados
const mostrarToast = (texto, tipo = "sucesso", duracao = 3000) => {
  const msg = { texto, tipo, show: false };
  toasts.value.push(msg);
  setTimeout(() => (msg.show = true), 10);
  setTimeout(() => {
    msg.show = false;
    setTimeout(() => toasts.value.shift(), 500);
  }, duracao);
};

// Carregar pagamentos
// Carregar pagamentos
const carregarPagamentos = async (silencioso = false) => {
  if (!silencioso) carregando.value = true;
  if (!silencioso) erro.value = null;
  
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (!res.ok || !data.sucesso)
      throw new Error(data.mensagem || "Erro ao carregar pagamentos");
    
    // Atualiza lista
    pagamentos.value = data.pagamentos;
    
    // Feedback visual
    if (!silencioso) {
      mostrarToast("Pagamentos atualizados com sucesso!", "sucesso");
    }
  } catch (e) {
    console.error("Erro ao carregar pagamentos:", e);
    if (!silencioso) erro.value = e.message;
  } finally {
    if (!silencioso) carregando.value = false;
  }
};

// Funções auxiliares
const formatarMoeda = (v) =>
  `${(v || 0).toLocaleString("pt-MZ", { minimumFractionDigits: 2 })} MZN`;
const formatarData = (d) =>
  d ? new Date(d).toLocaleDateString("pt-BR") : "N/A";
const formatarDataCompleta = (d) =>
  d ? new Date(d).toLocaleString("pt-BR") : "N/A";
const obterIniciais = (n) =>
  !n
    ? "?"
    : n.split(" ").length > 1
    ? `${n.split(" ")[0][0]}${n.split(" ")[1][0]}`.toUpperCase()
    : n[0].toUpperCase();
const getClasseDiasRestantes = (d) =>
  d <= 0 ? "text-danger" : d <= 7 ? "text-warning" : "text-success";
const visualizarDetalhes = (p) => (pagamentoSelecionado.value = p);
const fecharModal = () => (pagamentoSelecionado.value = null);

// Excluir pagamento
const excluirPagamento = async (id) => {
  const result = await Swal.fire({
    title: 'Tem certeza?',
    text: "Deseja realmente excluir este pagamento?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#800080',
    confirmButtonText: 'Sim, excluir!',
    cancelButtonText: 'Cancelar'
  });

  if (!result.isConfirmed) return;

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (data.sucesso) {
      mostrarToast("Pagamento excluído com sucesso!", "sucesso");
      await carregarPagamentos();
    } else {
      throw new Error(data.mensagem || "Erro ao excluir pagamento");
    }
  } catch (e) {
    mostrarToast("Erro ao excluir pagamento: " + e.message, "erro");
  }
};

// KPIs Computados
const receitaMensal = computed(() =>
  pagamentos.value
    .filter((p) => p.pacote?.toLowerCase() === "mensal")
    .reduce((t, p) => t + (p.valor || 0), 0)
);
const receitaAnual = computed(() =>
  pagamentos.value
    .filter((p) => p.pacote?.toLowerCase() === "anual")
    .reduce((t, p) => t + (p.valor || 0), 0)
);
const receitaTotal = computed(() => receitaMensal.value + receitaAnual.value);

const assinantesAtivos = computed(
  () => pagamentos.value.filter((p) => p.status === "pago").length
);
const assinantesExpirados = computed(
  () => pagamentos.value.filter((p) => p.status === "expirado").length
);
const assinaturasExpirando = computed(
  () =>
    pagamentos.value.filter(
      (p) => p.status === "pago" && p.diasRestantes > 0 && p.diasRestantes <= 7
    ).length
);
const assinantesMensais = computed(
  () =>
    pagamentos.value.filter((p) => p.pacote?.toLowerCase() === "mensal").length
);
const assinantesAnuais = computed(
  () =>
    pagamentos.value.filter((p) => p.pacote?.toLowerCase() === "anual").length
);

// Pagamentos filtrados (SEM paginação - para contar total)
const todosOsFiltrados = computed(() =>
  pagamentos.value.filter((p) => {
    const s = !filtroStatus.value || p.status === filtroStatus.value;
    const pa =
      !filtroPacote.value || p.pacote?.toLowerCase() === filtroPacote.value;
    const b =
      !busca.value ||
      p.usuario?.nome?.toLowerCase().includes(busca.value.toLowerCase()) ||
      p.usuario?.email?.toLowerCase().includes(busca.value.toLowerCase());
    return s && pa && b;
  })
);

// Pagamentos filtrados COM paginação (apenas os da página atual)
const pagamentosFiltrados = computed(() => {
  const inicio = (paginaAtual.value - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  return todosOsFiltrados.value.slice(inicio, fim);
});

// Total de páginas
const totalPaginas = computed(() =>
  Math.ceil(todosOsFiltrados.value.length / itensPorPagina)
);

// Páginas Visíveis (Janela deslizante inteligente)
const paginasVisiveis = computed(() => {
  const total = totalPaginas.value;
  const atual = paginaAtual.value;
  const delta = 2; // Páginas antes e depois
  
  let inicio = Math.max(1, atual - delta);
  let fim = Math.min(total, atual + delta);

  if (atual - delta < 1) {
    fim = Math.min(total, fim + (delta - (atual - 1)));
  }
  
  if (atual + delta > total) {
    inicio = Math.max(1, inicio - ((atual + delta) - total));
  }

  const paginas = [];
  for (let i = inicio; i <= fim; i++) {
    paginas.push(i);
  }
  return paginas;
});

// Mudar página
const mudarPagina = (novaPagina) => {
  if (novaPagina >= 1 && novaPagina <= totalPaginas.value) {
    paginaAtual.value = novaPagina;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// Resetar paginação quando filtros mudarem
watch([filtroStatus, filtroPacote, busca], () => {
  paginaAtual.value = 1;
});

// Detalhes do pagamento
const detalhesPagamento = computed(() => {
  if (!pagamentoSelecionado.value) return {};
  const p = pagamentoSelecionado.value;
  return {
    ID: p._id,
    Usuário: p.usuario?.nome,
    Email: p.usuario?.email,
    Pacote: p.pacote,
    Valor: formatarMoeda(p.valor),
    Método: p.metodoPagamento,
    Telefone: p.telefone || "N/A",
    "Data Pagamento": formatarDataCompleta(p.dataPagamento),
    Validade: formatarDataCompleta(p.validade),
    "Dias Restantes":
      p.diasRestantes > 0 ? `${p.diasRestantes} dias` : "Expirado",
    Status: p.status === "pago" ? "Ativo" : "Expirado",
  };
});

// Carregar ao montar
onMounted(() => {
  carregarPagamentos();
  
  // Polling de backup (cada 30s) para garantir atualização mesmo sem WebSocket
  const interval = setInterval(() => {
    carregarPagamentos(true); // true = silencioso (sem toast)
  }, 30000);

  // Limpar intervalo ao desmontar (embora este componente raramente desmonte)
  // onUnmounted(() => clearInterval(interval));
});
</script>

<style scoped>
/* Bootstrap Icons */
/* Importando o Bootstrap Icons diretamente de node_modules */
@import "bootstrap-icons/font/bootstrap-icons.css";

/* Para a fonte Poppins */
@import "@fontsource/poppins/500.css";
@import "@fontsource/poppins/600.css";
@import "@fontsource/poppins/700.css";
@import "@fontsource/poppins/900.css";

/*@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css');
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap');*/

/* Toasts animados */
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 2000;
}
.toast {
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.5s ease;
}
.toast.show {
  opacity: 0.95;
  transform: translateX(0);
}
.toast.hide {
  opacity: 0;
  transform: translateX(100%);
}
.toast.sucesso {
  background-color: #10b981;
}
.toast.erro {
  background-color: #ef4444;
}

/* Fontes */
h1 {
  font-family: "Poppins", sans-serif;
  font-weight: 900;
  letter-spacing: 0.5px;
  color: #fff;
}
p.text-muted {
  color: #b5b5b5 !important;
}

/* Toasts */
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 2000;
}
.toast {
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  opacity: 0.95;
  transition: all 0.3s;
}
.toast.sucesso {
  background-color: #10b981;
}
.toast.erro {
  background-color: #ef4444;
}

/* Reset e Base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.admin-dashboard {
  min-height: 100vh;
  background: #000000;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

/* Cores e Botões */
:root {
  --purple: #9333ea;
  --purple-dark: #7e22ce;
  --purple-light: #a855f7;
}
.btn-purple {
  background: var(--purple);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.3s;
}
.btn-purple:hover {
  background: var(--purple-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);
}

/* Aplica Poppins apenas no título principal */
h1 {
  font-family: "Poppins", sans-serif;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Cor personalizada (mantendo o estilo escuro do dashboard) */
h1.text-white {
  color: #fff;
}

/* Opcional: melhora o contraste do subtítulo */
p.text-muted {
  color: #b5b5b5 !important;
}
/* Reset e Base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.admin-dashboard {
  min-height: 100vh;
  background: #000000;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

/* Cores */
:root {
  --purple: #9333ea;
  --purple-dark: #7e22ce;
  --purple-light: #a855f7;
}

/* Botões */
.btn-purple {
  background: var(--purple);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-purple:hover {
  background: var(--purple-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);
}

/* KPI Cards */
.kpi-card {
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s;
}

.kpi-card:hover {
  border-color: #2a2a2a;
  transform: translateY(-2px);
}

.kpi-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.kpi-icon.bg-purple {
  background: linear-gradient(135deg, var(--purple), var(--purple-light));
}

.kpi-icon.bg-success {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.kpi-icon.bg-warning {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.kpi-icon.bg-danger {
  background: linear-gradient(135deg, #ef4444, #f87171);
}

.kpi-content {
  flex: 1;
}

.kpi-label {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.kpi-value {
  color: white;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

/* Cards */
.card-dark {
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 0.75rem;
  overflow: hidden;
}

.card-dark .card-body {
  padding: 1.5rem;
}

.card-dark .card-title {
  font-size: 1.125rem;
  font-weight: 600;
}

/* Forms */
.form-select-dark,
.form-control-dark {
  background: #000000;
  border: 1px solid #2a2a2a;
  color: white;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s;
}

.form-select-dark:focus,
.form-control-dark:focus {
  background: #0a0a0a;
  border-color: var(--purple);
  color: white;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
  outline: none;
}

.form-select-dark option {
  background: #0a0a0a;
  color: white;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

/* Tabela */
.table-dark-custom {
  color: #9ca3af;
  width: 100%;
}

.table-dark-custom thead {
  background: #000000;
  border-bottom: 1px solid #1a1a1a;
}

.table-dark-custom th {
  padding: 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  border: none;
}

.table-dark-custom tbody tr {
  border-bottom: 1px solid #1a1a1a;
  transition: all 0.2s;
}

.table-dark-custom tbody tr:hover {
  background: #0a0a0a;
}

.table-dark-custom td {
  padding: 1rem;
  vertical-align: middle;
  border: none;
}

/* User Info */
.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--purple);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-name {
  color: white;
  font-weight: 500;
  font-size: 0.9375rem;
}

.user-email {
  color: #6b7280;
  font-size: 0.8125rem;
}

/* Badges */
.badge-pacote {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: capitalize;
}

.badge-pacote.mensal {
  background: #1e293b;
  color: #60a5fa;
}

.badge-pacote.anual {
  background: #1e1b4b;
  color: #a78bfa;
}

.badge-status {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 600;
}

.badge-status.pago {
  background: #064e3b;
  color: #34d399;
}

.badge-status.expirado {
  background: #7f1d1d;
  color: #f87171;
}

/* Validade Info */
.validade-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.validade-info > div:last-child {
  font-size: 0.8125rem;
  font-weight: 500;
}

/* Botões de Ação */
.btn-outline-light {
  border-color: #2a2a2a;
  color: #9ca3af;
}

.btn-outline-light:hover {
  background: #1a1a1a;
  border-color: var(--purple);
  color: var(--purple);
}

.btn-outline-danger {
  border-color: #2a2a2a;
  color: #ef4444;
}

.btn-outline-danger:hover {
  background: #7f1d1d;
  border-color: #ef4444;
  color: white;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content-custom {
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 0.75rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header-custom {
  padding: 1.5rem;
  border-bottom: 1px solid #1a1a1a;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-close-custom {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s;
}

.btn-close-custom:hover {
  color: white;
}

.modal-body-custom {
  padding: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #1a1a1a;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  color: white;
  text-align: right;
}

/* Cores de Texto */
.text-purple {
  color: var(--purple) !important;
}

.text-success {
  color: #34d399 !important;
}

.text-warning {
  color: #fbbf24 !important;
}

.text-danger {
  color: #ef4444 !important;
}

/* Responsivo */
@media (max-width: 768px) {
  .kpi-value {
    font-size: 1.5rem;
  }

  .table-responsive {
    overflow-x: auto;
  }

  .table-dark-custom {
    min-width: 800px;
  }
}

/* Notificações Socket.IO */
.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.notifications-panel {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 400px;
  max-height: 600px;
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 0.75rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.notifications-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #1a1a1a;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notifications-header h5 {
  color: white;
  font-size: 1rem;
  font-weight: 600;
}

.notifications-body {
  max-height: 500px;
  overflow-y: auto;
}

.notification-item {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #1a1a1a;
  display: flex;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.notification-item:hover {
  background: #111111;
}

.notification-item.unread {
  background: rgba(147, 51, 234, 0.05);
  border-left: 3px solid var(--purple);
}

.notification-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-content p {
  color: white;
  font-size: 0.875rem;
  margin: 0;
}

.notification-content small {
  color: #6b7280;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .notifications-panel {
    right: 10px;
    left: 10px;
    width: auto;
  }
}


/* Botão Sino Circular */
.btn-bell {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #1a1a1a;
  border: 1px solid #333;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-bell:hover {
  background: var(--purple);
  border-color: var(--purple);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(147, 51, 234, 0.4);
}

.btn-bell:active {
  transform: scale(0.95);
}

.btn-bell i {
  font-size: 1.25rem;
  transition: transform 0.3s ease;
}

.btn-bell:hover i {
  transform: rotate(15deg);
}

/* Ajuste Badge */
.notification-badge {
  border: 2px solid #0a0a0a; /* Contraste com o fundo do botão */
  top: -2px;
  right: -2px;
}

/* --- Mobile Cards Styles --- */
.mobile-card {
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 12px;
  padding: 1.25rem;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s;
}
.mobile-card:active {
  transform: scale(0.98);
}
.user-avatar.mobile {
  width: 40px;
  height: 40px;
  font-size: 0.9rem;
}
.mobile-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
  background: rgba(255,255,255,0.03);
  padding: 0.75rem;
  border-radius: 8px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.info-item .label {
  font-size: 0.65rem;
  text-transform: uppercase;
  color: #6b7280;
  letter-spacing: 0.5px;
}
.info-item .value {
  font-size: 0.85rem;
  font-weight: 500;
}
.tiny-text {
  font-size: 0.7rem;
  margin-top: 1px;
}
.spin-anim {
  animation: spin 1s linear infinite;
}
@keyframes spin { 100% { transform: rotate(360deg); } }

/* --- Pagination Styles --- */
.bg-dark-soft { background: #0a0a0a; border: 1px solid #1a1a1a; }
.btn-dark-custom {
  background: transparent;
  color: #6b7280;
  border: none;
  transition: all 0.2s;
  height: 38px;
}
.btn-dark-custom:hover:not(:disabled) {
  background: #1a1a1a;
  color: white;
}
.btn-dark-custom:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Container mais focado para Desktop */
.custom-container {
  max-width: 1140px !important;
  margin-left: auto;
  margin-right: auto;
}
</style>
