<template>
    <br/><br/>
  <div>
    <NavbarDefault :sticky="true" />
    <div class="container py-5" style="min-height: 80vh; overflow-y: auto;">

      <!-- Título Geral -->
      <div class="titulo-pacotes-box mb-5 mx-auto" style="max-width: 480px;">
        <h2 class="titulo-pacotes text-center m-0">
          Meus Documentos
        </h2>
      </div>

      <div class="row justify-content-center">

        <!-- Documentos Solicitados -->
        <div class="col-lg-4 col-md-6 mb-4 p-3 shadow-sm rounded border borda-destacada">
          <h4 class="text-center mb-3">Solicitados</h4>
          <div v-if="loadingSolicitados" class="text-center my-3">Carregando...</div>
          <div v-else-if="documentosSolicitados.length === 0" class="text-center text-muted my-3">
            Nenhum documento solicitado.
          </div>
          <ul v-else class="list-group">
            <li v-for="doc in documentosSolicitados" :key="doc._id" class="list-group-item">
              <div><strong>Nome:</strong> {{ doc.nome_completo }}</div>
              <div><strong>Tipo:</strong> {{ doc.tipo_documento }}</div>
              <div><strong>Número:</strong> {{ doc.numero_documento }}</div>
              <div><strong>Status:</strong> <span :class="statusClass(doc.status)">{{ doc.status }}</span></div>
            </li>
          </ul>
        </div>

        <!-- Documentos Guardados -->
        <div class="col-lg-4 col-md-6 mb-4 p-3 shadow-sm rounded border borda-destacada">
          <h4 class="text-center mb-3">Guardados</h4>
          <div v-if="loadingGuardados" class="text-center my-3">Carregando...</div>
          <div v-else-if="documentosGuardados.length === 0" class="text-center text-muted my-3">
            Nenhum documento guardado.
          </div>
          <ul v-else class="list-group">
            <li v-for="doc in documentosGuardados" :key="doc._id" class="list-group-item">
              <div><strong>Nome:</strong> {{ doc.nome }}</div>
              <div><strong>Tipo:</strong> {{ doc.tipoDocumento }}</div>
              <div><strong>Número:</strong> {{ doc.numeroDocumento }}</div>
              <div><strong>Data:</strong> {{ formatarData(doc.createdAt) }}</div>
              <div v-for="info in detalhesAdicionais(doc)" :key="info">{{ info }}</div>
            </li>
          </ul>
        </div>

        <!-- Documentos Cadastrados -->
        <div class="col-lg-4 col-md-12 mb-4 p-3 shadow-sm rounded border borda-destacada">
          <h4 class="text-center mb-3">Cadastrados</h4>
          <div v-if="loadingCadastrados" class="text-center my-3">Carregando...</div>
          <div v-else-if="documentosCadastrados.length === 0" class="text-center text-muted my-3">
            Nenhum documento cadastrado.
          </div>
          <ul v-else class="list-group">
            <li v-for="doc in documentosCadastrados" :key="doc._id" class="list-group-item">
              <div><strong>Nome:</strong> {{ doc.nome_completo }}</div>
              <div><strong>Tipo:</strong> {{ doc.tipo_documento }}</div>
              <div><strong>Número:</strong> {{ doc.numero_documento }}</div>
              <div><strong>Província:</strong> {{ doc.provincia }}</div>
              <div><strong>Data de Perda:</strong> {{ formatarData(doc.data_perda) }}</div>
              <div><strong>Origem:</strong> {{ doc.origem }}</div>
            </li>
          </ul>
        </div>

      </div>
    </div>
    <FooterDefault />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';
import NavbarDefault from "../examples/navbars/NavbarDefault.vue";
import FooterDefault from "../examples/footers/FooterDefault.vue";

const documentosSolicitados = ref([]);
const documentosGuardados = ref([]);
const documentosCadastrados = ref([]);

const loadingSolicitados = ref(true);
const loadingGuardados = ref(true);
const loadingCadastrados = ref(true);

function statusClass(status) {
  if (status === 'Pendente') return 'text-warning';
  if (status === 'Entregue' || status === 'Recuperado') return 'text-success';
  return 'text-secondary';
}

function formatarData(dataISO) {
  if (!dataISO) return '-';
  const data = new Date(dataISO);
  return data.toLocaleDateString('pt-MZ');
}

function detalhesAdicionais(doc) {
  const extras = [];
  if (doc.tipoDocumento === 'Carta de Condução' && doc.categoria) extras.push(`Categoria: ${doc.categoria}`);
  if (doc.tipoDocumento === 'Seguro do Veículo') {
    if (doc.matricula) extras.push(`Matrícula: ${doc.matricula}`);
    if (doc.seguradora) extras.push(`Seguradora: ${doc.seguradora}`);
  }
  if (doc.tipoDocumento === 'NUIB') {
    if (doc.entidadeEmissora) extras.push(`Banco: ${doc.entidadeEmissora}`);
    if (doc.numeroConta) extras.push(`Conta: ${doc.numeroConta}`);
    if (doc.numeroCartao) extras.push(`Cartão: ${doc.numeroCartao}`);
  }
  if (doc.tipoDocumento === 'Cartão de Identidade Militar' && doc.patente) {
    extras.push(`Patente: ${doc.patente}`);
  }
  return extras;
}

async function fetchDocumentos() {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Solicitados
  try {
    loadingSolicitados.value = true;
    const res = await api.get('/minhas-solicitacoes', { headers });
    documentosSolicitados.value = res.data || [];
  } catch (e) {
    console.error('Erro ao buscar solicitados:', e);
  } finally {
    loadingSolicitados.value = false;
  }

  // Guardados
  try {
    loadingGuardados.value = true;
    const res = await api.get('/documentosguardados/meus-documentos', { headers });
    documentosGuardados.value = res.data || [];
  } catch (e) {
    console.error('Erro ao buscar guardados:', e);
  } finally {
    loadingGuardados.value = false;
  }

  // Cadastrados (rota corrigida conforme opção 2)
  try {
    loadingCadastrados.value = true;
    const res = await api.get('/documentos/documentos/meus', { headers });
    documentosCadastrados.value = res.data || [];
  } catch (e) {
    console.error('Erro ao buscar cadastrados:', e);
  } finally {
    loadingCadastrados.value = false;
  }
}

onMounted(fetchDocumentos);
</script>

<style scoped>
.titulo-pacotes-box {
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 2px 12px rgba(60,60,60,0.07);
  padding: 1.1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #66bb6a;
}
.titulo-pacotes {
  font-family: 'Montserrat', Arial, Helvetica, sans-serif;
  font-size: 1.7rem;
  font-weight: 800;
  color: #198754;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 8px rgba(102,187,106,0.07);
  margin: 0;
}
.borda-destacada {
  border: 1px solid #66bb6a;
  border-radius: 5px;
  background-color: #fff;
}
.text-success {
  color: #198754;
  font-weight: 600;
}
.text-warning {
  color: #ffc107;
  font-weight: 600;
}
.text-secondary {
  color: #6c757d;
  font-weight: 600;
}
</style>
