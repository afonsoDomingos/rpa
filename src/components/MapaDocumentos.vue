<script setup>
import { ref, computed, watch, onMounted, nextTick } from "vue"
import api from "../api"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import moambiqueGeoJSON from "../geojson/geoBoundaries-MOZ-ADM0_simplified2.json"

import { Bar } from "vue-chartjs"
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js"
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

// STATE
const documentos = ref([])
const totalDocumentos = ref(0)
const populacaoExibida = ref(0)
const mapa = ref(null)
let markersLayer = null
const isLoading = ref(false)
const filtroProvincia = ref("")

// POPULAÇÃO
const populacaoProvincias = {
  "Cabo Delgado": { homens: 1336707, mulheres: 1408165, total: 2744872 },
  "Gaza": { homens: 673411, mulheres: 803242, total: 1476653 },
  "Cidade de Maputo": { homens: 551403, mulheres: 581832, total: 1133235 },
  "Maputo": { homens: 1197965, mulheres: 1281844, total: 2479809 },
  "Nampula": { homens: 3241895, mulheres: 3407986, total: 6649881 },
  "Niassa": { homens: 1071956, mulheres: 1130861, total: 2202817 },
  "Sofala": { homens: 1303851, mulheres: 1370936, total: 2674787 },
  "Tete": { homens: 1563790, mulheres: 1610127, total: 3173917 },
  "Zambézia": { homens: 2895410, mulheres: 3108499, total: 6003909 },
  "Inhambane": { homens: 736101, mulheres: 845013, total: 1581114 },
  "Manica": { homens: 1111192, mulheres: 1187561, total: 2298753 }
}

const totalPopulacaoPais = Object.values(populacaoProvincias).reduce((a, p) => a + p.total, 0)

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
  "Cabo Delgado": [-12.3, 40.5]
}

const normalizarProvincia = (n) => {
  if (!n) return ""
  const nome = n.toLowerCase().trim()
  if (nome.includes("cidade") || nome.includes("maputo cidade")) return "Cidade de Maputo"
  if (nome.includes("cabo delgado")) return "Cabo Delgado"
  if (nome.includes("zambezia") || nome.includes("zambézia")) return "Zambézia"
  return Object.keys(coordenadasProvincias).find(p => nome.includes(p.toLowerCase())) || n
}

const abreviarNome = (n) =>
  n === "Cidade de Maputo" ? "C.Maputo" :
  n === "Cabo Delgado" ? "C.Delgado" : n

// RANKING DISCRETO
const rankingDiscreto = computed(() => {
  if (filtroProvincia.value) {
    const prov = filtroProvincia.value
    const qtd = documentos.value.filter(d => d.provincia === prov).length
    return [{ provincia: prov, nomeCurto: abreviarNome(prov), docs: qtd }]
  }

  return Object.keys(coordenadasProvincias)
    .map(p => ({ provincia: p, nomeCurto: abreviarNome(p), docs: documentos.value.filter(d => d.provincia === p).length }))
    .sort((a, b) => b.docs - a.docs)
    .slice(0, 10)
})

// CONTADORES ANIMADOS
const animateValue = (start, end, duration = 800) => {
  let s = null
  return t => {
    if (!s) s = t
    const p = Math.min((t - s) / duration, 1)
    return Math.floor((1 - Math.pow(1 - p, 3)) * (end - start) + start)
  }
}

watch([documentos, filtroProvincia], () => {
  const targetDocs = filtroProvincia.value
    ? documentos.value.filter(d => d.provincia === filtroProvincia.value).length
    : documentos.value.length

  const targetPop = filtroProvincia.value
    ? populacaoProvincias[filtroProvincia.value]?.total || 0
    : totalPopulacaoPais

  const dAnim = animateValue(totalDocumentos.value, targetDocs)
  const pAnim = animateValue(populacaoExibida.value, targetPop)

  const tick = t => {
    totalDocumentos.value = dAnim(t)
    populacaoExibida.value = pAnim(t)
    if (totalDocumentos.value < targetDocs || populacaoExibida.value < targetPop) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}, { immediate: true })

// GRÁFICO
const chartData = computed(() => ({
  labels: rankingDiscreto.value.map(i => i.nomeCurto),
  datasets: [
    { backgroundColor: "#3b82f6", data: rankingDiscreto.value.map(i => populacaoProvincias[i.provincia]?.homens || 0) },
    { backgroundColor: "#ec4899", data: rankingDiscreto.value.map(i => populacaoProvincias[i.provincia]?.mulheres || 0) },
    { backgroundColor: "#10b981", data: rankingDiscreto.value.map(i => i.docs) }
  ]
}))

// MAPA
const getColor = q => q > 50 ? "#ef4444" : q > 20 ? "#f97316" : "#10b981"

const carregarDocumentos = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get("/documentos")
    documentos.value = Array.isArray(data)
      ? data.map(d => ({ ...d, provincia: normalizarProvincia(d.provincia) }))
      : []
  } catch (e) { console.error(e) } finally { isLoading.value = false }
}

const limparFiltro = () => { filtroProvincia.value = "" }

const desenharMarcadores = () => {
  if (!mapa.value || !markersLayer) return
  markersLayer.clearLayers()
  rankingDiscreto.value.forEach(item => {
    if (item.docs === 0 && filtroProvincia.value) return
    const c = coordenadasProvincias[item.provincia]
    if (!c) return
    L.circleMarker(c, {
      radius: filtroProvincia.value ? 22 : Math.max(7, 7 + item.docs * 0.16),
      color: "#000", weight: 2, fillColor: getColor(item.docs), fillOpacity: 0.95
    })
      .bindPopup(`<div style="background:#000;color:#fff;padding:8px 11px;border-radius:6px;font-family:Poppins;font-weight:600;font-size:13px"><b>${item.nomeCurto}</b><br>${item.docs} docs</div>`)
      .addTo(markersLayer)
  })
  if (filtroProvincia.value) nextTick(() => mapa.value.setView(coordenadasProvincias[filtroProvincia.value], 10))
}

const centrarProvincia = p => coordenadasProvincias[p] && mapa.value.setView(coordenadasProvincias[p], 10)

onMounted(async () => {
  // ZOOM E CENTRO AJUSTADOS PARA MOSTRAR TODO O MOÇAMBIQUE PERFEITAMENTE
  mapa.value = L.map("mapa", { 
    zoomControl: false, 
    attributionControl: false 
  }).setView([-18.25, 35.3], 5)  // ← Todo o país visível com margem

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png").addTo(mapa.value)
  
  L.control.zoom({ 
    position: "bottomright", 
    zoomInText: "+", 
    zoomOutText: "-" 
  }).addTo(mapa.value)
  
  markersLayer = L.layerGroup().addTo(mapa.value)

  L.geoJSON(moambiqueGeoJSON, { 
    style: { color: "#ffffff", weight: 2.5, opacity: 0.9, fillOpacity: 0 } 
  }).addTo(mapa.value)

  const fix = () => nextTick(() => mapa.value?.invalidateSize())
  window.addEventListener("resize", fix)
  window.addEventListener("orientationchange", () => setTimeout(fix, 200))
  
  carregarDocumentos()
})

watch(filtroProvincia, desenharMarcadores)
watch(documentos, desenharMarcadores, { deep: true })
</script>

<template>
  <div class="app">
    <div id="mapa" class="mapa"></div>

    <!-- PAINEL MINIMALISTA -->
    <div class="painel">
      <div class="stats">
        <strong>{{ totalDocumentos.toLocaleString() }}</strong> docs •
        <strong>{{ populacaoExibida.toLocaleString() }}</strong> hab
      </div>

      <div class="filtro">
        <select v-model="filtroProvincia" class="select">
          <option value="">Todas</option>
          <option v-for="(c, p) in coordenadasProvincias" :key="p" :value="p">{{ abreviarNome(p) }}</option>
        </select>
        <button v-if="filtroProvincia" @click="limparFiltro" class="limpar">×</button>
      </div>

      <!-- RANKING DISCRETO -->
      <div class="ranking">
        <div v-for="(item, i) in rankingDiscreto" :key="item.provincia" class="rank-line">
          <span class="pos">{{ i + 1 }}.</span>
          <span class="prov">{{ item.nomeCurto }}</span>
          <strong class="docs">{{ item.docs }}</strong>
          <button @click="centrarProvincia(item.provincia)" class="ver">Ver</button>
        </div>
      </div>

      <div class="grafico">
        <Bar :data="chartData" :options="{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@fontsource/poppins/500.css';
@import '@fontsource/poppins/600.css';
@import '@fontsource/poppins/700.css';

.app { display: flex; flex-direction: column; height: 100dvh; background: #000; font-family: 'Poppins', sans-serif; font-weight: 500; }
.mapa { flex: 1; }

.painel {
  margin: 10px;
  padding: 9px 11px;
  background: #fff;
  color: #000;
  border: 2.5px solid #000;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
  gap: 7px;
  max-height: 26vh;
  overflow: hidden;
}

.stats { font-size: 0.76rem; text-align: center; color: #222; }
.stats strong { font-weight: 700; font-size: 0.86rem; }

.filtro { display: flex; gap: 6px; align-items: center; }
.select { flex: 1; padding: 6px; border: 1.4px solid #000; border-radius: 8px; font-size: 0.8rem; }
.limpar { width: 24px; height: 24px; background: #000; color: #fff; border: none; border-radius: 50%; font-size: 1rem; }

.ranking { flex: 1; overflow-y: auto; padding-right: 4px; }
.rank-line {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  background: #f8f8f8;
  border-radius: 6px;
  font-size: 0.78rem;
  margin: 2px 0;
}
.pos { width: 18px; font-weight: 700; color: #444; }
.prov { flex: 1; font-weight: 600; }
.docs { color: #10b981; font-weight: 700; font-size: 0.9rem; }
.ver { padding: 2px 5px; font-size: 0.66rem; background: #000; color: #fff; border: none; border-radius: 4px; }

.grafico { height: 100px; margin-top: 4px; }

@media (min-width: 768px) {
  .app { flex-direction: row; padding: 12px; gap: 12px; max-width: 1400px; margin: 0 auto; }
  .painel { flex: 0 0 290px; border-radius: 18px; padding: 12px; max-height: none; }
}
</style>