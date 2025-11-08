<!-- src/components/anunciantes/AnuncieForm.vue -->
<template>
  <div class="container">
    

    <main class="form-wrapper">
      <form @submit.prevent="handleSubmit" class="grid">
        <!-- Dados -->
        <section class="section">
          <h2 class="section-title">
            <span class="num num-purple">1</span> Info
          </h2>

          <div class="group">
            <input v-model="form.name" type="text" class="input" placeholder="Nome" required />
          </div>

          <div class="group">
            <textarea v-model="form.description" class="input textarea" rows="2" placeholder="Descrição" required></textarea>
          </div>

          <div class="group">
            <div class="price">
              <span class="currency">MZN</span>
              <input v-model.number="form.price" type="number" class="input price-input" placeholder="Preço" required />
            </div>
          </div>

          <div class="group">
            <input v-model="form.ctaLink" type="url" class="input" placeholder="wa.me/..." required />
          </div>
        </section>

        <!-- Imagem -->
        <section class="section">
          <h2 class="section-title">
            <span class="num num-green">2</span> Foto
          </h2>

          <div class="group">
            <input type="file" accept="image/*" @change="onFileChange" id="file" class="hidden" :required="!previewUrl" />
            <label for="file" class="upload-label">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
              </svg>
            </label>

            <transition name="fade">
              <div v-if="previewUrl" class="preview">
                <img :src="previewUrl" alt="" class="preview-img" />
                <button @click="removeImage" type="button" class="remove">
                  <svg class="icon-x" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                  </svg>
                </button>
              </div>
            </transition>
          </div>
        </section>

        <!-- Botão (sempre visível) -->
        <button type="submit" class="btn">
          Publicar Anúncio
          <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M13 7l5 5m0 0l-5 5m5-5H6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
          </svg>
        </button>
      </form>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
const emit = defineEmits(['next'])

const form = reactive({
  name: '',
  description: '',
  price: 0,
  ctaLink: '',
  image: null
})

const previewUrl = ref('')

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    alert('Máx. 2MB')
    e.target.value = ''
    return
  }
  form.image = file
  previewUrl.value = URL.createObjectURL(file)
}

const removeImage = () => {
  form.image = null
  previewUrl.value = ''
  const input = document.getElementById('file')
  if (input) input.value = ''
}

const handleSubmit = () => {
  console.log('Anúncio:', form)
  alert('Adicionado!')
  emit('next', form) // AVANÇA
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Poppins', sans-serif; }

.container {
  height: 100vh;
  width: 100vw;
  background: #0a0a0a; /* FUNDO PRETO TOTAL */
  color: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  padding: 0.5rem 0.75rem;
  text-align: center;
}
.title {
  font-size: 1.25rem;
  font-weight: 600;
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
.btn:hover {
  background: linear-gradient(135deg, #10b981 0%, #7c3aed 100%);
}
.arrow { width: 0.9rem; height: 0.9rem; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* RESPONSIVO */
@media (min-width: 768px) {
  .grid { grid-template-columns: 1fr 1fr; gap: 1rem; }
  .preview-img { height: 12rem; }
}

@media (min-width: 1024px) {
  .header { padding: 0.75rem 1rem; text-align: left; }
  .form-wrapper { padding: 0.75rem 1rem; }
}
</style>