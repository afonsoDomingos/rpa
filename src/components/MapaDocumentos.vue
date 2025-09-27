<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import api from "../api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import moambiqueGeoJSON from "../geojson/geoBoundaries-MOZ-ADM0_simplified2.json";

// Chart.js
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from "chart.js";
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// ==================== STATE ====================
const documentos = ref([]);
const mapa = ref(null);
let markersLayer = null;

const isLoading = ref(false);
const filtroProvincia = ref("");

// 🔹 Dados populacionais do INE
const populacaoProvincias = {
  "Cabo Delgado": { total: 2744872, homens: 1336707, mulheres: 1408165 },
  "Gaza": { total: 1476653, homens: 673411, mulheres: 803242 },
  "Cidade de Maputo": { total: 1133235, homens: 551403, mulheres: 581832 },
  "Maputo": { total: 2479809, homens: 1197965, mulheres: 1281844 },
  "Nampula": { total: 6649881, homens: 3241895, mulheres: 3407986 },
  "Niassa": { total: 2202817, homens: 1071956, mulheres: 1130861 },
  "Sofala": { total: 2674787, homens: 1303851, mulheres: 1370936 },
  "Tete": { total: 3173917, homens: 1563790, mulheres: 1610127 },
  "Zambézia": { total: 6003909, homens: 2895410, mulheres: 3108499 },
  "Inhambane": { total: 1581114, homens: 736101, mulheres: 845013 },
  "Manica": { total: 2298753, homens: 1111192, mulheres: 1187561 }
};

const coordenadasProvincias = {
  "Maputo": [-25.9655, 32.5832],
  "Cidade de Maputo": [-25.9653, 32.5892],
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

// ==================== NORMALIZAÇÃO ====================
const normalizarProvincia = (nome) => {
  if (!nome) return "";
  const n = nome.trim().toLowerCase();
  if (n.includes("maputo cidade") || n.includes("cidade de maputo")) return "Cidade de Maputo";
  if (n.includes("cabo delgado")) return "Cabo Delgado";
  if (n === "maputo") return "Maputo";
  if (n.includes("zambezia")) return "Zambézia";
  if (n.includes("inhambane")) return "Inhambane";
  if (n.includes("nampula")) return "Nampula";
  if (n.includes("niassa")) return "Niassa";
  if (n.includes("gaza")) return "Gaza";
  if (n.includes("sofala")) return "Sofala";
  if (n.includes("tete")) return "Tete";
  if (n.includes("manica")) return "Manica";
  return nome;
};

// ==================== COMPUTEDS ====================
const abreviarNome = (nome) => {
  if (nome === "Cidade de Maputo") return "C.Maputo";
  if (nome === "Cabo Delgado") return "C.Delgado";
  return nome;
};

const populacaoTotal = computed(() =>
  Object.values(populacaoProvincias).reduce((acc, p) => acc + (p.total || 0), 0)
);

const documentosFiltrados = computed(() =>
  documentos.value.filter((doc) =>
    filtroProvincia.value ? doc.provincia === filtroProvincia.value : true
  )
);

const estatisticasProvincias = computed(() =>
  Object.entries(coordenadasProvincias).map(([provincia]) => {
    const qtdDocs = documentos.value.filter(doc => doc.provincia === provincia).length;
    const popData = populacaoProvincias[provincia] || {};
    const taxaPor100k = popData.total ? (qtdDocs / popData.total * 100000).toFixed(2) : null;

    return {
      provincia,
      nomeCurto: abreviarNome(provincia),
      qtdDocs,
      ...popData,
      taxaPor100k
    };
  }).sort((a, b) => b.qtdDocs - a.qtdDocs)
);

const chartData = computed(() => ({
  labels: estatisticasProvincias.value.map(item => item.nomeCurto),
  datasets: [
    {
      label: "Homens",
      backgroundColor: "#3b82f6",
      data: estatisticasProvincias.value.map(item => item.homens || 0)
    },
    {
      label: "Mulheres",
      backgroundColor: "#f43f5e",
      data: estatisticasProvincias.value.map(item => item.mulheres || 0)
    },
    {
      label: "Documentos Perdidos",
      backgroundColor: "#22c55e",
      data: estatisticasProvincias.value.map(item => item.qtdDocs || 0)
    }
  ]
}));

// ==================== FUNÇÕES ====================
const getColor = (qtd) => {
  if (qtd > 50) return "red";
  if (qtd > 20) return "orange";
  return "green";
};

const carregarDocumentos = async () => {
  isLoading.value = true;
  try {
    const response = await api.get("/documentos");
    documentos.value = Array.isArray(response.data)
      ? response.data.map(d => ({ ...d, provincia: normalizarProvincia(d.provincia) }))
      : [];
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

  estatisticasProvincias.value.forEach((item) => {
    const coords = coordenadasProvincias[item.provincia];
    if (!coords) return;

    const marker = L.circleMarker(coords, {
      radius: Math.max(8, 10 + item.qtdDocs * 0.3),
      color: getColor(item.qtdDocs),
      fillColor: getColor(item.qtdDocs),
      fillOpacity: 0.6,
      weight: 1,
    });

    marker.bindPopup(`
      <b>${item.nomeCurto}</b><br>
      📄 ${item.qtdDocs} documentos<br>
      👥 População: ${item.total?.toLocaleString() || "N/D"}<br>
      🔹 ${item.taxaPor100k ? item.taxaPor100k + " docs/100k hab." : ""}
    `);

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
  if (coords && mapa.value) mapa.value.setView(coords, 7);
};

// ==================== WATCHERS ====================
watch(filtroProvincia, () => desenharMarcadores());
watch(documentos, () => desenharMarcadores());

// ==================== LIFECYCLE ====================
onMounted(() => {
  mapa.value = L.map("mapa", { attributionControl: false })
    .setView([-18.6657, 35.5296], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    .addTo(mapa.value);

  L.control.attribution({ prefix: false })
    .addAttribution('<a href="https://www.openstreetmap.org/" target="_blank" style="font-size: 10px; color: #666;">Fonte: MapSource</a')
    .setPosition("bottomright")
    .addTo(mapa.value);

  markersLayer = L.layerGroup().addTo(mapa.value);

  try {
    L.geoJSON(moambiqueGeoJSON, { style: { color: "#800080", weight: 2, fill: false } }).addTo(mapa.value);
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
    <!-- Mapa -->
    <div class="mapa-container borda-destacada">
      <div id="mapa" class="mapa"></div>
    </div>

    <!-- Painel lateral -->
    <div class="painel-lateral borda-destacada">
      <div class="mapa-header">
        <p>🗺️ Rastreador Rpa</p>
        <p>Total: <strong>{{ documentosFiltrados.length }}</strong></p>
        <p class="pop-total">👥 População: <strong>{{ populacaoTotal.toLocaleString() }}</strong></p>
        <div class="botoes-topo">
          <button class="btn-refresh" @click="carregarDocumentos" :disabled="isLoading">
            <span v-if="!isLoading">🔄 Atualizar</span>
            <span v-else>⏳ Atualizando...</span>
          </button>
          <button class="btn-clear" @click="limparFiltros">❌ Limpar</button>
        </div>
      </div>

      <div class="mapa-filtros">
        <select v-model="filtroProvincia" class="borda-destacada">
          <option value="">Todas</option>
          <option v-for="(coords, prov) in coordenadasProvincias" :key="prov" :value="prov">
            {{ abreviarNome(prov) }}
          </option>
        </select>
      </div>

      <div class="ranking">
        <h4>📊 Ranking</h4>
        <ul>
          <li v-for="(item, idx) in estatisticasProvincias" :key="item.provincia">
            <span class="posicao">#{{ idx + 1 }}</span>
            <span class="nome">{{ item.nomeCurto }}</span>
            <span class="qtd">📄 {{ item.qtdDocs }}</span>
            <span class="pop">👥 {{ item.total?.toLocaleString() || "N/D" }}</span>
            <span v-if="item.taxaPor100k" class="taxa">📊 {{ item.taxaPor100k }}/100k</span>
            <button class="btn-zoom" @click="centrarProvincia(item.provincia)">🔍</button>
          </li>
        </ul>
      </div>

      <div class="grafico">
        <h4>📈 População vs Documentos</h4>
        <Bar :data="chartData" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.mapa-wrapper {
  display: flex;
  gap: 12px;
  height: 600px;
  margin: 0 auto;
  padding: 8px;
  max-width: 1400px;
  box-sizing: border-box;
}

.mapa-container {
  flex: 0 0 68%;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.mapa {
  width: 100%;
  height: 100%;
  min-height: 580px;
}

.painel-lateral {
  flex: 0 0 32%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}

/* Destaques */
.borda-destacada {
  border: 1px solid #66bb6a;
  border-radius: 10px;
  padding: 8px;
  background-color: #fff;
  transition: 0.3s ease;
}

.borda-destacada:hover {
  border-color: #800080;
  box-shadow: 0 4px 12px rgba(128, 0, 128, 0.2);
}

/* Cabeçalho */
.mapa-header {
  background: #f9fafb;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
}

.mapa-header h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #007bff;
  margin: 0 0 6px 0;
}

/* Botões */
.botoes-topo {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.btn-refresh,
.btn-clear,
.btn-zoom {
  border: none;
  padding: 5px 9px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  color: #fff;
}

.btn-refresh { background: #007bff; }
.btn-clear { background: #6c757d; }
.btn-zoom { background: #28a745; }

/* Filtros */
.mapa-filtros select {
  width: 100%;
  padding: 5px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

/* Ranking */
.ranking {
  flex: 1;
  overflow-y: auto;
  background: #fff;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.ranking h4 {
  margin-bottom: 6px;
  font-size: 1rem;
  color: #333;
}

.ranking ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.ranking li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 0;
  border-bottom: 1px solid #eee;
}

.ranking li:last-child { border-bottom: none; }

.ranking .posicao { font-weight: bold; color: #007bff; }
.ranking .nome { flex: 1; margin: 0 5px; }

/* Responsivo */
@media (max-width: 1024px) {
  .mapa-wrapper { flex-direction: column; height: auto; }
  .mapa-container { flex: 0 0 100%; height: 350px; }
  .painel-lateral { flex: 0 0 100%; }
}

@media (max-width: 600px) {
  .botoes-topo { flex-direction: column; }
  .btn-refresh, .btn-clear { width: 100%; }
}
</style>
