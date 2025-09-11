<template>
  <div class="mapa-container">
    <!-- Cabeçalho -->
    <div class="mapa-header">
      <h3>🗺️ Rastreador Rpa</h3>
      <p>Total: <strong>{{ documentosFiltrados.length }}</strong> documentos</p>
      <button class="btn-refresh" @click="carregarDocumentos">🔄 Atualizar</button>
    </div>

    <!-- Filtro de Província -->
    <div class="mapa-filtros">
      <select v-model="filtroProvincia">
        <option value="">Todas as províncias</option>
        <option v-for="(coords, prov) in coordenadasProvincias" :key="prov" :value="prov">
          {{ prov }}
        </option>
      </select>

      <button class="btn-clear" @click="limparFiltros">❌ Limpar</button>
    </div>

    <!-- Mapa -->
    <div id="mapa" class="mapa"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import api from "../api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const documentos = ref([]);
const mapa = ref(null);
const markers = [];

const filtroProvincia = ref("");

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

const documentosFiltrados = computed(() => {
  return documentos.value.filter((doc) =>
    filtroProvincia.value ? doc.provincia === filtroProvincia.value : true
  );
});

const getColor = (qtd) => {
  if (qtd > 50) return "red";
  if (qtd > 20) return "orange";
  return "green";
};

const carregarDocumentos = async () => {
  try {
    const response = await api.get("/documentos");
    documentos.value = response.data;
    desenharMarcadores();
  } catch (error) {
    console.error("Erro ao carregar documentos:", error);
  }
};

const desenharMarcadores = () => {
  markers.forEach((m) => m.remove());
  markers.length = 0;

  const contagem = {};
  documentosFiltrados.value.forEach((doc) => {
    if (doc.provincia) {
      contagem[doc.provincia] = (contagem[doc.provincia] || 0) + 1;
    }
  });

  Object.entries(contagem).forEach(([provincia, qtd]) => {
    if (coordenadasProvincias[provincia]) {
      const marker = L.circleMarker(coordenadasProvincias[provincia], {
        radius: 10 + qtd * 0.3,
        color: getColor(qtd),
        fillColor: getColor(qtd),
        fillOpacity: 0.5,
      });

      marker.bindPopup(`<b>${provincia}</b><br>${qtd} documentos perdidos`);
      marker.on("click", () => {
        mapa.value.setView(coordenadasProvincias[provincia], 7);
      });

      marker.addTo(mapa.value);
      markers.push(marker);
    }
  });
};

const limparFiltros = () => {
  filtroProvincia.value = "";
  desenharMarcadores();
};

watch(filtroProvincia, () => {
  desenharMarcadores();
});

onMounted(() => {
  mapa.value = L.map("mapa", {
    attributionControl: false,
  }).setView([-18.6657, 35.5296], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapa.value);

  const attribution = L.control.attribution({ prefix: false });
  attribution.addAttribution('<a href="https://www.mapsource.com" target="_blank" style="font-size: 10px; color: #666;">Fonte: MapSource</a>');
  attribution.setPosition('bottomright');
  attribution.addTo(mapa.value);

  carregarDocumentos();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

.mapa-container {
  width: 100%;
  height: 600px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mapa-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.05);
}

.mapa-header h3 {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 1.5rem;
  color: #007bff;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.mapa-filtros {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  background: #fff;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.05);
}

.mapa-filtros select {
  padding: 5px 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
}

.btn-refresh,
.btn-clear {
  background: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: 0.2s;
}

.btn-clear {
  background: #6c757d;
}

.btn-refresh:hover {
  background: #0056b3;
}

.btn-clear:hover {
  background: #555;
}

.mapa {
  flex: 1;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
