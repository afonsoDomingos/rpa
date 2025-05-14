<script setup>

import { ref, onMounted } from 'vue';  // Importar 'ref' e 'onMounted' do Vue
// example component
import axios from 'axios';  // Importar axios
import DefaultCounterCard from "../../../../examples/cards/counterCards/DefaultCounterCard.vue";


// Variável reativa para armazenar a contagem de documentos
const documentCount = ref(0);           // Documentos encontrados
const solicitacoesCount = ref(0);       // Solicitações
// Função para buscar a contagem de documentos da API
onMounted(() => {
  // Requisição para pegar a contagem dos documentos
  axios.get('https://apirpa.onrender.com/api/documentos/count')
    .then(response => {
      documentCount.value = response.data.count;  // Atualiza a contagem com o valor da resposta
    })
    .catch(error => {
      console.error('Erro ao carregar contagem de documentos', error);  // Log de erro
    });


     // Requisição para pegar a contagem dos documentos
  axios.get('https://apirpa.onrender.com/api/solicitacoes/count')
    .then(response => {
      solicitacoesCount.value = response.data.count;  // Atualiza a contagem com o valor da resposta
    })
    .catch(error => {
      console.error('Erro ao carregar contagem de documentos', error);  // Log de erro
    });
    
});
</script>
<template>
  <section class="pt-4 pb-6" id="count-stats">
    <div class="container">
      <div class="row mb-7">
        <div class="col-lg-2 col-md-4 col-6 mb-4">
          <img
            class="w-100 opacity-7"
            src="@/assets/img/logos/gray-logos/pay.jpg"
            alt="logo"
          />
        </div>
        <div class="col-lg-2 col-md-4 col-6 mb-4">
          <img
            class="w-100 opacity-7"
            src="@/assets/img/logos/gray-logos/pay.jpg"
            alt="logo"
          />
        </div>
        <div class="col-lg-2 col-md-4 col-6 mb-4">
          <img
            class="w-100 opacity-7"
            src="@/assets/img/logos/gray-logos/pay.jpg"
            alt="logo"
          />
        </div>
        <div class="col-lg-2 col-md-4 col-6 mb-4">
          <img
            class="w-100 opacity-7"
            src="@/assets/img/logos/gray-logos/pay.jpg"
            alt="logo"
          />
        </div>
        <div class="col-lg-2 col-md-4 col-6 mb-4">
          <img
            class="w-100 opacity-7"
            src="@/assets/img/logos/gray-logos/pay.jpg"
            alt="logo"
          />
        </div>
        <div class="col-lg-2 col-md-4 col-6 mb-4">
          <img
            class="w-100 opacity-7"
            src="@/assets/img/logos/gray-logos/pay.jpg"
            alt="logo"
          />
        </div>
      </div>
      <div class="row justify-content-center text-center">
        <div class="col-md-3">
          <DefaultCounterCard 
                color="success"
                title="Documentos Encontrados1"
                description="Detalhes"
                :count="documentCount" 
                suffix="+"
                :duration="3000"
                divider="vertical"
              />
        </div>
        <div class="col-md-3">
         <DefaultCounterCard
                color="success"
                title="Documentos Solicitados"
                description="Detalhes"
                :count="solicitacoesCount"
                suffix="+"
                :duration="3000"
                divider="vertical"
              />
        </div>
        <div class="col-md-3">
          <DefaultCounterCard
                color="success"
                title="Documentos Entregues"
                description="Detalhes"
                :count="2"
                :duration="3000"
              />
        </div>
      </div>
    </div>
  </section>
</template>
