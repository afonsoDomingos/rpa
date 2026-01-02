<script setup>
import DefaultInfoCard from "../../../../examples/cards/infoCards/DefaultInfoCard.vue";
import aiesecAward from "@/assets/img/achievements/aiesec-award.jpg";
import nhluvukoCert from "@/assets/img/achievements/nhluvuko-certificate.jpg";
</script>

<template>
  <section class="py-5 bg-gray-100">
    <div class="container">
      <div class="row text-center mb-5">
        <div class="col-12">
          <h3 class="text-purple display-5 font-weight-bold">Reconhecimentos e Conquistas</h3>
          <p class="lead text-muted">Marcos que reafirmam nosso compromisso com a inovação em Moçambique.</p>
        </div>
      </div>

      <!-- AIESEC Achievement -->
      <div class="row align-items-center mb-7">
        <div class="col-lg-6 order-2 order-lg-1">
          <div class="p-3">
            <div class="d-flex align-items-center mb-3">
              <span class="badge bg-success me-2">Prémio</span>
              <h4 class="mb-0 text-purple">1º Lugar - Fórum de Projetos AIESEC</h4>
            </div>
            <p class="text-dark">
              A RPA Moçambique, liderada por Afonso Domingos, alcançou o topo do pódio no prestigiado Fórum de Projetos da AIESEC. Este reconhecimento destaca a nossa plataforma como uma das soluções digitais mais promissoras de Moçambique, focada no impacto social e na resolução de problemas reais enfrentados pelos cidadãos.
            </p>
            <div class="mt-4">
              <div class="d-flex align-items-center mb-2">
                <i class="material-icons-round text-success me-2">check_circle</i>
                <span>Inovação Tecnológica Premiada</span>
              </div>
              <div class="d-flex align-items-center mb-2">
                <i class="material-icons-round text-success me-2">check_circle</i>
                <span>Reconhecimento pelo Impacto Social</span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-6 order-1 order-lg-2 mb-4 mb-lg-0">
          <div class="image-wrapper shadow-lg rounded-4 overflow-hidden">
            <img :src="aiesecAward" alt="Afonso Domingos recebendo prémio AIESEC RPA Moçambique" class="img-fluid achievement-img">
          </div>
        </div>
      </div>

      <!-- Nhluvuko Project -->
      <div class="row align-items-center">
        <div class="col-lg-6 mb-4 mb-lg-0">
          <div class="image-wrapper shadow-lg rounded-4 overflow-hidden">
            <img :src="nhluvukoCert" alt="Certificação Projecto Nhluvuko GAPI MOZAL RPA Moçambique" class="img-fluid achievement-img">
          </div>
        </div>
        <div class="col-lg-6 ps-lg-5">
          <div class="p-3">
            <div class="d-flex align-items-center mb-3">
              <span class="badge bg-info me-2">Capacitação</span>
              <h4 class="mb-0 text-purple">Gestão de Negócios (GAPI & MOZAL)</h4>
            </div>
            <p class="text-dark">
              A participação na 8ª capacitação do Projecto Nhluvuko foi um passo estratégico para consolidar a nossa gestão. O apoio da GAPI e MOZAL permitiu fortalecer as bases do nosso empreendedorismo, garantindo que o Recupera Aqui cresça de forma sustentável e inclusiva, impactando positivamente as comunidades de Matola e Boane.
            </p>
            <div class="mt-4">
              <div class="d-flex align-items-center mb-2">
                <i class="material-icons-round text-info me-2">trending_up</i>
                <span>Gestão Estratégica e Sustentável</span>
              </div>
              <div class="d-flex align-items-center mb-2">
                <i class="material-icons-round text-info me-2">trending_up</i>
                <span>Foco no Empreendedorismo de Impacto</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.text-purple {
  color: #800080 !important;
}

.achievement-img {
  transition: transform 0.5s ease;
  width: 100%;
  height: auto;
  display: block;
}

.image-wrapper:hover .achievement-img {
  transform: scale(1.05);
}

.image-wrapper {
  background: #000;
  border: 4px solid #fff;
}

.badge {
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 1px;
}

.rounded-4 {
  border-radius: 1.5rem !important;
}

.mb-7 {
  margin-bottom: 5rem !important;
}

@media (max-width: 991px) {
  .mb-7 {
    margin-bottom: 3rem !important;
  }
}
</style>
