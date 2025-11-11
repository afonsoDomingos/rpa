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
            <button @click="abrirEdicao(ad)" class="btn-editar">
              <i class="bi bi-pencil"></i> Editar
            </button>
            <button @click="confirmarRemocao(ad._id)" class="btn-remover">
              <i class="bi bi-trash"></i> Remover
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE EDIÇÃO (INTEGRADO) -->
    <div v-if="editAd" class="modal-overlay" @click.self="fecharEdicao">
      <div class="modal-content">
        <button class="modal-close" @click="fecharEdicao">
          <i class="bi bi-x-lg"></i>
        </button>

        <form @submit.prevent="salvarEdicao" class="grid">
          <!-- === INFO === -->
          <section class="section">
            <h2 class="section-title">
              <span class="num num-purple">1</span> Editar Anúncio
            </h2>

            <div class="group">
              <input 
                v-model.trim="editForm.name" 
                id="name" 
                type="text" 
                class="input" 
                placeholder="Nome do anúncio" 
                required 
                maxlength="100" 
                :class="{ 'error': nameError }"
              />
              <p v-if="nameError" class="error-text">{{ nameError }}</p>
            </div>

            <div class="group">
              <textarea 
                v-model.trim="editForm.description" 
                id="description" 
                class="input textarea" 
                rows="3" 
                placeholder="Descrição detalhada" 
                required 
                maxlength="500"
                :class="{ 'error': descError }"
              ></textarea>
              <p v-if="descError" class="error-text">{{ descError }}</p>
            </div>

            <div class="group">
              <div class="price">
                <span class="currency">MZN</span>
                <input 
                  v-model.number="editForm.price" 
                  id="price" 
                  type="number" 
                  min="1" 
                  class="input price-input" 
                  placeholder="Preço" 
                  required 
                  :class="{ 'error': priceError }"
                />
              </div>
              <p v-if="priceError" class="error-text">{{ priceError }}</p>
            </div>

            <!-- CAMPO WHATSAPP (COM CONVERSÃO) -->
            <div class="group">
              <div class="input-with-icon">
                <input 
                  v-model="rawCta" 
                  id="ctaLink" 
                  type="text" 
                  class="input" 
                  placeholder="Número ou wa.me/..." 
                  required 
                  @blur="formatAndValidateCta"
                  :class="{ 'error': ctaError, 'valid': !ctaError && rawCta }"
                />
                <i v-if="!ctaError && rawCta" class="bi bi-check-circle-fill valid-icon"></i>
              </div>
              <p v-if="ctaError" class="error-text">{{ ctaError }}</p>
              <p v-else-if="editForm.ctaLink" class="success-text">
                <i class="bi bi-whatsapp"></i> 
                Link: <a :href="editForm.ctaLink" target="_blank">{{ editForm.ctaLink }}</a>
              </p>
            </div>
          </section>

          <!-- === FOTO === -->
          <section class="section">
            <h2 class="section-title">
              <span class="num num-green">2</span> Foto
            </h2>

            <div class="group">
              <!-- IMAGEM ATUAL -->
              <div v-if="previewUrl" class="current-image">
                <p class="current-label">Imagem atual:</p>
                <img :src="previewUrl" :alt="editForm.name" class="preview-img" />
              </div>

              <!-- NOVO UPLOAD -->
              <input 
                type="file" 
                accept="image/jpeg,image/png,image/webp" 
                @change="onFileChange" 
                id="file" 
                class="hidden" 
              />
              <label for="file" class="upload-label" :class="{ 'has-image': editForm.image }">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                </svg>
                <span v-if="!editForm.image" class="upload-text">Alterar foto</span>
                <span v-else class="upload-text">Nova foto adicionada</span>
              </label>

              <!-- PRÉ-VISUALIZAÇÃO NOVA IMAGEM -->
              <transition name="fade">
                <div v-if="newPreviewUrl" class="preview">
                  <img :src="newPreviewUrl" :alt="editForm.name" class="preview-img" />
                  <button @click="removeNewImage" type="button" class="remove" aria-label="Remover">
                    <svg class="icon-x" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                    </svg>
                  </button>
                </div>
              </transition>
            </div>
          </section>

          <!-- === BOTÃO === -->
          <button 
            type="submit" 
            class="btn" 
            :disabled="editLoading || !isFormValid"
            :class="{ 'btn-active': isFormValid && !editLoading }"
          >
            <span v-if="!editLoading">Salvar Alterações</span>
            <span v-else>Salvando...</span>
            <svg v-if="!editLoading" class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 12h14m-7-7v14" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            </svg>
          </button>

          <p v-if="submitError" class="error-text global-error">{{ submitError }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
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

// === LÓGICA DE EDIÇÃO INTEGRADA ===
const editAd = ref(null) // Anúncio sendo editado
const editForm = ref({
  id: '',
  name: '',
  description: '',
  price: 0,
  ctaLink: '',
  image: null, // nova imagem (File)
  imageUrl: '' // imagem atual (URL)
})
const rawCta = ref('')
const previewUrl = ref('')    // imagem atual
const newPreviewUrl = ref('') // nova imagem
const ctaError = ref('')
const submitError = ref('')
const editLoading = ref(false)

// Validações
const nameError = ref('')
const descError = ref('')
const priceError = ref('')

watch(() => editForm.value.name, (val) => {
  nameError.value = val.trim().length < 3 ? 'Mínimo 3 caracteres' : ''
})

watch(() => editForm.value.description, (val) => {
  descError.value = val.trim().length < 10 ? 'Mínimo 10 caracteres' : ''
})

watch(() => editForm.value.price, (val) => {
  priceError.value = val < 1 ? 'Preço deve ser maior que 0' : ''
})

// === CONVERSÃO DE NÚMERO PARA LINK ===
const formatAndValidateCta = () => {
  const input = rawCta.value.trim()

  const urlRegex = /^https?:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\//i
  if (urlRegex.test(input)) {
    editForm.value.ctaLink = input
    ctaError.value = ''
    return
  }

  const clean = input.replace(/[\s\-\(\)]/g, '')
  const phoneRegex = /^(\+?258)?[0-9]{9,12}$/

  if (phoneRegex.test(clean)) {
    let phone = clean
    if (!phone.startsWith('+')) phone = '+258' + phone.replace(/^258/, '')
    editForm.value.ctaLink = `https://wa.me/${phone}`
    ctaError.value = ''
    return
  }

  ctaError.value = 'Número ou link inválido'
}

// Validação completa
const isFormValid = computed(() => {
  return (
    editForm.value.name?.trim().length >= 3 &&
    editForm.value.description?.trim().length >= 10 &&
    editForm.value.price >= 1 &&
    /^https?:\/\/wa\.me\/\+/.test(editForm.value.ctaLink)
  )
})

// Abrir modal de edição
const abrirEdicao = (ad) => {
  editForm.value = {
    id: ad._id,
    name: ad.name,
    description: ad.description,
    price: ad.price,
    ctaLink: ad.ctaLink,
    image: null,
    imageUrl: ad.image
  }
  rawCta.value = ad.ctaLink
  previewUrl.value = ad.image
  newPreviewUrl.value = ''
  nameError.value = ''
  descError.value = ''
  priceError.value = ''
  ctaError.value = ''
  submitError.value = ''
  editAd.value = ad
}

// Fechar modal
const fecharEdicao = () => {
  editAd.value = null
  if (newPreviewUrl.value) URL.revokeObjectURL(newPreviewUrl.value)
}

// === UPLOAD DE NOVA IMAGEM ===
const onFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (!file.type.match('image/(jpeg|png|webp)')) {
    alert('Apenas JPG, PNG ou WebP.')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    alert('Máximo 2MB.')
    return
  }

  editForm.value.image = file
  newPreviewUrl.value = URL.createObjectURL(file)
}

const removeNewImage = () => {
  editForm.value.image = null
  newPreviewUrl.value = ''
  document.getElementById('file').value = ''
}

// === ENVIO (PUT) ===
const salvarEdicao = async () => {
  if (!isFormValid.value) {
    submitError.value = 'Preencha todos os campos corretamente.'
    return
  }

  editLoading.value = true
  submitError.value = ''

  const formData = new FormData()
  formData.append('name', editForm.value.name.trim())
  formData.append('description', editForm.value.description.trim())
  formData.append('price', editForm.value.price)
  formData.append('ctaLink', editForm.value.ctaLink.trim())

  if (editForm.value.image) {
    formData.append('image', editForm.value.image)
  }

  try {
    const res = await api.put(`/anuncios/${editForm.value.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })

    // Atualizar lista localmente
    const index = anuncios.value.findIndex(a => a._id === editForm.value.id)
    if (index !== -1) {
      anuncios.value[index] = {
        ...anuncios.value[index],
        name: editForm.value.name,
        description: editForm.value.description,
        price: editForm.value.price,
        ctaLink: editForm.value.ctaLink,
        image: editForm.value.image ? res.data.image : anuncios.value[index].image // Atualiza imagem se nova
      }
    }

    alert('Anúncio atualizado com sucesso!')
    fecharEdicao()

  } catch (err) {
    submitError.value = err.response?.data?.mensagem || 'Erro ao salvar alterações.'
    console.error(err)
  } finally {
    editLoading.value = false
  }
}

onUnmounted(() => {
  if (newPreviewUrl.value) URL.revokeObjectURL(newPreviewUrl.value)
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

/* === ESTILOS DO MODAL === */
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

/* Estilos do formulário (copiados e adaptados do componente filho) */
.container { max-width: 800px; margin: 0 auto; }
.form-wrapper { background: #fff; padding: 2rem; border-radius: 1rem; }
.grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 768px) { .grid { grid-template-columns: repeat(2, 1fr); } }

.section { padding: 1.5rem; background: #f9fafb; border-radius: 0.75rem; border: 1px solid #e5e7eb; }
.section-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem; color: #1f2937; }
.num { display: inline-flex; align-items: center; justify-content: center; width: 1.75rem; height: 1.75rem; border-radius: 50%; font-size: 0.875rem; font-weight: 700; }
.num-purple { background: #f3e8ff; color: #7c3aed; }
.num-green { background: #f0fdf4; color: #16a34a; }

.group { margin-bottom: 1.25rem; }
.input { width: 100%; padding: 0.75rem 1rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; transition: all 0.2s; }
.input:focus { outline: none; border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1); }
.textarea { resize: vertical; min-height: 80px; }
.error { border-color: #ef4444; }
.error-text { color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem; }

.price { display: flex; align-items: center; background: #f3f4f6; border-radius: 0.5rem; overflow: hidden; }
.currency { padding: 0.75rem 1rem; background: #e5e7eb; color: #4b5563; font-weight: 500; }
.price-input { border: none; background: transparent; flex: 1; }

.input-with-icon { position: relative; }
.valid-icon { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); color: #22c55e; font-size: 1rem; }
.valid { border-color: #22c55e; }
.success-text { color: #22c55e; font-size: 0.75rem; margin-top: 0.25rem; display: flex; align-items: center; gap: 0.25rem; }
.success-text a { color: #22c55e; text-decoration: underline; }

.current-image { margin-bottom: 1rem; }
.current-label { font-size: 0.875rem; color: #4b5563; margin-bottom: 0.5rem; }
.preview-img { max-width: 100%; height: auto; border-radius: 0.5rem; border: 1px solid #e5e7eb; }

.hidden { display: none; }
.upload-label { display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed #d1d5db; border-radius: 0.5rem; padding: 2rem; cursor: pointer; transition: all 0.2s; text-align: center; }
.upload-label:hover { border-color: #7c3aed; background: #f9fafb; }
.icon { width: 2rem; height: 2rem; margin-bottom: 0.5rem; stroke: #9ca3af; }
.upload-text { font-size: 0.875rem; color: #4b5563; font-weight: 500; }
.has-image .upload-text { color: #22c55e; }

.preview { position: relative; margin-top: 1rem; }
.remove { position: absolute; top: -0.5rem; right: -0.5rem; background: #ef4444; border: none; border-radius: 50%; width: 1.5rem; height: 1.5rem; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.icon-x { width: 1rem; height: 1rem; stroke: #fff; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; padding: 1rem; background: #e5e7eb; color: #4b5563; border: none; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; cursor: not-allowed; transition: all 0.2s; grid-column: span 2; }
.btn-active { background: #7c3aed; color: #fff; cursor: pointer; }
.btn-active:hover { background: #6d28d9; transform: translateY(-1px); }
.arrow { width: 1.25rem; height: 1.25rem; stroke: #fff; }

.global-error { text-align: center; grid-column: span 2; }
</style>