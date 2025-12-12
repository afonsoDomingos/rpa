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
  <section class="counter-section" id="count-stats">
    <div class="container">
      <div class="counter-grid">
        <div class="counter-item">
          <DefaultCounterCard
            color="success"
            title="Encontrados"
            description="Detalhes"
            :count="documentCount"
            suffix="+"
            :duration="3000"
            class="counter-black"
          />
        </div>
        <div class="counter-item">
          <DefaultCounterCard
            color="success"
            title="Solicitados"
            description="Detalhes"
            :count="solicitacoesCount"
            suffix="+"
            :duration="3000"
            class="counter-black"
          />
        </div>
        <div class="counter-item">
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
  </section>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@900&display=swap");

.counter-section {
  padding: 24px 16px;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.counter-grid {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
  flex-wrap: nowrap;
}

/* Mobile */
@media (max-width: 576px) {
  .counter-section {
    padding: 16px 12px;
  }
  
  .counter-grid {
    gap: 4px;
    max-width: 100%;
  }
}

.counter-item {
  text-align: center;
  flex: 1;
  min-width: 0;
  max-width: 180px;
}

@media (max-width: 576px) {
  .counter-item {
    max-width: 100px;
  }
}

/* Aplica Poppins Black em todos os títulos e contadores dos cards */
.counter-black {
  font-family: "Poppins", sans-serif !important;
  font-weight: 900 !important;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .counter-black {
    font-size: 0.85rem;
  }
}

@media (max-width: 576px) {
  .counter-black {
    font-size: 0.7rem;
  }
}

.counter-black .description {
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .counter-black .description {
    font-size: 0.65rem;
  }
}

@media (max-width: 576px) {
  .counter-black .description {
    font-size: 0.55rem;
  }
}
</style>
