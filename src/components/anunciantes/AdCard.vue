<!-- src/components/anunciantes/AdCard.vue -->
<template>
  <transition name="slide-slow">
    <div v-if="showAd && isDesktop" class="ad-card-container" @click.self="closeAd">
      <!-- Placeholder -->
      <div v-if="!activeAd" class="ad-placeholder">
        <div class="placeholder-icon">
          <i class="bi bi-megaphone-fill"></i>
        </div>
        <p class="placeholder-title">Anuncie aqui</p>
        <span class="placeholder-subtitle">Produtos & Serviços...</span>

        <!-- BOTÃO ANUNCIE AQUI (mesmo estilo do "Ver próximo") -->
        <button @click.stop="$router.push('/anuncie')" class="ad-announce-btn">
          <i class="bi bi-plus-circle"></i>
          Anuncie Aqui
        </button>
      </div>

      <!-- Anúncio Real -->
      <div v-else class="ad-content">
        <button @click="closeAd" class="close-btn" aria-label="Fechar anúncio">
          <i class="bi bi-x-lg"></i>
        </button>

        <img :src="activeAd.image" :alt="activeAd.name" class="ad-image" @error="handleImageError" />

        <div class="ad-body">
          <h3 class="ad-title">{{ activeAd.name }}</h3>
          <p class="ad-description">{{ activeAd.description }}</p>

          <div class="ad-price">
            <i class="bi bi-currency-exchange"></i>
            <strong>{{ formatPrice(activeAd.price) }}</strong>
          </div>

           <a :href="activeAd.ctaLink" target="_blank" rel="noopener" class="ad-cta-button" @click.stop>
          <i class="bi bi-whatsapp"></i>
          Ligar para Anuciante
        </a>

          <div class="ad-timer">
            <i class="bi bi-clock-history"></i>
            <span>Expira em <strong>{{ countdown }}s</strong></span>
          </div>

         <button @click="$router.push('/anuncie')" class="ad-announce-btn">
  <i class="bi bi-plus-circle"></i>
  <span>Anuncie Aqui</span>
</button>



        </div>

       
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showAd = ref(false)
const activeAd = ref(null)
const isDesktop = ref(window.innerWidth > 1024)
const countdown = ref(0)
let timeoutId = null
let intervalId = null
let currentIndex = 0

const ads = [
  {
    name: "Apartamento T3 - Matola",
    description: "Centro, perto do mercado",
    price: 2500000,
    image: "/img/anuncio-exemplo01.jpg",
    ctaLink: "https://wa.me/258841234567"
  },
  {
    name: "Toyota Corolla 2020",
    description: "Baixa km, revisado, garantia",
    price: 850000,
    image: "/img/anuncio-exemplo02.jpg",
    ctaLink: "https://wa.me/258851234567"
  },
  {
    name: "Pintura Residencial",
    description: "Orçamento grátis em 24h",
    price: 12000,
    image: "/img/anuncio-exemplo03.jpg",
    ctaLink: "https://wa.me/258861234567"
  }
]

const updateDesktop = () => { isDesktop.value = window.innerWidth > 1024 }

onMounted(() => {
  window.addEventListener('resize', updateDesktop)
  if (isDesktop.value) fetchAd()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDesktop)
  clearTimers()
})

const fetchAd = () => {
  activeAd.value = ads[currentIndex]
  showAd.value = true
  startCountdown()
}

const startCountdown = () => {
  const totalSeconds = 30 + Math.floor(Math.random() * 16)
  countdown.value = totalSeconds

  clearTimers()

  intervalId = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(intervalId)
      nextAd()
    }
  }, 1000)

  timeoutId = setTimeout(() => {
    nextAd()
  }, totalSeconds * 1000)
}

const nextAd = () => {
  clearTimers()
  currentIndex = (currentIndex + 1) % ads.length
  activeAd.value = ads[currentIndex]
  startCountdown()
}

const closeAd = () => {
  showAd.value = false
  clearTimers()
}

const clearTimers = () => {
  if (timeoutId) clearTimeout(timeoutId)
  if (intervalId) clearInterval(intervalId)
}

const handleImageError = (e) => {
  e.target.src = '/img/placeholder-ad.jpg'
}

const formatPrice = (value) => {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 0
  }).format(value)
}
</script>

<style scoped>
/* === IMPORTS === */
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css');
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');

/* === POPPINS EM TUDO === */
* {
  font-family: 'Poppins', sans-serif !important;
}

/* === CONTAINER === */
.ad-card-container {
  position: fixed;
  right: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  width: 300px;
  z-index: 998;
  animation: float 6s ease-in-out infinite;
  pointer-events: auto;
}

@keyframes float {
  0%, 100% { transform: translateY(-50%) translateY(0); }
  50% { transform: translateY(-50%) translateY(-10px); }
}

/* === VIDRO ULTRA TRANSPARENTE === */
.ad-placeholder,
.ad-content {
  background: linear-gradient(
    135deg,
    rgba(15, 10, 35, 0.12),
    rgba(252, 24, 24, 0.15)
  );
  background-size: 200% 200%;
  background-position: 0% 0%;

  backdrop-filter: blur(26px);
  -webkit-backdrop-filter: blur(26px);

  border: 1px solid rgba(120, 180, 240, 0.18);
  border-radius: 1.6rem;
  padding: 1.7rem;
  text-align: center;
  cursor: default;

  transition: background 0.7s ease, border-color 0.4s ease, box-shadow 0.5s ease;
  box-shadow: 0 16px 44px rgba(0, 0, 0, 0.32);
  position: relative;
  overflow: hidden;
}

.ad-placeholder:hover,
.ad-content:hover {
  background: linear-gradient(
    135deg,
    rgba(5, 25, 35, 0.52),
    rgba(15, 10, 35, 0.45)
  );
  background-position: 100% 100%;
  border-color: rgba(120, 180, 240, 0.38);
  box-shadow: 0 24px 60px rgba(15, 10, 35, 0.38);
}

/* === PLACEHOLDER === */
.placeholder-icon {
  width: 54px;
  height: 54px;
  background: rgba(102, 187, 106, 0.22);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.9rem;
  font-size: 1.7rem;
  color: #66bb6a;
}

.placeholder-title {
  font-weight: 800 !important;
  font-size: 1.38rem;
  color: #ffffff;
  margin: 0 0 0.3rem;
  letter-spacing: -0.03em;
}

.placeholder-subtitle {
  font-weight: 500 !important;
  font-size: 0.88rem;
  color: #b8e6b8;
  margin-bottom: 1.1rem;
  letter-spacing: 0.01em;
}

/* === BOTÃO ANUNCIE AQUI — MESMO ESTILO DO "VER PRÓXIMO" === */
.ad-announce-btn {
  background: none;
  border: none;
  color: #c29bff;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin: 0.4rem auto 0; /* ALINHADO COM O "VER PRÓXIMO" */
  padding: 0.3rem 0;
  transition: color 0.3s ease;
}

.ad-announce-btn:hover {
  color: #9c6bff;
}

.ad-announce-btn i {
  font-size: 1.05rem;
  transition: transform 0.3s ease;
}

.ad-announce-btn:hover i {
  transform: translateY(-2px);
}

/* === RESTANTE DO ANÚNCIO === */
.close-btn {
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  color: #eee;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.55);
  color: #ff4444;
  transform: scale(1.1);
}

.ad-image {
  width: 100%;
  height: 155px;
  object-fit: cover;
  border-radius: 1.1rem;
  margin-bottom: 1.1rem;
  background: #141414;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.3);
}

.ad-title {
  font-weight: 700 !important;
  font-size: 1.28rem;
  color: #ffffff;
  margin: 0 0 0.5rem;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.ad-description {
  font-weight: 500 !important;
  font-size: 0.92rem;
  color: #e0f2e0;
  margin: 0 0 0.8rem;
  letter-spacing: -0.01em;
}

.ad-price {
  font-weight: 700 !important;
  font-size: 1.38rem;
  color: #81c784;
  margin: 0.8rem 0 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  letter-spacing: -0.02em;
}

.ad-price i {
  font-size: 1.45rem;
  color: #66bb6a;
}

.ad-timer {
  font-weight: 600 !important;
  font-size: 0.90rem;
  color: #ffffff;
  margin: 0.6rem 0 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: rgba(255, 138, 101, 0.15);
  padding: 0.4rem 0.8rem;
  border-radius: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: pulse 2s infinite;
}

.ad-timer i {
  font-size: 1.05rem;
  color: #faf9f9;
}

.ad-timer strong {
  font-weight: 700;
  color: #ffffff;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.88; }
}

/* BOTÃO VER PRÓXIMO */
.ad-next-btn {
  background: none;
  border: none;
  color: #a0d6a0;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin: 0.4rem auto 1rem;
  padding: 0.3rem 0;
  transition: color 0.3s ease;
}

.ad-next-btn:hover {
  color: #66bb6a;
}

.ad-next-btn i {
  font-size: 1.05rem;
  transition: transform 0.3s ease;
}

.ad-next-btn:hover i {
  transform: translateX(3px);
}

/* BOTÃO WHATSAPP */
.ad-cta-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 1rem 1.2rem;
  background: linear-gradient(135deg, #66bb6a, #66bb6a);
  color: #ffffff;
  border-radius: 0.9rem;
  font-weight: 700 !important;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.4s ease;
  box-shadow: 0 6px 16px rgba(128, 0, 128, 0.35);
}

.ad-cta-button:hover {
  background: linear-gradient(135deg, #800080, #800080);
  transform: scale(1.04);
  box-shadow: 0 12px 30px rgba(102, 187, 106, 0.48);
}

.ad-cta-button i {
  font-size: 1.2rem;
}

/* === SLOW MOTION === */
.slide-slow-enter-active,
.slide-slow-leave-active {
  transition: all 1.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-slow-enter-from,
.slide-slow-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(120px);
}


.ad-announce-btn {
  font-weight: 600;
  font-size: 0.90rem;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: rgba(0, 0, 0, 0.25);
  padding: 0.4rem 3.8rem; /* largura proporcional ao .ad-timer */
  border-radius: 2rem;
  border: 1px solid rgba(102, 187, 106, 0.4);
  cursor: pointer;
  animation: pulse 2s infinite;
  transition: all 0.3s ease;
  margin: 0.6rem 0 0.5rem; /* pequena margem */
}

.ad-announce-btn:hover {
  background: rgba(0, 0, 0, 1.35);
  transform: scale(1.05);
}

.ad-announce-btn i {
  font-size: 1.05rem;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}



/* MOBILE */
@media (max-width: 1024px) {
  .ad-card-container { display: none !important; }
}

</style>