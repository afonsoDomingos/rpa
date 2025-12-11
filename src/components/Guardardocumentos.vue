<template>
  <div class="container-fluid position-sticky z-index-sticky top-0 px-0">
    <div class="row gx-0">
      <div class="col-12">
        <NavbarDefault :sticky="true" />
      </div>
    </div>
  </div>
  <br /><br /><br />
  <div class="container py-4">
    <div class="card shadow rounded-4 p-4">
      <h4 class="mb-4 text-center">
        <i class="bi bi-folder-plus text-primary me-2"></i>
        Guardar Meus Documentos
      </h4>

      <!-- Tipo do Documento -->
      <div class="mb-3">
        <label class="form-label">Tipo de Documento</label>
        <select
          v-model="form.tipoDocumento"
          class="form-select borda-destacada"
        >
          <option disabled value="">Selecione</option>
          <option v-for="tipo in tiposDocumento" :key="tipo" :value="tipo">
            {{ tipo }}
          </option>
        </select>
      </div>

      <!-- Campos dinâmicos por tipo de documento -->
      <div v-if="form.tipoDocumento" class="row g-3">
        <template
          v-for="campo in camposPorTipo[form.tipoDocumento]"
          :key="campo.key"
        >
          <div class="col-md-6">
            <label class="form-label">{{ campo.label }}</label>
            <input
              :type="campo.type || 'text'"
              v-model="form[campo.key]"
              class="form-control borda-destacada"
              :placeholder="campo.placeholder || ''"
            />
          </div>
        </template>
      </div>

      <!-- Botão -->
      <div class="text-center mt-4">
        <button class="btn btn-success px-4" @click="salvarDocumento">
          <i class="bi bi-check-circle me-2"></i>
          Guardar Documento
        </button>
      </div>

      <div v-if="mensagem" :class="`alert mt-4 ${mensagemTipo}`">
        {{ mensagem }}
      </div>
    </div>

    <!-- Lista de documentos guardados do próprio usuário -->
    <div class="container mt-5" v-if="documentos.length > 0">
      <h4 class="mb-4 text-primary fw-bold">📁 Meus Documentos Guardados</h4>

      <div
        v-for="(doc, index) in documentos"
        :key="doc._id || index"
        class="card shadow-sm mb-4"
      >
        <div class="card-body">
          <div class="row">
            <div class="col-md-6" v-if="doc.tipoDocumento">
              <strong>Tipo:</strong> {{ doc.tipoDocumento }}
            </div>
            <div class="col-md-6" v-if="doc.nome">
              <strong>Nome:</strong> {{ doc.nome }}
            </div>
            <div class="col-md-6" v-if="doc.numeroDocumento">
              <strong>Número:</strong> {{ doc.numeroDocumento }}
            </div>
            <div class="col-md-6" v-if="doc.dataEmissao">
              <strong>Data de Emissão:</strong>
              {{ formatarData(doc.dataEmissao) }}
            </div>
            <div class="col-md-6" v-if="doc.validade">
              <strong>Validade:</strong> {{ formatarData(doc.validade) }}
            </div>
            <div class="col-md-6" v-if="doc.categoria">
              <strong>Categoria:</strong> {{ doc.categoria }}
            </div>
            <div class="col-md-6" v-if="doc.matricula">
              <strong>Matrícula:</strong> {{ doc.matricula }}
            </div>
            <div class="col-md-6" v-if="doc.seguradora">
              <strong>Seguradora:</strong> {{ doc.seguradora }}
            </div>
            <div class="col-md-6" v-if="doc.numeroConta">
              <strong>Nº Conta:</strong> {{ doc.numeroConta }}
            </div>
            <div class="col-md-6" v-if="doc.numeroCartao">
              <strong>Nº Cartão:</strong> {{ doc.numeroCartao }}
            </div>
            <div class="col-md-6" v-if="doc.zonaEleitoral">
              <strong>Zona Eleitoral:</strong> {{ doc.zonaEleitoral }}
            </div>
            <div class="col-md-6" v-if="doc.numeroSegurancaSocial">
              <strong>Nº Segurança Social:</strong>
              {{ doc.numeroSegurancaSocial }}
            </div>
            <div class="col-md-6" v-if="doc.patente">
              <strong>Patente:</strong> {{ doc.patente }}
            </div>
            <div class="col-md-6" v-if="doc.modelo">
              <strong>Modelo:</strong> {{ doc.modelo }}
            </div>
            <div class="col-md-6" v-if="doc.cartaoVirtualTipo">
              <strong>Tipo Cartão Virtual:</strong> {{ doc.cartaoVirtualTipo }}
            </div>
            <div class="col-md-6" v-if="doc.codigoVirtual">
              <strong>Código Virtual:</strong> {{ doc.codigoVirtual }}
            </div>
          </div>

          <div class="mt-3 d-flex gap-2">
            <button
              class="btn btn-outline-danger btn-sm"
              @click="removerDocumento(doc._id)"
            >
              🗑 Remover
            </button>
            <button
              class="btn btn-outline-primary btn-sm"
              @click="editarDocumento(doc)"
            >
              ✏️ Editar
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center mt-5">
      <p class="text-muted fs-5">📂 Nenhum documento guardado.</p>
    </div>

    <FooterDefault />
  </div>
</template>

<script setup>
import NavbarDefault from "../examples/navbars/NavbarDefault.vue";
import FooterDefault from "../examples/footers/FooterDefault.vue";
import { ref, onMounted } from "vue";
import api from "../api";
import { useRouter } from "vue-router";

const router = useRouter();
const documentos = ref([]);
const mensagem = ref("");
const mensagemTipo = ref("");

const form = ref({
  _id: null,
  tipoDocumento: "",
  nome: "",
  numeroDocumento: "",
  dataEmissao: "",
  validade: "",
  categoria: "",
  matricula: "",
  seguradora: "",
  numeroConta: "",
  numeroCartao: "",
  zonaEleitoral: "",
  numeroSegurancaSocial: "",
  patente: "",
  modelo: "",
  cartaoVirtualTipo: "",
  codigoVirtual: "",
});

const modalAberto = ref(false);

const tiposDocumento = [
  "Bilhete de Identidade",
  "Carta de Condução",
  "Seguro do Veículo",
  "Livrete",
  "NUIT",
  "NUIB",
  "Passaporte",
  "Certidão de Nascimento",
  "Cartão de Eleitor",
  "Cartão da Segurança Social",
  "Cartão de Identidade Militar",
  "Cartões Virtuais",
];

// Campos por tipo de documento
const camposPorTipo = {
  "Bilhete de Identidade": [
    { key: "nome", label: "Nome completo" },
    { key: "numeroDocumento", label: "Número do BI" },
    { key: "dataEmissao", label: "Data de Emissão", type: "date" },
    { key: "validade", label: "Validade", type: "date" },
  ],
  "Carta de Condução": [
    { key: "nome", label: "Nome completo" },
    { key: "numeroDocumento", label: "Número da Carta" },
    { key: "categoria", label: "Categoria" },
    { key: "dataEmissao", label: "Data de Emissão", type: "date" },
    { key: "validade", label: "Validade", type: "date" },
  ],
  // Adicione os outros tipos de documento da mesma forma...
};

const fetchDocumentos = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    const res = await api.get("/documentosguardados/meus-documentos", {
      headers: { Authorization: `Bearer ${token}` },
    });
    documentos.value = res.data;
  } catch (err) {
    mostrarMensagem("Erro ao carregar documentos.", "alert-danger");
  }
};

const salvarDocumento = async () => {
  if (!form.value.tipoDocumento)
    return mostrarMensagem("Selecione o tipo de documento.", "alert-danger");
  try {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    if (form.value._id) {
      const { _id, ...dadosAtualizados } = form.value;
      await api.put(`/documentosguardados/${_id}`, dadosAtualizados, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const index = documentos.value.findIndex((doc) => doc._id === _id);
      if (index !== -1) documentos.value[index] = { ...form.value };
      mostrarMensagem("Documento atualizado com sucesso.", "alert-success");
    } else {
      const res = await api.post("/documentosguardados", form.value, {
        headers: { Authorization: `Bearer ${token}` },
      });
      documentos.value.push(res.data);
      mostrarMensagem("Documento guardado com sucesso.", "alert-success");
    }
    limparFormulario();
  } catch {
    mostrarMensagem("Erro ao guardar documento.", "alert-danger");
  }
};

const removerDocumento = async (id) => {
  try {
    const token = localStorage.getItem("token");
    await api.delete(`/documentosguardados/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    documentos.value = documentos.value.filter((doc) => doc._id !== id);
    mostrarMensagem("Documento removido com sucesso.", "alert-success");
  } catch {
    mostrarMensagem("Erro ao remover documento.", "alert-danger");
  }
};

const editarDocumento = (doc) => {
  form.value = { ...doc };
  modalAberto.value = true;
};

const fecharModal = () => {
  modalAberto.value = false;
};
const salvarEdicao = () => {
  salvarDocumento();
  fecharModal();
};
const limparFormulario = () => {
  Object.keys(form.value).forEach((k) => (form.value[k] = ""));
  form.value._id = null;
};
const mostrarMensagem = (msg, tipo) => {
  mensagem.value = msg;
  mensagemTipo.value = tipo;
  setTimeout(() => {
    mensagem.value = "";
    mensagemTipo.value = "";
  }, 3000);
};
const formatarData = (data) =>
  data ? new Date(data).toLocaleDateString() : "";

onMounted(fetchDocumentos);
</script>

<style scoped>
.container {
  max-width: 800px;
}

.card {
  animation: fadeIn 0.4s ease-in-out;
  border: 1px solid #ddd;
  border-radius: 16px;
}

h4 {
  font-weight: bold;
  color: #343a40;
}

.borda-destacada {
  border: 1px solid #66bb6a;
  border-radius: 8px;
  padding: 10px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background-color: #fefefe;
}

.borda-destacada:focus {
  border-color: #6f42c1;
  box-shadow: 0 0 0 0.2rem rgba(111, 66, 193, 0.25);
}

.alert {
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
}

.btn {
  font-weight: 500;
}

.btn-outline-danger,
.btn-outline-primary {
  border-radius: 10px;
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  min-width: 320px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

.modal-content form input {
  width: 100%;
  margin-top: 0.2rem;
  margin-bottom: 1rem;
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

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
