<template>
  <div class="mapa-container">
    <div id="mapa" class="mapa"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const documentos = ref([]);
const mapa = ref(null);
const marcadores = ref([]); // guardar marcadores para poder limpar

// Coordenadas aproximadas para as províncias de Moçambique
const coordenadasProvincias = {
  "Maputo": [-25.9655, 32.5832],
  "Maputo Cidade": [-25.9653, 32.5892],
  "Gaza": [-24.75, 33.0],
  "Inhambane": [-23.87, 35.38],
  "Sofala": [-19.0, 34.85],
  "Manica": [-19.15, 33.45],
  "Tete": [-16.17, 33.6],
  "Zambézia": [-17.83, 36.9],
  "Nampula": [-15.13, 39.27],
  "Niassa": [-13.28, 36.55],
  "Cabo Delgado": [-12.3, 40.5],
};

// Função para limpar marcadores antigos do mapa
const limparMarcadores = () => {
  marcadores.value.forEach((marker) => marker.remove());
  marcadores.value = [];
};

// Função para buscar documentos e popular o mapa
const carregarDocumentos = async () => {
  try {
    const response = await api.get("/documentos");
    documentos.value = response.data;

    limparMarcadores();

    // Contar por província
    const contagem = {};
    documentos.value.forEach((doc) => {
      if (doc.provincia) {
        contagem[doc.provincia] = (contagem[doc.provincia] || 0) + 1;
      }
    });

    // Adicionar marcadores
    Object.entries(contagem).forEach(([provincia, qtd]) => {
      if (coordenadasProvincias[provincia]) {
        const marker = L.circleMarker(coordenadasProvincias[provincia], {
          radius: 10 + qtd,
          color: "blue",
          fillColor: "#007bff",
          fillOpacity: 0.5,
        });

        marker.bindPopup(`<b>${provincia}</b><br>${qtd} documentos perdidos`);
        marker.addTo(mapa.value);
        marcadores.value.push(marker);
      }
    });
  } catch (error) {
    console.error("Erro ao carregar documentos:", error);
  }
};

onMounted(() => {
  mapa.value = L.map("mapa").setView([-18.6657, 35.5296], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  }).addTo(mapa.value);

  carregarDocumentos();
});

// Exporta função para que o componente pai possa chamar e atualizar o mapa
defineExpose({
  refreshMapa: carregarDocumentos,
});
</script>

<style scoped>
.mapa-container {
  width: 100%;
  height: 500px;
}

.mapa {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
