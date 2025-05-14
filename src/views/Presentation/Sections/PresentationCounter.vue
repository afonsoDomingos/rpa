<script setup>
import { ref, onMounted } from 'vue';  // Importar 'ref' e 'onMounted' do Vue
import axios from 'axios';  // Importar axios
import DefaultCounterCard from "../../../examples/cards/counterCards/DefaultCounterCard.vue";

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
  <section class="pt-3 pb-4" id="count-stats">
    <div class="container">
      <div class="row">
        <div class="col-lg-9 z-index-2 border-radius-xl mx-auto py-3">
          <div class="row">
            <div class="col-md-4 position-relative">
              <DefaultCounterCard 
                color="success"
                title="Documentos Encontrados"
                description="Detalhes"
                :count="documentCount" 
                suffix="+"
                :duration="3000"
                divider="vertical"
              />
            </div>
            <div class="col-md-4 position-relative">
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
            <div class="col-md-4">
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
      </div>
    </div>
  </section>
</template>
