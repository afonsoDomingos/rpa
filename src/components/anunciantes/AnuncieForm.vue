<template>
  <div class="container">
    <main class="form-wrapper">
      <form @submit.prevent="handleSubmit" class="grid">
        <section class="section">
          <h2 class="section-title">
            <span class="num num-purple">1</span> Info
          </h2>

          <div class="group">
            <label for="name" class="sr-only">Nome do anúncio</label>
            <input
              v-model="form.name"
              id="name"
              type="text"
              class="input"
              placeholder="Nome"
              required
              maxlength="100"
            />
          </div>

          <div class="group">
            <label for="description" class="sr-only">Descrição do anúncio</label>
            <textarea
              v-model="form.description"
              id="description"
              class="input textarea"
              rows="2"
              placeholder="Descrição"
              required
              maxlength="500"
            ></textarea>
          </div>

          <div class="group">
            <div class="price">
              <span class="currency">MZN</span>
              <label for="price" class="sr-only">Preço do anúncio</label>
              <input
                v-model.number="form.price"
                id="price"
                type="number"
                min="0"
                class="input price-input"
                placeholder="Preço"
                required
              />
            </div>
          </div>

          <div class="group">
            <label for="ctaLink" class="sr-only">Link do WhatsApp</label>
            <input
              v-model="form.ctaLink"
              id="ctaLink"
              type="url"
              class="input"
              placeholder="wa.me/..."
              required
            />
            <p v-if="ctaError" class="error-text">{{ ctaError }}</p>
          </div>
        </section>

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
              required
            />
            <label for="file" class="upload-label" aria-label="Enviar imagem do anúncio">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
            </label>

            <transition name="fade">
              <div v-if="previewUrl" class="preview">
                <img :src="previewUrl" :alt="`Pré-visualização de ${form.name || 'anúncio'}`" class="preview-img" />
                <button
                  @click="removeImage"
                  type="button"
                  class="remove"
                  aria-label="Remover imagem"
                >
                  <svg class="icon-x" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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

        <button type="submit" class="btn" :disabled="!form.name || !form.description || !form.price || !form.ctaLink || !form.image">
          Continuar
          <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M13 7l5 5m0 0l-5 5m5-5H6"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            />
          </svg>
        </button>
      </form>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['next'])

const form = reactive({
  name: '',
  description: '',
  price: 0,
  ctaLink: '',
  image: null
})

const previewUrl = ref('')
const ctaError = ref('')

onMounted(() => {
  const savedForm = localStorage.getItem('anuncieForm')
  if (savedForm) {
    const parsed = JSON.parse(savedForm)
    Object.assign(form, parsed)
    if (form.image) {
      previewUrl.value = URL.createObjectURL(form.image)
    }
  }
})

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (!file.type.match('image/(jpeg|png|webp)')) {
    alert('Apenas imagens JPG, PNG ou WebP são permitidas.')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    alert('A imagem deve ter no máximo 2MB.')
    return
  }

  form.image = file
  previewUrl.value = URL.createObjectURL(file)
  saveForm()
}

const removeImage = () => {
  form.image = null
  previewUrl.value = ''
  document.getElementById('file').value = ''
  saveForm()
}

const validateWhatsApp = () => {
  const url = form.ctaLink.trim()
  const regex = /^https?:\/\/(wa\.me|api\.whatsapp\.com|whatsapp\.com)\/.+$/
  if (!regex.test(url)) {
    ctaError.value = 'Use apenas links do WhatsApp (ex.: wa.me/...)'
    return false
  }
  ctaError.value = ''
  return true
}

const handleSubmit = () => {
  if (!validateWhatsApp()) return
  if (!form.image) {
    alert('Adicione uma imagem para o anúncio.')
    return
  }
  if (!form.name || form.name.length > 100) {
    alert('O nome do anúncio é obrigatório e deve ter até 100 caracteres.')
    return
  }
  if (!form.description || form.description.length > 500) {
    alert('A descrição é obrigatória e deve ter até 500 caracteres.')
    return
  }
  if (!form.price || form.price < 0) {
    alert('O preço deve ser um valor positivo.')
    return
  }

  emit('next', { ...form })
  saveForm()
}

const saveForm = () => {
  localStorage.setItem('anuncieForm', JSON.stringify({
    name: form.name,
    description: form.description,
    price: form.price,
    ctaLink: form.ctaLink
  }))
}

onUnmounted(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<style scoped>
/* Estilos originais mantidos */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Poppins', sans-serif; }

.container {
  height: 100vh;
  width: 100vw;
  background: #0a0a0a;
  color: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.form-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  max-width: 900px;
  margin: 0 auto;
}

.section {
  background: rgba(30, 30, 30, 0.9);
  padding: 0.75rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(255,255,255,0.08);
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
}

.num {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.3rem;
  font-size: 0.65rem;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.num-purple { background: #7c3aed; }
.num-green { background: #10b981; }

.group { margin-bottom: 0.5rem; }
.group:last-child { margin-bottom: 0; }

.input {
  width: 100%;
  padding: 0.5rem;
  background: rgba(0,0,0,0.6);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 0.4rem;
  color: white;
  font-size: 0.85rem;
  outline: none;
}

.input::placeholder { color: #777; }
.input:focus { border-color: #7c3aed; }

.textarea { resize: none; min-height: 60px; }

.price { position: relative; }
.currency {
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: #10b981;
  font-weight: 700;
  font-size: 0.75rem;
  pointer-events: none;
}
.price-input { padding-left: 2.75rem !important; }

.hidden { display: none; }

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 1rem 0.7rem;
  background: rgba(124,58,237,0.1);
  border: 1.5px dashed rgba(124,58,237,0.35);
  border-radius: 0.5rem;
  cursor: pointer;
}

.upload-label:hover {
  background: rgba(124,58,237,0.15);
  border-color: #7c3aed;
}

.icon { width: 1.75rem; height: 1.75rem; color: #a78bfa; }
.upload-label:hover .icon { color: #c4b5fd; }

.preview {
  position: relative;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1.5px solid rgba(124,58,237,0.35);
  margin-top: 0.4rem;
}

.preview-img { width: 100%; height: 10rem; object-fit: cover; }

.remove {
  position: absolute;
  top: 0.3rem;
  right: 0.3rem;
  background: #ef4444;
  border: none;
  border-radius: 50%;
  width: 1.6rem;
  height: 1.6rem;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove:hover { background: #dc2626; }
.icon-x { width: 1rem; height: 1rem; }

.btn {
  grid-column: 1 / -1;
  margin-top: 0.5rem;
  width: 100%;
  padding: 0.65rem;
  background: linear-gradient(135deg, #7c3aed 0%, #10b981 100%);
  color: white;
  border: none;
  border-radius: 0.4rem;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}

.btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #10b981 0%, #7c3aed 100%);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.arrow { width: 0.9rem; height: 0.9rem; }

.error-text {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (min-width: 768px) {
  .grid { grid-template-columns: 1fr 1fr; gap: 1rem; }
  .preview-img { height: 12rem; }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>