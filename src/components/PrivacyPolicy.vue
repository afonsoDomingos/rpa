<script setup>
import { onMounted, onUnmounted } from "vue";

//example components

import NavbarDefault from "../examples/navbars/NavbarDefault.vue";
import DefaultFooter from "../examples/footers/FooterDefault.vue";

import Nossateam from "../examples/footers/Nossateam.vue";
import Header from "../examples/Header.vue";

//Vue Material Kit 2 components

import Verdocumentos from "@/components/Verdocumentos.vue";
import MaterialSocialButton from "@/components/MaterialSocialButton.vue";

import TermsOption from "../views/LandingPages/components/TermsOption.vue";
// sections

//images
import vueMkHeader from "@/assets/img/banner.png";

import wavesWhite from "@/assets/img/waves-white.svg";
import logoBootstrap from "@/assets/img/logos/bootstrap5.jpg";
import logoTailwind from "@/assets/img/logos/icon-tailwind.jpg";
import logoVue from "@/assets/img/logos/vue.jpg";
import logoAngular from "@/assets/img/logos/angular.jpg";
import logoTechvibe from "@/assets/img/logos/techvibe.jpg";
import logoReact from "@/assets/img/logos/react.jpg";
import logoSketch from "@/assets/img/logos/sketch.jpg";

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

import api from "../api";
import Swal from "sweetalert2";

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

  <section class="py-9">
    <div class="container">
      <div class="row">
        <div class="col-lg-6 my-auto">
          <h3>Política de Privacidade</h3>
          <p class="pe-5">
            Na RecuperaAqui, reconhecemos que perder um documento pode
            significar mais do que um transtorno — pode representar um pedaço de
            identidade, um momento de dor ou confusão. Por isso, nossa missão é
            estender a mão com empatia, responsabilidade e clareza.
          </p>
          <a class="text-success icon-move-right"
            >Ler os Política de Privacidade
            <i class="fas fa-arrow-right text-sm ms-1"></i>
          </a>
        </div>
        <div class="col-lg-6 mt-lg-0 mt-5 ps-lg-0 ps-0">
          <TermsOption
            icon="token"
            content=" <strong>1.Coleta de Dados</strong><br /> Coletamos apenas nome, contacto, tipo e número do <br />  documento, e localização.<br />"
          />
          <TermsOption
            icon="token"
            content="<strong>2.Uso das Informações</strong><br /> Os dados são usados para conectar quem perdeu <br /> com quem encontrou documentos."
          />

          <TermsOption
            icon="token"
            content="<strong>3.Segurança</strong><br />Protegemos seus dados contra acessos indevidos<br />."
          />
          <TermsOption
            icon="token"
            content="<strong>4.Privacidade</strong><br />Não compartilhamos nem vendemos seus dados.<br />
            só são mostrados quando necessário."
          />
          <TermsOption
            icon="token"
            content="<strong>5.Seus Direitos</strong><br /> Você pode corrigir, excluir ou solicitar informações <br /> sobre seus dados."
          />
          <TermsOption
            icon="token"
            content="<strong>6.Alterações</strong><br /> Esta política pode ser atualizada. Fique atento."
          />
          <TermsOption
            icon="token"
            content="<strong>7.Contacto</strong><br /> Dúvidas ou denúncias?
            879642412
            <br />"
          />
        </div>
      </div>
    </div>
  </section>

  <div class="card card-body blur shadow-blur mx-3 mx-md-4 mt-n6">
    <div class="container">
      <div class="row">
        <div class="d-flex flex-column w-100 text-center p-5 mb-8">
          <h3>Parceiros</h3>
          <div class="d-flex justify-content-center mt-3 flex-wrap">
            <a
              href="https://www.facebook.com/profile.php?id=61558461805280"
              data-bs-toggle="tooltip"
              data-bs-placement="bottom"
              title="Bootstrap 5 - Most popular front-end component library"
            >
              <img
                :src="logoBootstrap"
                alt="title"
                loading="lazy"
                :style="{ height: '90px' }"
              />
            </a>

            <a
              href="https://www.facebook.com/profile.php?id=61570930139844&sk=photos"
              class="mx-3"
              data-bs-toggle="tooltip"
              data-bs-placement="bottom"
              title="Vue.js - Is a Progressive JavaScript Framework"
            >
              <img
                :src="logoVue"
                alt="title"
                loading="lazy"
                :style="{ height: '90px' }"
              />
            </a>
            <a
              class="opacity-5"
              href="https://www.facebook.com/Techvibemz/"
              data-bs-toggle="tooltip"
              data-bs-placement="bottom"
              title="Coming Soon"
            >
              <img
                :src="logoTechvibe"
                alt="title"
                loading="lazy"
                :style="{ height: '90px' }"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
    <div class="py-5">
      <div class="container">
        <div class="row">
          <div class="col-lg-5 ms-auto">
            <h4 class="mb-1">Obrigado pelo seu apoio!!</h4>
            <p class="lead mb-0">
              E por transformar este projeto em realidade.
            </p>
          </div>
          <div class="col-lg-5 me-lg-auto my-lg-auto text-lg-end mt-5">
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
    background-image: url("/src/assets/img/banner2.png") !important;
    /* Obriga a usar esta imagem */
    height: 50vh;
    /* Ajusta a altura para 50% da tela */
  }
}

/* Media query específica para iPhone XR E 12 */
@media (max-width: 414px) and (max-height: 896px) {
  .page-header {
    background-image: url("/src/assets/img/banner2.png") !important;
    /* Obriga a usar esta imagem */
    height: 50vh;
    /* Ajusta a altura para 50% da tela */
  }
}

/* Media query específica para iPhone  14 PROMAX E PIXEL 7 GALAX S8 , S20*/
@media (max-width: 430px) and (max-height: 932px) {
  .page-header {
    background-image: url("/src/assets/img/banner2.png") !important;
    /* Obriga a usar esta imagem */
    height: 50vh;
    /* Ajusta a altura para 50% da tela */
  }
}

/* Media query específica para iPAD MIN*/
@media (max-width: 768px) and (max-height: 1024px) {
  .page-header {
    background-image: url("/src/assets/img/banner2.png") !important;
    /* Obriga a usar esta imagem */
    height: 50vh;
    /* Ajusta a altura para 50% da tela */
  }
}

/* Media query específica para iPAD AIR*/
@media (max-width: 820px) and (max-height: 1180px) {
  .page-header {
    background-image: url("/src/assets/img/banner2.png") !important;
    /* Obriga a usar esta imagem */
    height: 50vh;
    /* Ajusta a altura para 50% da tela */
  }
}

/* Media query específica para iPAD PRO*/
@media (max-width: 1024px) and (max-height: 1366px) {
  .page-header {
    background-image: url("/src/assets/img/banner2.png") !important;
    /* Obriga a usar esta imagem */
    height: 50vh;
    /* Ajusta a altura para 50% da tela */
  }
}

/* Media query específica para SURFACE PRO7 ,DUE, GALAX Z FOLD*/
@media (max-width: 912px) and (max-height: 1368px) {
  .page-header {
    background-image: url("/src/assets/img/banner2.png") !important;
    /* Obriga a usar esta imagem */
    height: 50vh;
    /* Ajusta a altura para 50% da tela */
  }
}

/* Media query específica para NEXTHUB*/
@media (max-width: 1280px) and (max-height: 800px) {
  .page-header {
    background-image: url("/src/assets/img/banner2.png") !important;
    /* Obriga a usar esta imagem */
    height: 50vh;
    /* Ajusta a altura para 50% da tela */
  }
}

/* Media query específica para MOREP */
@media (max-width: 400px) and (max-height: 645px) {
  .page-header {
    background-image: url("/src/assets/img/banner2.png") !important;
    /* Obriga a usar esta imagem */
    height: 50vh;
    /* Ajusta a altura para 50% da tela */
  }
}

/* Media query específica para iPhone SE */
@media (max-width: 400px) and (max-height: 686px) {
  .page-header {
    background-image: url("/src/assets/img/banner2.png") !important;
    /* Obriga a usar esta imagem */
    height: 50vh;
    /* Ajusta a altura para 50% da tela */
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
