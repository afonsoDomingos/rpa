<script setup>
import DefaultReviewCard from "@/examples/cards/reviewCards/DefaultReviewCard.vue";
</script>
<template>
  <section class="py-5 font-poppins">
    <div class="container">
      <div class="row">
        <div class="col-lg-6 mx-auto text-center">
          <h2 class="mb-1 text-dark font-weight-bold">Depoimentos</h2>
          <p class="lead text-muted">
            O impacto real na vida das pessoas.
          </p>
        </div>
      </div>
      <div class="row mt-4">
        <DefaultReviewCard
          name="João Matusse"
          date="1 dia atrás"
          review='"Recuperei meu BI em 24h. Serviço incrível!"'
          :rating="5.0"
        />
        <DefaultReviewCard
          class="ms-md-auto"
          color="bg-gradient-success"
          name="Ana Cossa"
          date="1 semana atrás"
          review='"Encontrei uma carta e contactei o dono na hora. Muito fácil."'
          :rating="5.0"
        />

        <DefaultReviewCard
          name="Carlos Sitoe"
          date="3 semanas atrás"
          review='"Recuperei meu passaporte antes da viagem. Recomendo!"'
          :rating="5.0"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");

.font-poppins {
  font-family: "Poppins", sans-serif !important;
}

.font-poppins :deep(*) {
  font-family: "Poppins", sans-serif !important;
}

h2 {
  color: #344767;
}
</style>
