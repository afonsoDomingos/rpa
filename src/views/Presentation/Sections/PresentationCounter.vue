<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import DefaultCounterCard from "../../../examples/cards/counterCards/DefaultCounterCard.vue";

const documentCount = ref(0);
const solicitacoesCount = ref(0);

onMounted(() => {
  axios
    .get("https://apirpa.onrender.com/api/documentos/count")
    .then((response) => {
      documentCount.value = response.data.count;
    })
    .catch((error) =>
      console.error("Erro ao carregar contagem de documentos", error)
    );

  axios
    .get("https://apirpa.onrender.com/api/solicitacoes/count")
    .then((response) => {
      solicitacoesCount.value = response.data.count;
    })
    .catch((error) =>
      console.error("Erro ao carregar contagem de solicitações", error)
    );
});
</script>

<template>
  <section class="pt-3 pb-4" id="count-stats">
    <div class="container">
      <div class="row">
        <div class="col-lg-9 z-index-2 border-radius-xl mx-auto py-3">
          <div class="row">
            <div class="col-md-4 position-relative">
              <DefaultCounterCard
                color="success"
                title="Encontrados"
                description="Detalhes"
                :count="documentCount"
                suffix="+"
                :duration="3000"
                divider="vertical"
                class="counter-black"
              />
            </div>
            <div class="col-md-4 position-relative">
              <DefaultCounterCard
                color="success"
                title="Solicitados"
                description="Detalhes"
                :count="solicitacoesCount"
                suffix="+"
                :duration="3000"
                divider="vertical"
                class="counter-black"
              />
            </div>
            <div class="col-md-4">
              <DefaultCounterCard
                color="success"
                title="Entregues"
                description="Detalhes"
                :count="2"
                :duration="3000"
                class="counter-black"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@900&display=swap");

/* Aplica Poppins Black em todos os títulos e contadores dos cards */

.counter-black {
  font-family: "Poppins", sans-serif !important;
  font-weight: 900 !important; /* Mais grosso */
  font-size: 2rem; /* Aumenta o tamanho do contador */
}
.counter-black .description {
  font-size: 1rem; /* Mantém descrição menor */
}
</style>
