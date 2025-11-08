<!-- src/components/anunciantes/AdCard.vue -->
<template>
  <transition name="slide-slow">
    <div v-if="showAd" class="ad-card-container" @click.self="closeAd">
      <!-- Placeholder -->
      <div v-if="!activeAd" class="ad-placeholder">
        <div class="placeholder-icon">
          <i class="bi bi-megaphone-fill"></i>
        </div>
        <p class="placeholder-title">Anuncie aqui</p>
        <span class="placeholder-subtitle">Produtos & Serviços...</span>

        <button @click.stop="$router.push('/anuncie')" class="ad-announce-btn">
          <i class="bi bi-plus-circle"></i>
          Anuncie Aqui
        </button>
      </div>

      <!-- Anúncio Real -->
      <transition name="fade-ad" mode="out-in">
        <div v-if="activeAd" :key="currentIndex" class="ad-content">
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
            Contactar
            </a>

            <div class="ad-timer">
              <i class="bi bi-clock-history"></i>
              <span v-if="!userInteracted">Desaparece em <strong>{{ countdown }}s</strong></span>
              <span v-else>Próximo em <strong>{{ countdown }}s</strong></span>
            </div>

            <!-- Botão para avançar manualmente -->
            <button @click="nextAd" class="ad-next-btn">
              <i class="bi bi-arrow-right-circle"></i>
              <span>Ver próximo anúncio</span>
            </button>

            <button @click.stop="$router.push('/anuncie')" class="ad-announce-btn">
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

const router = useRouter()
const showAd = ref(false)
const activeAd = ref(null)
const countdown = ref(0)
const userInteracted = ref(false)
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

onMounted(() => {
  fetchAd()
})

onUnmounted(() => {
  clearTimers()
})

const fetchAd = () => {
  activeAd.value = ads[currentIndex]
  showAd.value = true
  startCountdown()
}

const startCountdown = () => {
  const totalSeconds = 30 + Math.floor(Math.random() * 16) // 30-45 segundos
  countdown.value = totalSeconds

  clearTimers()

  // Atualiza o countdown a cada segundo
  intervalId = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(intervalId)
      // Se o usuário NÃO interagiu, desaparece o anúncio
      if (!userInteracted.value) {
        closeAd()
      } else {
        // Se interagiu, mostra o próximo
        nextAd()
      }
    }
  }, 1000)

  // Timeout de segurança
  timeoutId = setTimeout(() => {
    if (!userInteracted.value) {
      closeAd()
    } else {
      nextAd()
    }
  }, totalSeconds * 1000)
}

const nextAd = () => {
  clearTimers()
  
  // Marca que o usuário interagiu (clicou em "Ver próximo")
  userInteracted.value = true
  
  // Avança para o próximo anúncio (ciclo)
  currentIndex = (currentIndex + 1) % ads.length
  activeAd.value = ads[currentIndex]
  
  // Reinicia o countdown para o novo anúncio
  startCountdown()
}

const closeAd = () => {
  showAd.value = false
  activeAd.value = null
  userInteracted.value = false // Reseta a flag
  clearTimers()
}

const clearTimers = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
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
.ad-card-container * {
  font-family: 'Poppins', sans-serif;
}

/* === CONTAINER === */
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

/* === RESPONSIVO === */
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
  border-radius: 1.4rem;
  padding: 1.3rem;
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
  letter-spacing: -0.03em;
}

.placeholder-subtitle {
  font-weight: 500;
  font-size: 0.82rem;
  color: #b8e6b8;
  margin-bottom: 0.9rem;
  letter-spacing: 0.01em;
}

/* === BOTÃO FECHAR === */
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
  background: rgba(239, 68, 68, 0.55);
  color: #ff4444;
  transform: scale(1.1);
}

/* === IMAGEM === */
.ad-image {
  width: 100%;
  height: 130px;
  object-fit: cover;
  border-radius: 0.9rem;
  margin-bottom: 0.9rem;
  background: #141414;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.3);
}

/* === CONTEÚDO === */
.ad-title {
  font-weight: 500;
  font-size: 1.1rem;
  color: #ffffff;
  margin: 0 0 0.4rem;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.ad-description {
  font-weight: 300;
  font-size: 0.85rem;
  color: #e0f2e0;
  margin: 0 0 0.7rem;
  letter-spacing: -0.01em;
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
  letter-spacing: -0.02em;
}

.ad-price i {
  font-size: 1.3rem;
  color: #66bb6a;
}

/* === BOTÃO WHATSAPP === */
.ad-cta-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #800080, #800080);
  color: #ffffff;
  border-radius: 0.8rem;
  font-weight: 700;
  font-size: 0.88rem;
  text-decoration: none;
  transition: all 0.4s ease;
  box-shadow: 0 4px 12px rgba(102, 187, 106, 0.35);
  margin-bottom: 0.7rem;
}

.ad-cta-button:hover {
  background: linear-gradient(135deg, #4caf50, #4caf50);
  transform: scale(1.03);
  box-shadow: 0 8px 20px rgba(102, 187, 106, 0.48);
}

.ad-cta-button i {
  font-size: 1.1rem;
}

/* === TIMER === */
.ad-timer {
  font-weight: 600;
  font-size: 0.82rem;
  color: #ffffff;
  margin: 0.5rem 0 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  background: rgba(255, 138, 101, 0.15);
  padding: 0.35rem 0.7rem;
  border-radius: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: pulse 2s infinite;
}

.ad-timer i {
  font-size: 0.95rem;
  color: #faf9f9;
}

.ad-timer strong {
  font-weight: 700;
  color: #ffffff;
}

/* === BOTÃO VER PRÓXIMO === */
.ad-next-btn {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  margin: 0.4rem auto 0.5rem;
  padding: 0.25rem 0;
  transition: all 0.3s ease;
}

.ad-next-btn:hover {
  color: #800080;
  transform: translateX(3px);
}

.ad-next-btn i {
  font-size: 0.95rem;
  transition: transform 0.3s ease;
}

.ad-next-btn:hover i {
  transform: translateX(3px);
}

/* === BOTÃO ANUNCIE AQUI === */
.ad-announce-btn {
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
}

.ad-announce-btn:hover {
  background: rgba(0, 0, 0, 0.45);
  border-color: rgba(102, 187, 106, 0.6);
  transform: scale(1.05);
}

.ad-announce-btn i {
  font-size: 0.95rem;
}

/* === ANIMAÇÕES === */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}

/* Transição do container principal */
.slide-slow-enter-active,
.slide-slow-leave-active {
  transition: all 1.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-slow-enter-from,
.slide-slow-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(120px);
}

/* Transição entre anúncios */
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

/* === AJUSTES MOBILE === */
@media (max-width: 768px) {
  .ad-placeholder,
  .ad-content {
    padding: 1rem;
  }

  .ad-image {
    height: 160px;
  }

  .ad-title {
    font-size: 1rem;
  }

  .ad-description {
    font-size: 0.8rem;
  }

  .ad-price {
    font-size: 1.1rem;
  }

  .ad-cta-button {
    padding: 0.7rem 1.2rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .ad-image {
    height: 90px;
    border-radius: 0.6rem;
  }

  .placeholder-icon {
    width: 32px;
    height: 32px;
    font-size: 1rem;
    margin: 0 auto 0.4rem;
  }

  .placeholder-title {
    font-size: 0.85rem;
    margin-bottom: 0.2rem;
  }

  .placeholder-subtitle {
    font-size: 0.65rem;
    margin-bottom: 0.5rem;
  }

  .ad-placeholder,
  .ad-content {
    padding: 0.7rem;
    border-radius: 1rem;
  }

  .ad-title {
    font-size: 0.8rem;
    margin-bottom: 0.2rem;
    line-height: 1.1;
  }

  .ad-description {
    font-size: 0.65rem;
    margin-bottom: 0.4rem;
  }

  .ad-price {
    font-size: 0.9rem;
    margin: 0.3rem 0 0.4rem;
    gap: 0.25rem;
  }

  .ad-price i {
    font-size: 0.95rem;
  }

  .ad-cta-button {
    padding: 0.5rem 0.7rem;
    font-size: 0.7rem;
    gap: 0.3rem;
    margin-bottom: 0.4rem;
  }

  .ad-cta-button i {
    font-size: 0.9rem;
  }

  .ad-timer {
    font-size: 0.62rem;
    padding: 0.25rem 0.5rem;
    gap: 0.25rem;
    margin: 0.3rem 0;
  }

  .ad-timer i {
    font-size: 0.75rem;
  }

  .ad-next-btn {
    font-size: 0.62rem;
    gap: 0.25rem;
    margin: 0.2rem auto 0.3rem;
  }

  .ad-next-btn i {
    font-size: 0.75rem;
  }

  .ad-announce-btn {
    font-size: 0.62rem;
    padding: 0.25rem 0.9rem;
    gap: 0.25rem;
  }

  .ad-announce-btn i {
    font-size: 0.75rem;
  }

  .close-btn {
    width: 24px;
    height: 24px;
    top: 0.4rem;
    right: 0.4rem;
    font-size: 0.75rem;
  }
}
</style>