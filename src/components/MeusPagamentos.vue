<template>
  <!-- Fix HMR Update -->
  <div class="container-fluid position-sticky z-index-sticky top-0 px-0">
    <div class="row gx-0">
      <div class="col-12">
        <NavbarDefault :sticky="true" />
      </div>
    </div>
  </div>

  <br /><br /><br />

  <div
    class="container-fluid pag-container-fluid py-4 my-4 shadow-sm rounded borda-destacada pag-container-responsive"
  >
    <!-- Alerta de Renovação -->
    <transition name="fade">
      <div
        v-if="alertaRenovacao.mostrar"
        :class="[
          'alert',
          'd-flex',
          'align-items-center',
          'gap-2',
          alertaRenovacao.tipo === 'danger' ? 'alert-danger' : 'alert-warning',
        ]"
        role="alert"
        style="max-width: 700px; margin: 0 auto 1.5rem auto"
      >
        <i class="material-icons">{{
          alertaRenovacao.tipo === "danger" ? "error" : "warning"
        }}</i>
        <span>{{ alertaRenovacao.texto }}</span>
      </div>
    </transition>

    <!-- Usuário Dropdown -->
    <li
      v-if="usuario"
      class="nav-item dropdown dropdown-hover mx-auto mb-4"
      style="list-style: none; max-width: 320px"
    >
      <a
        role="button"
        class="nav-link ps-2 d-flex cursor-pointer align-items-center justify-content-center border rounded-pill px-4 py-2 user-dropdown"
        id="dropdownUser"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label="Menu do usuário"
      >
        <i class="material-icons opacity-6 me-2 text-md">person</i>
        <span class="fw-semibold">{{ usuario.nome || "Usuário" }}</span>
        <i class="material-icons ms-2 text-sm">expand_more</i>
      </a>
      <ul
        class="dropdown-menu dropdown-menu-end dropdown-menu-animation mt-0 p-2 border-radius-lg"
        aria-labelledby="dropdownUser"
      >
        <li>
          <button
            class="dropdown-item border-radius-md text-danger d-flex align-items-center gap-2"
            @click="logout"
          >
            <i class="material-icons text-sm">logout</i>
            Sair
          </button>
        </li>
      </ul>
    </li>

    <!-- Resumo Financeiro -->
    <div class="mb-4 resumo-financeiro-container">
      <div class="resumo-card">
        <div class="resumo-icon bg-gradient-primary">
          <i class="material-icons text-white">payments</i>
        </div>
        <div class="resumo-content">
          <span class="resumo-label">Total Pago</span>
          <span class="resumo-value">{{ formatarMoeda(totalPago) }}</span>
        </div>
      </div>

      <div class="resumo-card">
        <div class="resumo-icon bg-gradient-info">
          <i class="material-icons text-white">receipt</i>
        </div>
        <div class="resumo-content">
          <span class="resumo-label">Último Pagamento</span>
          <span class="resumo-value-small">
            {{
              ultimoPagamento
                ? formatarData(ultimoPagamento.dataPagamento)
                : "-"
            }}
          </span>
          <span v-if="ultimoPagamento" class="resumo-subtext">
            MZN {{ ultimoPagamento.valor.toFixed(2) }}
          </span>
        </div>
      </div>

      <div class="resumo-card">
        <div class="resumo-icon bg-gradient-success">
          <i class="material-icons text-white">list_alt</i>
        </div>
        <div class="resumo-content">
          <span class="resumo-label">Total de Pagamentos</span>
          <span class="resumo-value">{{ pagamentos.length }}</span>
        </div>
      </div>

      <div class="resumo-card resumo-card-action">
        <button
          @click="exportarCSV"
          class="btn btn-gradient-primary w-100 d-flex align-items-center justify-content-center gap-2"
          :disabled="pagamentos.length === 0"
          aria-label="Exportar pagamentos para CSV"
        >
          <i class="material-icons text-sm">download</i>
          Exportar CSV
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="mb-4 filtros-container">
      <div class="filtros-wrapper">
        <div class="filtro-group">
          <label for="filtroStatus" class="visually-hidden"
            >Filtrar por status</label
          >
          <select
            id="filtroStatus"
            v-model="filtros.status"
            class="form-select form-select-sm filtro-select"
            aria-label="Filtrar por status"
          >
            <option value="">Todos os status</option>
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
            <option value="cancelado">Cancelado</option>
            <option value="expirado">Expirado</option>
          </select>
        </div>

        <div class="filtro-group">
          <label for="filtroPacote" class="visually-hidden"
            >Filtrar por pacote</label
          >
          <select
            id="filtroPacote"
            v-model="filtros.pacote"
            class="form-select form-select-sm filtro-select"
            aria-label="Filtrar por pacote"
          >
            <option value="">Todos os pacotes</option>
            <option v-for="p in pacotesUnicos" :key="p" :value="p">
              {{ p }}
            </option>
          </select>
        </div>

        <div class="filtro-group">
          <label for="filtroForma" class="visually-hidden"
            >Filtrar por forma de pagamento</label
          >
          <select
            id="filtroForma"
            v-model="filtros.formaPagamento"
            class="form-select form-select-sm filtro-select"
            aria-label="Filtrar por forma de pagamento"
          >
            <option value="">Todas as formas</option>
            <option v-for="f in formasUnicas" :key="f" :value="f">
              {{ f }}
            </option>
          </select>
        </div>

        <button
          class="btn btn-outline-light btn-sm filtro-limpar"
          @click="limparFiltros"
          :disabled="!temFiltrosAtivos"
          aria-label="Limpar todos os filtros"
        >
          <i class="material-icons text-sm me-1">clear</i>
          Limpar
        </button>
      </div>

      <!-- Contador de resultados -->
      <div v-if="temFiltrosAtivos" class="filtros-info mt-2 text-center">
        <small class="text-light">
          Mostrando {{ pagamentosFiltrados.length }} de
          {{ pagamentos.length }} pagamento(s)
        </small>
      </div>
    </div>

    <!-- Loading / Erro -->
    <transition name="fade">
      <div
        v-if="loading"
        class="alert alert-info text-center d-flex align-items-center justify-content-center gap-2"
      >
        <div class="spinner-border spinner-border-sm" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
        Carregando pagamentos...
      </div>
    </transition>

    <transition name="fade">
      <div
        v-if="erro"
        class="alert alert-danger text-center d-flex align-items-center justify-content-center gap-2"
      >
        <i class="material-icons">error</i>
        {{ erro }}
      </div>
    </transition>

    <!-- Conteúdo -->
    <div v-if="!loading && !erro">
      <!-- Desktop Table -->
      <div class="table-responsive d-none d-md-block">
        <table
          class="table table-dark table-hover align-middle mb-0 payments-table"
        >
          <thead class="table-header-gradient">
            <tr>
              <th scope="col">Pacote</th>
              <th scope="col">Status</th>
              <th scope="col">Forma</th>
              <th scope="col">Preço (MZN)</th>
              <th scope="col">Data</th>
              <th scope="col">Validade</th>
              <th scope="col" class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="pag in paginaAtual"
              :key="pag._id"
              @mouseenter="hoverId = pag._id"
              @mouseleave="hoverId = null"
              :class="{ 'table-active-dark': hoverId === pag._id }"
              class="payment-row"
            >
              <td class="fw-semibold">{{ pag.pacote }}</td>
              <td>
                <span
                  class="badge status-badge"
                  :class="getStatusClass(pag.status)"
                >
                  {{ pag.status }}
                </span>
              </td>
              <td>{{ pag.formaPagamento }}</td>
              <td class="fw-semibold">{{ Number(pag.valor).toFixed(2) }}</td>
              <td>{{ formatarData(pag.dataPagamento) }}</td>
              <td
                :class="
                  pag.status === 'pago'
                    ? diasParaExpirarInfo(pag.dataPagamento, pag.pacote).classe
                    : 'text-muted'
                "
              >
                {{
                  pag.status === "pago"
                    ? diasParaExpirarInfo(pag.dataPagamento, pag.pacote).texto
                    : "-"
                }}
              </td>
              <td class="text-center">
                <button
                  @click="abrirDetalhes(pag)"
                  class="btn btn-gradient-primary btn-sm btn-action"
                  aria-label="Ver detalhes do pagamento"
                >
                  <i class="material-icons text-sm">visibility</i>
                  Ver
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="d-md-none">
        <div
          v-for="pag in paginaAtual"
          :key="pag._id"
          class="card mb-3 shadow-sm payment-card-dark"
          @click="abrirDetalhes(pag)"
          role="button"
          tabindex="0"
          @keypress.enter="abrirDetalhes(pag)"
          aria-label="Ver detalhes do pagamento"
        >
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title mb-0 text-light">{{ pag.pacote }}</h5>
              <span
                class="badge status-badge"
                :class="getStatusClass(pag.status)"
              >
                {{ pag.status }}
              </span>
            </div>

            <div class="payment-details">
              <div class="detail-row">
                <span class="detail-label">
                  <i class="material-icons text-sm">payment</i>
                  Forma:
                </span>
                <span class="detail-value">{{ pag.formaPagamento }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">
                  <i class="material-icons text-sm">attach_money</i>
                  Preço:
                </span>
                <span class="detail-value fw-bold"
                  >MZN {{ Number(pag.valor).toFixed(2) }}</span
                >
              </div>

              <div class="detail-row">
                <span class="detail-label">
                  <i class="material-icons text-sm">calendar_today</i>
                  Data:
                </span>
                <span class="detail-value">{{
                  formatarData(pag.dataPagamento)
                }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">
                  <i class="material-icons text-sm">schedule</i>
                  Validade:
                </span>
                <span
                  class="detail-value"
                  :class="
                    pag.status === 'pago'
                      ? diasParaExpirarInfo(pag.dataPagamento, pag.pacote)
                          .classe
                      : 'text-muted'
                  "
                >
                  {{
                    pag.status === "pago"
                      ? diasParaExpirarInfo(pag.dataPagamento, pag.pacote).texto
                      : "-"
                  }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginação -->
      <nav v-if="paginas > 1" aria-label="Navegação de páginas" class="mt-4">
        <div class="pagination-container">
          <button
            class="pagination-btn-circle"
            @click="mudarPagina(paginaAtualIndex - 1)"
            :disabled="paginaAtualIndex === 1"
            aria-label="Página anterior"
          >
            <i class="material-icons">chevron_left</i>
          </button>

          <div class="pagination-numbers">
            <button
              v-for="p in paginasVisiveis"
              :key="p"
              class="btn pagination-number"
              :class="{
                active: p === paginaAtualIndex,
                disabled: typeof p === 'string',
              }"
              @click="typeof p === 'number' && mudarPagina(p)"
              :disabled="typeof p === 'string'"
              :aria-label="`Página ${p}`"
              :aria-current="p === paginaAtualIndex ? 'page' : undefined"
            >
              {{ p }}
            </button>
          </div>

          <button
            class="pagination-btn-circle"
            @click="mudarPagina(paginaAtualIndex + 1)"
            :disabled="paginaAtualIndex === paginas"
            aria-label="Próxima página"
          >
            <i class="material-icons">chevron_right</i>
          </button>
        </div>
      </nav>

      <!-- Empty State -->
      <div
        v-if="pagamentosFiltrados.length === 0"
        class="alert alert-warning text-center empty-state"
      >
        <i class="material-icons mb-2" style="font-size: 48px">inbox</i>
        <p class="mb-0">
          {{
            temFiltrosAtivos
              ? "Nenhum pagamento encontrado com os filtros aplicados."
              : "Nenhum pagamento encontrado."
          }}
        </p>
        <button
          v-if="temFiltrosAtivos"
          @click="limparFiltros"
          class="btn btn-sm btn-outline-warning mt-2"
        >
          Limpar filtros
        </button>
      </div>
    </div>

    <!-- Modal de Detalhes -->
    <div
      class="modal fade"
      id="modalDetalhes"
      tabindex="-1"
      aria-labelledby="modalDetalhesLabel"
      aria-hidden="true"
      ref="modalRef"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content modal-dark">
          <div class="modal-header modal-header-gradient">
            <h5
              class="modal-title d-flex align-items-center gap-2 text-white"
              id="modalDetalhesLabel"
            >
              <i class="material-icons">receipt_long</i>
              Detalhes do Pagamento
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Fechar modal"
              @click="fecharModal"
            ></button>
          </div>
          <div class="modal-body" v-if="pagamentoSelecionado">
            <ul class="list-group list-group-flush">
              <li
                class="list-group-item list-group-item-dark d-flex justify-content-between align-items-center"
              >
                <strong
                  ><i class="material-icons text-sm me-2">category</i
                  >Pacote:</strong
                >
                <span>{{ pagamentoSelecionado.pacote }}</span>
              </li>
              <li
                class="list-group-item list-group-item-dark d-flex justify-content-between align-items-center"
              >
                <strong
                  ><i class="material-icons text-sm me-2">info</i
                  >Status:</strong
                >
                <span
                  class="badge status-badge"
                  :class="getStatusClass(pagamentoSelecionado.status)"
                >
                  {{ pagamentoSelecionado.status }}
                </span>
              </li>
              <li
                class="list-group-item list-group-item-dark d-flex justify-content-between align-items-center"
              >
                <strong
                  ><i class="material-icons text-sm me-2">payment</i
                  >Forma:</strong
                >
                <span>{{ pagamentoSelecionado.formaPagamento }}</span>
              </li>
              <li
                class="list-group-item list-group-item-dark d-flex justify-content-between align-items-center"
              >
                <strong
                  ><i class="material-icons text-sm me-2">attach_money</i
                  >Preço:</strong
                >
                <span class="fw-bold"
                  >MZN {{ Number(pagamentoSelecionado.valor).toFixed(2) }}</span
                >
              </li>
              <li
                class="list-group-item list-group-item-dark d-flex justify-content-between align-items-center"
              >
                <strong
                  ><i class="material-icons text-sm me-2">calendar_today</i
                  >Data:</strong
                >
                <span>{{
                  formatarData(pagamentoSelecionado.dataPagamento)
                }}</span>
              </li>
              <li
                class="list-group-item list-group-item-dark d-flex justify-content-between align-items-center"
                :class="
                  pagamentoSelecionado.status === 'pago'
                    ? diasParaExpirarInfo(
                        pagamentoSelecionado.dataPagamento,
                        pagamentoSelecionado.pacote
                      ).classe
                    : 'text-muted'
                "
              >
                <strong
                  ><i class="material-icons text-sm me-2">schedule</i
                  >Validade:</strong
                >
                <span>
                  {{
                    pagamentoSelecionado.status === "pago"
                      ? diasParaExpirarInfo(
                          pagamentoSelecionado.dataPagamento,
                          pagamentoSelecionado.pacote
                        ).texto
                      : "-"
                  }}
                </span>
              </li>
              <li
                class="list-group-item list-group-item-dark d-flex justify-content-between align-items-center"
              >
                <strong
                  ><i class="material-icons text-sm me-2">tag</i
                  >Referência:</strong
                >
                <span>{{ pagamentoSelecionado.referencia || "-" }}</span>
              </li>
              <li class="list-group-item list-group-item-dark">
                <strong class="d-block mb-2"
                  ><i class="material-icons text-sm me-2">description</i
                  >Descrição:</strong
                >
                <span>{{
                  pagamentoSelecionado.descricao ||
                  "Nenhuma descrição disponível"
                }}</span>
              </li>
              <li
                class="list-group-item list-group-item-dark"
                v-if="pagamentoSelecionado.comprovante"
              >
                <strong class="d-block mb-2"
                  ><i class="material-icons text-sm me-2">attachment</i
                  >Comprovante:</strong
                >
                <a
                  :href="pagamentoSelecionado.comprovante"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-sm btn-gradient-primary"
                >
                  <i class="material-icons text-sm me-1">open_in_new</i>
                  Ver comprovante
                </a>
              </li>
            </ul>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
              @click="fecharModal"
            >
              Fechar
            </button>
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
import { useRouter } from "vue-router";
import api from "../api";
import * as bootstrap from "bootstrap";

const router = useRouter();

// State
const usuario = ref(null);
const pagamentos = ref([]);
const loading = ref(false);
const erro = ref("");
const hoverId = ref(null);
const filtros = ref({ status: "", pacote: "", formaPagamento: "" });
const itensPorPagina = 10;
const paginaAtualIndex = ref(1);
const pagamentoSelecionado = ref(null);
const modalRef = ref(null);
let modalInstance = null;

// Computed - Alerta de Renovação
const alertaRenovacao = computed(() => {
  if (!ultimoPagamento.value) {
    return { mostrar: false, texto: "", tipo: "" };
  }
  const info = diasParaExpirarInfo(
    ultimoPagamento.value.dataPagamento,
    ultimoPagamento.value.pacote
  );

  if (info.texto === "Expirado") {
    return {
      mostrar: true,
      texto:
        "⚠️ Sua assinatura expirou. Renove para continuar usando o serviço.",
      tipo: "danger",
    };
  }

  const match = info.texto.match(/Faltam (\d+)/);
  if (match && Number(match[1]) <= 3) {
    return {
      mostrar: true,
      texto: `⏰ Sua assinatura expira em ${match[1]} dia${
        match[1] > 1 ? "s" : ""
      }. Renove para evitar interrupções.`,
      tipo: "warning",
    };
  }

  return { mostrar: false, texto: "", tipo: "" };
});

// Computed - Filtros e Dados
const pacotesUnicos = computed(() =>
  [...new Set(pagamentos.value.map((p) => p.pacote))].sort()
);

const formasUnicas = computed(() =>
  [...new Set(pagamentos.value.map((p) => p.formaPagamento))].sort()
);

const pagamentosFiltrados = computed(() =>
  pagamentos.value.filter(
    (p) =>
      (!filtros.value.status || p.status === filtros.value.status) &&
      (!filtros.value.pacote || p.pacote === filtros.value.pacote) &&
      (!filtros.value.formaPagamento ||
        p.formaPagamento === filtros.value.formaPagamento)
  )
);

const temFiltrosAtivos = computed(
  () =>
    filtros.value.status || filtros.value.pacote || filtros.value.formaPagamento
);

// Watch para resetar paginação quando filtros mudam
watch(filtros, () => {
  paginaAtualIndex.value = 1;
}, { deep: true });

const paginas = computed(() =>
  Math.ceil(pagamentosFiltrados.value.length / itensPorPagina)
);

const paginaAtual = computed(() =>
  pagamentosFiltrados.value.slice(
    (paginaAtualIndex.value - 1) * itensPorPagina,
    paginaAtualIndex.value * itensPorPagina
  )
);

const paginasVisiveis = computed(() => {
  const total = paginas.value;
  const atual = paginaAtualIndex.value;
  const delta = 2;
  const range = [];

  for (
    let i = Math.max(2, atual - delta);
    i <= Math.min(total - 1, atual + delta);
    i++
  ) {
    range.push(i);
  }

  if (atual - delta > 2) {
    range.unshift("...");
  }
  if (atual + delta < total - 1) {
    range.push("...");
  }

  range.unshift(1);
  if (total > 1) {
    range.push(total);
  }

  return range.filter((v, i, a) => a.indexOf(v) === i);
});

const totalPago = computed(() =>
  pagamentos.value.reduce((a, b) => a + Number(b.valor || 0), 0)
);

const ultimoPagamento = computed(() => {
  if (pagamentos.value.length === 0) return null;
  return [...pagamentos.value].sort(
    (a, b) => new Date(b.dataPagamento) - new Date(a.dataPagamento)
  )[0];
});

// Functions
function diasParaExpirarInfo(dataISO, pacote) {
  const dataPagamento = new Date(dataISO);
  const nomePacote = pacote?.toLowerCase().trim();
  
  let diasValidade = 30; // Default mensal
  if (nomePacote === "anual") diasValidade = 365;
  else if (nomePacote === "teste" || nomePacote === "test") diasValidade = 5;

  const dataExpiracao = new Date(dataPagamento);
  dataExpiracao.setDate(dataExpiracao.getDate() + diasValidade);

  const hoje = new Date();
  const diffMs = dataExpiracao - hoje;
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias < 0) return { texto: "Expirado", classe: "text-danger fw-bold" };
  if (diffDias === 0)
    return { texto: "Expira hoje", classe: "text-warning fw-bold" };
  return {
    texto: `Faltam ${diffDias} dia${diffDias > 1 ? "s" : ""}`,
    classe: "text-success fw-bold",
  };
}

function formatarData(dataISO) {
  return new Date(dataISO).toLocaleString("pt-MZ", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatarMoeda(valor) {
  return `MZN ${Number(valor || 0).toFixed(2)}`;
}

function getStatusClass(status) {
  const classes = {
    pago: "bg-success",
    pendente: "bg-warning text-dark",
    cancelado: "bg-danger",
    expirado: "bg-danger",
  };
  return classes[status] || "bg-secondary";
}

function mudarPagina(p) {
  if (typeof p === "number" && p >= 1 && p <= paginas.value) {
    paginaAtualIndex.value = p;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function limparFiltros() {
  filtros.value = { status: "", pacote: "", formaPagamento: "" };
  mudarPagina(1);
}

function abrirDetalhes(p) {
  pagamentoSelecionado.value = p;
  if (!modalInstance) {
    modalInstance = new bootstrap.Modal(modalRef.value);
  }
  modalInstance.show();
}

function fecharModal() {
  modalInstance?.hide();
  pagamentoSelecionado.value = null;
}

function exportarCSV() {
  const headers = [
    "Pacote",
    "Status",
    "Forma",
    "Preço (MZN)",
    "Data",
    "Validade",
    "Referência",
    "Descrição",
  ];
  const rows = pagamentosFiltrados.value.map((p) => {
    const validade =
      p.status === "pago"
        ? diasParaExpirarInfo(p.dataPagamento, p.pacote).texto
        : "-";
    return [
      p.pacote,
      p.status,
      p.formaPagamento,
      Number(p.valor).toFixed(2),
      formatarData(p.dataPagamento),
      validade,
      p.referencia || "",
      p.descricao || "",
    ];
  });

  const csv =
    "data:text/csv;charset=utf-8," +
    [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");

  const link = document.createElement("a");
  link.href = encodeURI(csv);
  link.download = `pagamentos_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function logout() {
  localStorage.removeItem("email");
  router.push("/");
}

async function buscarUsuario() {
  try {
    const email = localStorage.getItem("email");
    if (!email) return router.push("/");

    // Tenta buscar dados completos (pode falhar se não for admin)
    try {
      const res = await api.get("/auth/usuarios");
      if (Array.isArray(res.data)) {
         usuario.value = res.data.find((u) => u.email === email);
      }
    } catch (innerErr) {
      console.warn("Não foi possível carregar lista de usuários (permissão?), usando fallback.", innerErr);
    }

    // Fallback se não encontrou ou falhou: usa dados locais/básicos
    if (!usuario.value) {
      usuario.value = { 
        nome: email.split('@')[0], // Nome provisório baseado no email
        email: email,
        role: 'user'
      };
    }
  } catch (err) {
    console.error("Erro crítico em buscarUsuario:", err);
    // Não definimos erro.value aqui para não bloquear a tabela de pagamentos
  }
}

async function carregarPagamentos() {
  loading.value = true;
  erro.value = "";

  try {
    const res = await api.get("/pagamentos/meus");
    pagamentos.value = res.data.pagamentos || [];
  } catch (err) {
    erro.value = err.response?.data?.mensagem || "Erro ao carregar pagamentos.";
  } finally {
    loading.value = false;
  }
}

// Lifecycle
onMounted(() => {
  buscarUsuario();
  carregarPagamentos();
});
</script>

<style scoped>
/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Container - White Theme */
.pag-container-fluid {
  width: 100%;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 24px;
  padding-right: 24px;
  background: #ffffff;
}

@media (min-width: 992px) {
  .pag-container-fluid {
    padding-left: 48px;
    padding-right: 48px;
  }
}

@media (max-width: 768px) {
  .pag-container-fluid {
    padding-left: 16px;
    padding-right: 16px;
  }
}

.pag-container-responsive {
  padding-left: 0;
  padding-right: 0;
}

/* Container Principal - Tesla/SpaceX Style */
.borda-destacada {
  border: none;
  border-radius: 0;
  padding: 48px 24px;
  background: #ffffff;
  box-shadow: none;
}

@media (min-width: 992px) {
  .borda-destacada {
    padding: 64px 48px;
  }
}

@media (max-width: 768px) {
  .borda-destacada {
    padding: 32px 16px;
  }
}

.borda-destacada:hover {
  border-color: transparent;
  box-shadow: none;
}

/* User Dropdown - White Theme */
.user-dropdown {
  transition: all 0.3s ease;
  background: #f9fafb;
  border-color: #800080 !important;
  color: #1f2937;
}

.user-dropdown:hover {
  background: #f3f4f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(128, 0, 128, 0.15);
}

/* Gradientes - Apenas Roxo */
.bg-gradient-primary,
.bg-gradient-info,
.bg-gradient-success {
  background: #800080;
}

.btn-gradient-primary {
  background: #800080;
  border: none;
  color: white;
  transition: all 0.3s ease;
}

.btn-gradient-primary:hover:not(:disabled) {
  background: #6b006b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(128, 0, 128, 0.3);
  color: white;
}

.btn-gradient-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Resumo Financeiro - Tesla Style */
.resumo-financeiro-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 48px;
}

@media (min-width: 768px) {
  .resumo-financeiro-container {
    gap: 24px;
  }
}

.resumo-card {
  background: #f8f9fa;
  border: none;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: background 0.3s ease;
}

@media (min-width: 768px) {
  .resumo-card {
    padding: 28px;
    gap: 20px;
  }
}

.resumo-card:hover {
  background: #f1f3f4;
}

.resumo-card-action {
  padding: 16px;
}

.resumo-icon {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #171717 !important;
}

.resumo-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.resumo-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.resumo-value {
  font-size: 1.75rem;
  font-weight: 600;
  color: #171717;
  letter-spacing: -0.5px;
}

.resumo-value-small {
  font-size: 1rem;
  font-weight: 600;
  color: #171717;
}

.resumo-subtext {
  font-size: 0.875rem;
  color: #6b7280;
}

.resumo-value-small {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
}

.resumo-subtext {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Filtros - Tesla Style */
.filtros-container {
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  border: none;
  margin-bottom: 32px;
}

.filtros-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: flex-start;
}

.filtro-group {
  flex: 0 0 auto;
  min-width: 160px;
}

.filtro-select {
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  background: #ffffff;
  color: #171717;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  height: 42px;
  padding: 0 14px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23171717' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.filtro-select:hover {
  border-color: #171717;
}

.filtro-select:focus {
  border-color: #171717;
  box-shadow: 0 0 0 3px rgba(23, 23, 23, 0.1);
  background-color: #ffffff;
  color: #171717;
  outline: none;
}

.filtro-select option {
  background: #ffffff;
  color: #171717;
  padding: 12px;
}

.filtro-limpar {
  border-radius: 8px;
  min-width: 90px;
  height: 42px;
  transition: all 0.2s ease;
  border: 2px solid #171717;
  color: #171717;
  background: transparent;
  font-weight: 500;
  font-size: 0.85rem;
  cursor: pointer;
}

.filtro-limpar:hover:not(:disabled) {
  background: #171717;
  color: #ffffff;
}

.filtro-limpar:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.filtros-info {
  animation: fadeIn 0.3s ease;
}

/* Table - Tesla Style */
.payments-table {
  border-radius: 0;
  /* overflow: hidden; */
  box-shadow: none;
  background: #ffffff;
}

.table-dark {
  --bs-table-bg: #ffffff;
  --bs-table-color: #171717;
  --bs-table-border-color: #f1f3f4;
}

.table-header-gradient {
  background: #171717;
}

.table-header-gradient th {
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  padding: 16px 20px;
  border: none;
  color: #ffffff;
}

.payment-row {
  transition: background 0.2s ease;
  cursor: pointer;
  border-bottom: 1px solid #f1f3f4;
}

.payment-row:hover {
  background-color: #f8f9fa !important;
}

.payment-row td {
  padding: 20px;
  font-size: 0.9rem;
  color: #171717;
}

.table-active-dark {
  background-color: #f8f9fa !important;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
  background: #171717;
  color: white;
  border: none;
  padding: 8px 16px;
  font-size: 0.8rem;
}

.btn-action:hover {
  background: #333333;
}

/* Mobile Cards - White Theme */
.payment-card-dark {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.payment-card-dark:hover {
  border-color: #800080;
  box-shadow: 0 4px 12px rgba(128, 0, 128, 0.15);
  transform: translateY(-2px);
}

.payment-card-dark:active {
  transform: translateY(-2px);
}

.payment-card-dark .card-body {
  background: transparent;
}

.payment-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: #6b7280;
  font-size: 0.9rem;
}

.detail-value {
  font-weight: 500;
  color: #1f2937;
  text-align: right;
}

/* Pagination - Tesla Style */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: nowrap;
}

@media (max-width: 576px) {
  .pagination-container {
    gap: 8px;
  }
}

.pagination-numbers {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
  flex: 0 1 auto;
}

@media (max-width: 576px) {
  .pagination-numbers {
    gap: 2px;
  }
}

/* Botões circulares Anterior/Próximo */
.pagination-btn-circle {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #171717;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

@media (max-width: 576px) {
  .pagination-btn-circle {
    width: 36px;
    height: 36px;
    min-width: 36px;
  }
}

.pagination-btn-circle:hover:not(:disabled) {
  background: #333333;
  transform: scale(1.05);
}

.pagination-btn-circle:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination-btn-circle i {
  font-size: 20px;
}

@media (max-width: 576px) {
  .pagination-btn-circle i {
    font-size: 18px;
  }
}

.pagination-number {
  min-width: 36px;
  height: 36px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #171717;
  font-weight: 500;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

@media (max-width: 576px) {
  .pagination-number {
    min-width: 32px;
    height: 32px;
    font-size: 0.75rem;
  }
}

.pagination-number:hover:not(.disabled):not(.active) {
  background: #f8f9fa;
  border-color: #171717;
}

.pagination-number.active {
  background: #171717;
  border-color: #171717;
  color: white;
}

.pagination-number.disabled {
  opacity: 0.3;
  cursor: default;
  border: none;
  background: transparent;
}

.pagination-btn-next {
  margin-left: auto;
}

.pagination-number {
  min-width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #1f2937;
  font-weight: 600;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.pagination-number:hover:not(.disabled):not(.active) {
  background: #f9fafb;
  border-color: #800080;
  transform: translateY(-2px);
}

.pagination-number.active {
  background: #800080;
  border-color: #800080;
  color: white;
}

.pagination-number.disabled {
  opacity: 0.3;
  cursor: default;
  border: none;
  background: transparent;
}

/* Empty State */
.empty-state {
  padding: 48px 24px;
  text-align: center;
  border-radius: 12px;
  background: #fef3c7;
  border: 1px solid #fbbf24;
}

/* Modal - White Theme */
.modal-dark {
  background: #ffffff;
  border: 1px solid #e5e7eb;
}

.modal-header-gradient {
  background: #800080;
  border-bottom: none;
}

.modal-content {
  border-radius: 16px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
}

.modal-body {
  padding: 24px;
  background: transparent;
}

.list-group-item-dark {
  background: #f9fafb;
  border-color: #e5e7eb;
  color: #1f2937;
}

.list-group-item {
  border-left: none;
  border-right: none;
  padding: 16px 0;
}

.list-group-item:first-child {
  border-top: none;
}

.list-group-item:last-child {
  border-bottom: none;
}

.modal-footer {
  background: transparent;
  border-top: 1px solid rgba(99, 102, 241, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .pag-container-responsive {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }

  .borda-destacada {
    padding: 20px !important;
  }

  .resumo-financeiro-container {
    grid-template-columns: 1fr;
  }

  .filtros-wrapper {
    flex-direction: column;
  }

  .filtro-group {
    width: 100%;
    max-width: 100%;
  }

  .filtro-limpar {
    width: 100%;
  }

  .resumo-card {
    padding: 16px;
  }

  .resumo-icon {
    width: 48px;
    height: 48px;
  }

  .resumo-value {
    font-size: 1.25rem;
  }

  .pagination-container {
    flex-direction: column;
    gap: 12px;
  }

  .pagination-btn {
    width: 100%;
    min-width: auto;
  }

  .pagination-btn-prev,
  .pagination-btn-next {
    margin: 0;
  }

  .pagination-numbers {
    order: -1;
    width: 100%;
  }
}

/* Utilities */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
