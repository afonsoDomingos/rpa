<template>
  <div class="meus-anuncios">
    <!-- LOADING -->
    <div v-if="loading" class="loading-state">
      <i class="bi bi-hourglass-split"></i>
      <p>Carregando seus anúncios...</p>
    </div>

    <!-- ERRO -->
    <div v-else-if="error" class="error-state">
      <i class="bi bi-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button @click="recarregar" class="retry-btn">Tentar novamente</button>
    </div>

    <!-- VAZIO -->
    <div v-else-if="!anuncios.length" class="empty-state">
      <i class="bi bi-megaphone-fill"></i>
      <p>Ainda não existem anúncios publicados.</p>
      <button @click="$router.push('/anuncie')" class="new-btn">
        <i class="bi bi-plus-circle"></i> Criar Anúncio
      </button>
    </div>

    <!-- LISTA -->
    <div v-else>
      <header class="header">
        <button @click="$router.go(-1)" class="back-btn">
          <i class="bi bi-arrow-left"></i> Voltar
        </button>
        <h1 class="page-title">Meus Anúncios</h1>
      </header>

      <div class="grid-anuncios">
        <div v-for="(ad, i) in anuncios" :key="ad._id" class="anuncio-card" :style="{ '--i': i }">
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
          </div>

          <!-- AÇÕES -->
          <div class="anuncio-acoes">
            <a :href="ad.ctaLink" target="_blank" class="btn-contato">
              <i class="bi bi-whatsapp"></i> Contactar
            </a>
            <button @click="editarAnuncio(ad)" class="btn-editar">
              <i class="bi bi-pencil"></i> Editar
            </button>
            <button @click="confirmarRemocao(ad._id)" class="btn-remover">
              <i class="bi bi-trash"></i> Remover
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()
const anuncios = ref([])
const loading = ref(true)
const error = ref('')

// Formatar preço
const formatPrice = (value) => {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 0
  }).format(value)
}

// Status traduzido
const getStatusText = (status) => {
  switch (status) {
    case 'active': return 'Ativo'
    case 'pending': return 'Pendente'
    case 'paused': return 'Pausado'
    default: return 'Indefinido'
  }
}

// Imagem fallback
const handleImageError = (e) => {
  e.target.src = '/img/placeholder-ad.jpg'
  e.target.classList.add('error')
}

const onImageLoad = (e) => {
  e.target.classList.add('loaded')
}

// EDITAR ANÚNCIO (PASSA DADOS COMPLETOS)
const editarAnuncio = (ad) => {
  // Salva no localStorage para o formulário carregar
  localStorage.setItem('anuncioParaEditar', JSON.stringify({
    id: ad._id,
    name: ad.name,
    description: ad.description,
    price: ad.price,
    ctaLink: ad.ctaLink,
    imageUrl: ad.image // para pré-visualização
  }))

  router.push('/anuncie/editar')
}

// Remover
const confirmarRemocao = async (id) => {
  if (!confirm('Tem certeza que deseja remover este anúncio?')) return

  try {
    await api.delete(`/anuncios/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    anuncios.value = anuncios.value.filter(a => a._id !== id)
  } catch (err) {
    alert(err.response?.data?.mensagem || 'Erro ao remover anúncio.')
  }
}

// Recarregar
const recarregar = () => {
  loading.value = true
  error.value = ''
  carregarAnuncios()
}

// Carregar anúncios
const carregarAnuncios = async () => {
  try {
    const res = await api.get('/anuncios/meus', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })

    anuncios.value = Array.isArray(res.data) ? res.data : res.data.anuncios || []

  } catch (err) {
    console.error('Erro ao carregar anúncios:', err)
    error.value = err.response?.data?.mensagem || 'Não foi possível carregar os anúncios.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  carregarAnuncios()
})
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css');
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.meus-anuncios {
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  padding: 2rem;
  background: radial-gradient(circle at top left, #120024, #000);
  color: #fff;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  margin-top: 6rem;
  opacity: 0.9;
}

.loading-state i, .error-state i, .empty-state i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: block;
}

.loading-state i { color: #7c3aed; animation: spin 1.5s linear infinite; }
.error-state i { color: #ff6b6b; }
.empty-state i { color: #66bb6a; }

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.retry-btn, .new-btn {
  margin-top: 1rem;
  background: #7c3aed;
  color: #fff;
  padding: 0.7rem 1.4rem;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: 0.3s;
  font-weight: 600;
}

.retry-btn:hover, .new-btn:hover { 
  background: #6d28d9; 
  transform: translateY(-1px);
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #ffffff !important; /* BRANCO */
  font-family: 'Poppins', sans-serif;
  margin: 0;
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

.grid-anuncios {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.8rem;
}

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
}

.anuncio-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.35);
}

.anuncio-status {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  padding: 0.25rem 0.7rem;
  border-radius: 1rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.anuncio-status.active { background: #4caf50; color: #fff; }
.anuncio-status.pending { background: #ff9800; color: #fff; }
.anuncio-status.paused { background: #9e9e9e; color: #fff; }

.anuncio-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 0.8rem;
  margin-bottom: 1rem;
  opacity: 0;
  transition: opacity 0.4s ease;
  background: #1a1a1a;
}

.anuncio-img.loaded { opacity: 1; }
.anuncio-img.error { opacity: 0.7; }

.anuncio-titulo {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fff;
}

.anuncio-desc {
  font-size: 0.9rem;
  color: #d9d9d9;
  margin-bottom: 0.6rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.anuncio-preco {
  font-weight: 700;
  font-size: 1.1rem;
  color: #81c784;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 1rem;
}

.anuncio-acoes {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.anuncio-acoes button, .anuncio-acoes a {
  flex: 1;
  padding: 0.55rem 0.7rem;
  border-radius: 8px;
  border: none;
  font-size: 0.85rem;
  cursor: pointer;
  transition: 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-weight: 500;
}

.btn-contato {
  background: #7c3aed;
  color: #fff;
}

.btn-contato:hover { background: #25d366; }

.btn-editar {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.btn-editar:hover { background: rgba(255,255,255,0.2); }

.btn-remover {
  background: rgba(239,68,68,0.2);
  color: #ff6666;
}

.btn-remover:hover { background: rgba(239,68,68,0.35); }

@keyframes fadeUp {
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .grid-anuncios { grid-template-columns: 1fr; }
  .anuncio-acoes { flex-direction: column; }
  .page-title { font-size: 1.4rem; }
}
</style>