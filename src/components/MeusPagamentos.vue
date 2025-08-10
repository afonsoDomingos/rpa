<template>
  <div class="container-fluid position-sticky z-index-sticky top-0 px-0">
    <div class="row gx-0">
      <div class="col-12">
        <NavbarDefault :sticky="true" />
      </div>
    </div>
  </div>
  <br/><br/><br/>
  <div class="container-fluid pag-container-fluid py-4 my-4 bg-white shadow-sm rounded borda-destacada pag-container-responsive">
    <h2 class="mb-4 text-center text-success fw-bold">Meus Pagamentos</h2>

    <div v-if="alertaRenovacao.mostrar" :class="['alert', alertaRenovacao.tipo === 'danger' ? 'alert-danger' : 'alert-warning']" role="alert" style="max-width: 600px; margin: 0 auto 1rem auto;">
  {{ alertaRenovacao.texto }}
</div>


    <!-- Usuário -->
    <li v-if="usuario" class="nav-item dropdown dropdown-hover mx-auto mb-4" style="list-style: none; max-width: 300px;">
      <a role="button" class="nav-link ps-2 d-flex cursor-pointer align-items-center justify-content-center border border-success rounded-pill px-3 py-2" :class="getTextColor()" id="dropdownUser" data-bs-toggle="dropdown" aria-expanded="false">
        <i class="material-icons opacity-6 me-2 text-md" :class="getTextColor()">person</i>
        {{ usuario.nome || 'Usuário' }}
      </a>
      <ul class="dropdown-menu dropdown-menu-end dropdown-menu-animation mt-0 p-2 border-radius-lg" aria-labelledby="dropdownUser">
        <li><button class="dropdown-item border-radius-md text-danger" @click="logout">Sair</button></li>
      </ul>
    </li>

    <!-- Resumo financeiro -->
    <div class="mb-4 resumo-financeiro-row">
      <div class="resumo-item"><strong>Total pago:</strong> MZN {{ totalPago.toFixed(2) }}</div>
      <div class="resumo-item"><strong>Último pagamento:</strong> {{ ultimoPagamento ? formatarData(ultimoPagamento.data) + " (" + ultimoPagamento.valor.toFixed(2) + " MZN)" : "-" }}</div>
      <div class="resumo-item"><strong>Total de pagamentos:</strong> {{ pagamentos.length }}</div>
      <div class="resumo-item"><button @click="exportarCSV" class="btn btn-outline-success btn-sm w-100-mobile">Exportar CSV</button></div>
    </div>

    <!-- Filtros -->
    <div class="mb-4 filtros-row filtros-compact">
      <select v-model="filtros.status" class="form-select form-select-sm filtro-item filtro-compact">
        <option value="">Todos os status</option>
        <option value="pago">Pago</option>
        <option value="pendente">Pendente</option>
        <option value="cancelado">Cancelado</option>
        <option value="expirado">Expirado</option>
      </select>

      <select v-model="filtros.pacote" class="form-select form-select-sm filtro-item filtro-compact">
        <option value="">Todos os pacotes</option>
        <option v-for="p in pacotesUnicos" :key="p" :value="p">{{ p }}</option>
      </select>

      <select v-model="filtros.formaPagamento" class="form-select form-select-sm filtro-item filtro-compact">
        <option value="">Todas as formas</option>
        <option v-for="f in formasUnicas" :key="f" :value="f">{{ f }}</option>
      </select>

      <button class="btn btn-outline-secondary btn-sm filtro-item filtro-compact w-100-mobile btn-limpar-filtros" @click="limparFiltros">
        Limpar filtros
      </button>
    </div>

    <!-- Loading / Erro -->
    <div v-if="loading" class="alert alert-info text-center">Carregando pagamentos...</div>
    <div v-else-if="erro" class="alert alert-danger text-center">{{ erro }}</div>

    <!-- Conteúdo -->
    <div v-else>
  <!-- Desktop -->
<div class="table-responsive d-none d-md-block">
  <table class="table table-hover align-middle mb-0">
    <thead class="table-success">
      <tr>
        <th>Pacote</th>
        <th>Status</th>
        <th>Forma</th>
        <th>Preço (MZN)</th>
        <th>Data</th>
        <th>Validade</th>
        <th>Detalhes</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="pag in paginaAtual" :key="pag._id" 
          @mouseenter="hoverId = pag._id" 
          @mouseleave="hoverId = null" 
          :class="{ 'table-active': hoverId === pag._id }" 
          style="cursor: pointer;">
        <td>{{ pag.pacote }}</td>
        <td>
          <span class="badge" :class="{
            'bg-success': pag.status === 'pago',
            'bg-warning text-dark': pag.status === 'pendente',
            'bg-danger': pag.status === 'cancelado' || pag.status === 'expirado'
          }">{{ pag.status }}</span>
        </td>
        <td>{{ pag.formaPagamento }}</td>
        <td>{{ Number(pag.valor).toFixed(2) }}</td>
        <td>{{ formatarData(pag.dataPagamento) }}</td>
        <td :class="pag.status === 'pago' ? diasParaExpirarInfo(pag.dataPagamento, pag.pacote).classe : 'text-muted'">
          {{ pag.status === 'pago' ? diasParaExpirarInfo(pag.dataPagamento, pag.pacote).texto : '-' }}
        </td>
        <td>
          <button @click="abrirDetalhes(pag)" class="btn btn-outline-primary btn-sm">Ver</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
<!-- Mobile -->
<div class="d-md-none">
  <div v-for="pag in paginaAtual" :key="pag._id" class="card mb-3 shadow-sm" @click="abrirDetalhes(pag)" style="cursor: pointer;">
    <div class="card-body">
      <h5 class="card-title">{{ pag.pacote }}</h5>
      <p class="card-text mb-1"><strong>Status:</strong>
        <span class="badge" :class="{
          'bg-success': pag.status === 'pago',
          'bg-warning text-dark': pag.status === 'pendente',
          'bg-danger': pag.status === 'cancelado' || pag.status === 'expirado'
        }">{{ pag.status }}</span>
      </p>
      <p class="card-text mb-1"><strong>Forma:</strong> {{ pag.formaPagamento }}</p>
      <p class="card-text mb-1"><strong>Preço:</strong> MZN {{ Number(pag.valor).toFixed(2) }}</p>
      <p class="card-text mb-1"><strong>Data:</strong> {{ formatarData(pag.data) }}</p>
      <p class="card-text mb-1" :class="pag.status === 'pago' ? diasParaExpirarInfo(pag.dataPagamento, pag.pacote).classe : 'text-muted'">
        <strong>Validade:</strong> {{ pag.status === 'pago' ? diasParaExpirarInfo(pag.dataPagamento, pag.pacote).texto : '-' }}
      </p>
    </div>
  </div>
</div>

      <!-- Paginação -->
      <nav v-if="paginas > 1" aria-label="Paginação" class="mt-3">
        <ul class="pagination justify-content-center flex-wrap gap-2">
          <li class="page-item" :class="{ disabled: paginaAtualIndex === 1 }">
            <button class="page-link" @click="mudarPagina(paginaAtualIndex - 1)" :disabled="paginaAtualIndex === 1">&laquo; Anterior</button>
          </li>
          <li class="page-item" v-for="p in paginas" :key="p" :class="{ active: p === paginaAtualIndex }">
            <button class="page-link" @click="mudarPagina(p)">{{ p }}</button>
          </li>
          <li class="page-item" :class="{ disabled: paginaAtualIndex === paginas }">
            <button class="page-link" @click="mudarPagina(paginaAtualIndex + 1)" :disabled="paginaAtualIndex === paginas">Próximo &raquo;</button>
          </li>
        </ul>
      </nav>

      <div v-if="pagamentosFiltrados.length === 0" class="alert alert-warning text-center">
        Nenhum pagamento encontrado.
      </div>
    </div>

    <!-- Modal -->
    <!-- Modal -->
<div class="modal fade" id="modalDetalhes" tabindex="-1" aria-labelledby="modalDetalhesLabel" aria-hidden="true" ref="modalRef">
  <div class="modal-dialog modal-dialog-centered modal-lg">
    <div class="modal-content">
      <div class="modal-header bg-success text-white">
        <h5 class="modal-title" id="modalDetalhesLabel">Detalhes do Pagamento</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar" @click="fecharModal"></button>
      </div>
      <div class="modal-body" v-if="pagamentoSelecionado">
        <ul class="list-group list-group-flush">
          <li class="list-group-item"><strong>Pacote:</strong> {{ pagamentoSelecionado.pacote }}</li>
          <li class="list-group-item"><strong>Status:</strong>
            <span class="badge" :class="{
              'bg-success': pagamentoSelecionado.status === 'pago',
              'bg-warning text-dark': pagamentoSelecionado.status === 'pendente',
              'bg-danger': pagamentoSelecionado.status === 'cancelado' || pagamentoSelecionado.status === 'expirado'
            }">{{ pagamentoSelecionado.status }}</span>
          </li>
          <li class="list-group-item"><strong>Forma:</strong> {{ pagamentoSelecionado.formaPagamento }}</li>
          <li class="list-group-item"><strong>Preço:</strong> MZN {{ Number(pagamentoSelecionado.valor).toFixed(2) }}</li>
          <li class="list-group-item"><strong>Data:</strong> {{ formatarData(pagamentoSelecionado.dataPagamento) }}</li>
          <li class="list-group-item" :class="pagamentoSelecionado.status === 'pago' ? diasParaExpirarInfo(pagamentoSelecionado.dataPagamento, pagamentoSelecionado.pacote).classe : 'text-muted'">
            <strong>Validade:</strong> {{ pagamentoSelecionado.status === 'pago' ? diasParaExpirarInfo(pagamentoSelecionado.dataPagamento, pagamentoSelecionado.pacote).texto : '-' }}
          </li>
          <li class="list-group-item"><strong>Referência:</strong> {{ pagamentoSelecionado.referencia || "-" }}</li>
          <li class="list-group-item"><strong>Descrição:</strong> {{ pagamentoSelecionado.descricao || "Nenhuma" }}</li>
          <li class="list-group-item" v-if="pagamentoSelecionado.comprovante">
            <strong>Comprovante:</strong> 
            <a :href="pagamentoSelecionado.comprovante" target="_blank">Ver aqui</a>
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
  <FooterDefault />
</template>

<script setup>
import NavbarDefault from "../examples/navbars/NavbarDefault.vue";
import FooterDefault from "../examples/footers/FooterDefault.vue";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../api";
import * as bootstrap from "bootstrap";



import { watchEffect } from "vue";

// Computed que calcula a mensagem de alerta e tipo baseado no último pagamento
const alertaRenovacao = computed(() => {
  if (!ultimoPagamento.value) {
    return { mostrar: false, texto: "", tipo: "" };
  }
  const info = diasParaExpirarInfo(ultimoPagamento.value.dataPagamento, ultimoPagamento.value.pacote);
  // info.texto pode ser "Expirado", "Expira hoje", ou "Faltam X dias"
  if (info.texto === "Expirado") {
    return { mostrar: true, texto: "Sua assinatura expirou. Renove para continuar usando o serviço.", tipo: "danger" };
  }
  // Extrair o número de dias do texto "Faltam X dia(s)"
  const match = info.texto.match(/Faltam (\d+)/);
  if (match && Number(match[1]) <= 3) {
    return { mostrar: true, texto: `Sua assinatura expira em ${match[1]} dia${match[1] > 1 ? "s" : ""}. Renove para evitar interrupções.`, tipo: "warning" };
  }
  return { mostrar: false, texto: "", tipo: "" };
});


const router = useRouter();

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

function diasParaExpirarInfo(dataISO, pacote) {
  const dataPagamento = new Date(dataISO);
  const nomePacote = pacote?.toLowerCase().trim();

  // Aqui comparamos diretamente com os nomes esperados
  const diasValidade = nomePacote === "anual" ? 365 : 30;

  const dataExpiracao = new Date(dataPagamento);
  dataExpiracao.setDate(dataExpiracao.getDate() + diasValidade);

  const hoje = new Date();
  const diffMs = dataExpiracao - hoje;
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias < 0) return { texto: "Expirado", classe: "text-danger fw-bold" };
  if (diffDias === 0) return { texto: "Expira hoje", classe: "text-warning fw-bold" };
  return { texto: `Faltam ${diffDias} dia${diffDias > 1 ? "s" : ""}`, classe: "text-success fw-bold" };
}



function formatarData(dataISO) {
  return new Date(dataISO).toLocaleString("pt-MZ", { dateStyle: "short", timeStyle: "short" });
}

const pacotesUnicos = computed(() => [...new Set(pagamentos.value.map(p => p.pacote))].sort());
const formasUnicas = computed(() => [...new Set(pagamentos.value.map(p => p.formaPagamento))].sort());

const pagamentosFiltrados = computed(() =>
  pagamentos.value.filter((p) =>
    (!filtros.value.status || p.status === filtros.value.status) &&
    (!filtros.value.pacote || p.pacote === filtros.value.pacote) &&
    (!filtros.value.formaPagamento || p.formaPagamento === filtros.value.formaPagamento)
  )
);

const paginas = computed(() => Math.ceil(pagamentosFiltrados.value.length / itensPorPagina));
const paginaAtual = computed(() => pagamentosFiltrados.value.slice((paginaAtualIndex.value - 1) * itensPorPagina, paginaAtualIndex.value * itensPorPagina));
const totalPago = computed(() => pagamentosFiltrados.value.filter(p => p.status === "pago").reduce((a, b) => a + Number(b.valor), 0));
const ultimoPagamento = computed(() => [...pagamentosFiltrados.value.filter(p => p.status === "pago")].sort((a, b) => new Date(b.data) - new Date(a.data))[0] || null);

function mudarPagina(p) {
  if (p >= 1 && p <= paginas.value) {
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
  if (!modalInstance) modalInstance = new bootstrap.Modal(modalRef.value);
  modalInstance.show();
}

function fecharModal() {
  modalInstance?.hide();
  pagamentoSelecionado.value = null;
}

function exportarCSV() {
  const headers = ["Pacote", "Status", "Forma", "Preço (MZN)", "Data", "Validade", "Referência", "Descrição"];
  const rows = pagamentosFiltrados.value.map(p => {
    const validade = diasParaExpirarInfo(p.data, p.pacote).texto;
    return [
      p.pacote,
      p.status,
      p.formaPagamento,
      Number(p.valor).toFixed(2),
      formatarData(p.data),
      p.status === 'pago' ? validade : '-',
      p.referencia || "",
      p.descricao || ""
    ];
  });

  const csv = "data:text/csv;charset=utf-8," + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
  const link = document.createElement("a");
  link.href = encodeURI(csv);
  link.download = "pagamentos.csv";
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
    const res = await api.get("/auth/usuarios");
    usuario.value = res.data.find(u => u.email === email);
    if (!usuario.value) router.push("/");
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
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
/* Por padrão, ocupa 100% em telas pequenas, 80% centralizado em telas grandes */
.pag-container-fluid {
  width: 100%;
  max-width: 100vw;
  margin-left: 0;
  margin-right: 0;
  padding-left: 0;
  padding-right: 0;
}
@media (min-width: 992px) {
  .pag-container-fluid {
    width: 95% !important;
    max-width: 95vw !important;
    margin-left: auto !important;
    margin-right: auto !important;
    border-radius: 18px;
  }
}
@media (max-width: 991px) {
  .pag-container-fluid {
    width: 85% !important;
    max-width: 85vw !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
}
.pag-container-responsive {
  padding-left: 32px;
  padding-right: 32px;
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




/* Responsividade aprimorada para alinhar por linha em telas menores */
.resumo-financeiro-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.resumo-item {
  min-width: 160px;
  margin-bottom: 0;
}
.filtros-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.filtro-item {
  min-width: 120px;
  margin-bottom: 0;
}
.w-100-mobile {
  width: auto;
}

/* Filtros compactos e elegantes em telas grandes */
@media (min-width: 992px) {
  .filtros-row {
    justify-content: flex-end;
    background: #f6f6fa;
    border-radius: 32px;
    padding: 10px 24px 10px 18px;
    box-shadow: 0 2px 8px rgba(102, 187, 106, 0.07);
    max-width: 820px;
    margin-left: auto;
    margin-right: auto;
    min-height: 0;
  }
  .filtro-compact {
    min-width: 100px;
    max-width: 160px;
    margin-bottom: 0;
    border-radius: 18px !important;
    background: #fff !important;
    border: 1px solid #d0e6d0 !important;
    font-size: 0.97rem;
    box-shadow: 0 1px 2px rgba(102, 187, 106, 0.04);
    transition: border-color 0.2s, box-shadow 0.2s;
    height: 36px;
    padding: 4px 10px;
  }
  .filtro-compact:focus {
    border-color: #66bb6a !important;
    box-shadow: 0 0 0 2px #c8e6c9;
  }
  .filtros-row select.filtro-compact,
  .filtros-row input.filtro-compact {
    margin-right: 6px;
    margin-left: 0;
    margin-bottom: 0;
  }
  .filtros-row button.filtro-compact {
    margin-left: 8px;
    margin-right: 0;
    min-width: 110px;
    border-radius: 18px;
    font-size: 0.97rem;
    padding: 6px 16px;
    height: 36px;
  }
}

@media (max-width: 768px) {
  .resumo-financeiro-row, .filtros-row {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .resumo-item, .filtro-item {
    width: 100% !important;
    min-width: 0;
    margin-bottom: 0;
  }
  .w-100-mobile {
    width: 100% !important;
  }
}

/* Responsividade: padding e margem */
@media (max-width: 768px) {
  .pag-container-responsive {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
  .container {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
  .borda-destacada {
    padding: 12px !important;
  }
  .table-responsive {
    font-size: 0.97rem;
  }
  .btn-outline-success {
    font-size: 0.9rem;
    padding: 5px 15px;
  }
  h2 {
    font-size: 1.3rem;
  }
  .dropdown-menu {
    min-width: 160px;
    font-size: 0.97rem;
  }
}
</style>
