<template>
  <div class="container">
    <main class="form-wrapper">
      <form @submit.prevent="handleSubmit" class="grid">
        <!-- === INFO === -->
        <section class="section">
          <h2 class="section-title">
            <span class="num num-purple">1</span> Info
          </h2>

          <div class="group">
            <input 
              v-model.trim="form.name" 
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
              v-model.trim="form.description" 
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
                v-model.number="form.price" 
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

          <!-- CAMPO WHATSAPP -->
          <div class="group">
            <div class="input-with-icon">
              <input 
                v-model="rawCta" 
                id="ctaLink" 
                type="text" 
                class="input" 
                placeholder="Seu número ou wa.me/..." 
                required 
                @blur="formatAndValidateCta"
                :class="{ error: ctaError, valid: !ctaError && rawCta }"
              />
              <i v-if="!ctaError && rawCta" class="bi bi-check-circle-fill valid-icon"></i>
            </div>
            <p v-if="ctaError" class="error-text">{{ ctaError }}</p>
            <p v-else-if="form.ctaLink" class="success-text">
              Link gerado: <a :href="form.ctaLink" target="_blank">{{ form.ctaLink }}</a>
            </p>
          </div>
        </section>

        <!-- === FOTO === -->
        <section class="section">
          <h2 class="section-title">
            <span class="num num-green">2</span> Foto
          </h2>

          <div class="group">
            <input 
              type="file" 
              accept="image/jpeg,image/png,image/webp" 
              @change="onFileChange" 
              id="file" 
              class="hidden" 
              :required="!form.image"
            />
            <label for="file" class="upload-label" :class="{ 'has-image': form.image }">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
              </svg>
              <span v-if="!form.image" class="upload-text">Adicionar foto (Máx 2Mb)</span>
              <span v-else class="upload-text">Foto adicionada</span>
            </label>

            <transition name="fade">
              <div v-if="previewUrl" class="preview">
                <img :src="previewUrl" :alt="form.name" class="preview-img" />
                <button @click="removeImage" type="button" class="remove" aria-label="Remover">
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
          :disabled="loading || !isFormValid"
          :class="{ 'btn-active': isFormValid && !loading }"
        >
          <span v-if="!loading">Criar Anúncio</span>
          <span v-else>Enviando...</span>
          <svg v-if="!loading" class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M13 7l5 5m0 0l-5 5m5-5H6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
          </svg>
        </button>

        <p v-if="submitError" class="error-text global-error">{{ submitError }}</p>
      </form>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted, onUnmounted } from 'vue'
import api from '@/api'
import { sendMetaEvent } from '@/utils/meta'

const emit = defineEmits(['created'])

const form = reactive({
  name: '',
  description: '',
  price: 0,
  ctaLink: '',
  image: null
})

const rawCta = ref('')
const previewUrl = ref('')
const loading = ref(false)
const submitError = ref('')

// Validações
const nameError = ref('')
const descError = ref('')
const priceError = ref('')
const ctaError = ref('')

watch(() => form.name, (val) => {
  nameError.value = val.trim().length < 3 ? 'Mínimo 3 caracteres' : ''
})

watch(() => form.description, (val) => {
  descError.value = val.trim().length < 10 ? 'Mínimo 10 caracteres' : ''
})

watch(() => form.price, (val) => {
  priceError.value = val < 1 ? 'Preço deve ser maior que 0' : ''
})

const formatAndValidateCta = () => {
  // ... teu código de validação de WhatsApp (mantém igual)
  // (não mudei aqui porque está perfeito)
}

const isFormValid = computed(() => {
  return (
    form.name?.trim().length >= 3 &&
    form.description?.trim().length >= 10 &&
    form.price >= 1 &&
    /^https?:\/\/wa\.me\/\+/.test(form.ctaLink) &&
    form.image
  )
})

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  if (!file.type.match('image/(jpeg|png|webp)')) return alert('Apenas JPG, PNG ou WebP.')
  if (file.size > 2 * 1024 * 1024) return alert('Máximo 2MB.')
  form.image = file
  previewUrl.value = URL.createObjectURL(file)
}

const removeImage = () => {
  form.image = null
  previewUrl.value = ''
  document.getElementById('file').value = ''
}

const handleSubmit = async () => {
  if (!isFormValid.value) {
    submitError.value = 'Preencha todos os campos corretamente.'
    return
  }

  loading.value = true
  submitError.value = ''

  const formData = new FormData()
  formData.append('name', form.name.trim())
  formData.append('description', form.description.trim())
  formData.append('price', form.price)
  formData.append('ctaLink', form.ctaLink.trim())
  formData.append('image', form.image)
  formData.append('weeks', 1)

  try {
    const res = await api.post('/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (res.data.sucesso) {
      localStorage.removeItem('anuncieForm')

      // EVENTO LEAD – ANÚNCIO CRIADO
      await sendMetaEvent('Lead', {
        content_name: 'Anúncio Criado',
        content_type: 'product',
        value: form.price,
        currency: 'MZN'
      })

      emit('created', {
        anuncioId: res.data.anuncioId,
        formData: res.data.anuncio
      })
    }
  } catch (err) {
    submitError.value = err.response?.data?.mensagem || 'Erro ao criar anúncio.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const saved = localStorage.getItem('anuncieForm')
  if (saved) {
    const data = JSON.parse(saved)
    Object.assign(form, data)
    rawCta.value = form.ctaLink || ''
    if (form.image) previewUrl.value = URL.createObjectURL(form.image)
  }
})

onUnmounted(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<style scoped>
/* === MESMO CSS DO ORIGINAL (mantido) === */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css');

* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Poppins', sans-serif; }

.container { height: 100vh; width: 100vw; background: #0a0a0a; color: white; display: flex; flex-direction: column; overflow: hidden; }
.form-wrapper { flex: 1; overflow-y: auto; padding: 0.5rem; }
.grid { display: grid; grid-template-columns: 1fr; gap: 0.75rem; max-width: 900px; margin: 0 auto; }

.section { background: rgba(30, 30, 30, 0.9); padding: 0.75rem; border-radius: 0.6rem; border: 1px solid rgba(255,255,255,0.08); }
.section-title { font-size: 0.875rem; font-weight: 600; display: flex; align-items: center; gap: 0.3rem; margin-bottom: 0.5rem; color: whitesmoke; }
.num { width: 1.25rem; height: 1.25rem; border-radius: 0.3rem; font-size: 0.65rem; font-weight: 700; color: white; display: flex; align-items: center; justify-content: center; }
.num-purple { background: #7c3aed; }
.num-green { background: #10b981; }

.group { margin-bottom: 0.5rem; }
.group:last-child { margin-bottom: 0; }

.input { width: 100%; padding: 0.5rem; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.12); border-radius: 0.4rem; color: white; font-size: 0.85rem; outline: none; transition: all 0.2s; }
.input::placeholder { color: #777; }
.input:focus { border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124,58,237,0.2); }
.input.error { border-color: #ef4444; box-shadow: 0 0 0 2px rgba(239,68,68,0.2); }
.input.valid { border-color: #10b981; box-shadow: 0 0 0 2px rgba(16,185,129,0.2); }

.textarea { resize: none; min-height: 60px; }

.price { position: relative; }
.currency { position: absolute; left: 0.5rem; top: 50%; transform: translateY(-50%); color: #10b981; font-weight: 700; font-size: 0.75rem; pointer-events: none; }
.price-input { padding-left: 2.75rem !important; }

.hidden { display: none; }

.upload-label { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; padding: 1rem; background: rgba(124,58,237,0.1); border: 1.5px dashed rgba(124,58,237,0.35); border-radius: 0.5rem; cursor: pointer; transition: all 0.3s; }
.upload-label:hover { background: rgba(124,58,237,0.15); border-color: #7c3aed; }
.upload-label.has-image { border-style: solid; background: rgba(16,185,129,0.1); border-color: #10b981; }

.icon { width: 1.75rem; height: 1.75rem; color: #a78bfa; transition: color 0.3s; }
.upload-label:hover .icon { color: #c4b5fd; }
.upload-label.has-image .icon { color: #10b981; }

.upload-text { font-size: 0.8rem; color: #a0a0a0; }
.upload-label.has-image .upload-text { color: #10b981; font-weight: 600; }

.preview { position: relative; border-radius: 0.5rem; overflow: hidden; border: 1.5px solid rgba(124,58,237,0.35); margin-top: 0.4rem; }
.preview-img { width: 100%; height: 10rem; object-fit: cover; }

.remove { position: absolute; top: 0.3rem; right: 0.3rem; background: #ef4444; border: none; border-radius: 50%; width: 1.6rem; height: 1.6rem; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.remove:hover { background: #dc2626; transform: scale(1.1); }
.icon-x { width: 1rem; height: 1rem; }

.btn { grid-column: 1 / -1; margin-top: 0.5rem; width: 100%; padding: 0.65rem; background: #374151; color: #9ca3af; border: none; border-radius: 0.4rem; font-weight: 600; font-size: 0.85rem; cursor: not-allowed; display: flex; align-items: center; justify-content: center; gap: 0.35rem; transition: all 0.3s; }
.btn.btn-active { background: linear-gradient(135deg, #7c3aed 0%, #10b981 100%); color: white; cursor: pointer; }
.btn.btn-active:hover { background: linear-gradient(135deg, #10b981 0%, #7c3aed 100%); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(124,58,237,0.3); }
.arrow { width: 0.9rem; height: 0.9rem; }

.error-text { color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem; font-weight: 500; }
.global-error { grid-column: 1 / -1; margin-top: 0.5rem; padding: 0.75rem; background: rgba(239,68,68,0.15); border: 1.5px solid #ef4444; border-radius: 0.6rem; text-align: center; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.input-with-icon { position: relative; }
.valid-icon { position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); color: #10b981; font-size: 1.1rem; pointer-events: none; }
.success-text { color: #10b981; font-size: 0.75rem; margin-top: 0.25rem; display: flex; align-items: center; gap: 0.3rem; }
.success-text a { color: #10b981; text-decoration: underline; font-weight: 500; }

@media (min-width: 768px) {
  .grid { grid-template-columns: 1fr 1fr; gap: 1rem; }
  .preview-img { height: 12rem; }
}
</style>