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
import vueMkHeader from "@/assets/img/banner.png";

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

// Função de validação do nome completo
const validarNome = () => {
  const nomeRegex = /^[A-Za-zÀ-ÿ\s]+$/;
  if (!nome_completo.value) {
    nomeError.value = "O nome é obrigatório.";
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
    contactoError.value =
      "O contacto deve conter 9 dígitos e começar com 84, 85, 86, 87 ou 83.";
    return false;
  }
  contactoError.value = "";
  return true;
};

// Função para enviar a solicitação
const solicitarDocumento = async () => {
  // Validações
  if (!validarNome() || !validarContacto()) {
    return; // Não prossegue se alguma validação falhar
  }

  // Validação adicional (por exemplo, para data de nascimento)
  if (!data_nascimento.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Campo obrigatório',
      text: "Por favor, preencha a data de nascimento."
    });
    return;
  }

  // Montar os dados para a solicitação
  const solicitacao = {
    nome_completo: nome_completo.value,
    contacto: contacto.value,
    tipo_documento: tipo_documento.value,
    motivo: motivo.value,
    afiliacao: afiliacao.value, // Campo opcional
    local_emissao: local_emissao.value, // Campo opcional
    data_nascimento: data_nascimento.value, // Campo obrigatório
    numero_bi: numero_bi.value, // Campo opcional
  };

  try {
    // Envia os dados para a API
    const response = await api.post("/solicitacoes", solicitacao);
    console.log("Solicitação enviada com sucesso:", response.data);
    mensagemSucesso.value = "✅ Solicitação enviada! Aguarde nosso contacto.";
    mensagemErro.value = ""; // limpa erro anterior, se houver

    // Limpar os campos após envio
    nome_completo.value = "";
    contacto.value = "";
    tipo_documento.value = "";
    motivo.value = "";
    afiliacao.value = "";
    local_emissao.value = "";
    data_nascimento.value = "";
    numero_bi.value = "";
  } catch (error) {
    console.error("Erro ao enviar a solicitação:", error);
    mensagemErro.value =
      "❌ Ocorreu um erro ao enviar a solicitação. Tente novamente.";
    mensagemSucesso.value = ""; // limpa mensagem anterior de sucesso
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
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Solicitar</h5>
          <MaterialButton
            color="none"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></MaterialButton>
        </div>
        <div class="modal-body">
          <!-- Formulário de solicitação -->
          <form id="formSolicitacao" @submit.prevent="solicitarDocumento">
            <div class="mb-3">
              <label for="nomeSolicitante" class="form-label fw-bold"
                >Nome Completo</label
              >
              <input
                type="text"
                id="nomeSolicitante"
                class="form-control zoom-field borda-destacada"
                v-model="nome_completo"
                placeholder="Ex: João Silva"
                maxlength="50"
                required
              />
              <div v-if="nomeError" class="text-warning visible">
                {{ nomeError }}
              </div>
            </div>
            <div class="mb-3">
              <label for="tipoDocumento" class="form-label fw-bold"
                >Tipo de Documento</label
              >
              <select
                id="tipoDocumento"
                class="form-select zoom-field"
                v-model="tipo_documento"
                required
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

            <div class="mb-3">
              <label for="contato" class="form-label fw-bold">Contacto</label>
              <input
                type="tel"
                id="contato"
                class="form-control zoom-field borda-destacada"
                v-model="contacto"
                placeholder="Ex: 84 123 4567"
                maxlength="9"
                required
              />
              <div v-if="contactoError" class="text-warning visible">
                {{ contactoError }}
              </div>
            </div>

            <!-- Campo: Afiliação (Opcional) -->
            <div class="col-md-12 mb-3">
              <label for="afiliacao" class="form-label fw-bold"
                >Afiliação</label
              >
              <input
                type="text"
                id="afiliacao"
                class="form-control borda-destacada"
                v-model="afiliacao"
                placeholder="Ex: Pai ou Mãe"
              />
            </div>

            <!-- Campo: Local da Emissão (Opcional) -->
            <div class="col-md-12 mb-3">
              <label for="localEmissao" class="form-label fw-bold"
                >Local da Emissão</label
              >
              <input
                type="text"
                id="localEmissao"
                class="form-control borda-destacada"
                v-model="local_emissao"
                placeholder="Ex: Maputo"
              />
            </div>

            <!-- Campo: Data de Nascimento (Obrigatório) -->
            <div class="col-md-12 mb-3">
              <label for="dataNascimento" class="form-label fw-bold"
                >Data de Nascimento</label
              >
              <input
                type="date"
                id="dataNascimento"
                class="form-control"
                v-model="data_nascimento"
                required
              />
            </div>

            <!-- Campo: Número de BI (Opcional) -->
            <div class="col-md-12 mb-3">
              <label for="numeroBi" class="form-label fw-bold"
                >Número do BI</label
              >
              <input
                type="text"
                id="numeroBi"
                class="form-control borda-destacada"
                v-model="numero_bi"
                placeholder="Ex: 123456789LA045"
              />
            </div>

            <div class="mb-3">
              <label for="motivo" class="form-label fw-bold"
                >Motivo da solicitação</label
              >
              <textarea
                class="form-control borda-destacadatxt"
                id="motivo"
                v-model="motivo"
                rows="3"
                placeholder="Explique por que está solicitando este documento (opcional)"
              ></textarea>
            </div>
          </form>
          <!-- Alerta de sucesso -->
          <div
            v-if="mensagemSucesso"
            class="alert alert-success mt-3"
            role="alert"
          >
            {{ mensagemSucesso }}
          </div>
          <!-- Alerta de erro -->
          <div v-if="mensagemErro" class="alert alert-danger mt-3" role="alert">
            {{ mensagemErro }}
          </div>
        </div>
        <div class="modal-footer justify-content-between">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            Cancelar
          </button>
          <button type="submit" class="btn btn-success" form="formSolicitacao">
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
