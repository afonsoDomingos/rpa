<template>
  <div class="admin-anuncios">
    <!-- LOADING / ERRO -->
    <div v-if="loading" class="loading-state">
      <i class="bi bi-hourglass-split"></i>
      <p>Carregando anúncios...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="bi bi-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button @click="recarregar" class="retry-btn">Tentar novamente</button>
    </div>

    <!-- CONTEÚDO -->
    <div v-else>
      <!-- SKELETON LOADING (novo) -->
      <div v-if="loading" class="grid-anuncios">
        <div v-for="n in 6" :key="'skeleton-' + n" class="anuncio-card skeleton">
          <div class="anuncio-img skeleton-img"></div>
          <div class="anuncio-info">
            <h3 class="skeleton-line"></h3>
            <p class="skeleton-line short"></p>
            <p class="skeleton-line"></p>
          </div>
          <div class="anuncio-acoes">
            <div class="skeleton-btn"></div>
            <div class="skeleton-btn"></div>
            <div class="skeleton-btn"></div>
          </div>
        </div>
      </div>

      <!-- HEADER PREMIUM COMPLETO -->
      <header class="premium-header">
        <button @click="$router.go(-1)" class="back-button">
          <i class="bi bi-arrow-left-circle-fill"></i>
          <span>Voltar</span>
        </button>

        <div class="title-section">
          <h1 class="page-title">
            <i class="bi bi-megaphone-fill"></i>
            Gerenciar Anúncios
          </h1>
          <p class="page-subtitle">Controle total dos anúncios patrocinados</p>
        </div>

        <!-- CONTADORES COMPACTOS -->
        <div class="compact-stats">
          <div class="cstat total">
            <div class="cstat-value">{{ totalAnuncios }}</div>
            <div class="cstat-label">Total</div>
          </div>
          <div class="cstat active">
            <div class="cstat-value">{{ countByStatus.active }}</div>
            <div class="cstat-label">Ativos</div>
          </div>
          <div class="cstat pending">
            <div class="cstat-value">{{ countByStatus.pending }}</div>
            <div class="cstat-label">Pendentes</div>
          </div>
          <div class="cstat paused">
            <div class="cstat-value">{{ countByStatus.paused }}</div>
            <div class="cstat-label">Pausados</div>
          </div>
        </div>
      </header>

      <!-- BARRA DE FILTROS -->
      <div class="filters-bar">
        <div class="filter-controls">
          <select v-model="filtroStatus" @change="aplicarFiltro" class="filter-select">
            <option value="todos">Todos os anúncios</option>
            <option value="active">Apenas ativos</option>
            <option value="pending">Apenas pendentes</option>
            <option value="paused">Apenas pausados</option>
          </select>

          <div class="search-box">
            <i class="bi bi-search"></i>
            <input
              v-model="filtroUsuario"
              @keyup.enter="aplicarFiltro"
              placeholder="Buscar por nome ou e-mail (Enter para buscar)"
              class="search-input"
            />
          </div>
        </div>
      </div>

      <!-- GRID DE ANÚNCIOS -->
      <div class="grid-anuncios">
        <div v-for="(ad, i) in anunciosFiltrados" :key="ad._id" class="anuncio-card Hiring" :style="{ '--i': i }">
          <div class="anuncio-status" :class="ad.status">{{ getStatusText(ad.status) }}</div>
          <img :src="ad.image" :alt="ad.name" class="anuncio-img" @error="handleImageError" @load="onImageLoad" />

          <div class="anuncio-info">
            <h3 class="anuncio-titulo">{{ ad.name }}</h3>
            <p class="anuncio-desc">{{ ad.description }}</p>
            <div class="anuncio-preco"><i class="bi bi-currency-exchange"></i> {{ formatPrice(ad.price) }}</div>
            <div class="anuncio-user">{{ ad.userName || 'Anônimo' }} <small v-if="ad.userEmail">({{ ad.userEmail }})</small></div>
          </div>

          <div class="anuncio-stats">
            <div class="stat-row"><i class="bi bi-eye"></i> Visualizações: <strong>{{ ad.views || 0 }}</strong></div>
            <div class="stat-row"><i class="bi bi-whatsapp"></i> Cliques: <strong>{{ ad.clicks || 0 }}</strong></div>
            <div v-if="ad.expiresAt" class="stat-row"><i class="bi bi-clock"></i> Expira: {{ formatDate(ad.expiresAt) }}</div>
          </div>

          <div class="anuncio-acoes">
            <button @click="abrirStats(ad)" class="btn-stats"><i class="bi bi-graph-up"></i><span class="btn-text">Estatísticas</span></button>
            <button @click="toggleStatus(ad)" :class="['btn-status', ad.status === 'paused' ? 'btn-ativar' : 'btn-pausar']">
              <i :class="ad.status === 'paused' ? 'bi bi-play' : 'bi bi-pause'"></i>
              <span class="btn-text">{{ ad.status === 'paused' ? 'Ativar' : 'Pausar' }}</span>
            </button>
            <button @click="confirmarRemocao(ad._id)" class="btn-remover"><i class="bi bi-trash"></i><span class="btn-text">Remover</span></button>
          </div>
        </div>
      </div>

      <!-- MODAL (igual) -->
      <!-- MODAL TOTALMENTE REFORMULADO -->
<div v-if="modalAberto" class="modal-overlay" @click="fecharModal">
  <div class="modal-content pro-stats-modal" @click.stop>
    <header class="modal-header">
      <h2>
        <i class="bi bi-graph-up-arrow"></i>
        Estatísticas Detalhadas: {{ anuncioModal?.name }}
      </h2>
      <button @click="fecharModal" class="modal-close"><i class="bi bi-x-lg"></i></button>
    </header>

    <div class="modal-body">
      <!-- 4 CARDS PRINCIPAIS -->
      <div class="stats-grid">
        <div class="stat-card big">
          <i class="bi bi-eye"></i>
          <h3>{{ formatNumber(anuncioModal?.views || 0) }}</h3>
          <p>Visualizações</p>
        </div>
        <div class="stat-card big">
          <i class="bi bi-whatsapp"></i>
          <h3>{{ formatNumber(anuncioModal?.clicks || 0) }}</h3>
          <p>Cliques Totais</p>
        </div>
        <div class="stat-card big">
          <i class="bi bi-people"></i>
          <h3>{{ formatNumber(anuncioModal?.impressions || 0) }}</h3>
          <p>Impressões</p>
        </div>
        <div class="stat-card big ctr">
          <i class="bi bi-percent"></i>
          <h3>{{ ctrTotal.toFixed(2) }}%</h3>
          <p>Taxa de Cliques (CTR)</p>
        </div>
      </div>

      <!-- GRÁFICO PREMIUM -->
      <div class="chart-wrapper">
        <div class="chart-header">
          <h3>Desempenho nos últimos dias</h3>
          <div class="chart-legend">
            <span><i class="dot" style="background:#8b5cf6"></i> Cliques</span>
            <span><i class="dot" style="background:#10b981"></i> Visualizações</span>
            <span><i class="dot" style="background:#f59e0b"></i> CTR (%)</span>
          </div>
        </div>
        <div v-if="anuncioModal?.statsHistory?.length" class="chart-container">
          <canvas ref="chartRef"></canvas>
        </div>
        <div v-else class="no-data">
          <i class="bi bi-bar-chart-line"></i>
          Ainda sem dados suficientes para exibir o gráfico
        </div>
      </div>
    </div>
  </div>
</div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import io from 'socket.io-client'
import Chart from 'chart.js/auto'

const router = useRouter()
const anuncios = ref([])
const loading = ref(true)
const error = ref('')
const filtroStatus = ref('todos')
const filtroUsuario = ref('')
const modalAberto = ref(false)
const anuncioModal = ref(null)
const chartRef = ref(null)
let chart = null
let socket = null

// Debounce reutilizável (mais limpo)
const useDebounce = (fn, delay = 400) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// Filtros combinados (status + busca por texto no frontend)
const anunciosFiltrados = computed(() => {
  let list = anuncios.value

  if (filtroStatus.value !== 'todos') {
    list = list.filter(a => a.status === filtroStatus.value)
  }

  if (filtroUsuario.value.trim()) {
    const termo = filtroUsuario.value.toLowerCase().trim()
    list = list.filter(ad =>
      (ad.userName?.toLowerCase().includes(termo)) ||
      (ad.userEmail?.toLowerCase().includes(termo))
    )
  }

  return list
})

const countByStatus = computed(() => {
  const c = { active: 0, pending: 0, paused: 0 }
  anuncios.value.forEach(a => {
    if (c[a.status] !== undefined) c[a.status]++
  })
  return c
})

const totalAnuncios = computed(() => anuncios.value.length)

const aplicarFiltro = async () => {
  loading.value = true
  error.value = ''
  try {
    const params = new URLSearchParams()
    if (filtroStatus.value !== 'todos') params.append('status', filtroStatus.value)
    if (filtroUsuario.value.trim()) params.append('usuario', filtroUsuario.value.trim())

    const res = await api.get(`/anuncios/admin${params.toString() ? `?${params}` : ''}`)
    anuncios.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    error.value = err.response?.status === 401 ? 'Sessão expirada.' :
                  err.response?.status === 403 ? 'Acesso negado.' :
                  err.response?.data?.mensagem || 'Erro ao carregar.'
  } finally {
    loading.value = false
  }
}

const formatPrice = v => new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN', minimumFractionDigits: 0 }).format(v)
const formatDate = d => new Date(d).toLocaleDateString('pt-MZ')

// Corrigido o nome da função
const getStatusText = (s) => ({
  active: 'Ativo',
  pending: 'Pendente',
  paused: 'Pausado'
}[s] || 'Indefinido')

const handleImageError = e => { e.target.src = '/img/placeholder-ad.jpg'; e.target.classList.add('error') }
const onImageLoad = e => e.target.classList.add('loaded')

const toggleStatus = async (ad) => {
  const novo = ad.status === 'paused' ? 'active' : 'paused'
  if (!confirm(`Deseja ${novo === 'active' ? 'ativar' : 'pausar'} este anúncio?`)) return
  try {
    await api.patch(`/anuncios/admin/${ad._id}/status`, { status: novo })
    ad.status = novo
  } catch (e) { alert(e.response?.data?.mensagem || 'Erro') }
}

const confirmarRemocao = async (id) => {
  if (!confirm('Remover permanentemente este anúncio?')) return
  try {
    await api.delete(`/anuncios/admin/${id}`)
    anuncios.value = anuncios.value.filter(a => a._id !== id)
  } catch (e) { alert(e.response?.data?.mensagem || 'Erro') }
}

const abrirStats = async (ad) => {
  try {
    const res = await api.get(`/anuncios/admin/${ad._id}/stats`)
    anuncioModal.value = { ...ad, ...res.data }
    modalAberto.value = true
    await nextTick()
    criarOuAtualizarGrafico()
  } catch (e) { alert('Erro ao carregar estatísticas') }
}

const fecharModal = () => {
  modalAberto.value = false
  anuncioModal.value = null
  if (chart) { chart.destroy(); chart = null }
}

const recarregar = () => aplicarFiltro()

// Adiciona estes helpers no <script setup>
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const ctrTotal = computed(() => {
  if (!anuncioModal.value) return 0
  const views = anuncioModal.value.views || 0
  const clicks = anuncioModal.value.clicks || 0
  return views > 0 ? (clicks / views) * 100 : 0
})

// GRÁFICO TOTALMENTE REFORMULADO
const criarOuAtualizarGrafico = () => {
  if (!chartRef.value || !anuncioModal.value?.statsHistory?.length) return

  const history = anuncioModal.value.statsHistory
  const labels = history.map(h => {
    const date = new Date(h.date)
    const day = date.getDate()
    const month = date.toLocaleString('pt-MZ', { month: 'short' })
    return `${day} ${month}`
  })

  const clicksData = history.map(h => h.clicks || 0)
  const viewsData = history.map(h => h.views || 0)
  const ctrData = history.map(h => {
    const v = h.views || 0
    return v > 0 ? ((h.clicks || 0) / v) * 100 : 0
  })

  if (chart) chart.destroy()

  chart = new Chart(chartRef.value.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Cliques',
          data: clicksData,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#8b5cf6',
          pointRadius: 5,
          pointHoverRadius: 8
        },
        {
          label: 'Visualizações',
          data: viewsData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#10b981',
          pointRadius: 4,
          borderWidth: 3
        },
        {
          label: 'CTR (%)',
          data: ctrData,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: false,
          tension: 0.3,
          yAxisID: 'y1',
          pointRadius: 3,
          borderDash: [5, 5]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.9)',
          titleColor: '#e2e8f0',
          bodyColor: '#e2e8f0',
          cornerRadius: 12,
          displayColors: true,
          callbacks: {
            label: (ctx) => {
              if (ctx.dataset.label === 'CTR (%)') {
                return ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}%`
              }
              return ` ${ctx.dataset.label}: ${formatNumber(ctx.parsed.y)}`
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.06)' },
          ticks: { color: '#94a3b8', callback: value => formatNumber(value) }
        },
        y1: {
          position: 'right',
          beginAtZero: true,
          max: 100,
          grid: { drawOnChartArea: false },
          ticks: { color: '#f59e0b', callback: value => value + '%' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8' }
        }
      }
    }
  })
}

onMounted(() => {
  aplicarFiltro()
  socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', { transports: ['websocket'] })

  socket.on('anuncio:view', (data) => {
    const ad = anuncios.value.find(a => a._id === data.anuncioId)
    if (ad) ad.views = data.views
  })

  socket.on('anuncio:click', (data) => {
    const ad = anuncios.value.find(a => a._id === data.anuncioId)
    if (ad) ad.clicks = data.clicks
  })
})

onUnmounted(() => {
  if (socket) socket.disconnect()
  if (chart) chart.destroy()
})
</script>



<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css');

/* Força Poppins em tudo */
* { font-family: 'Poppins', sans-serif !important; }

.admin-anuncios {
  min-height: 100vh;
  background: radial-gradient(circle at top left, #120024, #000);
  color: #fff;
  padding: 1.8rem 1.5rem;
}

/* ============= ESTADOS (loading/error) ============= */
.loading-state, .error-state {
  text-align: center;
  margin-top: 6rem;
  opacity: 0.9;
}
.loading-state i, .error-state i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: block;
  color: #7c3aed;
}
.error-state i { color: #ff6b6b; }
.retry-btn {
  background: #7c3aed;
  color: #fff;
  padding: 0.7rem 1.4rem;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: 0.3s;
  font-weight: 600;
}
.retry-btn:hover { background: #6d28d9; transform: translateY(-1px); }

/* ============= HEADER PREMIUM ============= */
.premium-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding-bottom: 1.8rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.compact-stats {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;
}

.cstat {
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 0.75rem 1.1rem;
  min-width: 90px;
  text-align: center;
  border: 1.5px solid transparent;
  background-clip: padding-box;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
}

.cstat::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  padding: 2px;
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.cstat:hover::before { opacity: 1; }
.cstat:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3); }

.cstat.total   { --gradient-start: #6366f1; --gradient-end: #8b5cf6; }
.cstat.active  { --gradient-start: #34d399; --gradient-end: #10b981; }
.cstat.pending { --gradient-start: #fbbf24; --gradient-end: #f59e0b; }
.cstat.paused  { --gradient-start: #94a3b8; --gradient-end: #64748b; }

.cstat-value {
  font-size: 1.65rem;
  font-weight: 800;
  line-height: 1;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.cstat-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-top: 0.35rem;
  color: #e2e8f0;
  opacity: 0.9;
}

/* Responsivo – em telas pequenas empilha os contadores */
@media (max-width: 992px) {
  .premium-header {
    flex-direction: column;
    text-align: center;
  }
  .compact-stats {
    justify-content: center;
  }
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #fff;
  padding: 0.75rem 1.4rem;
  border-radius: 14px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}
.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}
.back-button i { font-size: 1.3rem; color: #c4b5fd; }

.title-section .page-title {
  font-size: 2.1rem;
  font-weight: 800;
  margin: 0;
  color: #e0d0ff;
  display: flex;
  align-items: center;
  gap: 0.9rem;
}
.title-section .page-title i { color: #a78bfa; font-size: 2rem; }

.page-subtitle {
  margin: 0.4rem 0 0;
  font-size: 0.95rem;
  color: #cbd5e1;
  font-weight: 500;
  opacity: 0.9;
}

/* Contadores compactos */
.header-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.stat-badge {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  padding: 0.9rem 1.3rem;
  min-width: 100px;
  text-align: center;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}
.stat-badge:hover { transform: translateY(-4px); box-shadow: 0 8px 18px rgba(0,0,0,0.25); }
.stat-badge.total   { border-color: #818cf8; }
.stat-badge.active  { border-color: #34d399; }
.stat-badge.pending { border-color: #fbbf24; }
.stat-badge.paused  { border-color: #94a3b8; }
.stat-badge .number { display: block; font-size: 1.6rem; font-weight: 800; line-height: 1; color: #fff; }
.stat-badge .label { font-size: 0.78rem; margin-top: 0.35rem; opacity: 0.85; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.5px; }

/* ============= BARRA DE FILTROS ============= */
.filters-bar {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 18px;
  padding: 1.3rem 1.6rem;
  margin-bottom: 2.2rem;
}
.filter-controls {
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
  align-items: center;
}
.filter-select {
  padding: 0.85rem 1.3rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 0.94rem;
  font-weight: 500;
  min-width: 200px;
}
.search-box { position: relative; }
.search-box i {
  position: absolute;
  left: 1.1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 1.1rem;
  pointer-events: none;
}
.search-input {
  padding: 0.85rem 1.3rem 0.85rem 3.2rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 0.94rem;
  width: 300px;
  max-width: 100%;
}
.search-input::placeholder { color: rgba(255,255,255,0.5); }

/* ============= GRID DE ANÚNCIOS ============= */
.grid-anuncios {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.8rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* ============= CARD (mantido exatamente como você queria) ============= */
.anuncio-card {
  position: relative;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 1rem;
  padding: 1rem;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.6s ease forwards;
  animation-delay: calc(0.1s * var(--i));
  display: flex;
  flex-direction: column;
}
.anuncio-card:hover { transform: translateY(-6px); box-shadow: 0 12px 32px rgba(0,0,0,0.35); }

.anuncio-status {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  padding: 0.25rem 0.7rem;
  border-radius: 1rem;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 2;
}
.anuncio-status.active { background: #4caf50; color: #fff; }
.anuncio-status.pending { background: #ff9800; color: #fff; }
.anuncio-status.paused { background: #9e9e9e; color: #fff; }

.anuncio-img {
  width: 100%;
  height: 170px;
  object-fit: cover;
  border-radius: 0.8rem;
  margin-bottom: 0.8rem;
  opacity: 0;
  transition: opacity 0.4s ease;
  background: #1a1a1a;
}
.anuncio-img.loaded { opacity: 1; }
.anuncio-img.error { opacity: 0.7; }

.anuncio-info { flex: 1; margin-bottom: 0.8rem; }
.anuncio-titulo {
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fff;
}
.anuncio-desc {
  font-size: 0.85rem;
  color: #d9d9d9;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.anuncio-preco {
  font-weight: 700;
  font-size: 1.05rem;
  color: #81c784;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 0.3rem;
}
.anuncio-user { font-size: 0.8rem; color: #a0a0a0; }

.anuncio-stats {
  margin-bottom: 0.8rem;
  padding: 0.5rem;
  background: rgba(255,255,255,0.05);
  border-radius: 0.5rem;
}
.stat-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #d9d9d9;
  margin-bottom: 0.3rem;
}
.stat-row:last-child { margin-bottom: 0; }
.stat-row i { color: #7c3aed; }

.anuncio-acoes {
  display: flex;
  gap: 0.4rem;
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.anuncio-acoes button {
  flex: 1;
  padding: 0.48rem 0.6rem;
  border-radius: 7px;
  border: none;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  font-weight: 500;
  min-height: 36px;
  white-space: nowrap;
}
.btn-text { display: none; }
.btn-stats { background: rgba(124, 58, 237, 0.3); color: #fff; }
.btn-stats:hover { background: rgba(124, 58, 237, 0.5); }
.btn-pausar { background: #ff9800; color: #fff; }
.btn-pausar:hover { background: #f57c00; }
.btn-ativar { background: #4caf50; color: #fff; }
.btn-ativar:hover { background: #45a049; }
.btn-remover { background: rgba(239,68,68,0.2); color: #ff6666; }
.btn-remover:hover { background: rgba(239,68,68,0.35); }

/* ============= MODAL ============= */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.modal-header h2 { margin: 0; color: #fff; font-size: 1.2rem; }
.modal-close { background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer; opacity: 0.7; }
.modal-close:hover { opacity: 1; }
.modal-body { padding: 1.5rem; }
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.stat-card {
  text-align: center;
  padding: 1rem;
  background: rgba(255,255,255,0.05);
  border-radius: 0.8rem;
}
.stat-card i { font-size: 2rem; color: #7c3aed; margin-bottom: 0.5rem; display: block; }
.stat-card h3 { margin: 0; font-size: 1.5rem; color: #fff; }
.stat-card p { margin: 0.3rem 0 0; color: #d9d9d9; font-size: 0.85rem; }

.chart-container {
  position: relative;
  height: 300px;
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(255,255,255,0.05);
  border-radius: 0.8rem;
}
.no-data { text-align: center; padding: 2rem; color: #94a3b8; font-size: 0.95rem; }

/* ============= ANIMAÇÃO ============= */
@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

/* ============= RESPONSIVO ============= */
@media (max-width: 992px) {
  .premium-header { flex-direction: column; text-align: center; }
  .title-section .page-title { font-size: 1.9rem; justify-content: center; }
  .header-stats { justify-content: center; }
}
@media (max-width: 768px) {
  .admin-anuncios { padding: 1rem; }
  .grid-anuncios { grid-template-columns: 1fr; gap: 1.5rem; }
  .filter-controls { flex-direction: column; align-items: stretch; }
  .filter-select, .search-input { width: 100%; }
  .back-button { width: 100%; justify-content: center; }
  .anuncio-acoes button { padding: 0.45rem 0.5rem; font-size: 0.75rem; min-height: 34px; }
  .btn-text { display: inline; }
}
@media (min-width: 769px) {
  .btn-text { display: inline; }
}



/* SKELETON LOADING */
.skeleton {
  animation: pulse 1.8s ease-in-out infinite;
}
.skeleton-img {
  height: 170px;
  background: #2d1b3a;
  border-radius: 0.8rem;
  margin-bottom: 0.8rem;
}
.skeleton-line {
  height: 16px;
  background: #2d1b3a;
  border-radius: 8px;
  margin-bottom: 0.6rem;
}
.skeleton-line.short { width: 70%; }
.skeleton-btn {
  height: 36px;
  background: #2d1b3a;
  border-radius: 7px;
  flex: 1;
}
@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

/* Botões: texto só aparece no hover (desktop) */
.btn-text {
  display: none;
}
@media (min-width: 769px) {
  .anuncio-acoes button:hover .btn-text {
    display: inline;
  }
}
@media (max-width: 768px) {
  .btn-text {
    display: inline;
  }
}

/* Contadores com transição suave */
.cstat-value {
  transition: all 0.4s ease;
}
</style>