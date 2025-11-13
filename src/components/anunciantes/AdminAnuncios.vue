<template>
  <div class="admin-anuncios">
    <!-- LOADING -->
    <div v-if="loading" class="loading-state">
      <i class="bi bi-hourglass-split"></i>
      <p>Carregando anúncios...</p>
    </div>

    <!-- ERRO -->
    <div v-else-if="error" class="error-state">
      <i class="bi bi-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button @click="recarregar" class="retry-btn">Tentar novamente</button>
    </div>

    <!-- LISTA -->
    <div v-else>
      <header class="header">
        <button @click="$router.go(-1)" class="back-btn">
          <i class="bi bi-arrow-left"></i> Voltar
        </button>
        <h1 class="page-title">Admin - Anúncios</h1>
      </header>

      <!-- FILTROS -->
      <div class="filters">
        <div class="filter-group">
          <select v-model="filtroStatus" @change="aplicarFiltro" class="filter-select">
            <option value="todos">Todos</option>
            <option value="active">Ativos</option>
            <option value="pending">Pendentes</option>
            <option value="paused">Pausados</option>
          </select>

          <input
            v-model="filtroUsuario"
            @input="debouncedFiltro"
            placeholder="Filtrar por usuário"
            class="filter-input"
          />
        </div>

        <div class="filter-stats">
          <span class="stat-item">Total: {{ totalAnuncios }}</span>
          <span class="stat-item">Ativos: {{ countByStatus.active }}</span>
          <span class="stat-item">Pendentes: {{ countByStatus.pending }}</span>
          <span class="stat-item">Pausados: {{ countByStatus.paused }}</span>
        </div>
      </div>

      <!-- GRID -->
      <div class="grid-anuncios">
        <div
          v-for="(ad, i) in anunciosFiltrados"
          :key="ad._id"
          class="anuncio-card"
          :style="{ '--i': i }"
        >
          <!-- STATUS -->
          <div class="anuncio-status" :class="ad.status">
            {{ getStatusText(ad.status) }}
          </div>

          <!-- IMAGEM -->
          <img
            :src="ad.image"
            :alt="ad.name"
            class="anuncio-img"
            @error="handleImageError"
            @load="onImageLoad"
          />

          <!-- INFO -->
          <div class="anuncio-info">
            <h3 class="anuncio-titulo">{{ ad.name }}</h3>
            <p class="anuncio-desc">{{ ad.description }}</p>
            <div class="anuncio-preco">
              <i class="bi bi-currency-exchange"></i>
              <span>{{ formatPrice(ad.price) }}</span>
            </div>
            <div class="anuncio-user">
              {{ ad.userName || 'Anônimo' }}
              <small v-if="ad.userEmail">({{ ad.userEmail }})</small>
            </div>
          </div>

          <!-- ESTATÍSTICAS -->
          <div class="anuncio-stats">
            <div class="stat-row">
              <i class="bi bi-eye"></i> Visualizações: <strong>{{ ad.views || 0 }}</strong>
            </div>
            <div class="stat-row">
              <i class="bi bi-whatsapp"></i> Cliques: <strong>{{ ad.clicks || 0 }}</strong>
            </div>
            <div v-if="ad.expiresAt" class="stat-row">
              <i class="bi bi-clock"></i> Expira: {{ formatDate(ad.expiresAt) }}
            </div>
          </div>

          <!-- AÇÕES -->
          <div class="anuncio-acoes">
            <button @click="abrirStats(ad)" class="btn-stats">
              <i class="bi bi-graph-up"></i>
              <span class="btn-text">Estatísticas</span>
            </button>

            <button
              @click="toggleStatus(ad)"
              :class="['btn-status', ad.status === 'paused' ? 'btn-ativar' : 'btn-pausar']"
            >
              <i :class="ad.status === 'paused' ? 'bi bi-play' : 'bi bi-pause'"></i>
              <span class="btn-text">{{ ad.status === 'paused' ? 'Ativar' : 'Pausar' }}</span>
            </button>

            <button @click="confirmarRemocao(ad._id)" class="btn-remover">
              <i class="bi bi-trash"></i>
              <span class="btn-text">Remover</span>
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL COM GRÁFICO -->
      <div v-if="modalAberto" class="modal-overlay" @click="fecharModal">
        <div class="modal-content" @click.stop>
          <header class="modal-header">
            <h2>Estatísticas: {{ anuncioModal?.name }}</h2>
            <button @click="fecharModal" class="modal-close"><i class="bi bi-x"></i></button>
          </header>
          <div class="modal-body">
            <div class="stats-grid">
              <div class="stat-card"><i class="bi bi-eye"></i><h3>{{ anuncioModal?.views || 0 }}</h3><p>Visualizações</p></div>
              <div class="stat-card"><i class="bi bi-whatsapp"></i><h3>{{ anuncioModal?.clicks || 0 }}</h3><p>Cliques</p></div>
              <div class="stat-card"><i class="bi bi-people"></i><h3>{{ anuncioModal?.impressions || 0 }}</h3><p>Impressões</p></div>
              <div class="stat-card"><i class="bi bi-clock-history"></i><h3>{{ anuncioModal?.duration || 'N/A' }} dias</h3><p>Duração</p></div>
            </div>

            <div v-if="anuncioModal?.statsHistory?.length" class="chart-container">
              <canvas ref="chartRef"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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

// === DEBOUNCE ===
let debounceTimer
const debouncedFiltro = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(aplicarFiltro, 400)
}

// === FILTROS ===
const anunciosFiltrados = computed(() => {
  if (filtroStatus.value === 'todos') return anuncios.value
  return anuncios.value.filter(a => a.status === filtroStatus.value)
})

const countByStatus = computed(() => {
  const c = { active: 0, pending: 0, paused: 0 }
  anuncios.value.forEach(a => c[a.status] = (c[a.status] || 0) + 1)
  return c
})

const totalAnuncios = computed(() => anuncios.value.length)

// === CARREGAR COM FILTROS ===
const aplicarFiltro = async () => {
  loading.value = true
  error.value = ''

  try {
    const params = new URLSearchParams()
    if (filtroStatus.value !== 'todos') params.append('status', filtroStatus.value)
    if (filtroUsuario.value.trim()) params.append('usuario', filtroUsuario.value.trim())

    const res = await api.get(`/admin/anuncios${params.toString() ? `?${params}` : ''}`)
    anuncios.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('Erro ao carregar:', err)
    if (err.response?.status === 401) error.value = 'Sessão expirada.'
    else if (err.response?.status === 403) error.value = 'Acesso negado.'
    else error.value = err.response?.data?.mensagem || 'Erro ao carregar.'
  } finally {
    loading.value = false
  }
}

// === UTILIDADES ===
const formatPrice = v => new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN', minimumFractionDigits: 0 }).format(v)
const formatDate = d => new Date(d).toLocaleDateString('pt-MZ')
const getStatusText = s => ({ active: 'Ativo', pending: 'Pendente', paused: 'Pausado' })[s] || 'Indefinido'

// === IMAGEM ===
const handleImageError = e => { e.target.src = '/img/placeholder-ad.jpg'; e.target.classList.add('error') }
const onImageLoad = e => e.target.classList.add('loaded')

// === AÇÕES ===
const toggleStatus = async (ad) => {
  const novo = ad.status === 'paused' ? 'active' : 'paused'
  if (!confirm(`Deseja ${novo === 'active' ? 'ativar' : 'pausar'}?`)) return

  try {
    await api.patch(`/admin/anuncios/${ad._id}/status`, { status: novo })
    ad.status = novo
  } catch (e) {
    alert(e.response?.data?.mensagem || 'Erro ao alterar status')
  }
}

const confirmarRemocao = async (id) => {
  if (!confirm('Remover permanentemente?')) return
  try {
    await api.delete(`/admin/anuncios/${id}`)
    anuncios.value = anuncios.value.filter(a => a._id !== id)
  } catch (e) {
    alert(e.response?.data?.mensagem || 'Erro ao remover')
  }
}

const abrirStats = async (ad) => {
  try {
    const res = await api.get(`/admin/anuncios/${ad._id}/stats`)
    anuncioModal.value = { ...ad, ...res.data }
    modalAberto.value = true
  } catch (e) {
    alert(e.response?.data?.mensagem || 'Erro ao carregar estatísticas')
  }
}

const fecharModal = () => { modalAberto.value = false; anuncioModal.value = null }

const recarregar = () => aplicarFiltro()

// === ATUALIZAÇÃO EM TEMPO REAL ===
const atualizarEstatisticaLocal = (anuncioId, campo, valor) => {
  const anuncio = anuncios.value.find(a => a._id === anuncioId)
  if (anuncio) {
    anuncio[campo] = valor
  }
}

// === GRÁFICO ===
watch(() => anuncioModal.value, (novo) => {
  if (novo && chartRef.value) {
    if (chart) chart.destroy()

    const ctx = chartRef.value.getContext('2d')
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: novo.statsHistory.map(h => new Date(h.date).toLocaleDateString('pt-MZ')),
        datasets: [{
          label: 'Cliques por dia',
          data: novo.statsHistory.map(h => h.clicks),
          borderColor: '#7c3aed',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    })
  }
}, { deep: true })

// === MONTAGEM ===
onMounted(() => {
  aplicarFiltro()

  // Socket.IO
  socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000')

  socket.on('anuncio:view', (data) => {
    atualizarEstatisticaLocal(data.anuncioId, 'views', data.views)
  })

  socket.on('anuncio:click', (data) => {
    atualizarEstatisticaLocal(data.anuncioId, 'clicks', data.clicks)
  })
})

onUnmounted(() => {
  if (socket) socket.disconnect()
  if (chart) chart.destroy()
})
</script>



<style scoped>
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css');
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.admin-anuncios {
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  padding: 1.5rem;
  background: radial-gradient(circle at top left, #120024, #000);
  color: #fff;
}

/* === ESTADOS === */
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

/* === HEADER === */
.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
.page-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  flex: 1;
}
.back-btn {
  background: none;
  border: 1px solid rgba(255,255,255,0.3);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.back-btn:hover { background: rgba(255,255,255,0.1); }

/* === FILTROS === */
.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.filter-select {
  background: rgba(255,255,255,0.1);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
}
.filter-select option { color: #000; }
.filter-stats {
  display: flex;
  gap: 1.5rem;
  font-size: 0.85rem;
  opacity: 0.9;
}
.stat-item { color: #d9d9d9; }

/* === GRID === */
.grid-anuncios {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.8rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* === CARD === */
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
.anuncio-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.35);
}

/* === STATUS === */
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

/* === IMAGEM === */
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

.chart-container {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(255,255,255,0.05);
  border-radius: 0.8rem;
}

.anuncio-img.loaded { opacity: 1; }
.anuncio-img.error { opacity: 0.7; }

/* === INFO === */
.anuncio-info {
  flex: 1;
  margin-bottom: 0.8rem;
}
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
.anuncio-user {
  font-size: 0.8rem;
  color: #a0a0a0;
}

/* === ESTATÍSTICAS === */
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

/* === AÇÕES === */
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

.btn-stats {
  background: rgba(124, 58, 237, 0.3);
  color: #fff;
}
.btn-stats:hover { background: rgba(124, 58, 237, 0.5); }

.btn-pausar {
  background: #ff9800;
  color: #fff;
}
.btn-pausar:hover { background: #f57c00; }

.btn-ativar {
  background: #4caf50;
  color: #fff;
}
.btn-ativar:hover { background: #45a049; }

.btn-remover {
  background: rgba(239,68,68,0.2);
  color: #ff6666;
}
.btn-remover:hover { background: rgba(239,68,68,0.35); }

/* === MODAL === */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
.modal-header h2 {
  margin: 0;
  color: #fff;
  font-size: 1.2rem;
}
.modal-close {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.7;
}
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
.stats-history {
  background: rgba(255,255,255,0.05);
  padding: 1rem;
  border-radius: 0.5rem;
}
.stats-history h4 { margin: 0 0 0.5rem; color: #fff; }
.stats-history ul {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}
.stats-history li {
  padding: 0.3rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-size: 0.85rem;
  color: #d9d9d9;
}

/* === ANIMAÇÃO === */
@keyframes fadeUp {
  to { opacity: 1; transform: translateY(0); }
}

/* === RESPONSIVO === */
@media (max-width: 768px) {
  .admin-anuncios { padding: 1rem; }
  .grid-anuncios { grid-template-columns: 1fr; gap: 1.5rem; }
  .page-title { font-size: 1.4rem; }
  .header { gap: 0.8rem; }
  .filters { flex-direction: column; align-items: stretch; }
  .filter-stats { justify-content: center; flex-wrap: wrap; }
  .anuncio-acoes { flex-direction: row; gap: 0.35rem; }
  .anuncio-acoes button {
    padding: 0.45rem 0.5rem;
    font-size: 0.75rem;
    min-height: 34px;
  }
  .btn-text { display: inline; }
  .modal-content { width: 95%; margin: 1rem; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 769px) {
  .btn-text { display: inline; }
}
</style>