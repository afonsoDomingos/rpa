<template>
  <div>
    <div class="container-fluid position-sticky z-index-sticky top-0 px-0">
      <div class="row gx-0">
        <div class="col-12">
          <NavbarDefault :sticky="true" />
        </div>
      </div>
    </div>

    <br /><br /><br />
    <div class="container py-5" style="min-height: 80vh; overflow-y: auto">
      <!-- Cabeçalho -->
      <div class="titulo-pacotes-box mb-5 mx-auto">
        <h2 class="titulo-pacotes text-center m-0">
          <i class="bi bi-folder2-open me-2"></i>
          Meus Documentos
        </h2>
      </div>

      <!-- Grid -->
      <div class="row g-4 justify-content-center">
        <!-- Solicitados -->
        <div class="col-lg-4 col-md-6">
          <div class="card h-100 p-3 shadow-sm borda-destacada">
            <h5 class="text-center text-primary fw-bold mb-3">
              📥 Solicitados
            </h5>
            <div v-if="loadingSolicitados" class="text-center my-3 text-muted">
              Carregando...
            </div>
            <div
              v-else-if="documentosSolicitados.length === 0"
              class="text-center text-muted my-3"
            >
              Nenhum documento solicitado.
            </div>
            <ul v-else class="list-group list-group-flush">
              <li
                v-for="doc in documentosSolicitados"
                :key="doc._id"
                class="list-group-item"
              >
                <div><strong>Nome:</strong> {{ doc.nome_completo }}</div>
                <div><strong>Tipo:</strong> {{ doc.tipo_documento }}</div>
                <div><strong>Número:</strong> {{ doc.numero_documento }}</div>
                <div>
                  <strong>Status:</strong>
                  <span :class="statusClass(doc.status)">{{ doc.status }}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Guardados -->
        <div class="col-lg-4 col-md-6">
          <div class="card h-100 p-3 shadow-sm borda-destacada">
            <h5 class="text-center text-success fw-bold mb-3">📁 Guardados</h5>
            <div v-if="loadingGuardados" class="text-center my-3 text-muted">
              Carregando...
            </div>
            <div
              v-else-if="documentosGuardados.length === 0"
              class="text-center text-muted my-3"
            >
              Nenhum documento guardado.
            </div>
            <ul v-else class="list-group list-group-flush">
              <li
                v-for="doc in documentosGuardados"
                :key="doc._id"
                class="list-group-item"
              >
                <div><strong>Nome:</strong> {{ doc.nome }}</div>
                <div><strong>Tipo:</strong> {{ doc.tipoDocumento }}</div>
                <div><strong>Número:</strong> {{ doc.numeroDocumento }}</div>
                <div>
                  <strong>Data:</strong> {{ formatarData(doc.createdAt) }}
                </div>
                <div v-for="info in detalhesAdicionais(doc)" :key="info">
                  {{ info }}
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Cadastrados -->
        <div class="col-lg-4 col-md-12">
          <div class="card h-100 p-3 shadow-sm borda-destacada">
            <h5 class="text-center text-dark fw-bold mb-3">📝 Cadastrados</h5>
            <div v-if="loadingCadastrados" class="text-center my-3 text-muted">
              Carregando...
            </div>
            <div
              v-else-if="documentosCadastrados.length === 0"
              class="text-center text-muted my-3"
            >
              Nenhum documento cadastrado.
            </div>
            <ul v-else class="list-group list-group-flush">
              <li
                v-for="doc in documentosCadastrados"
                :key="doc._id"
                class="list-group-item"
              >
                <div><strong>Nome:</strong> {{ doc.nome_completo }}</div>
                <div><strong>Tipo:</strong> {{ doc.tipo_documento }}</div>
                <div><strong>Número:</strong> {{ doc.numero_documento }}</div>
                <div><strong>Província:</strong> {{ doc.provincia }}</div>
                <div>
                  <strong>Data de Perda:</strong>
                  {{ formatarData(doc.data_perda) }}
                </div>
                <div><strong>Origem:</strong> {{ doc.origem }}</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <FooterDefault />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../api";
import NavbarDefault from "../examples/navbars/NavbarDefault.vue";
import FooterDefault from "../examples/footers/FooterDefault.vue";

const router = useRouter();

const documentosSolicitados = ref([]);
const documentosGuardados = ref([]);
const documentosCadastrados = ref([]);

const loadingSolicitados = ref(true);
const loadingGuardados = ref(true);
const loadingCadastrados = ref(true);

function statusClass(status) {
  if (status === "Pendente") return "text-warning fw-bold";
  if (status === "Entregue" || status === "Recuperado")
    return "text-success fw-bold";
  return "text-secondary fw-bold";
}

function formatarData(dataISO) {
  if (!dataISO) return "-";
  const data = new Date(dataISO);
  return data.toLocaleDateString("pt-MZ");
}

function detalhesAdicionais(doc) {
  const extras = [];
  if (doc.tipoDocumento === "Carta de Condução" && doc.categoria)
    extras.push(`Categoria: ${doc.categoria}`);
  if (doc.tipoDocumento === "Seguro do Veículo") {
    if (doc.matricula) extras.push(`Matrícula: ${doc.matricula}`);
    if (doc.seguradora) extras.push(`Seguradora: ${doc.seguradora}`);
  }
  if (doc.tipoDocumento === "NUIB") {
    if (doc.entidadeEmissora) extras.push(`Banco: ${doc.entidadeEmissora}`);
    if (doc.numeroConta) extras.push(`Conta: ${doc.numeroConta}`);
    if (doc.numeroCartao) extras.push(`Cartão: ${doc.numeroCartao}`);
  }
  if (doc.tipoDocumento === "Cartão de Identidade Militar" && doc.patente) {
    extras.push(`Patente: ${doc.patente}`);
  }
  return extras;
}

// função genérica para carregar dados autenticados
async function carregar(endpoint, target, loading) {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };

  try {
    loading.value = true;
    const res = await api.get(endpoint, { headers });
    target.value = res.data || [];
  } catch (e) {
    console.error(`Erro ao buscar ${endpoint}:`, e);
  } finally {
    loading.value = false;
  }
}

async function fetchDocumentos() {
  await Promise.all([
    carregar("/minhas-solicitacoes", documentosSolicitados, loadingSolicitados),
    carregar(
      "/documentosguardados/meus-documentos",
      documentosGuardados,
      loadingGuardados
    ),
    carregar(
      "/documentos/meus-documentos",
      documentosCadastrados,
      loadingCadastrados
    ),
  ]);
}

onMounted(fetchDocumentos);
</script>

<style scoped>
.titulo-pacotes-box {
  background: #f8f9fa;
  border-radius: 1.5rem;
  box-shadow: 0 2px 12px rgba(60, 60, 60, 0.07);
  padding: 1.3rem 1.7rem;
  border: 2px solid #198754;
  max-width: 520px;
}
.titulo-pacotes {
  font-family: "Montserrat", sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: #198754;
  letter-spacing: 0.5px;
}
.borda-destacada {
  border: 1px solid #198754;
  border-radius: 1rem;
  background-color: #ffffff;
}
.text-success {
  color: #198754;
}
.text-warning {
  color: #ffc107;
}
.text-secondary {
  color: #6c757d;
}
</style>
