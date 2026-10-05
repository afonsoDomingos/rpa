<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";

const router = useRouter();
const irParaComunidade = () => {
  router.push({ name: 'ComunidadeRpa' });
};

//example components
import NavbarDefault from "../../examples/navbars/NavbarDefault.vue";
import DefaultFooter from "../../examples/footers/FooterDefault.vue";
import Nossateam from "../../examples/footers/Nossateam.vue";
import Header from "../../examples/Header.vue";
import FilledInfoCard from "../../examples/cards/infoCards/FilledInfoCard.vue";

//Vue Material Kit 2 components
//import Guardardocumentos from '@/components/Guardardocumentos.vue'
import Verdocumentos from "@/components/Verdocumentos.vue";
import MaterialSocialButton from "@/components/MaterialSocialButton.vue";

// sections
import PresentationCounter from "./Sections/PresentationCounter.vue";
import setPopover from "./Sections/popover.vue";
import PresentationPages from "./Sections/PresentationPages.vue";
import PresentationExample from "./Sections/PresentationExample.vue";
import data from "./Sections/Data/designBlocksData";
import BuiltByDevelopers from "./Components/BuiltByDevelopers.vue";


// CORRETO
import FloatingDocs from "../../components/FloatingDocs.vue";
import AdCard from "../../components/anunciantes/AdCard.vue";
import MapaDocumentos from "../../components/MapaDocumentos.vue";

import DoacaoProjeto from "../../components/DoacaoProjeto.vue";

import NoticiasList from "../../components/NoticiasList.vue";
import GoogleAd from "../../components/GoogleAd.vue";

//images
import vueMkHeader from "@/assets/img/banner.webp";

import wavesWhite from "@/assets/img/waves-white.svg";
import logoBootstrap from "@/assets/img/logos/rpa.png";
import logoTailwind from "@/assets/img/logos/icon-tailwind.jpg";
import logoVue from "@/assets/img/logos/payboom.png";
import logoAngular from "@/assets/img/logos/angular.jpg";
import logoTechvibe from "@/assets/img/logos/techvibe.png";
import logoMafin from "@/assets/img/logos/madfin.png";
import logoSketch from "@/assets/img/logos/sketch.jpg";

// Lógica global movida para App.vue

import eventBus from "@/eventBus";

//hooks
const body = document.getElementsByTagName("body")[0];
onMounted(() => {
  body.classList.add("presentation-page");
  body.classList.add("bg-gray-200");

  eventBus.on("preencherSolicitacao", (doc) => {
    if (doc) {
      if (doc.nome_completo) nome_completo.value = doc.nome_completo;
      if (doc.tipo_documento) tipo_documento.value = doc.tipo_documento;
      if (doc.numero_documento) numero_bi.value = doc.numero_documento;
    }
    etapaAtual.value = 1;
  });
});
onUnmounted(() => {
  body.classList.remove("presentation-page");
  body.classList.remove("bg-gray-200");
  eventBus.off("preencherSolicitacao");
});

import api from "../../api";

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
  // Validações completas de segurança
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

    // Limpar os campos após envio
    nome_completo.value = "";
    contacto.value = "";
    tipo_documento.value = "";
    motivo.value = "";
    afiliacao.value = "";
    local_emissao.value = "";
    data_nascimento.value = "";
    numero_bi.value = "";
    etapaAtual.value = 1;

    // Fechar modal
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

  <FloatingDocs />
  <FloatingDocs />
  <AdCard />

  <Header>
    <div
      class="page-header min-vh-75"
      :style="`background-image: url(${vueMkHeader})`"
      fetchpriority="high"
    >
      <div class="container">
        <div class="row">
          <div class="col-lg-7 text-center mx-auto">
            <h1 class="text-white pt-3 mt-n5 visually-hidden">RPA Moçambique (Recupera Aqui) - Recuperação de Documentos Perdidos e Achados</h1>
            <p class="lead text-white mt-3 visually-hidden">A RPA Moçambique é a plataforma líder para encontrar seu Bilhete de Identidade, Passaporte e outros documentos perdidos.</p>
          </div>
        </div>
      </div>
    </div>
  </Header>

  <div
    class="card card-body blur shadow-blur mx-3 mx-md-4 mt-n6 gradient-background"
  >


    <!-- Componente para Exibir Documentos -->
    <Verdocumentos />

    <!-- Google AdSense - Bloco Fixo no Conteúdo para evitar violação -->
    <div class="container py-3">
      <div class="row">
        <div class="col-12 text-center">
          <GoogleAd adSlot="0987654321" />
        </div>
      </div>
    </div>

    <!-- <Guardardocumentos />-->
    <!-- Componente para Contador de Apresentação -->
    <PresentationCounter />
    <div class="py-5">
      <!-- Componente para exibir o rodapé padrão -->
      <MapaDocumentos />
    </div>
    <!-- Componente para Definir Popover (ajuda contextual ou informações extras ao interagir com elementos) -->
    <setPopover />
    <!-- Componente para Exibir Informações de Apresentação -->
    <PresentationInformation />

    <!-- Seção de Depoimentos Movida para baixo -->
    <!-- <PresentationTestimonials /> (Removido) -->

    <div class="container mobile-compact-section">
      <div class="row">
        <div class="d-flex flex-column w-100 text-center p-3 mb-4">
          <h3 class="mb-3">Parceiros</h3>
          
          <!-- Carrossel Infinito de Parceiros -->
          <div class="partners-carousel">
            <div class="partners-track">
              <!-- Logos Originais -->
              <div class="partner-slide">
                <a href="https://www.facebook.com/profile.php?id=61558461805280" target="_blank" rel="noopener">
                  <img :src="logoBootstrap" alt="Bootcamp RPA - Parceiro Recupera Aqui Moçambique" width="100" height="70" loading="lazy" />
                </a>
              </div>
              <div class="partner-slide">
                <a href="https://www.facebook.com/profile.php?id=61570930139844&sk=photos" target="_blank" rel="noopener">
                  <img :src="logoVue" alt="Payboom - Sistema de Pagamentos Parceiro Recupera Aqui" width="100" height="70" loading="lazy" />
                </a>
              </div>
              <div class="partner-slide">
                <a href="https://www.facebook.com/Techvibemz/" target="_blank" rel="noopener">
                  <img :src="logoTechvibe" alt="Techvibe - Desenvolvimento de Software Parceiro" width="100" height="70" loading="lazy" />
                </a>
              </div>


               <div class="partner-slide">
                <a href="http://madfin.vercel.app/" target="_blank" rel="noopener">
                  <img :src="logoMafin" alt="Madfin - Consultoria Financeira Parceiro Recupera Aqui" width="100" height="70" loading="lazy" />
                </a>
              </div>

              <!-- Duplicados para efeito infinito -->
              <div class="partner-slide">
                <a href="https://www.facebook.com/profile.php?id=61558461805280" target="_blank" rel="noopener">
                  <img :src="logoBootstrap" alt="Bootcamp RPA - Parceiro Recupera Aqui" width="100" height="70" loading="lazy" />
                </a>
              </div>
              <div class="partner-slide">
                <a href="https://www.facebook.com/profile.php?id=61570930139844&sk=photos" target="_blank" rel="noopener">
                  <img :src="logoVue" alt="Payboom - Parceiro Recupera Aqui" width="100" height="70" loading="lazy" />
                </a>
              </div>
              <div class="partner-slide">
                <a href="https://www.facebook.com Techvibemz/" target="_blank" rel="noopener">
                   <img :src="logoTechvibe" alt="Techvibe - Parceiro" width="100" height="70" loading="lazy" />
                </a>
              </div>
               <div class="partner-slide">
                <a href="http://madfin.vercel.app/" target="_blank" rel="noopener">
                  <img :src="logoMafin" alt="Madfin - Parceiro" width="100" height="70" loading="lazy" />
                </a>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>

    <div class="py-3 mobile-compact-section">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-5 ms-auto text-center text-lg-start mb-3 mb-lg-0">
            <h4 class="mb-1">Obrigado pelo seu apoio!!</h4>
            <p class="lead mb-0 text-sm">
              E por transformar este projeto em realidade.
            </p>
          </div>
          <div class="col-lg-5 me-lg-auto text-center text-lg-end">
            <MaterialSocialButton
              route="https://www.linkedin.com/in/afonso-domingos-6b59361a5/"
              component="linkedin"
              color="linkedin"
              label="linkedin"
            />
            <MaterialSocialButton
              route="https://www.facebook.com/profile.php?id=61570930139844&sk=photos"
              component="facebook"
              color="facebook"
              label="facebook"
            />
            <MaterialSocialButton
              route="https://docs.google.com/forms/d/e/1FAIpQLSdLO0mga6ygr6oVlCHQ6Hgt48baiZuQlXTzPRYynhXv0etD3g/viewform"
              component="dribbble"
              color="dribbble"
              label="Recupera Aqui"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Fechamento da div card -->

  <div>
    <NoticiasList />
  </div>

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

  <DefaultFooter />
</template>
<style scoped>
.gradient-background {
  background: linear-gradient(
    180deg,
    #f4dffd 15%,
    #f4dee1 25%,
    #fcfcc6 35%,
    #f8f9fa 45%,
    #ffffff 90%
  );
  background-size: 100% 200%; /* Dobra a altura para animar o gradiente */
  animation: gradientMove 13s ease infinite;
}
@keyframes gradientMove {
  0% {
    background-position: top;
  }
  70% {
    background-position: bottom;
  }
  100% {
    background-position: top;
  }
}
/* Estilos gerais para outros dispositivos */
.page-header {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
  height: 50vh;
}

/* Otimização Mobile e Tablets unificada */
@media (max-width: 991px) {
  .page-header {
    background-image: url("/src/assets/img/banner2.png") !important;
    height: 40vh; /* Altura reduzida para mobile */
  }

  /* Reduz margens negativas e paddings excessivos no mobile */
  .card.card-body {
    margin-top: -40px !important; /* Puxa o cartão mais para cima */
    padding-top: 2rem !important;
    padding-bottom: 2rem !important;
    margin-left: 10px !important;
    margin-right: 10px !important;
  }
  
  .py-5 {
    padding-top: 1.5rem !important;
    padding-bottom: 1.5rem !important;
  }
  
  .mobile-compact-section {
    padding-bottom: 1rem !important;
  }
    
  .min-vh-75 {
    min-height: 40vh !important;
  }
}

/* Carrossel Infinito de Parceiros */
.partners-carousel {
  overflow: hidden;
  width: 100%;
  position: relative;
  padding: 10px 0;
}

.partners-track {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  width: calc(180px * 8); /* Largura total = largura do slide * total de slides (4 originais + 4 duplicados) */
  animation: scroll 20s linear infinite;
}

.partner-slide {
  width: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.partner-slide img {
  height: 70px; /* Tamanho controlado para mobile e desktop */
  width: auto;
  max-width: 100%;
  object-fit: contain;
  opacity: 0.8;
  transition: transform 0.3s ease, opacity 0.3s;
}

.partner-slide img:hover {
  opacity: 1;
  transform: scale(1.2);
}

@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(calc(-180px * 4)); } /* Move metade da largura total (4 itens) */
}

/* Ajuste do rodapé para não ficar enorme no mobile */
@media (max-width: 600px) {
  .partner-slide {
    width: 140px; /* Menor no mobile */
  }
  .partners-track {
    width: calc(140px * 8);
    animation: scroll 15s linear infinite; /* Mais rápido no mobile */
  }
  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(calc(-140px * 4)); }
  }
}


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

.btn-doacao-flutuante {
  position: fixed;
  top: 48px;
  right: 18px;
  z-index: 1050;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  box-shadow: 0 2px 12px #0002;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.2s;
  padding: 10;
}
.btn-doacao-flutuante:hover {
  background: #fff;
  color: #111;
  border: 1px solid #111;
  transform: scale(1.13);
}
.icon-heart {
  font-size: 1.2rem;
  line-height: 1;
  /* cor do coração segue a cor do botão */
}
.btn-doacao-flutuante:hover {
  background: linear-gradient(135deg, #198754 60%, #800080 100%);
  transform: scale(1.07);
}

.doacao-modal-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 20000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.doacao-modal-content {
  background: #fff;
  border-radius: 18px;
  padding: 2.2rem 1.5rem 1.5rem 1.5rem;
  min-width: 320px;
  max-width: 95vw;
  box-shadow: 0 6px 32px #80008022;
  position: relative;
  animation: modalPop 0.25s;
}
@keyframes modalPop {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.btn-fechar {
  position: absolute;
  top: 10px;
  right: 16px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #800080;
  cursor: pointer;
  z-index: 10;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}


</style>
