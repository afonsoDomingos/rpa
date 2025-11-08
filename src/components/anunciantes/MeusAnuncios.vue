<template>
  <div class="meus-anuncios">
    <!-- HEADER -->
    <header class="meus-anuncios__header">
      <button @click="$router.go(-1)" class="btn-back">
        <i class="bi bi-arrow-left"></i> Voltar
      </button>
      <h1 class="title">Meus Anúncios</h1>
    </header>

    <!-- EMPTY STATE -->
    <div v-if="!anuncios.length" class="empty-state">
      <p>Ainda não tem anúncios.</p>
      <button @click="$router.push('/anuncie')" class="btn-cta">Criar Anúncio</button>
    </div>

    <!-- GRID DE ANÚNCIOS -->
    <div v-else class="ad-grid">
      <div v-for="ad in anuncios" :key="ad.id" class="ad-card">
        <img
          :src="ad.image || '/img/placeholder-ad.jpg'"
          alt="Anúncio"
          class="ad-card__img"
          @error="e => e.target.src = '/img/placeholder-ad.jpg'"
        />
        <div class="ad-card__info">
          <h3>{{ ad.name }}</h3>
          <span :class="['status', ad.status]">{{ ad.status === 'ativo' ? 'Ativo' : 'Expirado' }}</span>
        </div>
        <button
          v-if="ad.status === 'expirado'"
          @click="$emit('renovar', ad)"
          class="btn-renew"
        >
          Renovar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ anuncios: { type: Array, default: () => [] } })
defineEmits(['renovar'])
</script>

<style scoped>
@import 'bootstrap-icons/font/bootstrap-icons.css';
@import '@fontsource/poppins/500.css';
@import '@fontsource/poppins/600.css';
@import '@fontsource/poppins/700.css';

.meus-anuncios {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
  color: #fff;
  font-family: 'Poppins', sans-serif;
}

.meus-anuncios__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn-back {
  background: transparent;
  border: none;
  color: #a0a0a0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: color 0.2s;
}

.btn-back:hover {
  color: #fff;
}

.title {
  font-size: 2rem;
  font-weight: 700;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #a0a0a0;
}

.btn-cta {
  margin-top: 1rem;
  padding: 0.875rem 2rem;
  background: #800080;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cta:hover {
  background: #9900cc;
  transform: scale(1.05);
}

.ad-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.ad-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #1a1a1a;
  border-radius: 1rem;
  padding: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.ad-card:hover {
  border-color: #800080;
  box-shadow: 0 8px 24px rgba(128, 0, 128, 0.15);
  transform: translateY(-2px);
}

.ad-card__img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 0.75rem;
  flex-shrink: 0;
}

.ad-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.ad-card__info h3 {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
}

.status {
  font-weight: 600;
}

.status.ativo {
  color: #14b8a6;
}

.status.expirado {
  color: #ef4444;
}

.btn-renew {
  padding: 0.5rem 1rem;
  background: #800080;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-renew:hover {
  background: #9900cc;
  transform: scale(1.05);
}

@media (max-width: 640px) {
  .title { font-size: 1.5rem; }
  .ad-card { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
  .ad-card__img { width: 100%; height: auto; }
}
</style>
