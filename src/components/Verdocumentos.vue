<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { Modal } from "bootstrap";
import Swal from "sweetalert2";
import api from "../api";
import eventBus from "@/eventBus";
import setNavPills from "@/assets/js/nav-pills.js";
import { useDocumentos } from "@/composables/useDocumentos";

import MaterialSwitch from "@/components/MaterialSwitch.vue";
import MaterialButton from "@/components/MaterialButton.vue";


const usuarioLogado = ref(null);
const buscarDadosUsuario = async () => {
  try {
    const { data } = await api.get("/auth/me");
    usuarioLogado.value = data;
  } catch (err) {
    console.error("Erro ao buscar dados do usuário:", err);
  }
};

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
const totalPesquisas = ref(0);

const buscarTotalPesquisas = async () => {
  try {
    const res = await api.get('/documentos/pesquisas');
    if (Array.isArray(res.data)) {
      totalPesquisas.value = res.data.length;
    } else if (res.data && res.data.pesquisas) {
      totalPesquisas.value = res.data.pesquisas.length;
    }
  } catch (err) {
    console.error("Erro ao buscar total de pesquisas:", err);
  }
};

// Paginação
const paginaAtual = ref(1);
const itensPorPagina = 5;

const totalPaginas = computed(() => {
  const lista = activeTab.value === 'procurar' ? documentosEncontrados.value :
                activeTab.value === 'documentosReportados' ? documentosReportados.value :
                documentosProprietarios.value;
  return Math.ceil(lista.length / itensPorPagina);
});

const documentosPaginados = computed(() => {
  const lista = activeTab.value === 'procurar' ? documentosEncontrados.value :
                activeTab.value === 'documentosReportados' ? documentosReportados.value :
                documentosProprietarios.value;
  const start = (paginaAtual.value - 1) * itensPorPagina;
  return lista.slice(start, start + itensPorPagina);
});

const mudarPagina = (p) => {
  if (p >= 1 && p <= totalPaginas.value) paginaAtual.value = p;
};

// Listas auxiliares
const provincias = ["Maputo", "Maputo Cidade", "Gaza", "Inhambane", "Sofala", "Manica", "Tete", "Zambézia", "Nampula", "Niassa", "Cabo Delgado"];
const tipo_documentos = ["Bilhete de Identidade", "Passaporte", "Cartão de Eleitor", "Cartão de Estudante", "Carta de Condução", "Seguro do Veículo", "Livrete", "Cartão de Identidade Militar", "Outro..."];

const outroTipoDocumento = ref("");

// Mapeamento dinâmico de labels para o número do documento
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

// Funções de Validação
const validarNome = () => {
  const nomeRegex = /^[A-Za-zÀ-ÿ\s]+$/;
  if (!form.value.nome_completo) {
    nomeError.value = "O nome é obrigatório.";
    return false;
  }
  if (!nomeRegex.test(form.value.nome_completo)) {
    nomeError.value = "O nome completo deve conter apenas letras.";
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
    contactoError.value = "O contacto deve conter 9 dígitos e começar com 84, 85, 86, 87 ou 83.";
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
    mensagemErro.value = "Você precisa concordar com os termos.";
    return;
  }

  try {
    const payload = { 
      ...form.value, 
      tipo_documento: form.value.tipo_documento === "Outro..." ? outroTipoDocumento.value : form.value.tipo_documento,
      data_perda: new Date().toISOString().split('T')[0] 
    };
    
    if (form.value.tipo_documento === "Outro..." && !outroTipoDocumento.value) {
      mensagemErro.value = "Por favor, especifique o tipo de documento.";
      return;
    }

    const response = await apiCadastrar(payload);
    mensagemSucesso.value = `Documento cadastrado: ${response.data.nome_completo}`;
    Object.keys(form.value).forEach(key => form.value[key] = key === 'concordaTermos' ? false : "");
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

  const termoPesquisado = busca.value.nome || busca.value.tipo || busca.value.provincia || busca.value.numero;

  if (!termoPesquisado) {
    erroMensagem.value = "Preencha o campo do filtro.";
    isLoading.value = false;
    return;
  }

  // Log da pesquisa para o admin
  api.post('/documentos/pesquisas', {
    termo: termoPesquisado,
    filtro: tipoFiltro.value,
    usuario: usuarioLogado.value ? { nome: usuarioLogado.value.nome, email: usuarioLogado.value.email } : "Visitante",
    data: new Date().toISOString()
  }).then(async () => {
    const totalAntigo = totalPesquisas.value;
    await buscarTotalPesquisas();
    const novoTotal = totalPesquisas.value;
    
    if (novoTotal > totalAntigo) {
      let atingiuMilestone = false;
      // Nova Lógica: 10 em 10 até 1000, depois 100 em 100
      if (novoTotal <= 1000) {
        if (novoTotal % 10 === 0) atingiuMilestone = true;
      } else {
        if (novoTotal % 100 === 0) atingiuMilestone = true;
      }

      if (atingiuMilestone) {
        celebrarMilestone(novoTotal);
      }
    }
  }).catch(err => console.error("Erro ao salvar log:", err));

  try {
    const res = await apiProcurar(params);
    if (res.length === 0) {
      erroMensagem.value = "Pesquisa concluída, mas não encontramos nenhum documento com estes dados.";
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      erroMensagem.value = "Pesquisa concluída: nenhum documento foi encontrado com estes dados.";
      documentosEncontrados.value = [];
    } else {
      console.error("Erro de conexão:", error);
      erroMensagem.value = "Ops! Tivemos uma falha ao comunicar com o servidor.";
    }
  } finally {
    isLoading.value = false;
  }
};

const celebrarMilestone = (numero) => {
  const nomeUser = usuarioLogado.value?.nome || "Explorador(a)";
  Swal.fire({
    title: `🎊 ¡Incrível, ${nomeUser}! 🎊`,
    html: `
      <div class="celebration-container">
        <div class="milestone-badge mb-3">${numero}</div>
        <h4 class="text-purple fw-bold">Marcos de Pesquisa!</h4>
        <p class="mt-3 fs-5 text-dark">Tu acabaste de realizar uma das pesquisas que nos leva ao topo!</p>
        <p class="text-purple fw-bold fs-4 animate-pulse">#Pesquisa${numero}</p>
        <hr class="my-3 opacity-20">
        <p class="text-muted">
          <strong>${nomeUser}</strong>, a tua curiosidade e o teu uso da plataforma ajudam a Rpa a crescer para que possamos ajudar mais pessoas a encontrar o que perderam.
          <br><br>
          <span class="heart-beat">💖</span> <strong>Obrigado por fazeres história connosco!</strong>
        </p>
      </div>
    `,
    confirmButtonText: 'Continuar a Fazer História',
    confirmButtonColor: '#800080',
    background: '#fff url("https://www.transparenttextures.com/patterns/pinstripe-light.png")',
    backdrop: `
      rgba(128, 0, 128, 0.5)
      url("https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2Zic3RhcnJzZ2lmX2J5X2lkX2N0PWc/26tP3M3i03hoIYL6M/giphy.gif")
      center center
      repeat
    `,
    customClass: { popup: 'border-radius-20 shadow-2xl animate-bounce-in' }
  });
};

const partilharWhatsApp = (doc) => {
  const mensagem = `📢 *Documento Encontrado no RPA!*%0A%0A👤 *Nome:* ${doc.nome_completo}%0A📄 *Tipo:* ${doc.tipo_documento}%0A📍 *Província:* ${doc.provincia}%0A%0ASe conheces esta pessoa, avisa-a! Registre documentos em: ${window.location.href}`;
  window.open(`https://wa.me/?text=${mensagem}`, '_blank');
};

const partilharFacebook = (doc) => {
  const url = encodeURIComponent(window.location.href);
  const quote = encodeURIComponent(`📢 Documento Encontrado no RPA!\n👤 Nome: ${doc.nome_completo}\n📄 Tipo: ${doc.tipo_documento}\n📍 Província: ${doc.provincia}`);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank');
};

const partilharGeral = async (doc) => {
  const texto = `📢 Documento Encontrado!\n👤 Nome: ${doc.nome_completo}\n📄 Tipo: ${doc.tipo_documento}\n📍 Província: ${doc.provincia}`;
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'RPA - Documentos Encontrados',
        text: texto,
        url: window.location.href,
      });
    } catch (err) {
      console.log('Erro ao partilhar', err);
    }
  } else {
    partilharWhatsApp(doc);
  }
};

const verificarAssinaturaAntesDeSolicitar = async (doc) => {
  try {
    const { data } = await api.get("/pagamentos/assinatura/ativa");

    if (data.ativa) {
      const modalElement = document.getElementById("exampleModal");
      if (modalElement) new Modal(modalElement).show();
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Assinatura Necessária',
        text: 'Você precisa de uma assinatura ativa.',
        confirmButtonColor: '#800080',
        confirmButtonText: 'Ver Planos'
      }).then((r) => r.isConfirmed && router.push("/assinaturas"));
    }
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Erro', text: 'Tente novamente.' });
  }
};

const refreshAll = async () => {
  isLoading.value = true;
  await Promise.all([
    buscarDocumentos(),
    buscarDocumentosReportados(),
    buscarDocumentosProprietarios(),
    buscarTotalPesquisas()
  ]);
  isLoading.value = false;
};

onMounted(async () => {
  eventBus.on("changeTab", changeTab);
  eventBus.on("refreshData", refreshAll);
  setNavPills();
  isLoading.value = true;
  await Promise.all([
    buscarDadosUsuario(),
    buscarDocumentos(),
    buscarDocumentosReportados(),
    buscarDocumentosProprietarios(),
    buscarTotalPesquisas()
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
  <section class="py-7">
    <div class="container">
      <!-- Conteúdo de Navegação -->
      <ul class="nav nav-pills nav-fill custom-nav p-2" role="tablist">
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: activeTab === 'procurar' }"
            @click.prevent="activeTab = 'procurar'"
            role="tab"
            aria-selected="true"
          >
            <i class="bi bi-search me-2"></i> Procurar
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: activeTab === 'cadastrar' }"
            @click.prevent="activeTab = 'cadastrar'"
            role="tab"
            aria-selected="false"
          >
            <i class="bi bi-flag me-2"></i> Reportar
          </a>
        </li>
      </ul>

      <!-- Conteúdo das abas -->
      <div class="tab-content">
        <!-- Aba Procurar (Formulário para busca de documentos) -->
        <div v-if="activeTab === 'procurar'" class="tab-pane fade show active">
          <form @submit.prevent="procurar" class="form">
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

              <!-- Campo Dinâmico conforme o Filtro -->
              <div v-if="tipoFiltro === 'nome'" class="col-md-12 mb-3">
                <label for="nomeRec" class="form-label fw-bold">Nome Completo</label>
                <input type="text" id="nomeRec" class="form-control borda-destacadanome" v-model="busca.nome" placeholder="Ex: João Silva" required />
              </div>

              <div v-if="tipoFiltro === 'tipo'" class="col-md-12 mb-3">
                <label for="tipoDocumento" class="form-label fw-bold">Tipo de Documento</label>
                <select id="tipoDocumento" class="form-control borda-destacada form-select zoom-field" v-model="busca.tipo" required>
                  <option disabled value="">Selecione o Tipo</option>
                  <option v-for="tipo in tipo_documentos" :key="tipo" :value="tipo">{{ tipo }}</option>
                </select>
              </div>

              <div v-if="tipoFiltro === 'provincia'" class="col-md-12 mb-3">
                <label for="provinciaRec" class="form-label fw-bold">Província</label>
                <select id="provinciaRec" class="form-control destacada form-select zoom-field" v-model="busca.provincia" required>
                  <option disabled value="">Selecione a Província</option>
                  <option v-for="provincia in provincias" :key="provincia" :value="provincia">{{ provincia }}</option>
                </select>
              </div>

              <div v-if="tipoFiltro === 'numero'" class="col-md-12 mb-3">
                <label for="numero_documentoRec" class="form-label fw-bold">Número de Documento</label>
                <input type="text" id="numero_documentoRec" class="form-control borda-destacada" v-model="busca.numero" placeholder="Ex: 123456789" required />
              </div>

              <!-- Feedback de Busca Vazia -->
              <div v-if="erroMensagem && documentosEncontrados.length === 0 && busca.nome" class="text-center mt-4 p-4 rounded shadow-sm animate-fade-in" style="background-color: #f8f9fa; border-left: 5px solid #800080;">
                <p class="text-danger fw-bold fs-5 mb-2">{{ erroMensagem }}</p>
                <p class="text-muted fst-italic fs-6 mensagem-motivacional mb-3">
                  Não desanime {{ busca.nome.split(" ")[0] }}! Muitas pessoas encontram seus documentos depois de alguns dias.
                </p>
                
                <div class="d-flex flex-wrap justify-content-center gap-2">
                  <button @click="activeTab = 'cadastrar'" class="btn btn-success btn-sm px-4 btn-zoom">
                    📢 Não encontrou? Cadastre aqui
                  </button>
                  <button @click="router.push({ name: 'GuiaDocumentos' })" class="btn btn-outline-primary btn-sm px-4 btn-zoom">
                    <i class="bi bi-journal-text me-2"></i> Como tratar documentos em Moçambique
                  </button>
                </div>
              </div>

              <!-- Contador de Impacto (Otimizado/Compacto) -->
              <div v-if="totalPesquisas > 0" class="text-center mb-3 animate-fade-in">
                <div class="d-inline-flex align-items-center py-1 px-3 rounded-pill bg-purple-soft text-purple border shadow-sm stats-badge-compact">
                  <i class="bi bi-search me-2 small"></i>
                  <span class="small fw-bold">Já foram feitas {{ totalPesquisas }} pesquisas</span>
                </div>
              </div>

              <div class="text-center mt-3">
                <button type="submit" class="btn btn-purple w-100 btn-lg shadow">Procurar</button>
              </div>
            </div>
          </form>

          <!-- Listagem de Resultados -->
          <div v-if="isLoading" class="mt-4">
            <div v-for="i in 3" :key="i" class="skeleton-row mb-3"></div>
          </div>
          
          <div v-else-if="documentosEncontrados.length > 0" class="mt-4">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th class="text-end pe-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="doc in documentosPaginados" :key="doc.id" class="table-row">
                    <td><span class="fw-bold">{{ doc.nome_completo }}</span></td>
                    <td>{{ doc.tipo_documento }}</td>
                    <td class="text-end pe-4">
                      <div class="d-flex justify-content-end gap-2 align-items-center">
                        <div class="btn-group btn-group-sm rounded-pill overflow-hidden shadow-sm">
                          <button class="btn btn-whatsapp px-2" @click="partilharWhatsApp(doc)" title="WhatsApp">
                            <i class="bi bi-whatsapp"></i>
                          </button>
                          <button class="btn btn-facebook px-2" @click="partilharFacebook(doc)" title="Facebook">
                            <i class="bi bi-facebook"></i>
                          </button>
                          <button class="btn btn-share px-2" @click="partilharGeral(doc)" title="Mais opções (Instagram...)">
                            <i class="bi bi-share"></i>
                          </button>
                        </div>
                        <MaterialButton variant="gradient" color="success" size="sm" @click="verificarAssinaturaAntesDeSolicitar(doc)">
                          Solicitar
                        </MaterialButton>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Empty State Personalizado -->
          <div v-else-if="!isLoading && erroMensagem && activeTab === 'procurar'" class="empty-state text-center py-5 animate-fade-in">
            <div class="empty-icon mb-3">
              <i class="bi bi-search-heart text-purple opacity-20" style="font-size: 5rem;"></i>
            </div>
            <h5 class="text-dark fw-bold">Não encontramos resultados</h5>
            <p class="text-muted mb-4">{{ erroMensagem }}</p>
            
            <div class="d-flex flex-wrap justify-content-center gap-3">
              <button @click="activeTab = 'cadastrar'" class="btn btn-purple px-4">Cadastrar Documento</button>
              <button @click="router.push({ name: 'GuiaDocumentos' })" class="btn btn-info px-4">
                <i class="bi bi-journal-check me-2"></i> Como tratar documentos em Moçambique
              </button>
              <button @click="router.push('/comunidade')" class="btn btn-outline-purple px-4">
                <i class="bi bi-people-fill me-2"></i> Ver na Comunidade
              </button>
            </div>
            <p class="mt-4 text-sm text-muted">A nossa comunidade também partilha achados e perdidos diariamente!</p>
          </div>
        </div>

        <!-- Aba Reportar (Formulário Dinâmico) -->
        <div v-if="activeTab === 'cadastrar'" class="tab-pane fade show active">
          <form @submit.prevent="cadastrar" class="form">
            <div class="row">
              <!-- Seletor de Tipo -->
              <div class="col-md-12 mb-3">
                <label class="form-label fw-bold">Tipo de Documento</label>
                <select class="form-control borda-destacada form-select zoom-field" v-model="form.tipo_documento" required>
                  <option disabled value="">Selecione o Tipo de Documento</option>
                  <option v-for="tipo in tipo_documentos" :key="tipo" :value="tipo">{{ tipo }}</option>
                </select>
              </div>

              <!-- Campo para Tipo Customizado -->
              <div v-if="form.tipo_documento === 'Outro...'" class="col-md-12 mb-3 animate-fade-in">
                <label class="form-label fw-bold">Especifique o Tipo de Documento</label>
                <input type="text" class="form-control zoom-field borda-destacada" v-model="outroTipoDocumento" placeholder="Ex: Cartão de Saúde, Alvará..." required />
              </div>

              <!-- Campos Dinâmicos (Exibidos apenas após escolher o tipo) -->
              <template v-if="form.tipo_documento">
                <div class="col-md-12 mb-3">
                  <label class="form-label fw-bold">Nome completo conforme o documento</label>
                  <input type="text" class="form-control zoom-field borda-destacadanome" v-model="form.nome_completo" placeholder="Ex: João Silva" maxlength="50" required @blur="validarNome" />
                  <div v-if="nomeError" class="text-warning visible">{{ nomeError }}</div>
                </div>

                <div class="col-md-12 mb-3">
                  <label class="form-label fw-bold">{{ labelNumeroDocumento }}</label>
                  <input type="text" class="form-control zoom-field borda-destacada" v-model="form.numero_documento" placeholder="Número do documento" maxlength="20" required />
                </div>

                <div class="col-md-12 mb-3">
                  <label class="form-label fw-bold">Província onde foi perdido/encontrado</label>
                  <select class="form-control borda-destacada form-select zoom-field" v-model="form.provincia" required>
                    <option disabled value="">Selecione o local</option>
                    <option v-for="p in provincias" :key="p" :value="p">{{ p }}</option>
                  </select>
                </div>

                <div class="col-md-12 mb-3">
                  <label class="form-label fw-bold">Contacto</label>
                  <input type="tel" class="form-control zoom-field borda-destacada" v-model="form.contacto" placeholder="Ex: 84 123 4567" maxlength="9" required @blur="validarContacto" />
                  <div v-if="contactoError" class="text-warning visible">{{ contactoError }}</div>
                </div>

                <div class="col-md-12 mb-3">
                  <label class="form-label fw-bold">Você é o dono ou apenas encontrou?</label>
                  <select class="form-control borda-destacada form-select zoom-field" v-model="form.origem" required>
                    <option disabled value="">Escolha uma opção</option>
                    <option value="proprietario">Sou o dono</option>
                    <option value="reportado">Apenas encontrei</option>
                  </select>
                </div>

                <div class="col-md-12 mb-4">
                  <MaterialSwitch id="termsSwitch" v-model:checked="form.concordaTermos" labelClass="ms-3 mb-0">
                    Eu concordo com os <router-link to="/termsconditions" class="text-dark"><u>Termos e Condições</u></router-link>.
                  </MaterialSwitch>
                </div>

                <div class="col-md-12 text-center">
                  <button type="submit" class="btn btn-purple w-100 btn-lg shadow">Cadastrar</button>
                </div>
              </template>
            </div>

            <!-- Toast-like feedback -->
            <div class="mt-3">
              <p v-if="mensagemSucesso" class="alert-success btn btn-purple w-100 btn-lg shadow visible">{{ mensagemSucesso }}</p>
              <p v-if="mensagemErro" class="alert-danger btn btn-purple w-100 btn-lg shadow visible">{{ mensagemErro }}</p>
            </div>
          </form>
        </div>

        <div v-if="activeTab === 'documentosReportados'" class="tab-pane fade show active">
          <div v-if="isLoading" class="mt-4">
            <div v-for="i in 4" :key="i" class="skeleton-row mb-3"></div>
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Número</th>
                  <th>Província</th>
                  <th class="text-end pe-4">Partilhar</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="doc in documentosPaginados" :key="doc.id" class="table-row">
                  <td class="fw-bold">{{ doc.nome_completo }}</td>
                  <td>{{ doc.tipo_documento }}</td>
                  <td><code>{{ doc.numero_documento }}</code></td>
                  <td>{{ doc.provincia }}</td>
                  <td class="text-end pe-4">
                    <div class="btn-group btn-group-sm rounded-pill overflow-hidden shadow-sm">
                      <button class="btn btn-whatsapp px-2" @click="partilharWhatsApp(doc)" title="WhatsApp">
                        <i class="bi bi-whatsapp"></i>
                      </button>
                      <button class="btn btn-facebook px-2" @click="partilharFacebook(doc)" title="Facebook">
                        <i class="bi bi-facebook"></i>
                      </button>
                      <button class="btn btn-share px-2" @click="partilharGeral(doc)" title="Mais opções (Instagram...)">
                        <i class="bi bi-share"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Aba Reportados por Donos -->
        <div v-if="activeTab === 'documentosProprietarios'" class="tab-pane fade show active">
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Número</th>
                  <th>Província</th>
                  <th>Contacto</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="doc in documentosPaginados" :key="doc.id" class="table-row">
                  <td>{{ doc.nome_completo }}</td>
                  <td>{{ doc.tipo_documento }}</td>
                  <td>{{ doc.numero_documento }}</td>
                  <td>{{ doc.provincia }}</td>
                  <td>{{ doc.contacto }}</td>
                  <td>{{ doc.data_perda }}</td>
                </tr>
              </tbody>
            </table>
            <div class="mt-3"><strong>Nota:</strong> Lista de documentos perdidos reportados pelos donos.</div>
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
  </section>
</template>

<style scoped>
/* Design System Core - Cores e Variáveis */
:deep(.nav-link) {
  --nav-color: #800080;
  --nav-hover: #6a006a;
}

/* Navegação customizada */
.custom-nav {
  background: #f9fbf9;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.custom-nav .nav-link {
  color: #4b6043;
  font-weight: 600;
  border-radius: 30px;
  padding: 12px 30px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-nav .nav-link:hover {
  background-color: #e7f5e4;
  color: #2e7d32;
  transform: translateY(-2px);
}

.custom-nav .nav-link.active {
  background: linear-gradient(135deg, #800080, #b000b0);
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(128, 0, 128, 0.3);
}

/* Botões Premium */
.btn-purple {
  background: linear-gradient(135deg, #800080 60%, #b000b0 100%);
  color: white;
  border-radius: 30px;
  border: none;
  padding: 15px 25px;
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(128, 0, 128, 0.2);
  transition: all 0.3s ease;
}

.btn-purple:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(128, 0, 128, 0.4);
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

/* Novo Estilo para o Contador */
.bg-purple-soft {
  background-color: rgba(128, 0, 128, 0.08);
}

.text-purple {
  color: #800080 !important;
}

.stats-badge-compact {
  font-size: 0.85rem;
  animation: soft-pulse 2s infinite;
  border: 1px solid rgba(128, 0, 128, 0.15);
}

@media (max-width: 576px) {
  .stats-badge-compact {
    font-size: 0.75rem;
    padding: 4px 12px !important;
  }
}

@keyframes soft-pulse {
  0% { transform: scale(1); box-shadow: 0 4px 12px rgba(128, 0, 128, 0.1); }
  50% { transform: scale(1.02); box-shadow: 0 6px 16px rgba(128, 0, 128, 0.2); }
  100% { transform: scale(1); box-shadow: 0 4px 12px rgba(128, 0, 128, 0.1); }
}

.btn-outline-purple:disabled {
  border-color: #ccc;
  color: #ccc;
}

/* Campos de Formulário com Efeito Zoom */
.zoom-field, .borda-destacadanome, .borda-destacada {
  transition: all 0.3s ease;
  border: 1px solid #ced4da;
  padding: 12px 20px;
  border-radius: 12px;
}

.zoom-field:focus, .borda-destacada:focus {
  border-color: #800080;
  box-shadow: 0 0 0 0.25rem rgba(128, 0, 128, 0.1);
  transform: scale(1.01);
}

.borda-destacadanome { border: 2px solid #66bb6a; }
.borda-destacada { border: 1px solid #66bb6a; }

/* Tabelas */
.table {
  border-radius: 12px;
  overflow: hidden;
}

.table th {
  background-color: #800080;
  color: white;
  padding: 15px;
}

.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  background-color: #f8f0f8 !important;
  transform: translateX(5px);
}

/* Animações Core */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.alert-success { animation: pulse 1.5s infinite; color: #28a745; }
.alert-danger { animation: pulse 1.5s infinite; color: #dc3545; }
.btn-zoom { animation: pulse 1.5s ease-in-out infinite; }

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Mensagem Motivacional Typing Effect */
.mensagem-motivacional {
  color: #856404;
  font-style: italic;
  overflow: hidden;
  white-space: nowrap;
  border-right: 3px solid #856404;
  width: 0;
  animation: typing 6s steps(60) 1s forwards, blink 0.75s step-end infinite;
}

@keyframes typing { from { width: 0; } to { width: 100%; } }
@keyframes blink { 50% { border-color: transparent; } }

@media (max-width: 768px) {
  .mensagem-motivacional {
    white-space: normal;
    width: auto;
    animation: fadeIn 1s ease-in;
    border: none;
  }
}
/* Skeleton Loader */
.skeleton-row {
  height: 60px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 12px;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* WhatsApp Button */
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

.opacity-20 { opacity: 0.2; }

/* Estilos de Celebração */
.milestone-badge {
  display: inline-block;
  background: linear-gradient(135deg, #800080, #198754);
  color: white;
  width: 80px;
  height: 80px;
  line-height: 80px;
  border-radius: 50%;
  font-size: 1.8rem;
  font-weight: 800;
  box-shadow: 0 10px 20px rgba(128, 0, 128, 0.3);
  animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.heart-beat {
  display: inline-block;
  font-size: 1.5rem;
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0% { transform: scale(1); }
  15% { transform: scale(1.3); }
  30% { transform: scale(1); }
  45% { transform: scale(1.15); }
  60% { transform: scale(1); }
}

@keyframes bounceIn {
  from { opacity: 0; transform: scale(0.3); }
  50% { opacity: 1; transform: scale(1.05); }
  70% { transform: scale(0.9); }
  to { transform: scale(1); }
}

.border-radius-20 {
  border-radius: 20px !important;
}
</style>
