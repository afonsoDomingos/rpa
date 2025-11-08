<!-- src/components/anunciantes/MeusAnuncios.vue -->
<template>
  <div class="meus-anuncios">
    <div v-if="loading" class="loading-state">
      <i class="bi bi-hourglass-split"></i>
      <p>Carregando seus anúncios...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="bi bi-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button @click="recarregar" class="retry-btn">Tentar novamente</button>
    </div>

    <div v-else-if="!anuncios.length" class="empty-state">
      <i class="bi bi-megaphone-fill"></i>
      <p>Ainda não existem anúncios publicados.</p>
      <button @click="$router.push('/anuncie')" class="new-btn">
        <i class="bi bi-plus-circle"></i> Criar Anúncio
      </button>
    </div>

    <div v-else>
      <header class="header">
        <button @click="$router.go(-1)" class="back-btn" aria-label="Voltar à página anterior">
          <i class="bi bi-arrow-left" aria-hidden="true"></i> Voltar
        </button>
        <h1>Meus Anúncios</h1>
      </header>

      <div class="grid-anuncios">
        <div
          v-for="(ad, i) in anuncios"
          :key="ad.id"
          class="anuncio-card"
          :style="{ '--i': i }"
        >
          <div class="anuncio-status" :class="ad.status">
            {{ ad.status === 'active' ? 'Ativo' : 'Pausado' }}
          </div>

          <img
            :src="ad.image"
            :alt="`Anúncio: ${ad.name}`"
            class="anuncio-img"
            @error="handleImageError"
            @load="$event.target.classList.add('loaded')"
          />

          <div class="anuncio-info">
            <h3 class="anuncio-titulo">{{ ad.name }}</h3>
            <p class="anuncio-desc">{{ ad.description }}</p>
            <div class="anuncio-preco">
              <i class="bi bi-currency-exchange"></i>
              <span>{{ formatPrice(ad.price) }}</span>
            </div>
          </div>

          <div class="anuncio-acoes">
            <a
              :href="ad.ctaLink"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-contato"
              aria-label="Contactar via WhatsApp"
            >
              <i class="bi bi-whatsapp" aria-hidden="true"></i>
              <span class="visually-hidden">Contactar via WhatsApp</span>
              Contactar
            </a>
            <button @click="editarAnuncio(ad.id)" class="btn-editar" aria-label="Editar anúncio">
              <i class="bi bi-pencil" aria-hidden="true"></i> Editar
            </button>
            <button @click="confirmarRemocao(ad.id)" class="btn-remover" aria-label="Remover anúncio">
              <i class="bi bi-trash" aria-hidden="true"></i> Remover
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

const router = useRouter()
const anuncios = ref([])
const loading = ref(true)
const error = ref('')

const mockData = [
  {
    id: 1,
    name: "Apartamento T3 - Matola",
    description: "Centro, perto do mercado",
    price: 2500000,
    image: "/img/anuncio-exemplo01.jpg",
    ctaLink: "https://wa.me/258841234567",
    status: 'active'
  },
  {
    id: 2,
    name: "Toyota Corolla 2020",
    description: "Baixa km, revisado, garantia",
    price: 850000,
    image: "/img/anuncio-exemplo02.jpg",
    ctaLink: "https://wa.me/258851234567",
    status: 'active'
  },
  {
    id: 3,
    name: "iPhone 14 Pro Max",
    description: "128GB, como novo, com caixa",
    price: 75000,
    image: "/img/anuncio-exemplo03.jpg",
    ctaLink: "https://wa.me/258861234567",
    status: 'paused'
  }
]

const formatPrice = (value) => {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 0
  }).format(value)
}

const handleImageError = (e) => {
  e.target.src = '/img/placeholder-ad.jpg'
}

const editarAnuncio = (id) => {
  router.push(`/anuncie/editar/${id}`)
}

const confirmarRemocao = (id) => {
  if (confirm('Tem certeza que deseja remover este anúncio?')) {
    anuncios.value = anuncios.value.filter(a => a.id !== id)
  }
}

const recarregar = () => {
  loading.value = true
  error.value = ''
  carregarAnuncios()
}

const carregarAnuncios = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    anuncios.value = mockData
  } catch (err) {
    error.value = 'Não foi possível carregar os anúncios. Verifique sua conexão.'
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

.loading-state i { color: #7c3aed; }
.error-state i { color: #ff6b6b; }
.empty-state i { color: #66bb6a; }

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

.retry-btn:hover, .new-btn:hover { background: #6d28d9; }

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.header h1 { font-size: 1.6rem; font-weight: 700; }

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
.anuncio-status.paused { background: #ff9800; color: #fff; }

.anuncio-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 0.8rem;
  margin-bottom: 1rem;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.anuncio-img.loaded { opacity: 1; }

.anuncio-titulo {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes fadeUp {
  to { opacity: 1; transform: translateY(0); }
}
</style>