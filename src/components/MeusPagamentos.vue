<template>
  <div class="container py-4 my-4 bg-white shadow-sm rounded borda-destacada">
    <h2 class="mb-4 text-center text-success fw-bold">Meus Pagamentos</h2>

    <!-- Usuário logado - dropdown -->
    <li v-if="usuario" class="nav-item dropdown dropdown-hover mx-auto mb-4" style="list-style: none; max-width: 300px;">
      <a
        role="button"
        class="nav-link ps-2 d-flex cursor-pointer align-items-center justify-content-center border border-success rounded-pill px-3 py-2"
        :class="getTextColor()"
        id="dropdownUser"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i class="material-icons opacity-6 me-2 text-md" :class="getTextColor()">person</i>
        {{ usuario.nome || 'Usuário' }}
        <!-- Imagem da seta removida -->
      </a>

      <ul
        class="dropdown-menu dropdown-menu-end dropdown-menu-animation mt-0 p-2 border-radius-lg"
        aria-labelledby="dropdownUser"
      >
        <li>
          <button class="dropdown-item border-radius-md text-danger" @click="logout">
            Sair
          </button>
        </li>
      </ul>
    </li>

    <!-- Resumo financeiro -->
    <div class="mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
      <div><strong>Total pago:</strong> MZN {{ totalPago.toFixed(2) }}</div>
      <div><strong>Último pagamento:</strong> {{ ultimoPagamento ? formatarData(ultimoPagamento.data) + " (" + ultimoPagamento.preco.toFixed(2) + " MZN)" : "-" }}</div>
      <div><strong>Total de pagamentos:</strong> {{ pagamentos.length }}</div>
      <button @click="exportarCSV" class="btn btn-outline-success btn-sm">
        Exportar CSV
      </button>
    </div>

    <!-- Filtros -->
    <div class="mb-4 d-flex flex-wrap gap-3 align-items-center">
      <select v-model="filtros.status" class="form-select form-select-sm" style="max-width: 150px;">
        <option value="">Todos os status</option>
        <option value="pago">Pago</option>
        <option value="pendente">Pendente</option>
        <option value="cancelado">Cancelado</option>
      </select>

      <select v-model="filtros.pacote" class="form-select form-select-sm" style="max-width: 200px;">
        <option value="">Todos os pacotes</option>
        <option v-for="p in pacotesUnicos" :key="p" :value="p">{{ p }}</option>
      </select>

      <select v-model="filtros.formaPagamento" class="form-select form-select-sm" style="max-width: 180px;">
        <option value="">Todas as formas</option>
        <option v-for="f in formasUnicas" :key="f" :value="f">{{ f }}</option>
      </select>

      <input type="date" v-model="filtros.dataInicio" class="form-control form-control-sm" style="max-width: 150px;" placeholder="Data início" />
      <input type="date" v-model="filtros.dataFim" class="form-control form-control-sm" style="max-width: 150px;" placeholder="Data fim" />
      
      <button class="btn btn-secondary btn-sm" @click="limparFiltros">Limpar filtros</button>
    </div>

    <!-- Loading / Erro -->
    <div v-if="loading" class="alert alert-info text-center">
      Carregando pagamentos...
    </div>

    <div v-else-if="erro" class="alert alert-danger text-center">
      {{ erro }}
    </div>

    <!-- Conteúdo -->
    <div v-else>
      <!-- Desktop: tabela -->
      <div class="table-responsive d-none d-md-block">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-success">
            <tr>
              <th>Pacote</th>
              <th>Status</th>
              <th>Forma</th>
              <th>Preço (MZN)</th>
              <th>Data</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="pag in paginaAtual"
              :key="pag._id"
              @mouseenter="hoverId = pag._id"
              @mouseleave="hoverId = null"
              :class="{ 'table-active': hoverId === pag._id }"
              style="cursor: pointer;"
            >
              <td>{{ pag.pacote }}</td>
              <td>
                <span
                  class="badge"
                  :class="{
                    'bg-success': pag.status === 'pago',
                    'bg-warning text-dark': pag.status === 'pendente',
                    'bg-danger': pag.status === 'cancelado'
                  }"
                >
                  {{ pag.status }}
                </span>
              </td>
              <td>{{ pag.formaPagamento }}</td>
              <td>{{ Number(pag.preco).toFixed(2) }}</td>
              <td>{{ formatarData(pag.data) }}</td>
              <td>
                <button
                  @click="abrirDetalhes(pag)"
                  class="btn btn-outline-primary btn-sm"
                  type="button"
                >
                  Ver
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile: cards -->
      <div class="d-md-none">
        <div
          v-for="pag in paginaAtual"
          :key="pag._id"
          class="card mb-3 shadow-sm"
          @click="abrirDetalhes(pag)"
          style="cursor: pointer;"
        >
          <div class="card-body">
            <h5 class="card-title">{{ pag.pacote }}</h5>
            <p class="card-text mb-1">
              <strong>Status:</strong>
              <span
                class="badge"
                :class="{
                  'bg-success': pag.status === 'pago',
                  'bg-warning text-dark': pag.status === 'pendente',
                  'bg-danger': pag.status === 'cancelado'
                }"
              >
                {{ pag.status }}
              </span>
            </p>
            <p class="card-text mb-1"><strong>Forma:</strong> {{ pag.formaPagamento }}</p>
            <p class="card-text mb-1"><strong>Preço:</strong> MZN {{ Number(pag.preco).toFixed(2) }}</p>
            <p class="card-text"><strong>Data:</strong> {{ formatarData(pag.data) }}</p>
          </div>
        </div>
      </div>

      <!-- Paginação -->
      <nav aria-label="Paginação" v-if="paginas > 1" class="mt-3">
        <ul class="pagination justify-content-center flex-wrap gap-2">
          <li class="page-item" :class="{ disabled: paginaAtualIndex === 1 }">
            <button class="page-link" @click="mudarPagina(paginaAtualIndex - 1)" :disabled="paginaAtualIndex === 1">
              &laquo; Anterior
            </button>
          </li>

          <li
            class="page-item"
            v-for="p in paginas"
            :key="p"
            :class="{ active: p === paginaAtualIndex }"
          >
            <button class="page-link" @click="mudarPagina(p)">
              {{ p }}
            </button>
          </li>

          <li class="page-item" :class="{ disabled: paginaAtualIndex === paginas }">
            <button class="page-link" @click="mudarPagina(paginaAtualIndex + 1)" :disabled="paginaAtualIndex === paginas">
              Próximo &raquo;
            </button>
          </li>
        </ul>
      </nav>

      <!-- Nenhum pagamento -->
      <div v-if="pagamentosFiltrados.length === 0" class="alert alert-warning text-center">
        Nenhum pagamento encontrado.
      </div>
    </div>

    <!-- Modal detalhes -->
    <div
      class="modal fade"
      id="modalDetalhes"
      tabindex="-1"
      aria-labelledby="modalDetalhesLabel"
      aria-hidden="true"
      ref="modalRef"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title" id="modalDetalhesLabel">Detalhes do Pagamento</h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Fechar"
              @click="fecharModal"
            ></button>
          </div>
          <div class="modal-body" v-if="pagamentoSelecionado">
            <ul class="list-group list-group-flush">
              <li class="list-group-item"><strong>Pacote:</strong> {{ pagamentoSelecionado.pacote }}</li>
              <li class="list-group-item">
                <strong>Status:</strong>
                <span
                  class="badge"
                  :class="{
                    'bg-success': pagamentoSelecionado.status === 'pago',
                    'bg-warning text-dark': pagamentoSelecionado.status === 'pendente',
                    'bg-danger': pagamentoSelecionado.status === 'cancelado'
                  }"
                >
                  {{ pagamentoSelecionado.status }}
                </span>
              </li>
              <li class="list-group-item"><strong>Forma de pagamento:</strong> {{ pagamentoSelecionado.formaPagamento }}</li>
              <li class="list-group-item"><strong>Preço:</strong> MZN {{ Number(pagamentoSelecionado.preco).toFixed(2) }}</li>
              <li class="list-group-item"><strong>Data:</strong> {{ formatarData(pagamentoSelecionado.data) }}</li>
              <li class="list-group-item"><strong>Referência:</strong> {{ pagamentoSelecionado.referencia || "-" }}</li>
              <li class="list-group-item"><strong>Descrição:</strong> {{ pagamentoSelecionado.descricao || "Nenhuma" }}</li>
              <li class="list-group-item" v-if="pagamentoSelecionado.comprovante">
                <strong>Comprovante:</strong>
                <a :href="pagamentoSelecionado.comprovante" target="_blank" rel="noopener noreferrer">Ver aqui</a>
              </li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="fecharModal">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "../api";
import { useRouter } from "vue-router";
import * as bootstrap from "bootstrap";

const router = useRouter();

const usuario = ref(null);
const pagamentos = ref([]);
const loading = ref(false);
const erro = ref("");
const hoverId = ref(null);

// Filtros
const filtros = ref({
  status: "",
  pacote: "",
  formaPagamento: "",
  dataInicio: "",
  dataFim: "",
});

// Paginação
const itensPorPagina = 10;
const paginaAtualIndex = ref(1);

// Modal
const pagamentoSelecionado = ref(null);
const modalRef = ref(null);
let modalInstance = null;

// Buscar usuário pelo email salvo no localStorage
async function buscarUsuario() {
  try {
    const emailLogado = localStorage.getItem("email");
    if (!emailLogado) {
      router.push("/");
      return;
    }
    const response = await api.get("/auth/usuarios");
    if (!Array.isArray(response.data)) return;
    usuario.value = response.data.find((u) => u.email === emailLogado);
    if (!usuario.value) router.push("/");
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
  }
}

async function carregarPagamentos() {
  loading.value = true;
  erro.value = "";

  try {
    const response = await api.get("/pagamentos/meus");
    pagamentos.value = response.data.pagamentos || [];
  } catch (err) {
    erro.value =
      err.response?.data?.mensagem ||
      "Erro ao carregar os pagamentos. Verifique se está autenticado.";
  } finally {
    loading.value = false;
  }
}

function formatarData(dataISO) {
  const d = new Date(dataISO);
  return d.toLocaleString("pt-MZ", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

// Computados para dados únicos nos filtros
const pacotesUnicos = computed(() => {
  const set = new Set(pagamentos.value.map((p) => p.pacote));
  return Array.from(set).sort();
});
const formasUnicas = computed(() => {
  const set = new Set(pagamentos.value.map((p) => p.formaPagamento));
  return Array.from(set).sort();
});

// Computado para pagamentos filtrados
const pagamentosFiltrados = computed(() => {
  return pagamentos.value.filter((p) => {
    if (filtros.value.status && p.status !== filtros.value.status) return false;
    if (filtros.value.pacote && p.pacote !== filtros.value.pacote) return false;
    if (filtros.value.formaPagamento && p.formaPagamento !== filtros.value.formaPagamento)
      return false;
    if (filtros.value.dataInicio && new Date(p.data) < new Date(filtros.value.dataInicio))
      return false;
    if (filtros.value.dataFim && new Date(p.data) > new Date(filtros.value.dataFim))
      return false;

    return true;
  });
});

// Paginação calculada
const paginas = computed(() => {
  return Math.ceil(pagamentosFiltrados.value.length / itensPorPagina);
});

const paginaAtual = computed(() => {
  const start = (paginaAtualIndex.value - 1) * itensPorPagina;
  return pagamentosFiltrados.value.slice(start, start + itensPorPagina);
});

function mudarPagina(p) {
  if (p >= 1 && p <= paginas.value) {
    paginaAtualIndex.value = p;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function limparFiltros() {
  filtros.value = {
    status: "",
    pacote: "",
    formaPagamento: "",
    dataInicio: "",
    dataFim: "",
  };
  mudarPagina(1);
}

// Resumo financeiro
const totalPago = computed(() => {
  return pagamentosFiltrados.value
    .filter((p) => p.status === "pago")
    .reduce((acc, cur) => acc + Number(cur.preco), 0);
});
const ultimoPagamento = computed(() => {
  const pagos = pagamentosFiltrados.value
    .filter((p) => p.status === "pago")
    .sort((a, b) => new Date(b.data) - new Date(a.data));
  return pagos.length ? pagos[0] : null;
});

// Modal de detalhes
function abrirDetalhes(pagamento) {
  pagamentoSelecionado.value = pagamento;
  if (!modalInstance) {
    modalInstance = new bootstrap.Modal(modalRef.value);
  }
  modalInstance.show();
}

function fecharModal() {
  if (modalInstance) modalInstance.hide();
  pagamentoSelecionado.value = null;
}

// Exportar CSV simples
function exportarCSV() {
  const headers = ["Pacote", "Status", "Forma de pagamento", "Preço (MZN)", "Data", "Referência", "Descrição"];
  const rows = pagamentosFiltrados.value.map((p) => [
    p.pacote,
    p.status,
    p.formaPagamento,
    Number(p.preco).toFixed(2),
    formatarData(p.data),
    p.referencia || "",
    p.descricao || "",
  ]);

  let csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(";") + "\n"
    + rows.map(e => e.join(";")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "pagamentos.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Logout simples
function logout() {
  localStorage.removeItem("email");
  router.push("/");
}

onMounted(() => {
  buscarUsuario();
  carregarPagamentos();
});

function getTextColor() {
  return "text-success";
}
</script>

<style scoped>
.container {
  max-width: 900px;
  background-color: #f9fff9;
}

/* Borda destacada com transição e hover suave */
.borda-destacada {
  border: 2px solid #66bb6a;
  border-radius: 12px;
  padding: 25px;
  background-color: #fff;
  transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
}

.borda-destacada:hover {
  border-color: #800080;
  box-shadow: 0 8px 20px rgba(128, 0, 128, 0.25);
  transform: scale(1.02);
  cursor: default;
}

.table-active {
  background-color: #d1e7dd !important;
  transition: background-color 0.3s ease;
}

h2 {
  font-weight: 700;
  font-size: 2rem;
}

.alert {
  font-weight: 600;
  font-size: 1.1rem;
}

.btn-outline-success {
  font-weight: 600;
  font-size: 1rem;
  border-radius: 30px;
  padding: 6px 20px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.btn-outline-success:hover,
.btn-outline-success:focus {
  background-color: #66bb6a;
  color: white;
}

/* Ícone de pessoa alinhado */
.material-icons {
  font-size: 20px;
  color: #2e7d32; /* verde escuro */
}

/* Responsividade: padding e margem */
@media (max-width: 576px) {
  .container {
    padding: 15px;
  }

  .btn-outline-success {
    font-size: 0.9rem;
    padding: 5px 15px;
  }

  h2 {
    font-size: 1.6rem;
  }
}
</style>
