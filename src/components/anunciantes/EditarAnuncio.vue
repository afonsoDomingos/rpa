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

    <!-- LISTA DE ANÚNCIOS -->
    <div v-else class="lista-container">
      <header class="header">
        <button @click="$router.go(-1)" class="back-btn" aria-label="Voltar">
          <i class="bi bi-arrow-left"></i> Voltar
        </button>
        <h1 class="page-title">Meus Anúncios</h1>
      </header>

      <div class="grid-anuncios">
        <div
          v-for="(ad, i) in anuncios"
          :key="ad._id"
          class="anuncio-card"
          :style="{ '--i': i }"
        >
          <div class="anuncio-status" :class="ad.status">
            {{ getStatusText(ad.status) }}
          </div>

          <img
            :src="ad.image"
            :alt="ad.name"
            class="anuncio-img"
            @error="handleImageError"
            @load="onImageLoad"
            loading="lazy"
          />

          <div class="anuncio-info">
            <h3 class="anuncio-titulo">{{ ad.name }}</h3>
            <p class="anuncio-desc">{{ ad.description }}</p>
            <div class="anuncio-preco">
              <i class="bi bi-currency-exchange"></i>
              <span>{{ formatPrice(ad.price) }}</span>
            </div>
          </div>

          <!-- BOTÕES AGRUPADOS E BONITOS -->
          <div class="anuncio-acoes">
            <div class="acoes-linha">
              <a
                :href="ad.ctaLink"
                target="_blank"
                rel="noopener"
                class="btn-contato"
              >
                <i class="bi bi-whatsapp"></i>
                <span>Contactar</span>
              </a>
              <button
                @click="abrirEstatisticas(ad)"
                class="btn-stats"
                type="button"
              >
                <i class="bi bi-graph-up"></i>
                <span>Estatísticas</span>
              </button>
            </div>

            <div class="acoes-linha">
              <button @click="abrirEdicao(ad)" class="btn-editar" type="button">
                <i class="bi bi-pencil"></i>
                <span>Editar</span>
              </button>
              <button
                @click="confirmarRemocao(ad._id)"
                class="btn-remover"
                type="button"
              >
                <i class="bi bi-trash"></i>
                <span>Remover</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE EDIÇÃO -->
    <div
      v-if="editAd"
      class="modal-overlay"
      @click.self="fecharEdicao"
      ref="modal"
      tabindex="0"
    >
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="fecharEdicao">
          <i class="bi bi-x-lg"></i>
        </button>

        <form @submit.prevent="salvarEdicao" class="grid">
          <!-- Seção 1: Informações -->
          <section class="section">
            <h2 class="section-title">
              <span class="num num-purple">1</span> Editar Anúncio
            </h2>

            <div class="group">
              <input
                v-model.trim="editForm.name"
                type="text"
                class="input"
                placeholder="Nome do anúncio"
                required
                maxlength="100"
                :class="{ error: nameError }"
              />
              <p v-if="nameError" class="error-text">{{ nameError }}</p>
            </div>

            <div class="group">
              <textarea
                v-model.trim="editForm.description"
                class="input textarea"
                rows="3"
                placeholder="Descrição detalhada"
                required
                maxlength="500"
                :class="{ error: descError }"
              ></textarea>
              <p v-if="descError" class="error-text">{{ descError }}</p>
            </div>

            <div class="group">
              <div class="price">
                <span class="currency">MZN</span>
                <input
                  v-model.number="editForm.price"
                  type="number"
                  min="1"
                  class="input price-input"
                  placeholder="Preço"
                  required
                  :class="{ error: priceError }"
                />
              </div>
              <p v-if="priceError" class="error-text">{{ priceError }}</p>
            </div>

            <div class="group">
              <div class="input-with-icon">
                <input
                  v-model="rawCta"
                  type="text"
                  class="input"
                  placeholder="Número ou wa.me/..."
                  required
                  @blur="formatAndValidateCta"
                  :class="{ error: ctaError, valid: !ctaError && rawCta }"
                />
                <i
                  v-if="!ctaError && rawCta"
                  class="bi bi-check-circle-fill valid-icon"
                ></i>
              </div>
              <p v-if="ctaError" class="error-text">{{ ctaError }}</p>
              <p v-else-if="editForm.ctaLink" class="success-text">
                <i class="bi bi-whatsapp"></i> Link:
                <a :href="editForm.ctaLink" target="_blank" rel="noopener">{{
                  editForm.ctaLink
                }}</a>
              </p>
            </div>
          </section>

          <!-- Seção 2: Foto -->
          <section class="section">
            <h2 class="section-title">
              <span class="num num-green">2</span> Foto
            </h2>

            <div class="group">
              <div v-if="previewUrl" class="current-image">
                <p class="current-label">Imagem atual:</p>
                <img
                  :src="previewUrl"
                  :alt="editForm.name"
                  class="preview-img"
                />
              </div>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                @change="onFileChange"
                id="file-edit"
                class="hidden"
              />
              <label
                for="file-edit"
                class="upload-label"
                :class="{ 'has-image': editForm.image }"
              >
                <svg
                  class="icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  />
                </svg>
                <span v-if="!editForm.image" class="upload-text"
                  >Alterar foto</span
                >
                <span v-else class="upload-text">Nova foto adicionada</span>
              </label>

              <transition name="fade">
                <div v-if="newPreviewUrl" class="preview">
                  <img
                    :src="newPreviewUrl"
                    :alt="editForm.name"
                    class="preview-img"
                  />
                  <button
                    @click="removeNewImage"
                    type="button"
                    class="remove"
                    aria-label="Remover"
                  >
                    <svg
                      class="icon-x"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M6 18L18 6M6 6l12 12"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                      />
                    </svg>
                  </button>
                </div>
              </transition>
            </div>
          </section>

          <button
            type="submit"
            class="btn"
            :disabled="editLoading || !isFormValid"
            :class="{ 'btn-active': isFormValid && !editLoading }"
          >
            <span v-if="!editLoading">Salvar Alterações</span>
            <span v-else>Salvando...</span>
            <svg
              v-if="!editLoading"
              class="arrow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M5 12h14m-7-7v14"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
          </button>

          <p v-if="submitError" class="error-text global-error">
            {{ submitError }}
          </p>
        </form>
      </div>
    </div>

    <!-- MODAL DE ESTATÍSTICAS -->
    <div
      v-if="statsModal"
      class="modal-overlay"
      @click.self="fecharEstatisticas"
    >
      <div class="modal-content stats-modal">
        <button class="modal-close" @click="fecharEstatisticas">
          <i class="bi bi-x-lg"></i>
        </button>

        <h2 class="stats-title">
          <i class="bi bi-graph-up"></i> Estatísticas do Anúncio
        </h2>
        <h3 class="stats-name">{{ statsAnuncio?.name }}</h3>

        <div class="stats-grid">
          <div class="stat-card">
            <i class="bi bi-eye"></i>
            <div>
              <p>Visualizações</p>
              <strong>{{ stats?.views || 0 }}</strong>
            </div>
          </div>
          <div class="stat-card">
            <i class="bi bi-hand-index-thumb"></i>
            <div>
              <p>Cliques</p>
              <strong>{{ stats?.clicks || 0 }}</strong>
            </div>
          </div>
          <div class="stat-card">
            <i class="bi bi-percent"></i>
            <div>
              <p>CTR</p>
              <strong>{{ stats?.ctr || "0%" }}</strong>
            </div>
          </div>
          <div class="stat-card today">
            <i class="bi bi-calendar-today"></i>
            <div>
              <p>Cliques Hoje</p>
              <strong>{{ stats?.hoje || 0 }}</strong>
            </div>
          </div>
        </div>

        <div class="chart-container">
          <canvas ref="chartCanvas"></canvas>
        </div>

        <button @click="fecharEstatisticas" class="btn-close-stats">
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/api";
import Chart from "chart.js/auto";
import Swal from "sweetalert2";

const router = useRouter();

// Estados gerais
const anuncios = ref([]);
const loading = ref(true);
const error = ref("");

// Modal edição
const editAd = ref(null);
const editForm = ref({
  id: "",
  name: "",
  description: "",
  price: 0,
  ctaLink: "",
  image: null,
  imageUrl: "",
});
const rawCta = ref("");
const previewUrl = ref("");
const newPreviewUrl = ref("");
const ctaError = ref("");
const submitError = ref("");
const editLoading = ref(false);
const nameError = ref("");
const descError = ref("");
const priceError = ref("");

// Modal estatísticas
const statsModal = ref(false);
const statsAnuncio = ref(null);
const stats = ref(null);
const chartInstance = ref(null);
const chartCanvas = ref(null);
const modal = ref(null);

// Funções auxiliares
const formatPrice = (value) =>
  new Intl.NumberFormat("pt-MZ", {
    style: "currency",
    currency: "MZN",
    minimumFractionDigits: 0,
  }).format(value);
const getStatusText = (status) =>
  ({ active: "Ativo", pending: "Pendente", paused: "Pausado" }[status] ||
  "Indefinido");

const handleImageError = (e) => {
  e.target.src = "/img/placeholder-ad.jpg";
  e.target.classList.add("error");
};
const onImageLoad = (e) => e.target.classList.add("loaded");

// Carregar anúncios
const carregarAnuncios = async () => {
    try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token não encontrado");
    const res = await api.get("/anuncios/meus", {
      headers: { Authorization: `Bearer ${token}` },
    });
    anuncios.value = Array.isArray(res.data)
      ? res.data
      : res.data.anuncios || [];
  } catch (err) {
    error.value = err.response?.data?.mensagem || "Falha ao carregar anúncios.";
  } finally {
    loading.value = false;
  }
};

const recarregar = () => {
  loading.value = true;
  error.value = "";
  carregarAnuncios();
};

const confirmarRemocao = async (id) => {
  const result = await Swal.fire({
    title: 'Tem certeza?',
    text: "Deseja realmente remover este anúncio?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#800080',
    confirmButtonText: 'Sim, remover!',
    cancelButtonText: 'Cancelar'
  });

  if (!result.isConfirmed) return;

  try {
    await api.delete(`/anuncios/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    anuncios.value = anuncios.value.filter((a) => a._id !== id);
    Swal.fire({
      icon: 'success',
      title: 'Removido!',
      text: 'O anúncio foi removido com sucesso.',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: err.response?.data?.mensagem || "Erro ao remover anúncio."
    });
  }
};

// Validação do formulário
watch(
  () => editForm.value.name,
  (val) => {
    nameError.value = val?.trim().length < 3 ? "Mínimo 3 caracteres" : "";
  }
);
watch(
  () => editForm.value.description,
  (val) => {
    descError.value = val?.trim().length < 10 ? "Mínimo 10 caracteres" : "";
  }
);
watch(
  () => editForm.value.price,
  (val) => {
    priceError.value = val < 1 ? "Preço deve ser maior que 0" : "";
  }
);

const formatAndValidateCta = () => {
  const input = rawCta.value.trim();
  const urlRegex =
    /^https?:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\//i;
  if (urlRegex.test(input)) {
    editForm.value.ctaLink = input;
    ctaError.value = "";
    return;
  }

  const clean = input.replace(/[\s\-\(\)]/g, "");
  const phoneRegex = /^(\+?258)?[0-9]{9,12}$/;
  if (phoneRegex.test(clean)) {
    let phone = clean.startsWith("+")
      ? clean
      : "+258" + clean.replace(/^258/, "");
    phone = phone.replace(/^\+/, "");
    editForm.value.ctaLink = `https://wa.me/${phone}`;
    ctaError.value = "";
    return;
  }
  ctaError.value = "Número ou link inválido";
};

const isFormValid = computed(() => {
  const validName = editForm.value.name?.trim().length >= 3;
  const validDesc = editForm.value.description?.trim().length >= 10;
  const validPrice = editForm.value.price >= 1;
  const validCta = /^https?:\/\/wa\.me\/[0-9]+$/.test(
    editForm.value.ctaLink.trim()
  );
  return validName && validDesc && validPrice && validCta;
});

// Edição
const abrirEdicao = (ad) => {
  editForm.value = { ...ad, image: null, imageUrl: ad.image };
  rawCta.value = ad.ctaLink;
  previewUrl.value = ad.image;
  newPreviewUrl.value = "";
  nameError.value =
    descError.value =
    priceError.value =
    ctaError.value =
    submitError.value =
      "";
  editAd.value = true;
  nextTick(() => modal.value?.focus());
};

const fecharEdicao = () => {
  editAd.value = null;
  if (newPreviewUrl.value) URL.revokeObjectURL(newPreviewUrl.value);
  newPreviewUrl.value = "";
  document.getElementById("file-edit")?.value &&
    (document.getElementById("file-edit").value = "");
};

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.match("image/(jpeg|png|webp)"))
    return Swal.fire({ icon: 'warning', title: 'Formato inválido', text: "Apenas JPG, PNG ou WebP." });
  if (file.size > 2 * 1024 * 1024)
    return Swal.fire({ icon: 'warning', title: 'Arquivo muito grande', text: "Máximo 2MB." });
  editForm.value.image = file;
  newPreviewUrl.value = URL.createObjectURL(file);
};

const removeNewImage = () => {
  editForm.value.image = null;
  if (newPreviewUrl.value) URL.revokeObjectURL(newPreviewUrl.value);
  newPreviewUrl.value = "";
  document.getElementById("file-edit").value = "";
};

const salvarEdicao = async () => {
  if (!isFormValid.value)
    return (submitError.value = "Preencha todos os campos corretamente.");
  editLoading.value = true;
  submitError.value = "";

  const formData = new FormData();
  formData.append("name", editForm.value.name.trim());
  formData.append("description", editForm.value.description.trim());
  formData.append("price", editForm.value.price);
  formData.append("ctaLink", editForm.value.ctaLink.trim());
  if (editForm.value.image) formData.append("image", editForm.value.image);

  try {
    const res = await api.put(`/anuncios/${editForm.value.id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const index = anuncios.value.findIndex((a) => a._id === editForm.value.id);
    if (index !== -1) {
      anuncios.value[index] = {
        ...anuncios.value[index],
        name: editForm.value.name,
        description: editForm.value.description,
        price: editForm.value.price,
        ctaLink: editForm.value.ctaLink,
        image: editForm.value.image
          ? res.data.image
          : anuncios.value[index].image,
      };
    }
    Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: 'Anúncio atualizado com sucesso!',
        timer: 2000,
        showConfirmButton: false
    });
    fecharEdicao();
  } catch (err) {
    submitError.value = err.response?.data?.mensagem || "Erro ao salvar.";
  } finally {
    editLoading.value = false;
  }
};

const abrirEstatisticas = async (ad) => {
  statsAnuncio.value = ad;
  statsModal.value = true;
  try {
    const res = await api.get(`/anuncios/${ad._id}/stats`);
    stats.value = res.data.stats;
    nextTick(() => criarGrafico());
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Erro', text: "Erro ao carregar estatísticas" });
    fecharEstatisticas();
  }
};

const fecharEstatisticas = () => {
  statsModal.value = false;
  stats.value = null;
  statsAnuncio.value = null;
  if (chartInstance.value) chartInstance.value.destroy();
};

const criarGrafico = () => {
  if (!chartCanvas.value || !stats.value?.ultimoSeteDias) return;
  if (chartInstance.value) chartInstance.value.destroy();

  const labels = stats.value.ultimoSeteDias.map((item) =>
    new Date(item.date).toLocaleDateString("pt-MZ", {
      weekday: "short",
      day: "numeric",
    })
  );
  const data = stats.value.ultimoSeteDias.map((item) => item.clicks);

  chartInstance.value = new Chart(chartCanvas.value, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Cliques", data, backgroundColor: "#7c3aed", borderRadius: 8 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    },
  });
};

onMounted(carregarAnuncios);
onUnmounted(() => {
  if (newPreviewUrl.value) URL.revokeObjectURL(newPreviewUrl.value);
  if (chartInstance.value) chartInstance.value.destroy();
});
</script>

<style scoped>
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css");
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap");

/* Força Poppins em tudo */
* {
  font-family: "Poppins", sans-serif !important;
}

.meus-anuncios {
  font-family: "Poppins", sans-serif;
  min-height: 100vh;
  padding: 2rem;
  background: radial-gradient(circle at top left, #120024, #000);
  color: #fff;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  margin-top: 6rem;
}
.loading-state i,
.error-state i,
.empty-state i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: block;
}
.loading-state i {
  color: #7c3aed;
  animation: spin 1.5s linear infinite;
}
.error-state i {
  color: #ff6b6b;
}
.empty-state i {
  color: #66bb6a;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.retry-btn,
.new-btn {
  margin-top: 1rem;
  background: #7c3aed;
  color: #fff;
  padding: 0.7rem 1.4rem;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}
.retry-btn:hover,
.new-btn:hover {
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
  color: #fff;
  margin: 0;
}
.back-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.grid-anuncios {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.8rem;
}

.anuncio-card {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.15);
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
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
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
}
.anuncio-status.active {
  background: #4caf50;
  color: #fff;
}
.anuncio-status.pending {
  background: #ff9800;
  color: #fff;
}
.anuncio-status.paused {
  background: #9e9e9e;
  color: #fff;
}

.anuncio-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 0.8rem;
  margin-bottom: 1rem;
  background: #1a1a1a;
  opacity: 0;
  transition: opacity 0.4s;
}
.anuncio-img.loaded {
  opacity: 1;
}

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

/* BOTÕES PERFEITOS */
.anuncio-acoes {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.acoes-linha {
  display: flex;
  gap: 0.6rem;
}
.acoes-linha button,
.acoes-linha a {
  flex: 1;
  padding: 0.7rem 0.5rem;
  border-radius: 10px;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;
}
.btn-contato {
  background: linear-gradient(135deg, #7c3aed, #9333ea);
  color: white;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}
.btn-contato:hover {
  background: #25d366;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 211, 102, 0.4);
}
.btn-stats {
  background: rgba(124, 58, 237, 0.15);
  color: #e0d4ff;
  border: 1px solid rgba(124, 58, 237, 0.3);
}
.btn-stats:hover {
  background: #7c3aed;
  color: white;
  transform: translateY(-2px);
}
.btn-editar {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
.btn-editar:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}
.btn-remover {
  background: rgba(239, 68, 68, 0.15);
  color: #ff6b6b;
  border: 1px solid rgba(239, 68, 68, 0.3);
}
.btn-remover:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #ff4444;
  transform: translateY(-2px);
}

@media (max-width: 480px) {
  .acoes-linha {
    flex-direction: column;
  }
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* MODAIS */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}
.modal-content {
  background: #fff;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  color: #000;
}
.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}
.modal-close:hover {
  color: #000;
}

.stats-modal {
  max-width: 600px;
  text-align: center;
}
.stats-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #7c3aed;
}
.stats-name {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 1.5rem;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}
.stat-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #333;
}
.stat-card i {
  font-size: 2rem;
  color: #7c3aed;
}
.stat-card.today {
  background: #f0e8ff;
}
.stat-card strong {
  font-size: 1.5rem;
  display: block;
}
.chart-container {
  margin: 2rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 1rem;
  height: 300px;
}
.btn-close-stats {
  margin-top: 1rem;
  padding: 0.8rem 2rem;
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

/* Formulário de edição (mantido 100% funcional) */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.section {
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1f2937;
}
.num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 700;
}
.num-purple {
  background: #f3e8ff;
  color: #7c3aed;
}
.num-green {
  background: #f0fdf4;
  color: #16a34a;
}
.group {
  margin-bottom: 1.25rem;
}
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}
.input:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}
.textarea {
  resize: vertical;
  min-height: 80px;
}
.error {
  border-color: #ef4444;
}
.error-text {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}
.price {
  display: flex;
  align-items: center;
  background: #f3f4f6;
  border-radius: 0.5rem;
  overflow: hidden;
}
.currency {
  padding: 0.75rem 1rem;
  background: #e5e7eb;
  color: #4b5563;
  font-weight: 500;
}
.price-input {
  border: none;
  background: transparent;
  flex: 1;
}
.input-with-icon {
  position: relative;
}
.valid-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #22c55e;
  font-size: 1rem;
}
.valid {
  border-color: #22c55e;
}
.success-text {
  color: #22c55e;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.success-text a {
  color: #22c55e;
  text-decoration: underline;
}
.current-image,
.preview {
  margin-bottom: 1rem;
}
.preview-img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}
.hidden {
  display: none;
}
.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}
.upload-label:hover {
  border-color: #7c3aed;
  background: #f9fafb;
}
.icon,
.icon-x {
  width: 2rem;
  height: 2rem;
  stroke: currentColor;
}
.upload-text {
  font-size: 0.875rem;
  color: #4b5563;
  font-weight: 500;
}
.has-image .upload-text {
  color: #22c55e;
}
.preview {
  position: relative;
}
.remove {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background: #ef4444;
  border: none;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  background: #e5e7eb;
  color: #4b5563;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: not-allowed;
  transition: all 0.2s;
  grid-column: span 2;
}
.btn-active {
  background: #7c3aed;
  color: #fff;
  cursor: pointer;
}
.btn-active:hover {
  background: #6d28d9;
  transform: translateY(-1px);
}
.arrow {
  width: 1.25rem;
  height: 1.25rem;
  stroke: #fff;
}
.global-error {
  text-align: center;
  grid-column: span 2;
}
</style>
