<script setup>
import { ref, onMounted, computed } from "vue";
import api from "@/api";
import { Pie } from "vue-chartjs";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const solicitacoes = ref([]);
const mensagemErro = ref("");
const solicitanteSelecionado = ref(null);
const termoBusca = ref("");
const paginaAtual = ref(1);
const porPagina = 5;

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
      item.nome_completo
        ?.toLowerCase()
        .includes(termoBusca.value.toLowerCase()) ||
      item.tipo_documento
        ?.toLowerCase()
        .includes(termoBusca.value.toLowerCase())
  );
});

const totalPaginas = computed(() =>
  Math.ceil(filtradas.value.length / porPagina)
);

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

  return {
    labels: Object.keys(contagem),
    datasets: [
      {
        label: "Solicitações por Tipo de Documento",
        data: Object.values(contagem),
        backgroundColor: [
          "#42A5F5",
          "#66BB6A",
          "#FFA726",
          "#AB47BC",
          "#FF7043",
          "#26A69A",
          "#8D6E63",
          "#D4E157",
        ],
      },
    ],
  };
});

function selecionarSolicitante(solicitante) {
  solicitanteSelecionado.value = solicitante;
}
</script>

<template>
  <div class="container mt-5">
    <h3 class="mb-4 text-center">Documentos Solicitados</h3>

    <div v-if="mensagemErro" class="alert alert-danger text-center">
      {{ mensagemErro }}
    </div>

    <div v-if="solicitacoes.length > 0">
      <div class="text-center mb-3">
        <strong>Total de solicitações:</strong> {{ solicitacoes.length }}
      </div>
      <div class="mb-4 d-flex justify-content-center">
        <div style="width: 400px">
          <Pie
            :data="chartData"
            :options="{
              responsive: true,
              plugins: { legend: { position: 'bottom' } },
            }"
          />
        </div>
      </div>
    </div>

    <!-- Campo de busca -->
    <div class="mb-3">
      <input
        v-model="termoBusca"
        type="text"
        class="form-control"
        placeholder="Buscar por nome ou tipo de documento..."
      />
    </div>

    <!-- Tabela -->
    <div v-if="paginadas.length > 0" class="table-responsive">
      <table class="table table-hover shadow-sm">
        <thead class="table-light">
          <tr>
            <th>Nome</th>
            <th>Tipo de Documento</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginadas" :key="item._id || item.id">
            <td>{{ item.nome_completo }}</td>
            <td>{{ item.tipo_documento }}</td>
            <td>
              <button
                class="btn btn-sm btn-outline-primary"
                @click="selecionarSolicitante(item)"
              >
                Ver Detalhes
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginação -->
      <nav class="d-flex justify-content-center">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: paginaAtual === 1 }">
            <button class="page-link" @click="irParaPagina(paginaAtual - 1)">
              Anterior
            </button>
          </li>
          <li
            v-for="pagina in totalPaginas"
            :key="pagina"
            class="page-item"
            :class="{ active: paginaAtual === pagina }"
          >
            <button class="page-link" @click="irParaPagina(pagina)">
              {{ pagina }}
            </button>
          </li>
          <li
            class="page-item"
            :class="{ disabled: paginaAtual === totalPaginas }"
          >
            <button class="page-link" @click="irParaPagina(paginaAtual + 1)">
              Próxima
            </button>
          </li>
        </ul>
      </nav>
    </div>
    <div v-else class="text-center text-muted">
      Nenhuma solicitação encontrada.
    </div>

    <!-- Detalhes do solicitante -->
    <div v-if="solicitanteSelecionado" class="mt-5">
      <div class="text-center mb-4">
        <h5 class="text-primary fw-bold mb-2">Detalhes da Solicitação</h5>
        <p class="text-muted">
          Informações completas do solicitante selecionado.
        </p>
      </div>

      <div class="card shadow border-0">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Nome Completo:</label>
              <div class="form-control bg-light">
                {{ solicitanteSelecionado.nome_completo }}
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Tipo de Documento:</label>
              <div class="form-control bg-light">
                {{ solicitanteSelecionado.tipo_documento }}
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Contacto:</label>
              <div class="form-control bg-light">
                {{ solicitanteSelecionado.contacto }}
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Afiliação:</label>
              <div class="form-control bg-light">
                {{ solicitanteSelecionado.afiliacao || "-" }}
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Local de Emissão:</label>
              <div class="form-control bg-light">
                {{ solicitanteSelecionado.local_emissao || "-" }}
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Data de Nascimento:</label>
              <div class="form-control bg-light">
                {{ solicitanteSelecionado.data_nascimento || "-" }}
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Número do BI:</label>
              <div class="form-control bg-light">
                {{ solicitanteSelecionado.numero_bi || "-" }}
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold"
                >Motivo da Solicitação:</label
              >
              <div class="form-control bg-light">
                {{ solicitanteSelecionado.motivo || "-" }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
canvas {
  max-width: 100%;
}
</style>
