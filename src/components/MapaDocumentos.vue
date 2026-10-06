<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import api from "../api";

// Lazy import — só carrega Chart.js se necessário
let Bar = null;
let ChartJS = null;

// State
const documentos = ref([]);
const totalDocumentos = ref(0);
const populacaoExibida = ref(0);
const mapa = ref(null);
const isLoading = ref(true);
const mapaReady = ref(false);
const filtroProvincia = ref("");
const isMobile = ref(window.innerWidth < 768);
let markersLayer = null;
let leafletInstance = null;

// POPULAÇÃO
const populacaoProvincias = {
  "Cabo Delgado": { homens: 1336707, mulheres: 1408165, total: 2744872 },
  Gaza: { homens: 673411, mulheres: 803242, total: 1476653 },
  "Cidade de Maputo": { homens: 551403, mulheres: 581832, total: 1133235 },
  Maputo: { homens: 1197965, mulheres: 1281844, total: 2479809 },
  Nampula: { homens: 3241895, mulheres: 3407986, total: 6649881 },
  Niassa: { homens: 1071956, mulheres: 1130861, total: 2202817 },
  Sofala: { homens: 1303851, mulheres: 1370936, total: 2674787 },
  Tete: { homens: 1563790, mulheres: 1610127, total: 3173917 },
  "Zambézia": { homens: 2895410, mulheres: 3108499, total: 6003909 },
  Inhambane: { homens: 736101, mulheres: 845013, total: 1581114 },
  Manica: { homens: 1111192, mulheres: 1187561, total: 2298753 },
};

const totalPopulacaoPais = Object.values(populacaoProvincias).reduce(
  (a, p) => a + p.total,
  0
);

const coordenadasProvincias = {
  Maputo: [-25.9655, 32.5832],
  "Cidade de Maputo": [-25.9653, 32.5892],
  Gaza: [-24.75, 33.0],
  Inhambane: [-23.87, 35.38],
  Sofala: [-19.0, 34.85],
  Manica: [-19.15, 33.45],
  Tete: [-16.17, 33.6],
  "Zambézia": [-17.83, 36.9],
  Nampula: [-15.13, 39.27],
  Niassa: [-13.28, 36.55],
  "Cabo Delgado": [-12.3, 40.5],
};

const normalizarProvincia = (n) => {
  if (!n) return "";
  const nome = n.toLowerCase().trim();
  if (nome.includes("cidade") || nome.includes("maputo cidade"))
    return "Cidade de Maputo";
  if (nome.includes("cabo delgado")) return "Cabo Delgado";
  if (nome.includes("zambezia") || nome.includes("zambézia")) return "Zambézia";
  return (
    Object.keys(coordenadasProvincias).find((p) =>
      nome.includes(p.toLowerCase())
    ) || n
  );
};

const abreviarNome = (n) =>
  n === "Cidade de Maputo"
    ? "C.Maputo"
    : n === "Cabo Delgado"
    ? "C.Delgado"
    : n;

// RANKING
const rankingDiscreto = computed(() => {
  if (filtroProvincia.value) {
    const prov = filtroProvincia.value;
    const qtd = documentos.value.filter((d) => d.provincia === prov).length;
    return [{ provincia: prov, nomeCurto: abreviarNome(prov), docs: qtd }];
  }
  return Object.keys(coordenadasProvincias)
    .map((p) => ({
      provincia: p,
      nomeCurto: abreviarNome(p),
      docs: documentos.value.filter((d) => d.provincia === p).length,
    }))
    .sort((a, b) => b.docs - a.docs)
    .slice(0, 10);
});

// COUNTERS ANIMADOS (simplificados)
watch(
  [documentos, filtroProvincia],
  () => {
    const targetDocs = filtroProvincia.value
      ? documentos.value.filter((d) => d.provincia === filtroProvincia.value).length
      : documentos.value.length;
    const targetPop = filtroProvincia.value
      ? populacaoProvincias[filtroProvincia.value]?.total || 0
      : totalPopulacaoPais;
    totalDocumentos.value = targetDocs;
    populacaoExibida.value = targetPop;
  },
  { immediate: true }
);

// GRÁFICO — só carrega em desktop
const showChart = ref(false);
const chartData = computed(() => ({
  labels: rankingDiscreto.value.map((i) => i.nomeCurto),
  datasets: [
    { backgroundColor: "#3b82f6", data: rankingDiscreto.value.map((i) => populacaoProvincias[i.provincia]?.homens || 0) },
    { backgroundColor: "#ec4899", data: rankingDiscreto.value.map((i) => populacaoProvincias[i.provincia]?.mulheres || 0) },
    { backgroundColor: "#10b981", data: rankingDiscreto.value.map((i) => i.docs) },
  ],
}));

const getColor = (q) => (q > 50 ? "#ef4444" : q > 20 ? "#f97316" : "#10b981");

const carregarDocumentos = async () => {
  try {
    const { data } = await api.get("/documentos");
    documentos.value = Array.isArray(data)
      ? data.map((d) => ({ ...d, provincia: normalizarProvincia(d.provincia) }))
      : [];
  } catch (e) {
    console.error(e);
  }
};

const desenharMarcadores = () => {
  if (!leafletInstance || !markersLayer) return;
  const L = leafletInstance;
  markersLayer.clearLayers();
  rankingDiscreto.value.forEach((item) => {
    if (item.docs === 0 && filtroProvincia.value) return;
    const c = coordenadasProvincias[item.provincia];
    if (!c) return;
    L.circleMarker(c, {
      radius: filtroProvincia.value ? 18 : Math.max(6, 6 + item.docs * 0.14),
      color: "#000",
      weight: 1.5,
      fillColor: getColor(item.docs),
      fillOpacity: 0.9,
    })
      .bindPopup(
        `<div style="background:#000;color:#fff;padding:6px 10px;border-radius:6px;font-size:12px"><b>${item.nomeCurto}</b><br>${item.docs} docs</div>`
      )
      .addTo(markersLayer);
  });
  if (filtroProvincia.value) {
    nextTick(() =>
      mapa.value?.setView(coordenadasProvincias[filtroProvincia.value], 9)
    );
  }
};

const centrarProvincia = (p) =>
  coordenadasProvincias[p] && mapa.value?.setView(coordenadasProvincias[p], 9);

const limparFiltro = () => { filtroProvincia.value = ""; };

// INICIALIZAÇÃO LAZY DO MAPA — só quando visível
const inicializarMapa = async () => {
  if (mapaReady.value) return;

  isLoading.value = true;

  // Lazy load Leaflet e GeoJSON só quando necessário
  const [L, { default: geoJSON }] = await Promise.all([
    import("leaflet"),
    import("../geojson/geoBoundaries-MOZ-ADM0_simplified2.json"),
  ]);

  await import("leaflet/dist/leaflet.css");

  leafletInstance = L.default || L;
  const Lmap = leafletInstance;

  const mapEl = document.getElementById("mapa");
  if (!mapEl || mapa.value) return;

  mapa.value = Lmap.map("mapa", {
    zoomControl: false,
    attributionControl: false,
    // Performance: desligar animações em mobile
    zoomAnimation: !isMobile.value,
    fadeAnimation: !isMobile.value,
    markerZoomAnimation: !isMobile.value,
    preferCanvas: true, // Canvas em vez de SVG = muito mais rápido
  }).setView([-18.25, 35.3], isMobile.value ? 4 : 5);

  // CartoDB Positron — tile server leve, rápido, gratuito, sem chave
  Lmap.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    {
      subdomains: "abcd",
      maxZoom: 14,
      maxNativeZoom: 14, // Não pede tiles acima deste zoom = menos requests
      minZoom: 4,
      tileSize: 256,
      updateWhenIdle: true,       // Só actualiza tiles quando para de arrastar
      updateWhenZooming: false,   // Não actualiza durante zoom
      keepBuffer: 1,              // Menos tiles em buffer = menos memória
    }
  ).addTo(mapa.value);

  Lmap.control.zoom({ position: "bottomright", zoomInText: "+", zoomOutText: "−" }).addTo(mapa.value);

  markersLayer = Lmap.layerGroup().addTo(mapa.value);

  // GeoJSON com simplificação de estilo (sem fill = mais rápido)
  Lmap.geoJSON(geoJSON, {
    style: { color: "#ffffff", weight: isMobile.value ? 1 : 2, opacity: 0.7, fillOpacity: 0 },
  }).addTo(mapa.value);

  const fix = () => nextTick(() => mapa.value?.invalidateSize());
  window.addEventListener("resize", fix);
  window.addEventListener("orientationchange", () => setTimeout(fix, 300));

  mapaReady.value = true;
  isLoading.value = false;

  await carregarDocumentos();

  // Gráfico apenas desktop
  if (!isMobile.value) {
    const chartMod = await import("chart.js");
    const vueMod = await import("vue-chartjs");
    Bar = vueMod.Bar;
    chartMod.Chart.register(
      chartMod.Title, chartMod.Tooltip, chartMod.Legend,
      chartMod.BarElement, chartMod.CategoryScale, chartMod.LinearScale
    );
    showChart.value = true;
  } else {
    await carregarDocumentos(); // dados já carregados, sem gráfico
  }
};

let observer = null;

onMounted(() => {
  isMobile.value = window.innerWidth < 768;

  // IntersectionObserver — mapa só inicializa quando entra no viewport
  const el = document.getElementById("mapa-container");
  if (!el) { inicializarMapa(); return; }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        inicializarMapa();
      }
    },
    { threshold: 0.1 }
  );
  observer.observe(el);
});

onUnmounted(() => {
  observer?.disconnect();
  if (mapa.value) { mapa.value.remove(); mapa.value = null; }
});

watch(filtroProvincia, desenharMarcadores);
watch(documentos, desenharMarcadores, { deep: true });
</script>

<template>
  <div id="mapa-container" class="app">
    <!-- Mapa -->
    <div id="mapa" class="mapa">
      <!-- Skeleton enquanto carrega -->
      <div v-if="isLoading" class="mapa-skeleton">
        <div class="skeleton-pulse"></div>
        <span class="skeleton-label">A carregar mapa...</span>
      </div>
    </div>

    <!-- PAINEL -->
    <div class="painel">
      <div class="stats">
        <strong>{{ totalDocumentos.toLocaleString() }}</strong> docs •
        <strong>{{ populacaoExibida.toLocaleString() }}</strong> hab
      </div>

      <div class="filtro">
        <select v-model="filtroProvincia" class="select">
          <option value="">Todas</option>
          <option v-for="(c, p) in coordenadasProvincias" :key="p" :value="p">
            {{ abreviarNome(p) }}
          </option>
        </select>
        <button v-if="filtroProvincia" @click="limparFiltro" class="limpar">×</button>
      </div>

      <!-- RANKING -->
      <div class="ranking">
        <div v-for="(item, i) in rankingDiscreto" :key="item.provincia" class="rank-line">
          <span class="pos">{{ i + 1 }}.</span>
          <span class="prov">{{ item.nomeCurto }}</span>
          <strong class="docs">{{ item.docs }}</strong>
          <button @click="centrarProvincia(item.provincia)" class="ver">Ver</button>
        </div>
      </div>

      <!-- Gráfico apenas desktop -->
      <div v-if="showChart && Bar" class="grafico">
        <component
          :is="Bar"
          :data="chartData"
          :options="{
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: { legend: { display: false } },
          }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: #000;
  font-family: "Poppins", system-ui, sans-serif;
  font-weight: 500;
}

.mapa {
  flex: 1;
  position: relative;
  min-height: 220px;
}

/* Skeleton de carregamento */
.mapa-skeleton {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #111;
  z-index: 10;
}
.skeleton-pulse {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #800080, #198754);
  animation: pulse 1.4s ease-in-out infinite;
  margin-bottom: 12px;
}
.skeleton-label {
  color: rgba(255,255,255,0.6);
  font-size: 0.82rem;
}
@keyframes pulse {
  0%, 100% { opacity: 0.4; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.05); }
}

.painel {
  margin: 8px;
  padding: 9px 11px;
  background: #fff;
  color: #000;
  border: 2px solid #000;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.35);
  display: flex;
  flex-direction: column;
  gap: 7px;
  max-height: 28vh;
  overflow: hidden;
}

.stats {
  font-size: 0.76rem;
  text-align: center;
  color: #222;
}
.stats strong {
  font-weight: 700;
  font-size: 0.86rem;
}

.filtro {
  display: flex;
  gap: 6px;
  align-items: center;
}
.select {
  flex: 1;
  padding: 6px;
  border: 1.4px solid #000;
  border-radius: 8px;
  font-size: 0.8rem;
  font-family: inherit;
}
.limpar {
  width: 26px;
  height: 26px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 1rem;
  cursor: pointer;
  flex-shrink: 0;
}

.ranking {
  flex: 1;
  overflow-y: auto;
  padding-right: 2px;
  -webkit-overflow-scrolling: touch;
}
.rank-line {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 4px 6px;
  background: #f8f8f8;
  border-radius: 6px;
  font-size: 0.77rem;
  margin: 2px 0;
}
.pos { width: 18px; font-weight: 700; color: #444; }
.prov { flex: 1; font-weight: 600; }
.docs { color: #10b981; font-weight: 700; font-size: 0.88rem; }
.ver {
  padding: 2px 6px;
  font-size: 0.66rem;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  touch-action: manipulation;
}

/* Gráfico — só desktop */
.grafico {
  height: 90px;
  margin-top: 4px;
}

@media (min-width: 768px) {
  .app {
    flex-direction: row;
    padding: 12px;
    gap: 12px;
    max-width: 1400px;
    margin: 0 auto;
  }
  .painel {
    flex: 0 0 280px;
    border-radius: 16px;
    padding: 12px;
    max-height: none;
  }
}

/* Ecrãs muito pequenos — mapa mais compacto */
@media (max-width: 380px) {
  .painel {
    max-height: 30vh;
    padding: 7px 9px;
  }
  .rank-line {
    font-size: 0.72rem;
  }
}
</style>
