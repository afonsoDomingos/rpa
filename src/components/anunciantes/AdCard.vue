<template>
  <transition name="slide-slow">
    <div v-if="showAd" class="ad-card-container" @click.self="closeAd">
      
      <!-- PLACEHOLDER QUANDO NÃO TEM ANÚNCIOS -->
      <div v-if="!activeAds.length" class="ad-placeholder">
        <div class="placeholder-icon">
          <i class="bi bi-megaphone-fill"></i>
        </div>
        <p class="placeholder-title">Anuncie aqui</p>
        <span class="placeholder-subtitle">Produtos & Serviços...</span>
        <button @click.stop="$router.push('/anuncie')" class="ad-action-btn">
          <i class="bi bi-plus-circle"></i> Anuncie Aqui
        </button>
      </div>

      <!-- ANÚNCIO ATIVO -->
      <transition name="fade-ad" mode="out-in">
        <div v-if="activeAd" :key="currentIndex" class="ad-content">
          <button @click="closeAd" class="close-btn">
            <i class="bi bi-x-lg"></i>
          </button>

          <div class="ad-sponsored">
            <i class="bi bi-megaphone-fill"></i>
            <span>Patrocinado</span>
          </div>

          <img
            :src="activeAd.image"
            :alt="activeAd.name"
            class="ad-image"
            loading="lazy"
            @load="registrarView(activeAd._id)"
            @error="handleImageError"
          />

          <div class="ad-body">
            <h3 class="ad-title">{{ activeAd.name || 'Anúncio' }}</h3>
            <p class="ad-description">{{ activeAd.description || 'Sem descrição' }}</p>

            <div class="ad-price">
              <i class="bi bi-currency-exchange"></i>
              <strong>{{ formatPrice(activeAd.price || 0) }}</strong>
            </div>

            <div class="ad-action-btn ad-timer-btn">
              <i class="bi bi-clock-history"></i>
              <span>Falta <strong>{{ countdown }}s</strong></span>
            </div>

            <!-- BOTÃO WHATSAPP -->
            <button
              @click.stop="handleWhatsAppClick"
              class="ad-action-btn ad-whatsapp-btn"
              :disabled="enviandoWhatsapp"
            >
              <i class="bi bi-whatsapp"></i>
              {{ enviandoWhatsapp ? 'Abrindo...' : 'Contactar' }}
            </button>

            <button
              v-if="activeAds.length > 1"
              @click="debouncedNextAd"
              class="ad-action-btn ad-next-btn"
            >
              <i class="bi bi-arrow-right-circle-fill"></i>
              <span>Próximo</span>
            </button>

            <button @click.stop="$router.push('/anuncie')" class="ad-action-btn">
              <i class="bi bi-plus-circle"></i>
              <span>Anuncie Aqui</span>
            </button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { debounce } from 'lodash'
import api from '@/api'

const router = useRouter()

// Estado
const showAd = ref(false)
const activeAd = ref(null)
const activeAds = ref([])
const currentIndex = ref(0)
const countdown = ref(30)
const enviandoWhatsapp = ref(false)

let timeoutId = null
let intervalId = null
let pollingInterval = null
let reappearTimeout = null

const ONE_HOUR_MS = 60 * 60 * 1000

// BUSCAR ANÚNCIOS (sempre fresco)
const fetchActiveAds = async () => {
  console.log('%cAdCard: Buscando anúncios fresquinhos...', 'color: cyan; font-weight: bold')

  try {
    const res = await api.get('/anuncios/ativos', { timeout: 10000 })
    const data = Array.isArray(res.data) ? res.data : []

    activeAds.value = data
      .filter(ad => ad && 
        (ad.status === 'active' || ad.status === 'Active') && 
        ad.image && 
        ad._id
      )
      .slice(0, 10) // máximo 10 anúncios

    // Salva no cache para fallback offline
    localStorage.setItem('cachedAds', JSON.stringify(activeAds.value))

    // Se tem anúncios, escolhe um ALEATÓRIO (nunca mais o mesmo toda hora)
    if (activeAds.value.length > 0) {
      currentIndex.value = Math.floor(Math.random() * activeAds.value.length)
      activeAd.value = activeAds.value[currentIndex.value]
      showAd.value = true
      startCountdown()
      console.log(`%cMostrando anúncio #${currentIndex.value + 1}/${activeAds.value.length}`, 'color: lime; font-weight: bold')
    } else {
      activeAd.value = null
      showAd.value = true // mostra placeholder
    }

  } catch (err) {
    console.error('Erro ao buscar anúncios:', err.response || err)
    
    // Tenta carregar do cache se falhar
    const cached = localStorage.getItem('cachedAds')
    if (cached) {
      activeAds.value = JSON.parse(cached)
      if (activeAds.value.length > 0) {
        currentIndex.value = Math.floor(Math.random() * activeAds.value.length)
        activeAd.value = activeAds.value[currentIndex.value]
        showAd.value = true
        startCountdown()
        console.log('Anúncios carregados do cache (offline)')
      }
    }
  }
}

// CONTADOR
const startCountdown = () => {
  countdown.value = 30
  clearTimers()

  intervalId = setInterval(() => {
    if (countdown.value > 0) countdown.value--
  }, 1000)

  timeoutId = setTimeout(closeAd, 30000)
}

const nextAd = () => {
  if (activeAds.value.length <= 1) return
  clearTimers()
  currentIndex.value = (currentIndex.value + 1) % activeAds.value.length
  activeAd.value = activeAds.value[currentIndex.value]
  startCountdown()
}

const debouncedNextAd = debounce(nextAd, 300)

// VIEW + CLIQUE
const registrarView = async (id) => {
  try { await api.post(`/anuncios/${id}/view`) } catch (err) { console.warn('View não registrada', err) }
}

const handleWhatsAppClick = async () => {
  if (enviandoWhatsapp.value) return
  enviandoWhatsapp.value = true

  const ad = activeAd.value

  try { await api.post(`/anuncios/${ad._id}/clique`) } catch (err) { console.warn('Clique não registrado', err) }

  let numero = (ad.phone || '258840000000').replace(/\D/g, '')
  if (numero.length < 9) numero = '258840000000'

  const mensagem = ad.ctaLink
    ? `Olá! Vi o anúncio: *${ad.name}* — ${ad.ctaLink}`
    : `Olá! Gostaria de saber mais sobre *${ad.name}* (R${ad.price})`

  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`
  window.open(url, '_blank', 'noopener,noreferrer')

  setTimeout(() => enviandoWhatsapp.value = false, 1500)
}

// FECHAR → e forçar atualização fresca quando voltar
const closeAd = () => {
  showAd.value = false
  clearTimers()
  localStorage.setItem('adLastClosed', Date.now().toString())

  clearTimeout(reappearTimeout)
  reappearTimeout = setTimeout(() => {
    fetchActiveAds() // ← AQUI: busca anúncios novos quando voltar!
  }, ONE_HOUR_MS)
}

const clearTimers = () => {
  if (timeoutId) clearTimeout(timeoutId)
  if (intervalId) clearInterval(intervalId)
  timeoutId = intervalId = null
}

const handleImageError = (e) => {
  e.target.src = '/img/placeholder-ad.jpg'
}

const formatPrice = (v) => new Intl.NumberFormat('pt-MZ', { 
  style: 'currency', 
  
  currency: 'MZN', 
  minimumFractionDigits: 0 
}).format(v)

// CICLO DE VIDA
onMounted(() => {
  fetchActiveAds() // primeira carga

  // Polling a cada 1 minuto (só quando pode ou deve reaparecer)
  pollingInterval = setInterval(() => {
    const lastClosed = localStorage.getItem('adLastClosed')
    const canReappearNow = !lastClosed || Date.now() - parseInt(lastClosed) >= ONE_HOUR_MS

    if (!showAd.value || canReappearNow) {
      fetchActiveAds() // sempre fresco
    }
  }, 10 * 60 * 1000) // 10 minutos

  window.addEventListener('newAdCreated', fetchActiveAds)
})

onUnmounted(() => {
  clearTimers()
  if (pollingInterval) clearInterval(pollingInterval)
  if (reappearTimeout) clearTimeout(reappearTimeout)
  window.removeEventListener('newAdCreated', fetchActiveAds)
})
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css');
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');

.ad-card-container * {
  font-family: 'Poppins', sans-serif;
}

.ad-card-container {
  position: fixed;
  right: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  width: 260px;
  z-index: 998;
  animation: float 6s ease-in-out infinite;
  pointer-events: auto;
}

/* === PATROCINADO (COM ÍCONE, PEQUENO) === */
.ad-sponsored {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  background: rgba(88, 27, 135, 0.85);
  color: #fff;
  font-size: 0.58rem;
  font-weight: 600;
  padding: 0.2rem 0.45rem;
  border-radius: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  z-index: 5;
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: 0.2px;
  text-transform: none;
}

.ad-sponsored i {
  font-size: 0.75rem;
  opacity: 0.9;
}

/* === BOTÃO PADRÃO (TODOS IGUAIS) === */
.ad-action-btn {
  font-weight: 600;
  font-size: 0.82rem;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  background: rgba(0, 0, 0, 0.25);
  padding: 0.35rem 2.2rem;
  border-radius: 2rem;
  border: 1px solid rgba(102, 187, 106, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0.3rem auto 0;
  width: 100%;
  max-width: 200px;
  height: 36px; /* ALTURA FIXA */
}

.ad-action-btn:hover {
  background: rgba(0, 0, 0, 0.973);
  border-color: rgba(102, 187, 106, 0.6);
  transform: scale(1.05);
}

/* === WHATSAPP (MESMO ESTILO) === */
.ad-whatsapp-btn {
  background: linear-gradient(135deg, #800080, #800080);
  color: #fff;
  border: 1px solid rgba(102, 187, 106, 0.4);
}

.ad-whatsapp-btn:hover {
  background: linear-gradient(135deg, #4caf50, #4caf50);
  transform: scale(1.05);
}

/* === CONTADOR (MESMO ESTILO) === */
.ad-timer-btn {
  background: rgba(255, 138, 101, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  animation: pulse 2s infinite;
  cursor: default;
}

/* === PRÓXIMO ANÚNCIO (MESMO ESTILO) === */
.ad-next-btn {
  background: linear-gradient(135deg, #ffffff, #ffffff);
  color: #800080;
  border: 1px solid rgba(102, 187, 106, 0.4);
}

.ad-next-btn:hover {
  background: #f0f0f0;
  transform: scale(1.05);
}

/* === RESTANTE DO CSS === */
@media (max-width: 1024px) {
  .ad-card-container {
    right: 50%;
    transform: translateX(50%) translateY(-50%);
    width: 90%;
    max-width: 340px;
  }
}

@media (max-width: 480px) {
  .ad-card-container {
    width: 160px;
    right: 0.5rem;
    top: 5.5rem;
    transform: none;
    animation: none;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(-50%) translateY(0); }
  50% { transform: translateY(-50%) translateY(-10px); }
}

.ad-placeholder,
.ad-content {
  background: linear-gradient(135deg, rgba(15, 10, 35, 0.12), rgba(252, 24, 24, 0.15));
  background-size: 200% 200%;
  backdrop-filter: blur(26px);
  -webkit-backdrop-filter: blur(26px);
  border: 1px solid rgba(120, 180, 240, 0.18);
  border-radius: 1.4rem;
  padding: 1.3rem;
  text-align: center;
  cursor: default;
  transition: all 0.7s ease;
  box-shadow: 0 16px 44px rgba(0, 0, 0, 0.32);
  position: relative;
  overflow: hidden;
}

.ad-placeholder:hover,
.ad-content:hover {
  background-position: 100% 100%;
  border-color: rgba(120, 180, 240, 0.38);
  box-shadow: 0 24px 60px rgba(15, 10, 35, 0.38);
}

.placeholder-icon {
  width: 48px;
  height: 48px;
  background: rgba(102, 187, 106, 0.22);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.7rem;
  font-size: 1.5rem;
  color: #66bb6a;
}

.placeholder-title {
  font-weight: 800;
  font-size: 1.2rem;
  color: #ffffff;
  margin: 0 0 0.3rem;
}

.placeholder-subtitle {
  font-weight: 500;
  font-size: 0.82rem;
  color: #b8e6b8;
  margin-bottom: 0.9rem;
}

.close-btn {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  color: #eee;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  transition: all 0.3s;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(46, 241, 7, 0.55);
  color: #ffffff;
  transform: scale(1.1);
}

.ad-image {
  width: 100%;
  height: 130px;
  object-fit: cover;
  border-radius: 0.9rem;
  margin-bottom: 0.9rem;
  background: #141414;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.3);
}

.ad-title {
  font-weight: 500;
  font-size: 1.1rem;
  color: #ffffff;
  margin: 0 0 0.4rem;
  line-height: 1.2;
}

.ad-description {
  font-weight: 300;
  font-size: 0.85rem;
  color: #e0f2e0;
  margin: 0 0 0.7rem;
}

.ad-price {
  font-weight: 700;
  font-size: 1.2rem;
  color: #81c784;
  margin: 0.6rem 0 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}

.slide-slow-enter-active,
.slide-slow-leave-active {
  transition: all 1.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-slow-enter-from,
.slide-slow-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(120px);
}

.fade-ad-enter-active,
.fade-ad-leave-active {
  transition: all 0.5s ease;
}

.fade-ad-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.fade-ad-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

/* RESPONSIVO */
@media (max-width: 768px) {
  .ad-image { height: 160px; }
  .ad-title { font-size: 1rem; }
  .ad-price { font-size: 1.1rem; }
}

@media (max-width: 480px) {
  .ad-image { height: 90px; border-radius: 0.6rem; }
  .placeholder-icon { width: 32px; height: 32px; font-size: 1rem; }
  .placeholder-title { font-size: 0.85rem; }
  .placeholder-subtitle { font-size: 0.65rem; }
  .ad-placeholder, .ad-content { padding: 0.7rem; border-radius: 1rem; }
  .ad-title { font-size: 0.8rem; }
  .ad-description { font-size: 0.65rem; }
  .ad-price { font-size: 0.9rem; }
  .ad-action-btn {
    font-size: 0.62rem;
    padding: 0.25rem 0.9rem;
    gap: 0.25rem;
    height: 30px;
  }
  .close-btn { width: 24px; height: 24px; top: 0.4rem; right: 0.4rem; font-size: 0.75rem; }
  .ad-sponsored {
    top: 0.4rem;
    left: 0.4rem;
    font-size: 0.52rem;
    padding: 0.15rem 0.35rem;
    border-radius: 0.8rem;
  }
  .ad-sponsored i { font-size: 0.65rem; }
}

</style>