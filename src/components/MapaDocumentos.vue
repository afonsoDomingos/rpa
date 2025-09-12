
<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import api from "../api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import moambiqueGeoJSON from "../geojson/geoBoundaries-MOZ-ADM0_simplified2.json";

const documentos = ref([]);
const mapa = ref(null);
let markersLayer = null;

const isLoading = ref(false);
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

// Filtro para mapa e ranking
const documentosFiltrados = computed(() =>
  documentos.value.filter((doc) =>
    filtroProvincia.value ? doc.provincia === filtroProvincia.value : true
  )
);

// Ranking respeitando o filtro
const rankingProvincias = computed(() => {
  const contagem = {};
  documentosFiltrados.value.forEach((doc) => {
    const prov = doc.provincia;
    if (prov) contagem[prov] = (contagem[prov] || 0) + 1;
  });
  return Object.entries(contagem)
    .map(([provincia, qtd]) => ({ provincia, qtd }))
    .sort((a, b) => b.qtd - a.qtd);
});

const getColor = (qtd) => {
  if (qtd > 50) return "red";
  if (qtd > 20) return "orange";
  return "green";
};

const carregarDocumentos = async () => {
  isLoading.value = true;
  try {
    const response = await api.get("/documentos");
    documentos.value = Array.isArray(response.data) ? response.data : [];
    desenharMarcadores();
  } catch (error) {
    console.error("Erro ao carregar documentos:", error);
  } finally {
    isLoading.value = false;
  }
};

const desenharMarcadores = () => {
  if (!mapa.value || !markersLayer) return;
  markersLayer.clearLayers();

  const contagem = {};
  documentosFiltrados.value.forEach((doc) => {
    const prov = doc.provincia;
    if (prov) contagem[prov] = (contagem[prov] || 0) + 1;
  });

  Object.entries(contagem).forEach(([provincia, qtd]) => {
    const coords = coordenadasProvincias[provincia];
    if (!coords) return;

    const marker = L.circleMarker(coords, {
      radius: Math.max(8, 10 + qtd * 0.3),
      color: getColor(qtd),
      fillColor: getColor(qtd),
      fillOpacity: 0.6,
      weight: 1,
    });

    marker.bindPopup(`<b>${provincia}</b><br>${qtd} documentos perdidos`);
    marker.on("click", () => mapa.value.setView(coords, 7));
    markersLayer.addLayer(marker);
  });
};

const limparFiltros = () => {
  filtroProvincia.value = "";
  desenharMarcadores();
};

const centrarProvincia = (provincia) => {
  const coords = coordenadasProvincias[provincia];
  if (coords && mapa.value) {
    mapa.value.setView(coords, 7);
  }
};

watch(filtroProvincia, () => desenharMarcadores());
watch(documentos, () => desenharMarcadores());

onMounted(() => {
  mapa.value = L.map("mapa", { attributionControl: false })
    .setView([-18.6657, 35.5296], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    .addTo(mapa.value);

  const attribution = L.control.attribution({ prefix: false });
  attribution.addAttribution('<a href="https://www.mapsource.com" target="_blank" style="font-size: 10px; color: #666;">Fonte: MapSource</a>');
  attribution.setPosition("bottomright");
  attribution.addTo(mapa.value);

  markersLayer = L.layerGroup().addTo(mapa.value);

  try {
    L.geoJSON(moambiqueGeoJSON, { style: { color: "#800080", weight: 3, fill: false } }).addTo(mapa.value);
  } catch (e) {
    console.warn("Falha ao adicionar GeoJSON:", e);
  }

  carregarDocumentos();
});

onUnmounted(() => {
  if (mapa.value) {
    mapa.value.off();
    mapa.value.remove();
    mapa.value = null;
  }
});
</script>
<template>
  <div class="mapa-wrapper">
    <!-- Mapa à esquerda -->
    <div class="mapa-container borda-destacada">
      <div id="mapa" class="mapa"></div>
    </div>

    <!-- Painel lateral à direita -->
    <div class="painel-lateral borda-destacada">
      <!-- Cabeçalho -->
      <div class="mapa-header">
        <h3>🗺️ Rastreador Rpa</h3>
        <p>Total: <strong>{{ documentosFiltrados.length }}</strong> documentos</p>
        <div class="botoes-topo">
          <button
            class="btn-refresh"
            @click="carregarDocumentos"
            :disabled="isLoading"
          >
            <span v-if="!isLoading">🔄 Atualizar</span>
            <span v-else>⏳ Atualizando...</span>
          </button>
          <button class="btn-clear" @click="limparFiltros">❌</button>
        </div>
      </div>

      <!-- Filtro -->
      <div class="mapa-filtros">
        <select v-model="filtroProvincia" class="borda-destacada">
          <option value="">Todas as províncias</option>
          <option
            v-for="(coords, prov) in coordenadasProvincias"
            :key="prov"
            :value="prov"
          >
            {{ prov }}
          </option>
        </select>
      </div>

      <!-- Ranking -->
      <div class="ranking">
        <h4>📊 Ranking por Província</h4>
        <ul>
          <li
            v-for="(item, idx) in rankingProvincias"
            :key="item.provincia"
          >
            <span class="posicao">#{{ idx + 1 }}</span>
            <span class="nome">{{ item.provincia }}</span>
            <span class="qtd">{{ item.qtd }}</span>
            <button class="btn-zoom" @click="centrarProvincia(item.provincia)">
              🔍
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 🔹 Classe adicionada */
.borda-destacada {
  border: 2px solid #66bb6a;
  border-radius: 12px;
  padding: 10px 0;
  background-color: #fff;
  transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
}

.borda-destacada:hover {
  border-color: #800080;
  box-shadow: 0 8px 20px rgba(128, 0, 128, 0.25);
  transform: scale(1.02);
}

/* 🔹 Wrapper geral */
.mapa-wrapper {
  display: flex;
  gap: 20px;
  height: 600px;
  flex-direction: row;
  margin: 0 20px;
}

/* 🔹 Painel lateral */
.painel-lateral {
  flex: 0 0 30%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 🔹 Container do mapa */
.mapa-container {
  flex: 0 0 70%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0px 4px 12px rgba(0,0,0,0.1);
  display: flex;
}

/* 🔹 O mapa precisa de altura fixa */
.mapa {
  width: 100%;
  height: 100%;
  min-height: 580px; /* 👈 garante que o mapa aparece */
}

/* 🔹 Header */
.mapa-header {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mapa-header h3 {
  font-family: 'Poppins', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #007bff;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.2);
  margin: 0;
}

/* 🔹 Botões no topo */
.botoes-topo {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* 🔹 Filtros */
.mapa-filtros {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
  justify-content: center;
}

.mapa-filtros select {
  width: 70%;
  max-width: 220px;
  padding: 6px;
  border-radius: 6px;
}

/* 🔹 Botões */
.btn-refresh,
.btn-clear,
.btn-zoom {
  background: #007bff;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-refresh {
  background: #007bff;
}

.btn-clear {
  flex: 0 0 auto;
  width: 40px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #6c757d;
  border-radius: 6px;
  cursor: pointer;
}

.btn-zoom {
  background: #28a745;
  font-size: 0.8rem;
  padding: 4px 8px;
}

/* 🔹 Ranking */
.ranking {
  background: #fff;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0px 2px 6px rgba(0,0,0,0.05);
  flex: 1;
  overflow-y: auto;
}

.ranking h4 {
  margin-bottom: 8px;
  font-size: 1rem;
  color: #333;
}

.ranking ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ranking li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 6px 0;
  padding: 4px 0;
  border-bottom: 1px solid #eee;
}

.ranking .posicao {
  font-weight: bold;
  color: #007bff;
  margin-right: 6px;
}

.ranking .nome {
  flex: 1;
}

.ranking .qtd {
  font-weight: bold;
  margin-right: 6px;
}

/* ================= RESPONSIVIDADE ================= */
@media (max-width: 768px) {
  .mapa-wrapper {
    flex-direction: column;
    height: auto;
  }

  .mapa-container,
  .painel-lateral {
    flex: 0 0 100%;
    height: auto;
  }

  .mapa-container {
    height: 300px; /* mapa menor no mobile */
  }

  .mapa {
    min-height: 280px; /* mapa responsivo */
  }

  .painel-lateral {
    gap: 16px;
  }

  .mapa-filtros {
    flex-direction: column;
    gap: 8px;
  }

  .mapa-filtros select {
    width: 100%;
    max-width: 100%;
  }

  .botoes-topo {
    flex-direction: column;
    gap: 10px;
  }

  .btn-refresh,
  .btn-clear {
    width: 100%;
  }
}
</style>




