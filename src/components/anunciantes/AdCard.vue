<template>
  <transition name="slide-slow">
    <div v-if="showAd" class="ad-card-container" @click.self="closeAd">
      <transition name="fade-ad" mode="out-in">
        <div v-if="activeAd" :key="activeAd.type === 'google' ? 'google' : currentIndex" class="ad-content">
          <button @click="closeAd" class="close-btn">
            <i class="bi bi-x-lg"></i>
          </button>

          <div v-if="activeAd.type === 'google'" class="ad-google-content">
            <div class="ad-sponsored">
               <i class="bi bi-google"></i>
               <span>Publicidade</span>
            </div>
            <p class="ad-title mb-2">Google Ads</p>
            <GoogleAd adSlot="0987654321" />
            <p class="ad-description mt-2 small">Anúncios sugeridos pela Google.</p>
            <button @click.stop="$router.push('/anuncie')" class="ad-action-btn mt-2">
              <i class="bi bi-megaphone-fill"></i> Anuncie aqui
            </button>
          </div>

          <div v-else class="ad-local-content">
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
              <h3 class="ad-title">{{ activeAd.name || "Anúncio" }}</h3>
              <p class="ad-description">
                {{ activeAd.description || "Sem descrição" }}
              </p>

              <div class="ad-price">
                <i class="bi bi-currency-exchange"></i>
                <strong>{{ formatPrice(activeAd.price || 0) }}</strong>
              </div>

              <div class="ad-action-btn ad-timer-btn">
                <i class="bi bi-clock-history"></i>
                <span>Falta <strong>{{ countdown }}s</strong></span>
              </div>

              <button
                @click.stop="handleWhatsAppClick"
                class="ad-action-btn ad-whatsapp-btn"
                :disabled="enviandoWhatsapp"
              >
                <i class="bi bi-whatsapp"></i>
                {{ enviandoWhatsapp ? "Abrindo..." : "Contactar" }}
              </button>

              <button
                v-if="activeAds.length > 1"
                @click="debouncedNextAd"
                class="ad-action-btn ad-next-btn"
              >
                <i class="bi bi-arrow-right-circle-fill"></i>
                <span>Próximo</span>
              </button>

              <button
                @click.stop="$router.push('/anuncie')"
                class="ad-action-btn mt-2"
              >
                <i class="bi bi-plus-circle"></i>
                <span>Anuncie Aqui</span>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="ad-placeholder">
          <div class="placeholder-icon">
            <i class="bi bi-megaphone-fill"></i>
          </div>
          <p class="placeholder-title">Anuncie aqui</p>
          <span class="placeholder-subtitle">Produtos & Serviços...</span>
          <button @click.stop="$router.push('/anuncie')" class="ad-action-btn">
            <i class="bi bi-plus-circle"></i> Anuncie Aqui
          </button>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { debounce } from "lodash";
import api from "@/api";
import GoogleAd from "@/components/GoogleAd.vue";

const router = useRouter();

const showAd = ref(false);
const activeAd = ref(null);
const activeAds = ref([]);
const currentIndex = ref(0);
const countdown = ref(30);
const enviandoWhatsapp = ref(false);

let timeoutId = null;
let intervalId = null;
let pollingInterval = null;
let reappearTimeout = null;

const ONE_HOUR_MS = 60 * 60 * 1000;

const fetchActiveAds = async () => {
  try {
    const res = await api.get("/anuncios/ativos", { timeout: 10000 });
    const data = Array.isArray(res.data) ? res.data : [];

    activeAds.value = data
      .filter(
        (ad) =>
          ad &&
          (ad.status === "active" || ad.status === "Active") &&
          ad.image &&
          ad._id
      )
      .slice(0, 10);

    localStorage.setItem("cachedAds", JSON.stringify(activeAds.value));

    if (activeAds.value.length > 0) {
      if (Math.random() < 0.3) {
        activeAd.value = { type: 'google' };
      } else {
        currentIndex.value = Math.floor(Math.random() * activeAds.value.length);
        activeAd.value = activeAds.value[currentIndex.value];
      }
      showAd.value = true;
      startCountdown();
    } else {
      activeAd.value = { type: 'google' };
      showAd.value = true;
      startCountdown();
    }
  } catch (err) {
    const cached = localStorage.getItem("cachedAds");
    if (cached) {
      activeAds.value = JSON.parse(cached);
      if (activeAds.value.length > 0) {
        currentIndex.value = Math.floor(Math.random() * activeAds.value.length);
        activeAd.value = activeAds.value[currentIndex.value];
        showAd.value = true;
        startCountdown();
      }
    }
  }
};

const startCountdown = () => {
  countdown.value = 30;
  clearTimers();
  intervalId = setInterval(() => {
    if (countdown.value > 0) countdown.value--;
  }, 1000);
  timeoutId = setTimeout(closeAd, 30000);
};

const nextAd = () => {
  if (activeAds.value.length === 0) {
    activeAd.value = { type: 'google' };
    startCountdown();
    return;
  }
  clearTimers();
  if (activeAd.value.type === 'google') {
    currentIndex.value = 0;
    activeAd.value = activeAds.value[currentIndex.value];
  } else {
    if (Math.random() < 0.3) {
      activeAd.value = { type: 'google' };
    } else {
      currentIndex.value = (currentIndex.value + 1) % activeAds.value.length;
      activeAd.value = activeAds.value[currentIndex.value];
    }
  }
  startCountdown();
};

const debouncedNextAd = debounce(nextAd, 300);

const registrarView = async (id) => {
  if (!id) return;
  try {
    await api.post(`/anuncios/${id}/view`);
  } catch (err) {}
};

const handleWhatsAppClick = async () => {
  if (enviandoWhatsapp.value) return;
  enviandoWhatsapp.value = true;
  const ad = activeAd.value;
  try {
    await api.post(`/anuncios/${ad._id}/clique`);
  } catch (err) {}
  let numero = (ad.phone || "258840000000").replace(/\D/g, "");
  if (numero.length < 9) numero = "258840000000";
  const mensagem = ad.ctaLink
    ? `Olá! Vi o anúncio: *${ad.name}* — ${ad.ctaLink}`
    : `Olá! Gostaria de saber mais sobre *${ad.name}* (R${ad.price})`;
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => (enviandoWhatsapp.value = false), 1500);
};

const closeAd = () => {
  showAd.value = false;
  clearTimers();
  localStorage.setItem("adLastClosed", Date.now().toString());
  clearTimeout(reappearTimeout);
  reappearTimeout = setTimeout(() => {
    fetchActiveAds();
  }, ONE_HOUR_MS);
};

const clearTimers = () => {
  if (timeoutId) clearTimeout(timeoutId);
  if (intervalId) clearInterval(intervalId);
  timeoutId = intervalId = null;
};

const handleImageError = (e) => {
  e.target.src = "/img/placeholder-ad.jpg";
};

const formatPrice = (v) =>
  new Intl.NumberFormat("pt-MZ", {
    style: "currency",
    currency: "MZN",
    minimumFractionDigits: 0,
  }).format(v);

onMounted(() => {
  fetchActiveAds();
  pollingInterval = setInterval(() => {
    const lastClosed = localStorage.getItem("adLastClosed");
    const canReappearNow = !lastClosed || Date.now() - parseInt(lastClosed) >= ONE_HOUR_MS;
    if (!showAd.value || canReappearNow) fetchActiveAds();
  }, 10 * 60 * 1000);
  window.addEventListener("newAdCreated", fetchActiveAds);
});

onUnmounted(() => {
  clearTimers();
  if (pollingInterval) clearInterval(pollingInterval);
  if (reappearTimeout) clearTimeout(reappearTimeout);
  window.removeEventListener("newAdCreated", fetchActiveAds);
});
</script>

<style scoped>
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css");
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap");

.ad-card-container * { font-family: "Poppins", sans-serif; }

.ad-card-container {
  position: fixed;
  right: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  width: 260px;
  z-index: 998;
  animation: float 6s ease-in-out infinite;
}

.ad-placeholder, .ad-content {
  background: white; border: 1px solid #eee; border-radius: 1rem;
  padding: 1rem; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  position: relative;
}

.ad-image { width: 100%; height: 120px; object-fit: cover; border-radius: 0.5rem; margin-bottom: 0.5rem; }
.ad-title { font-weight: 700; font-size: 1rem; color: #333; margin-bottom: 0.3rem; }
.ad-description { font-size: 0.8rem; color: #666; margin-bottom: 0.5rem; }
.ad-action-btn { width: 100%; padding: 8px; border-radius: 0.5rem; border: none; background: #800080; color: #fff; font-weight: 600; cursor: pointer; margin-top: 5px; }

@media (max-width: 480px) {
  .ad-card-container { 
    width: 155px !important; 
    right: 8px !important; 
    top: 160px !important; 
    transform: none !important; 
    z-index: 900 !important; /* Abaixo do menu */
  }
  .ad-image { height: 80px !important; }
  .ad-title { font-size: 0.8rem !important; }
  .ad-description, .ad-price, .ad-timer-btn, .ad-sponsored, .ad-next-btn, .mt-2 { 
    display: none !important; 
  }
  .ad-action-btn { 
    font-size: 0.7rem !important; 
    padding: 4px !important; 
    height: 28px !important;
  }
  .ad-content {
      padding: 0.6rem !important;
  }
}

@keyframes float { 0%, 100% { transform: translateY(-50%) translateY(0); } 50% { transform: translateY(-50%) translateY(-10px); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
.slide-slow-enter-active, .slide-slow-leave-active { transition: all 0.5s ease; }
.slide-slow-enter-from, .slide-slow-leave-to { opacity: 0; transform: translateX(30px); }
.fade-ad-enter-active, .fade-ad-leave-active { transition: opacity 0.3s; }
.fade-ad-enter-from, .fade-ad-leave-to { opacity: 0; }
.close-btn { position: absolute; top: -10px; right: -10px; background: #800080; color: #fff; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
</style>
