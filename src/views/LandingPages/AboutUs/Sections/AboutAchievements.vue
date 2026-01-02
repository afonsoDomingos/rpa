<script setup>
import DefaultInfoCard from "../../../../examples/cards/infoCards/DefaultInfoCard.vue";
</script>
<template>
  <section class="py-5">
    <div class="container">
      <div class="row">
        <div class="col-lg-12">
          <h3 class="mb-5 text-purple text-center">Reconhecimentos e Conquistas</h3>
          <div class="row">
            <div class="col-md-6">
              <DefaultInfoCard
                color="success"
                icon="emoji_events"
                title="1º Lugar - Fórum de Projetos AIESEC"
                description="A RPA Moçambique, apresentada por Afonso Domingos, conquistou o 1º lugar no Fórum de Projetos da AIESEC. A plataforma foi reconhecida pela sua inovação e impacto social no desenvolvimento de tecnologias que melhoram a vida das pessoas."
              />
            </div>
            <div class="col-md-6">
              <DefaultInfoCard
                color="success"
                icon="business_center"
                title="Projecto Nhluvuko (GAPI & MOZAL)"
                description="Participação na 8ª capacitação em Gestão de Negócios do Projecto Nhluvuko. Uma iniciativa que fortalece o empreendedorismo em Matola e Boane, reafirmando nosso compromisso com o empoderamento de jovens e mulheres empreendedoras."
              />
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
  font-weight: 700;
}
</style>
