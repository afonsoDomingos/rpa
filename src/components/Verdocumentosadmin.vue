import api from "../api";
import { ref, onMounted, onUnmounted, watch } from "vue";
import MaterialSwitch from "@/components/MaterialSwitch.vue";
import eventBus from "@/eventBus";
import MaterialButton from "@/components/MaterialButton.vue";
import setNavPills from "@/assets/js/nav-pills.js";
import Swal from "sweetalert2";

const activeTab = ref("procurar");

const changeTab = (tabName) => {
  activeTab.value = tabName;
};

onMounted(() => {
  eventBus.on("changeTab", changeTab);
  setNavPills();
});
onUnmounted(() => eventBus.off("changeTab", changeTab));

// Campos para a aba "Cadastrar"
const nome_completo = ref("");
const tipo_documento = ref("");
const numero_documento = ref("");
const data_perda = ref("");
const provincia = ref("");
const origem = ref("");
const contacto = ref("");

// Campos para a aba "Reportar"
const protocolo = ref("");

// Campos para a aba "Procurar"
const nome_completoRec = ref("");
const tipo_documentoRec = ref("");
const provinciaRec = ref("");
const numero_documentoRec = ref("");

// Lista de documentos
const documentosDisponiveis = ref([]);
const documentosReportados = ref([]);
const documentosProprietarios = ref([]);
const documentosEncontrados = ref([]);

// Mensagens reativas para feedback
const mensagemErro = ref("");
const mensagemSucesso = ref("");
const erroMensagem = ref("");
const nomeError = ref("");
const contactoError = ref("");

// Função de validação do nome completo
const validarNome = () => {
  const nomeRegex = /^[A-Za-zÀ-ÿ\s]+$/;
  if (!nome_completo.value) {
    nomeError.value = "O nome  é obrigatório.";
    return false;
  } else if (!nomeRegex.test(nome_completo.value)) {
    nomeError.value = "O nome completo deve conter apenas letras.";
    return false;
  }
  nomeError.value = "";
  return true;
};

// Função de validação do contacto
const validarContacto = () => {
  const contactoRegex = /^(84|85|86|87|83)\d{7}$/;
  if (!contacto.value) {
    contactoError.value = "O contacto é obrigatório.";
    return false;
  } else if (!contactoRegex.test(contacto.value)) {
    contactoError.value = "O contacto deve conter 9 dígitos e começar com 84, 85, 86, 87 ou 83.";
    return false;
  }
  contactoError.value = "";
  return true;
};

// Função para buscar todos os documentos disponíveis
const buscarDocumentos = async () => {
  try {
    const response = await api.get("/documentos");
    documentosDisponiveis.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar documentos:", error);
  }

  if (!validarNome() || !validarContacto()) {
    return;
  }
};

const buscarDocumentosReportados = async () => {
  try {
    const response = await api.get("/documentos/reportados");
    documentosReportados.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar documentos reportados:", error);
  }
};

const buscarDocumentosProprietarios = async () => {
  try {
    const response = await api.get("/documentos/proprietarios");
    documentosProprietarios.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar documentos proprietários:", error);
  }
};

onMounted(() => {
  buscarDocumentos();
  buscarDocumentosReportados();
  buscarDocumentosProprietarios();
});

const cadastrarDocumento = async () => {
  mensagemErro.value = "";
  mensagemSucesso.value = "";

  try {
    const novoDocumento = {
      nome_completo: nome_completo.value,
      tipo_documento: tipo_documento.value,
      numero_documento: numero_documento.value,
      provincia: provincia.value,
      data_perda: data_perda.value,
      origem: origem.value,
      contacto: contacto.value,
    };

    const response = await api.post("/documentos", novoDocumento);
    console.log("Documento cadastrado com sucesso:", response.data);

    mensagemSucesso.value = `Documento cadastrado com sucesso: Nome: ${response.data.nome_completo}, Tipo: ${response.data.tipo_documento}, Número: ${response.data.numero_documento}, Província: ${response.data.provincia}, Data: ${response.data.data_perda}`;

    nome_completo.value = "";
    tipo_documento.value = "";
    numero_documento.value = "";
    provincia.value = "";
    data_perda.value = "";
    origem.value = "";
    contacto.value = "";

    buscarDocumentos();
  } catch (error) {
    console.error("Erro ao cadastrar documento:", error);
    mensagemErro.value = error.response?.data?.message || "Erro ao cadastrar. Verifique os dados e tente novamente.";
  }
};

const tipoFiltro = ref("nome");

watch(tipoFiltro, (novoValor) => {
  console.log("Filtro alterado para:", novoValor);
  nome_completoRec.value = "";
  tipo_documentoRec.value = "";
  provinciaRec.value = "";
  numero_documentoRec.value = "";
});

const procurarDocumento = async () => {
  erroMensagem.value = "";
  let params = {};

  if (tipoFiltro.value === "nome" && nome_completoRec.value.trim()) {
    params.nome_completo = nome_completoRec.value.trim();
  } else if (tipoFiltro.value === "tipo" && tipo_documentoRec.value) {
    params.tipo_documento = tipo_documentoRec.value;
  } else if (tipoFiltro.value === "provincia" && provinciaRec.value) {
    params.provincia = provinciaRec.value;
  } else if (tipoFiltro.value === "numero" && numero_documentoRec.value.trim()) {
    params.numero_documento = numero_documentoRec.value.trim();
  } else {
    erroMensagem.value = "Por favor, preencha o campo correspondente ao filtro selecionado.";
    return;
  }

  try {
    const response = await api.get("/documentos", { params });
    documentosEncontrados.value = response.data;

    if (documentosEncontrados.value.length === 0) {
      erroMensagem.value = "Nenhum documento encontrado.";
    }
  } catch (error) {
    erroMensagem.value = error.response?.data?.message || "Erro ao buscar documentos. Tente novamente.";
    console.error("Erro ao procurar documentos:", error);
  }
};

watch(activeTab, (novaAba) => {
  if (novaAba !== "procurar") {
    nome_completoRec.value = "";
    tipo_documentoRec.value = "";
    provinciaRec.value = "";
    numero_documentoRec.value = "";
  }
});

const provincias = [
  "Maputo",
  "Maputo Cidade",
  "Gaza",
  "Inhambane",
  "Sofala",
  "Manica",
  "Tete",
  "Zambézia",
  "Nampula",
  "Niassa",
  "Cabo Delgado",
];

const tipo_documentos = [
  "Bilhete de Identidade",
  "Passaporte",
  "Cartão de Eleitor",
  "Cartão de Estudante",
  "Carta de Condução",
  "Seguro do Veículo",
  "Livrete",
  "Cartão de Identidade Militar",
];

const reportarStatus = () => {
  console.log("Protocolo de Recuperação:", protocolo.value, "Nome:", nome_completo.value);
};

const isEditModalOpen = ref(false);
const documentoEditado = ref({});

const editarDocumento = (documento) => {
  documentoEditado.value = { ...documento };
  isEditModalOpen.value = true;
};

const fecharModal = () => {
  isEditModalOpen.value = false;
  documentoEditado.value = {};
};

const salvarEdicao = async () => {
  try {
    await api.put(`/documentos/${documentoEditado.value._id}`, documentoEditado.value);

    const index = documentosReportados.value.findIndex((doc) => doc._id === documentoEditado.value._id);
    if (index !== -1) {
      documentosReportados.value[index] = { ...documentoEditado.value };
    }

    fecharModal();
  } catch (error) {
    console.error("Erro ao salvar edição do documento:", error);
  }
};

const eliminarDocumento = async (documento) => {
  const result = await Swal.fire({
    title: 'Tem certeza?',
    text: `Tem certeza que deseja eliminar o documento ${documento.numero_documento}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#800080',
    confirmButtonText: 'Sim, eliminar!',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      await api.delete(`/documentos/${documento._id}`);

      documentosReportados.value = documentosReportados.value.filter((doc) => doc._id !== documento._id);
      console.log("Documento eliminado:", documento);
    } catch (error) {
      console.error("Erro ao eliminar documento:", error);
    }
  }
};

buscarDocumentos();

const atualizarStatus = async (documento) => {
  if (!documento.status || !["Pendente", "Entregue"].includes(documento.status)) {
    Swal.fire({ icon: 'warning', title: 'Status inválido', text: 'Use "Pendente" ou "Entregue".' });
    return;
  }

  try {
    await api.patch(`/documentos/${documento._id}/status`, {
      status: documento.status,
      isAdmin: true,
    });

    const index = documentosReportados.value.findIndex((doc) => doc._id === documento._id);
    if (index !== -1) {
      documentosReportados.value[index].status = documento.status;
    }

    Swal.fire({
      title: 'Atualizado!',
      text: 'Status atualizado com sucesso!',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    Swal.fire({ icon: 'error', title: 'Erro', text: "Erro ao atualizar status." });
  }
};
</script>

<template>
  <section class="verdocumentos-wrapper py-7">
    <div class="verdocumentos-container">
      <!-- Conteúdo de Navegação -->
      <ul class="nav nav-pills nav-fill custom-nav-admin p-2" role="tablist">
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: activeTab === 'procurar' }"
            @click.prevent="activeTab = 'procurar'"
            role="tab"
          >
            <i class="bi bi-search me-2"></i> Procurar Admin
          </a>
        </li>

        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: activeTab === 'cadastrar' }"
            @click.prevent="activeTab = 'cadastrar'"
            role="tab"
          >
            <i class="bi bi-flag me-2"></i> Reportar Admin
          </a>
        </li>

        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: activeTab === 'documentosReportados' }"
            @click.prevent="activeTab = 'documentosReportados'"
            role="tab"
          >
            <i class="bi bi-file-earmark-text me-2"></i> Reportados Admin
          </a>
        </li>

        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: activeTab === 'documentosProprietarios' }"
            @click.prevent="activeTab = 'documentosProprietarios'"
            role="tab"
          >
            <i class="bi bi-person-badge me-2"></i> Proprietários Admin
          </a>
        </li>
      </ul>

      <!-- Conteúdo das abas -->
      <div class="tab-content">
        <!-- Aba Procurar -->
        <div v-if="activeTab === 'procurar'" class="tab-pane fade show active">
          <form @submit.prevent="procurarDocumento" class="form">
            <div class="row">
              <div class="col-md-12 mb-3">
                <label for="tipoFiltro" class="form-label fw-bold">Escolha o tipo de filtro</label>
                <select id="tipoFiltro" class="form-control borda-destacada form-select zoom-field" v-model="tipoFiltro">
                  <option value="nome">Nome Completo</option>
                  <option value="tipo">Tipo de Documento</option>
                  <option value="provincia">Província</option>
                  <option value="numero">Número de Documento</option>
                </select>
              </div>

              <div v-if="tipoFiltro === 'nome'" class="col-md-12 mb-3">
                <label for="nomeRec" class="form-label fw-bold">Nome Completo</label>
                <input type="text" id="nomeRec" class="form-control borda-destacadanome" v-model="nome_completoRec" placeholder="Ex: João Silva" required />
              </div>

              <div v-if="tipoFiltro === 'tipo'" class="col-md-12 mb-3">
                <label for="tipoDocumento" class="form-label fw-bold">Tipo de Documento</label>
                <select id="tipoDocumento" class="form-control borda-destacada form-select zoom-field" v-model="tipo_documentoRec" required>
                  <option disabled value="">Selecione o Tipo de Documento</option>
                  <option v-for="tipo in tipo_documentos" :key="tipo" :value="tipo">{{ tipo }}</option>
                </select>
              </div>

              <div v-if="tipoFiltro === 'provincia'" class="col-md-12 mb-3">
                <label for="provinciaRec" class="form-label fw-bold">Província</label>
                <select id="provinciaRec" class="form-control destacada form-select zoom-field" v-model="provinciaRec" required>
                  <option disabled value="">Selecione a Província</option>
                  <option v-for="provincia in provincias" :key="provincia" :value="provincia">{{ provincia }}</option>
                </select>
              </div>

              <div v-if="tipoFiltro === 'numero'" class="col-md-12 mb-3">
                <label for="numero_documentoRec" class="form-label fw-bold">Número de Documento</label>
                <input type="text" id="numero_documentoRec" class="form-control borda-destacada" v-model="numero_documentoRec" placeholder="Ex: 123456789" required />
              </div>

              <div
                v-if="erroMensagem && documentosEncontrados.length === 0 && nome_completoRec"
                class="text-center mt-4 p-4 rounded shadow-sm animate-fade-in"
                style="background-color: #f8f9fa"
              >
                <p class="text-danger fw-bold fs-5 mb-3">{{ erroMensagem }}</p>
                <p class="text-muted fst-italic fs-6 mensagem-motivacional">
                  Não desanime {{ nome_completoRec.split(" ")[0] }}! Muitas pessoas encontram seus documentos depois de alguns dias, especialmente quando são registrados na plataforma.
                </p>
                <button @click="activeTab = 'cadastrar'" class="btn btn-success btn-lg mt-3 px-4 py-2 btn-zoom">📢 Não encontrou? Cadastre aqui</button>
              </div>

              <br />
              <div class="text-center">
                <button type="submit" class="btn btn-purple w-100 btn-lg shadow">Procurar</button>
              </div>
            </div>
          </form>

          <!-- Tabela de Busca - COM RESPONSIVIDADE MELHORADA -->
          <div v-if="documentosEncontrados.length > 0" class="mt-4">
            <div class="table-responsive shadow-sm rounded-4 bg-white">
              <table class="table mb-0 align-middle custom-table-admin">
                <thead class="bg-light">
                  <tr>
                    <th class="py-3 ps-4 border-0">Nome</th>
                    <th class="py-3 border-0">Tipo de Documento</th>
                    <th class="py-3 pe-4 text-end border-0">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="doc in documentosEncontrados" :key="doc.numero_documento" class="hover-row-admin">
                    <td class="ps-4" data-label="Nome">
                      <span class="fw-semibold text-dark text-truncate-admin">{{ doc.nome_completo }}</span>
                    </td>
                    <td data-label="Tipo de Documento">
                      <span class="text-secondary text-truncate-admin">{{ doc.tipo_documento }}</span>
                    </td>
                    <td class="pe-4 text-end" data-label="Ação">
                      <MaterialButton variant="gradient" color="success" data-bs-toggle="modal" data-bs-target="#exampleModal">Solicitar</MaterialButton>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Aba Cadastrar -->
        <div v-if="activeTab === 'cadastrar'" class="tab-pane fade show active">
          <form @submit.prevent="cadastrarDocumento" class="form">
            <div class="row">
              <div class="col-md-12 mb-3">
                <label for="nomeSolicitante" class="form-label fw-bold">Nome completo conforme o documento</label>
                <input
                  type="text"
                  id="nomeSolicitante"
                  class="form-control zoom-field borda-destacadanome"
                  v-model="nome_completo"
                  placeholder="Ex: João Silva"
                  maxlength="50"
                  required
                  @blur="validarNome"
                />
                <div v-if="nomeError" class="text-warning visible">{{ nomeError }}</div>
              </div>

              <div class="col-md-12 mb-3">
                <label for="numeroDocumento" class="form-label fw-bold">Número do Documento</label>
                <input type="text" id="numeroDocumento" class="form-control zoom-field borda-destacada" v-model="numero_documento" placeholder="Ex: 123" maxlength="15" required />
              </div>

              <div class="col-md-12 mb-3">
                <label for="tipoDocumento" class="form-label fw-bold">Tipo de Documento</label>
                <select id="tipoDocumento" class="form-control borda-destacada form-select zoom-field" v-model="tipo_documento" required>
                  <option disabled value="">Selecione o Tipo de Documento</option>
                  <option v-for="tipo_documento in tipo_documentos" :key="tipo_documento" :value="tipo_documento">{{ tipo_documento }}</option>
                </select>
              </div>

              <div class="col-md-12 mb-3">
                <label for="provincia" class="form-label fw-bold">Província Local onde foi encontrado ou perdido</label>
                <select id="provincia" class="form-control borda-destacada form-select zoom-field" v-model="provincia" required>
                  <option disabled value="">Selecione o local</option>
                  <option v-for="provincia in provincias" :key="provincia" :value="provincia">{{ provincia }}</option>
                </select>
              </div>

              <div class="col-md-12 mb-3">
                <label for="contato" class="form-label fw-bold">Contacto</label>
                <input type="tel" id="contato" class="form-control zoom-field borda-destacada" v-model="contacto" placeholder="Ex: 84 123 4567" maxlength="9" required @blur="validarContacto" />
                <div v-if="contactoError" class="text-warning visible">{{ contactoError }}</div>
              </div>

              <div class="col-md-12 mb-3" style="display: none">
                <label for="dataPerda" class="form-label fw-bold">Data</label>
                <input type="date" id="dataPerda" class="form-control zoom-field" v-model="data_perda" required />
              </div>

              <div class="col-md-12 mb-3">
                <label for="origem" class="form-label fw-bold">Você é o dono ou apenas encontrou?</label>
                <select id="origem" class="form-control borda-destacada form-select zoom-field" v-model="origem" required>
                  <option disabled value="">Escolha uma opção</option>
                  <option value="proprietario">Sou o dono</option>
                  <option value="reportado">Apenas encontrei</option>
                </select>
              </div>

              <div class="col-md-12 mb-3">
                <MaterialSwitch class="mb-4 d-flex align-items-center" id="flexSwitchCheckDefault" labelClass="ms-3 mb-0">
                  Eu concordo com os
                  <router-link to="/termsconditions" class="text-dark"><u>Termos e Condições</u></router-link>..
                </MaterialSwitch>
              </div>

              <div class="text-center">
                <button type="submit" class="btn btn-purple w-100 btn-lg shadow">Cadastrar</button>
              </div>
            </div>
            <div class="text-center">
              <p v-if="mensagemSucesso" class="alert-success btn btn-purple w-100 btn-lg shadow visible">{{ mensagemSucesso }}</p>
              <p v-if="mensagemErro" class="alert-danger btn btn-purple w-100 btn-lg shadow visible">{{ mensagemErro }}</p>
            </div>
          </form>
        </div>

        <!-- Aba Documentos Reportados - COM RESPONSIVIDADE MELHORADA -->
        <div v-if="activeTab === 'documentosReportados'" class="tab-pane fade show active">
          <div class="table-responsive shadow-sm rounded-4 bg-white mb-4">
            <table class="table mb-0 align-middle custom-table-admin">
              <thead class="bg-light">
                <tr>
                  <th class="py-3 ps-4 border-0">Nome</th>
                  <th class="py-3 border-0">Tipo de Documento</th>
                  <th class="py-3 border-0">Número do Documento</th>
                  <th class="py-3 border-0">Contacto</th>
                  <th class="py-3 border-0">Província</th>
                  <th class="py-3 border-0">Data</th>
                  <th class="py-3 pe-4 text-end border-0">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="documento in documentosReportados" :key="documento.numero_documento" class="hover-row-admin">
                  <td class="ps-4" data-label="Nome" data-icon="person-circle">
                    <span class="fw-semibold text-dark text-truncate-admin">{{ documento.nome_completo }}</span>
                  </td>
                  <td data-label="Tipo de Documento" data-icon="file-earmark">
                    <span class="text-secondary text-truncate-admin">{{ documento.tipo_documento }}</span>
                  </td>
                  <td data-label="Número do Documento" data-icon="hash">
                    <span class="text-secondary">{{ documento.numero_documento }}</span>
                  </td>
                  <td data-label="Contacto" data-icon="telephone">
                    <span class="text-secondary">{{ documento.contacto }}</span>
                  </td>
                  <td data-label="Província" data-icon="geo-alt">
                    <span class="text-secondary text-truncate-admin">{{ documento.provincia }}</span>
                  </td>
                  <td data-label="Data" data-icon="calendar">
                    <span class="text-secondary">{{ documento.data_perda }}</span>
                  </td>
                  <td class="pe-4 text-end" data-label="Ações" data-icon="tools">
                    <div class="d-flex justify-content-end gap-2 flex-wrap">
                      <button @click="editarDocumento(documento)" class="btn btn-warning btn-sm">
                        <i class="bi bi-pencil-fill"></i> Editar
                      </button>
                      <button @click="eliminarDocumento(documento)" class="btn btn-danger btn-sm">
                        <i class="bi bi-trash-fill"></i> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Modal para edição de documento -->
          <div v-if="isEditModalOpen" class="modal fade show d-block" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Editar Documento</h5>
                  <button type="button" class="close" @click="fecharModal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  <form @submit.prevent="salvarEdicao">
                    <div class="form-group">
                      <label for="nome_completo">Nome Completo</label>
                      <input v-model="documentoEditado.nome_completo" type="text" class="form-control" id="nome_completo" required />
                    </div>
                    <div class="form-group">
                      <label for="tipo_documento">Tipo de Documento</label>
                      <input v-model="documentoEditado.tipo_documento" type="text" class="form-control" id="tipo_documento" required />
                    </div>
                    <div class="form-group">
                      <label for="numero_documento">Número do Documento</label>
                      <input v-model="documentoEditado.numero_documento" type="text" class="form-control" id="numero_documento" disabled />
                    </div>
                    <div class="form-group">
                      <label for="provincia">Província</label>
                      <input v-model="documentoEditado.provincia" type="text" class="form-control" id="provincia" required />
                    </div>
                    <div class="form-group">
                      <label for="data_perda">Data da Perda</label>
                      <input v-model="documentoEditado.data_perda" type="date" class="form-control" id="data_perda" required />
                    </div>
                    <button type="submit" class="btn btn-primary">Salvar</button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div class="tab-pane fade show active">
            <strong>Nota:</strong> Esta é a lista de documentos perdidos registrados por alguém que os encontrou.
          </div>
        </div>

        <!-- Aba Documentos Proprietários - COM RESPONSIVIDADE MELHORADA -->
        <div v-if="activeTab === 'documentosProprietarios'" class="tab-pane fade show active">
          <div class="table-responsive shadow-sm rounded-4 bg-white mb-4">
            <table class="table mb-0 align-middle custom-table-admin">
              <thead class="bg-light">
                <tr>
                  <th class="py-3 ps-4 border-0">Nome</th>
                  <th class="py-3 border-0">Tipo de Documento</th>
                  <th class="py-3 border-0">Número do Documento</th>
                  <th class="py-3 border-0">Província</th>
                  <th class="py-3 border-0">Contacto</th>
                  <th class="py-3 border-0">Data</th>
                  <th class="py-3 pe-4 text-end border-0">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="documento in documentosProprietarios" :key="documento.numero_documento" class="hover-row-admin">
                  <td class="ps-4" data-label="Nome" data-icon="person-circle">
                    <span class="fw-semibold text-dark text-truncate-admin">{{ documento.nome_completo }}</span>
                  </td>
                  <td data-label="Tipo de Documento" data-icon="file-earmark">
                    <span class="text-secondary text-truncate-admin">{{ documento.tipo_documento }}</span>
                  </td>
                  <td data-label="Número do Documento" data-icon="hash">
                    <span class="text-secondary">{{ documento.numero_documento }}</span>
                  </td>
                  <td data-label="Província" data-icon="geo-alt">
                    <span class="text-secondary text-truncate-admin">{{ documento.provincia }}</span>
                  </td>
                  <td data-label="Contacto" data-icon="telephone">
                    <span class="text-secondary">{{ documento.contacto }}</span>
                  </td>
                  <td data-label="Data" data-icon="calendar">
                    <span class="text-secondary">{{ documento.data_perda }}</span>
                  </td>
                  <td class="pe-4 text-end" data-label="Status" data-icon="clipboard-check">
                    <select v-model="documento.status" @change="atualizarStatus(documento)" class="form-select form-select-sm">
                      <option value="Pendente">Pendente</option>
                      <option value="Recuperado">Entregue</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="tab-pane fade show active">
            <strong>Nota:</strong> Esta é a lista de documentos perdidos reportados pelos seus donos.
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css");
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap');

/* Wrapper e Container com largura consistente */
.verdocumentos-wrapper {
  width: 100%;
  background-color: #ffffff;
  font-family: 'Poppins', sans-serif;
}

.verdocumentos-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Navegação */
.custom-nav-admin {
  background: #f9fbf9;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.custom-nav-admin .nav-link {
  color: #4b6043;
  font-weight: 700; /* Poppins Bold */
  border-radius: 8px;
  padding: 10px 12px;
  transition: all 0.3s ease;
}

.custom-nav-admin .nav-link:hover {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.custom-nav-admin .nav-link.active {
  background: linear-gradient(135deg, #2e7d32, #43a047);
  color: #fff !important;
  box-shadow: 0 3px 8px rgba(46, 125, 50, 0.3);
}

.custom-nav-admin .nav-link i {
  font-size: 1.1rem;
  vertical-align: middle;
}

/* Tabelas Admin - Design Moderno e Responsivo */
.custom-table-admin {
  font-family: 'Poppins', sans-serif;
}

.custom-table-admin th {
  font-weight: 900; /* Poppins Black */
  text-transform: uppercase;
  font-size: 0.85rem;
  color: #6c757d;
  letter-spacing: 0.5px;
}

.custom-table-admin td {
  vertical-align: middle;
  font-weight: 600; /* Poppins SemiBold */
}

.hover-row-admin {
  transition: all 0.3s ease;
}

.hover-row-admin:hover {
  background-color: #f8f9fa;
  transform: translateX(4px);
}

/* Truncamento de textos longos */
.text-truncate-admin {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

/* Botões */
.btn-purple {
  background-color: #800080;
  color: white;
  border-radius: 30px;
  border: none;
  padding: 15px 25px;
  font-size: 1.1rem;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
}

.btn-purple:hover {
  background-color: #6a006a;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

.zoom-field {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.zoom-field:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(128, 0, 128, 0.3);
}

.borda-destacada,
.borda-destacadanome {
  border: 2px solid #66bb6a;
  border-radius: 5px;
  padding: 10px;
  outline: none;
}

.borda-destacada:focus,
.borda-destacadanome:focus {
  border-color: #800080;
  box-shadow: 0 0 0 0.2rem rgba(102, 16, 242, 0.25);
}

/* Labels */
.form-label {
  font-weight: 700 !important; /* Poppins Bold */
  font-family: 'Poppins', sans-serif;
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
</style>
