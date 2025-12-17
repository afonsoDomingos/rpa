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
import AdCard from "../../components/anunciantes/AdCard.vue";
import MapaDocumentos from "../../components/MapaDocumentos.vue";

import DoacaoProjeto from "../../components/DoacaoProjeto.vue";

import NoticiasList from "../../components/NoticiasList.vue";

//images
import vueMkHeader from "@/assets/img/banner.jpg";

import wavesWhite from "@/assets/img/waves-white.svg";
import logoBootstrap from "@/assets/img/logos/bootstrap5.jpg";
import logoTailwind from "@/assets/img/logos/icon-tailwind.jpg";
import logoVue from "@/assets/img/logos/vue.jpg";
import logoAngular from "@/assets/img/logos/angular.jpg";
import logoTechvibe from "@/assets/img/logos/techvibe.jpg";
import logoReact from "@/assets/img/logos/react.jpg";
import logoSketch from "@/assets/img/logos/sketch.jpg";

const showDoacao = ref(false);

function handleEsc(event) {
  if (event.key === "Escape") showDoacao.value = false;
}

onMounted(() => {
  window.addEventListener("keydown", handleEsc);
});
onUnmounted(() => {
  window.removeEventListener("keydown", handleEsc);
});

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

  // Validação adicional
  if (!data_nascimento.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Atenção',
      text: 'Por favor, preencha a data de nascimento.',
      confirmButtonColor: '#800080'
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

  <!-- Botão flutuante de doação com ícone e tooltip -->
  <button
    class="btn-doacao-flutuante"
    @click="showDoacao = true"
    :aria-pressed="showDoacao"
    aria-label="Apoie o Projeto"
    title="Apoie o Projeto"
  >
    <i class="bi bi-heart-fill icon-heart"></i>
  </button>

  <!-- Botão flutuante de Comunidade -->
  <button
    class="btn-comunidade-flutuante"
    @click="irParaComunidade"
    aria-label="Ir para Comunidade"
    title="Comunidade"
  >
    <i class="bi bi-people-fill icon-community"></i>
  </button>

  <!-- Modal de doação -->
  <transition name="fade">
    <div
      v-if="showDoacao"
      class="doacao-modal-bg"
      @click.self="showDoacao = false"
      tabindex="-1"
      aria-modal="true"
      role="dialog"
    >
      <div class="doacao-modal-content" ref="modalContent" tabindex="0">
        <button
          class="btn-fechar"
          @click="showDoacao = false"
          aria-label="Fechar janela de doação"
          title="Fechar"
        >
          &times;
        </button>
        <div
          class="modal-instruction mb-2 text-muted"
          style="font-size: 0.98rem"
        >
          Clique fora da janela ou pressione <b>ESC</b>.
        </div>
        <DoacaoProjeto />
      </div>
    </div>
  </transition>
  <FloatingDocs />
  <AdCard />

  <Header>
    <div
      class="page-header min-vh-75"
      :style="`background-image: url(${vueMkHeader})`"
      fetchpriority="high"
    >
      <div class="container">
        <!-- Conteúdo removido conforme solicitado -->
      </div>
    </div>
  </Header>

  <div
    class="card card-body blur shadow-blur mx-3 mx-md-4 mt-n6 gradient-background"
  >


    <!-- Componente para Exibir Documentos -->
    <Verdocumentos />

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
                  <img :src="logoBootstrap" alt="Bootstrap" width="100" height="70" loading="lazy" />
                </a>
              </div>
              <div class="partner-slide">
                <a href="https://www.facebook.com/profile.php?id=61570930139844&sk=photos" target="_blank" rel="noopener">
                  <img :src="logoVue" alt="Vue.js" width="100" height="70" loading="lazy" />
                </a>
              </div>
              <div class="partner-slide">
                <a href="https://www.facebook.com/Techvibemz/" target="_blank" rel="noopener">
                  <img :src="logoTechvibe" alt="Techvibe" width="100" height="70" loading="lazy" />
                </a>
              </div>

              <!-- Duplicados para efeito infinito -->
              <div class="partner-slide">
                <a href="https://www.facebook.com/profile.php?id=61558461805280" target="_blank" rel="noopener">
                  <img :src="logoBootstrap" alt="Bootstrap" width="100" height="70" loading="lazy" />
                </a>
              </div>
              <div class="partner-slide">
                <a href="https://www.facebook.com/profile.php?id=61570930139844&sk=photos" target="_blank" rel="noopener">
                  <img :src="logoVue" alt="Vue.js" width="100" height="70" loading="lazy" />
                </a>
              </div>
              <div class="partner-slide">
                <a href="https://www.facebook.com/Techvibemz/" target="_blank" rel="noopener">
                  <img :src="logoTechvibe" alt="Techvibe" width="100" height="70" loading="lazy" />
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
  width: calc(180px * 6); /* Largura total = largura do slide * total de slides (original + duplicado) */
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
  100% { transform: translateX(calc(-180px * 3)); } /* Move metade da largura total */
}

/* Ajuste do rodapé para não ficar enorme no mobile */
@media (max-width: 600px) {
  .partner-slide {
    width: 140px; /* Menor no mobile */
  }
  .partners-track {
    width: calc(140px * 6);
    animation: scroll 15s linear infinite; /* Mais rápido no mobile */
  }
  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(calc(-140px * 3)); }
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

@media (max-width: 600px) {
  .btn-doacao-flutuante {
    top: auto !important;
    bottom: 78px !important;
    right: 18px !important;
    left: auto !important;
  }
}

.btn-comunidade-flutuante {
  position: fixed;
  top: 90px;
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
  padding: 0;
}
.btn-comunidade-flutuante:hover {
  background: white;
  color: #111;
  border: 1px solid #111;
  transform: scale(1.13);
}
.btn-comunidade-flutuante:hover {
  background: linear-gradient(135deg, #6610f2 60%, #800080 100%);
  transform: scale(1.07);
  color: white;
}
.icon-community {
    font-size: 1.2rem;
    line-height: 1;
}

@media (max-width: 600px) {
  .btn-comunidade-flutuante {
    top: auto !important;
    bottom: 120px !important;
    right: 18px !important;
    left: auto !important;
  }
}
</style>
