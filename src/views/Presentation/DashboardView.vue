<script setup>
import { onMounted, onUnmounted } from "vue";
import Swal from "sweetalert2";

import TabelaSolicitacoes from "../TabelaSolicitacoes.vue";
import DocumentosCharts from "../DocumentosCharts.vue";
import DashboardOverview from "@/components/DashboardOverview.vue";
import AtividadesRecentes from "@/components/AtividadesRecentes.vue";

//example components
import NavbarDefault from "../..//examples/navbars/NavbarDefault.vue";
import DefaultFooter from "../../examples/footers/FooterDefault.vue";
import Nossateam from "../../examples/footers/Nossateam.vue";
import Header from "../../examples/Header.vue";

//Vue Material Kit 2 components
import Verdocumentosadmin from "@/components/Verdocumentosadmin.vue";

import UsuariosView from "../../components/UsuariosView.vue";

// sections
import PresentationCounter from "./Sections/PresentationCounter.vue";

//images
import vueMkHeader from "@/assets/img/banner.webp";

//hooks
const body = document.getElementsByTagName("body")[0];
onMounted(() => {
  body.classList.add("presentation-page");
  body.classList.add("bg-gray-200");
});
onUnmounted(() => {
  body.classList.remove("presentation-page");
  body.classList.remove("bg-gray-200");
});

import api from "../../api";
import { ref } from "vue"; // Importando ref para reatividade

// Definição de campos reativos
const nome_completo = ref("");
const contacto = ref("");
const tipo_documento = ref("");
const motivo = ref("");

// Mensagens de erro
const nomeError = ref("");
const contactoError = ref("");
const mensagemSucesso = ref("");
const mensagemErro = ref("");
// Lista de tipos de documentos
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

const afiliacao = ref("");
const local_emissao = ref("");
const data_nascimento = ref("");
const numero_bi = ref("");
const etapaAtual = ref(1);
const enviando = ref(false);

// Função de validação do nome completo
const validarNome = () => {
  const nomeRegex = /^[A-Za-zÀ-ÿ\s]+$/;
  if (!nome_completo.value.trim()) {
    nomeError.value = "O nome é obrigatório.";
    return false;
  } else if (!nomeRegex.test(nome_completo.value.trim())) {
    nomeError.value = "O nome completo deve conter apenas letras.";
    return false;
  }
  nomeError.value = "";
  return true;
};

// Função de validação do contacto
const validarContacto = () => {
  const contactoLimpo = contacto.value.replace(/\s+/g, '');
  const contactoRegex = /^(84|85|86|87|83)\d{7}$/;
  if (!contactoLimpo) {
    contactoError.value = "O contacto é obrigatório.";
    return false;
  } else if (!contactoRegex.test(contactoLimpo)) {
    contactoError.value =
      "O contacto deve conter 9 dígitos e começar com 84, 85, 86, 87 ou 83.";
    return false;
  }
  contactoError.value = "";
  return true;
};

// Navegação entre etapas
const avancarEtapa = () => {
  if (etapaAtual.value === 1) {
    if (!validarNome() || !validarContacto()) {
      return;
    }
    etapaAtual.value = 2;
  } else if (etapaAtual.value === 2) {
    if (!tipo_documento.value) {
      Swal.fire({
        icon: 'warning',
        title: 'Tipo de Documento',
        text: 'Por favor, selecione o tipo de documento.',
        confirmButtonColor: '#800080'
      });
      return;
    }
    if (!data_nascimento.value) {
      Swal.fire({
        icon: 'warning',
        title: 'Data de Nascimento',
        text: 'Por favor, preencha a data de nascimento do titular.',
        confirmButtonColor: '#800080'
      });
      return;
    }
    etapaAtual.value = 3;
  }
};

const voltarEtapa = () => {
  if (etapaAtual.value > 1) {
    etapaAtual.value--;
  }
};

const resetarModal = () => {
  etapaAtual.value = 1;
  mensagemSucesso.value = "";
  mensagemErro.value = "";
};

// Função para enviar a solicitação
const solicitarDocumento = async () => {
  if (!validarNome() || !validarContacto()) {
    etapaAtual.value = 1;
    return;
  }

  if (!tipo_documento.value || !data_nascimento.value) {
    etapaAtual.value = 2;
    return;
  }

  enviando.value = true;
  mensagemSucesso.value = "";
  mensagemErro.value = "";

  const solicitacao = {
    nome_completo: nome_completo.value.trim(),
    contacto: contacto.value.replace(/\s+/g, ''),
    tipo_documento: tipo_documento.value,
    motivo: motivo.value.trim(),
    afiliacao: afiliacao.value.trim(),
    local_emissao: local_emissao.value.trim(),
    data_nascimento: data_nascimento.value,
    numero_bi: numero_bi.value.trim(),
  };

  try {
    const response = await api.post("/solicitacoes", solicitacao);
    console.log("Solicitação enviada com sucesso:", response.data);
    mensagemSucesso.value = "✅ Solicitação enviada com sucesso! Aguarde nosso contacto.";

    Swal.fire({
      icon: 'success',
      title: 'Solicitação Enviada!',
      text: 'O seu pedido foi recebido com sucesso. Nossa equipe entrará em contacto pelo número ' + solicitacao.contacto,
      confirmButtonColor: '#66bb6a'
    });

    nome_completo.value = "";
    contacto.value = "";
    tipo_documento.value = "";
    motivo.value = "";
    afiliacao.value = "";
    local_emissao.value = "";
    data_nascimento.value = "";
    numero_bi.value = "";
    etapaAtual.value = 1;

    const modalEl = document.getElementById("exampleModal");
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) {
        setTimeout(() => modalInstance.hide(), 1200);
      }
    }
  } catch (error) {
    console.error("Erro ao enviar a solicitação:", error);
    mensagemErro.value =
      "❌ Ocorreu um erro ao enviar a solicitação. Tente novamente.";
    Swal.fire({
      icon: 'error',
      title: 'Erro ao Enviar',
      text: 'Não foi possível enviar sua solicitação. Verifique os dados e tente novamente.',
      confirmButtonColor: '#800080'
    });
  } finally {
    enviando.value = false;
  }
};
</script>

<template>
  <div class="container position-sticky z-index-sticky top-0">
    <div class="row">
      <div class="col-12">
        <NavbarDefault :sticky="true" />
      </div>
    </div>
  </div>

  <Header>
    <div
      class="page-header min-vh-75"
      :style="`background-image: url(${vueMkHeader})`"
      loading="lazy"
    >
      <div class="container">
        <div class="row">
          <div class="col-lg-7 text-center mx-auto position-relative">
            <h1
              class="text-white pt-3 mt-n5 me-2"
              :style="{ display: 'inline-block ' }"
            ></h1>
            <p
              class="lead text-white px-5 mt-3"
              :style="{ fontWeight: '500' }"
            ></p>
          </div>
        </div>
      </div>
    </div>
  </Header>

  <div class="card card-body blur shadow-blur mx-3 mx-md-4 mt-n6">
    <!-- Novo: Dashboard Overview com KPIs -->
    <DashboardOverview />
    
    <!-- Novo: Atividades Recentes -->
    <AtividadesRecentes />
    
    <!-- Componente para Exibir Documentos -->
    <section class="py-5" id="usuarios" data-section="usuarios">
      <UsuariosView />
    </section>
    
    <div id="charts" data-section="charts">
      <DocumentosCharts />
    </div>
    
    <div id="verdocumentosadmin" data-section="verdocumentosadmin">
      <Verdocumentosadmin />
    </div>

    <!-- Tabela de solicitações abaixo -->
    <div id="solicitacoes" data-section="solicitacoes">
      <TabelaSolicitacoes :solicitacoes="solicitacoes" />
    </div>
    
    <!-- Componente para Contador de Apresentação -->
    <PresentationCounter />
  </div>
  <!-- Fechamento da div card -->

  <!-- Modal -->
  <div
    class="modal fade"
    id="exampleModal"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content modal-solicitar-content">
        <!-- CABEÇALHO -->
        <div class="modal-header border-0 pb-1 pt-3 px-4 d-flex justify-content-between align-items-center">
          <div>
            <h5 class="modal-title fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <i class="bi bi-file-earmark-check text-purple"></i> Solicitar Documento
            </h5>
            <small class="text-muted text-xs">
              Etapa {{ etapaAtual }} de 3:
              <span class="text-purple fw-bold">
                {{ etapaAtual === 1 ? 'Identificação' : etapaAtual === 2 ? 'Dados do Documento' : 'Confirmação' }}
              </span>
            </small>
          </div>
          <button
            type="button"
            class="btn-close shadow-none"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="resetarModal"
          ></button>
        </div>

        <!-- CORPO DO MODAL -->
        <div class="modal-body px-4 pt-2 pb-2">
          <!-- STEPPER INDICATOR VISUAL -->
          <div class="stepper-container mb-3">
            <div class="stepper-item" :class="{ active: etapaAtual === 1, done: etapaAtual > 1 }">
              <div class="stepper-circle">
                <i v-if="etapaAtual > 1" class="bi bi-check-lg"></i>
                <span v-else>1</span>
              </div>
              <span class="stepper-label">Identificação</span>
            </div>
            <div class="stepper-line" :class="{ active: etapaAtual > 1 }"></div>
            <div class="stepper-item" :class="{ active: etapaAtual === 2, done: etapaAtual > 2 }">
              <div class="stepper-circle">
                <i v-if="etapaAtual > 2" class="bi bi-check-lg"></i>
                <span v-else>2</span>
              </div>
              <span class="stepper-label">Documento</span>
            </div>
            <div class="stepper-line" :class="{ active: etapaAtual > 2 }"></div>
            <div class="stepper-item" :class="{ active: etapaAtual === 3 }">
              <div class="stepper-circle">
                <span>3</span>
              </div>
              <span class="stepper-label">Confirmação</span>
            </div>
          </div>

          <!-- FORMULÁRIO -->
          <form id="formSolicitacao" @submit.prevent="solicitarDocumento">
            <!-- ETAPA 1: IDENTIFICAÇÃO -->
            <div v-show="etapaAtual === 1" class="step-animation">
              <div class="mb-3">
                <label for="nomeSolicitante" class="form-label fw-bold text-sm mb-1">
                  Nome Completo <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0 text-purple"><i class="bi bi-person"></i></span>
                  <input
                    type="text"
                    id="nomeSolicitante"
                    class="form-control border-start-0 ps-1"
                    v-model="nome_completo"
                    placeholder="Ex: João Silva"
                    maxlength="50"
                    @blur="validarNome"
                  />
                </div>
                <div v-if="nomeError" class="text-danger text-xs mt-1">
                  {{ nomeError }}
                </div>
              </div>

              <div class="mb-3">
                <label for="contato" class="form-label fw-bold text-sm mb-1">
                  Contacto (Moçambique) <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0 text-purple"><i class="bi bi-telephone"></i></span>
                  <input
                    type="tel"
                    id="contato"
                    class="form-control border-start-0 ps-1"
                    v-model="contacto"
                    placeholder="Ex: 84 123 4567"
                    maxlength="9"
                    @blur="validarContacto"
                  />
                </div>
                <div v-if="contactoError" class="text-danger text-xs mt-1">
                  {{ contactoError }}
                </div>
                <small class="text-muted text-xs d-block mt-1">Inicie com 84, 85, 86, 87 ou 83</small>
              </div>

              <div class="mb-2">
                <label for="afiliacao" class="form-label fw-bold text-sm mb-1">
                  Afiliação / Relação <span class="text-muted fw-normal text-xs">(Opcional)</span>
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0 text-purple"><i class="bi bi-people"></i></span>
                  <input
                    type="text"
                    id="afiliacao"
                    class="form-control border-start-0 ps-1"
                    v-model="afiliacao"
                    placeholder="Ex: Titular, Pai, Mãe, Advogado"
                  />
                </div>
              </div>
            </div>

            <!-- ETAPA 2: DADOS DO DOCUMENTO -->
            <div v-show="etapaAtual === 2" class="step-animation">
              <div class="mb-3">
                <label for="tipoDocumento" class="form-label fw-bold text-sm mb-1">
                  Tipo de Documento <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0 text-purple"><i class="bi bi-card-text"></i></span>
                  <select
                    id="tipoDocumento"
                    class="form-select border-start-0 ps-1"
                    v-model="tipo_documento"
                  >
                    <option disabled value="">Selecione o Tipo de Documento</option>
                    <option
                      v-for="tipo in tipo_documentos"
                      :key="tipo"
                      :value="tipo"
                    >
                      {{ tipo }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="mb-3">
                <label for="dataNascimento" class="form-label fw-bold text-sm mb-1">
                  Data de Nascimento do Titular <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0 text-purple"><i class="bi bi-calendar-event"></i></span>
                  <input
                    type="date"
                    id="dataNascimento"
                    class="form-control border-start-0 ps-1"
                    v-model="data_nascimento"
                  />
                </div>
              </div>

              <div class="mb-2">
                <label for="numeroBi" class="form-label fw-bold text-sm mb-1">
                  Número do BI / Documento <span class="text-muted fw-normal text-xs">(Opcional)</span>
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0 text-purple"><i class="bi bi-upc-scan"></i></span>
                  <input
                    type="text"
                    id="numeroBi"
                    class="form-control border-start-0 ps-1"
                    v-model="numero_bi"
                    placeholder="Ex: 110100234567M"
                  />
                </div>
              </div>
            </div>

            <!-- ETAPA 3: REVISÃO & CONFIRMAÇÃO -->
            <div v-show="etapaAtual === 3" class="step-animation">
              <!-- Resumo dos dados das etapas anteriores -->
              <div class="resumo-box p-3 rounded-3 mb-3">
                <div class="d-flex align-items-center mb-2">
                  <i class="bi bi-shield-check text-success me-2 fs-5"></i>
                  <strong class="text-dark text-sm">Resumo da Solicitação</strong>
                </div>
                <div class="row g-2 text-xs">
                  <div class="col-6">
                    <span class="text-muted d-block">Solicitante:</span>
                    <strong class="text-dark text-truncate d-block">{{ nome_completo || '-' }}</strong>
                  </div>
                  <div class="col-6">
                    <span class="text-muted d-block">Contacto:</span>
                    <strong class="text-dark d-block">{{ contacto || '-' }}</strong>
                  </div>
                  <div class="col-6">
                    <span class="text-muted d-block">Documento:</span>
                    <strong class="text-purple d-block text-truncate">{{ tipo_documento || '-' }}</strong>
                  </div>
                  <div class="col-6">
                    <span class="text-muted d-block">Nascimento:</span>
                    <strong class="text-dark d-block">{{ data_nascimento || '-' }}</strong>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="localEmissao" class="form-label fw-bold text-sm mb-1">
                  Local da Emissão <span class="text-muted fw-normal text-xs">(Opcional)</span>
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0 text-purple"><i class="bi bi-geo-alt"></i></span>
                  <input
                    type="text"
                    id="localEmissao"
                    class="form-control border-start-0 ps-1"
                    v-model="local_emissao"
                    placeholder="Ex: Maputo, Matola, Beira"
                  />
                </div>
              </div>

              <div class="mb-2">
                <label for="motivo" class="form-label fw-bold text-sm mb-1">
                  Observações / Motivo <span class="text-muted fw-normal text-xs">(Opcional)</span>
                </label>
                <textarea
                  class="form-control"
                  id="motivo"
                  v-model="motivo"
                  rows="2"
                  placeholder="Ex: Documento perdido no transporte público..."
                ></textarea>
              </div>
            </div>
          </form>

          <!-- Alerta de sucesso -->
          <div
            v-if="mensagemSucesso"
            class="alert alert-success mt-2 py-2 px-3 text-sm"
            role="alert"
          >
            {{ mensagemSucesso }}
          </div>
          <!-- Alerta de erro -->
          <div v-if="mensagemErro" class="alert alert-danger mt-2 py-2 px-3 text-sm" role="alert">
            {{ mensagemErro }}
          </div>
        </div>

        <!-- RODAPÉ DE NAVEGAÇÃO ENTRE ETAPAS -->
        <div class="modal-footer border-0 pt-1 pb-3 px-4 d-flex justify-content-between">
          <button
            v-if="etapaAtual === 1"
            type="button"
            class="btn btn-outline-secondary btn-sm mb-0 rounded-pill px-3"
            data-bs-dismiss="modal"
            @click="resetarModal"
          >
            Cancelar
          </button>
          <button
            v-else
            type="button"
            class="btn btn-outline-secondary btn-sm mb-0 rounded-pill px-3"
            @click="voltarEtapa"
          >
            <i class="bi bi-arrow-left me-1"></i> Voltar
          </button>

          <button
            v-if="etapaAtual < 3"
            type="button"
            class="btn btn-purple btn-sm mb-0 rounded-pill px-4 text-white"
            @click="avancarEtapa"
          >
            Continuar <i class="bi bi-arrow-right ms-1"></i>
          </button>
          <button
            v-else
            type="submit"
            form="formSolicitacao"
            class="btn btn-success btn-sm mb-0 rounded-pill px-4 shadow-sm"
            :disabled="enviando"
          >
            <span v-if="enviando" class="spinner-border spinner-border-sm me-1" role="status"></span>
            <i v-else class="bi bi-send-fill me-1"></i>
            Enviar Solicitação
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Componente para exibir informações sobre a nossa equipe -->
  <Nossateam />
  <!-- Componente para exibir o rodapé padrão -->
  <DefaultFooter />
</template>
<style scoped>
/* Multi-step Stepper para Solicitação */
.modal-solicitar-content {
  border-radius: 20px !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2) !important;
  border: 1px solid rgba(128, 0, 128, 0.12) !important;
  overflow: hidden;
}

.stepper-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 10px 14px;
  background: rgba(128, 0, 128, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(128, 0, 128, 0.08);
}

.stepper-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 2;
}

.stepper-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.stepper-item.active .stepper-circle {
  background: #800080;
  color: #ffffff;
  box-shadow: 0 0 0 3px rgba(128, 0, 128, 0.2);
}

.stepper-item.done .stepper-circle {
  background: #66bb6a;
  color: #ffffff;
}

.stepper-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #64748b;
  transition: color 0.3s ease;
}

.stepper-item.active .stepper-label {
  color: #800080;
  font-weight: 700;
}

.stepper-item.done .stepper-label {
  color: #66bb6a;
}

.stepper-line {
  flex: 1;
  height: 2px;
  background: #e2e8f0;
  margin: 0 8px;
  margin-top: -14px;
  transition: background 0.3s ease;
}

.stepper-line.active {
  background: #66bb6a;
}

.step-animation {
  animation: stepFade 0.25s ease-out;
}

@keyframes stepFade {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.resumo-box {
  background: rgba(128, 0, 128, 0.04);
  border: 1px dashed rgba(128, 0, 128, 0.25);
}

.text-purple {
  color: #800080 !important;
}

.btn-purple {
  background: #800080 !important;
  color: #ffffff !important;
  border: none !important;
  transition: all 0.25s ease;
}

.btn-purple:hover {
  background: #6a006a !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(128, 0, 128, 0.25);
}

/* Estilos gerais para outros dispositivos */
.page-header {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
  height: 50vh;
}

/* Media query específica para iPhone SE */
@media (max-width: 375px) and (max-height: 667px) {
  .page-header {
    background-image: url("/src/assets/img/banner2.png") !important; /* Obriga a usar esta imagem */
    height: 50vh; /* Ajusta a altura para 50% da tela */
  }
}
/* Media query específica para iPhone XR E 12 */
@media (max-width: 414px) and (max-height: 896px) {
  .page-header {
    background-image: url("/src/assets/img/banner2.png") !important; /* Obriga a usar esta imagem */
    height: 50vh; /* Ajusta a altura para 50% da tela */
  }
}
/* Media query específica para iPhone  14 PROMAX E PIXEL 7 GALAX S8 , S20*/
@media (max-width: 430px) and (max-height: 932px) {
  .page-header {
    background-image: url("/src/assets/img/banner2.png") !important; /* Obriga a usar esta imagem */
    height: 50vh; /* Ajusta a altura para 50% da tela */
  }
}
/* Media query específica para iPAD MIN*/
@media (max-width: 768px) and (max-height: 1024px) {
  .page-header {
    background-image: url("/src/assets/img/banner2.png") !important; /* Obriga a usar esta imagem */
    height: 50vh; /* Ajusta a altura para 50% da tela */
  }
}
/* Media query específica para iPAD AIR*/
@media (max-width: 820px) and (max-height: 1180px) {
  .page-header {
    background-image: url("/src/assets/img/banner2.png") !important; /* Obriga a usar esta imagem */
    height: 50vh; /* Ajusta a altura para 50% da tela */
  }
}
/* Media query específica para iPAD PRO*/
@media (max-width: 1024px) and (max-height: 1366px) {
  .page-header {
    background-image: url("/src/assets/img/banner2.png") !important; /* Obriga a usar esta imagem */
    height: 50vh; /* Ajusta a altura para 50% da tela */
  }
}
/* Media query específica para SURFACE PRO7 ,DUE, GALAX Z FOLD*/
@media (max-width: 912px) and (max-height: 1368px) {
  .page-header {
    background-image: url("/src/assets/img/banner2.png") !important; /* Obriga a usar esta imagem */
    height: 50vh; /* Ajusta a altura para 50% da tela */
  }
}
/* Media query específica para NEXTHUB*/
@media (max-width: 1280px) and (max-height: 800px) {
  .page-header {
    background-image: url("/src/assets/img/banner2.png") !important; /* Obriga a usar esta imagem */
    height: 50vh; /* Ajusta a altura para 50% da tela */
  }
}

/* Media query específica para MOREP */
@media (max-width: 400px) and (max-height: 645px) {
  .page-header {
    background-image: url("/src/assets/img/banner2.png") !important; /* Obriga a usar esta imagem */
    height: 50vh; /* Ajusta a altura para 50% da tela */
  }
}
/* Media query específica para iPhone SE */
@media (max-width: 400px) and (max-height: 686px) {
  .page-header {
    background-image: url("/src/assets/img/banner2.png") !important; /* Obriga a usar esta imagem */
    height: 50vh; /* Ajusta a altura para 50% da tela */
  }
}

.borda-destacadatxt {
  border: 1px solid #707070;
  border-radius: 5px;
  padding: 10px;
  outline: none;
}

.borda-destacada {
  border: 1px solid #66bb6a;
  border-radius: 5px;
  padding: 10px;
  outline: none;
}

.borda-destacada:focus {
  border-color: #800080;
  /* Roxo */
  box-shadow: 0 0 0 0.2rem rgba(102, 16, 242, 0.25);
}
</style>
