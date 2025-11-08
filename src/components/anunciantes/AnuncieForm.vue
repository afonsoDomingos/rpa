<!-- src/components/anunciantes/AnuncieForm.vue -->
<template>
  <form @submit.prevent="$emit('next', form)" class="anuncie-form">
    <div class="form-group">
      <label class="form-label">Nome do Produto/Serviço</label>
      <input
        v-model="form.name"
        type="text"
        class="form-input"
        placeholder="Ex: Apartamento T3 - Matola"
        required
      />
    </div>

    <div class="form-group">
      <label class="form-label">Preço</label>
      <div class="price-input">
        <span class="currency">MZN</span>
        <input
          v-model.number="form.price"
          type="number"
          min="0"
          step="1000"
          class="form-input"
          placeholder="2500000"
          required
        />
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Link do WhatsApp</label>
      <input
        v-model="form.ctaLink"
        type="url"
        class="form-input"
        placeholder="https://wa.me/258841234567"
        required
      />
    </div>

    <div class="form-group">
      <label class="form-label">Imagem do Anúncio (máx. 2MB)</label>
      <div class="file-input-wrapper">
        <input
          type="file"
          accept="image/*"
          @change="onFileChange"
          id="file-upload"
          class="file-input"
          required
        />
        <label for="file-upload" class="file-label">
          <i class="bi bi-cloud-upload"></i>
          Escolher imagem
        </label>
      </div>
      <transition name="fade">
        <div v-if="previewUrl" class="image-preview">
          <img :src="previewUrl" alt="Preview" />
          <button @click="removeImage" class="remove-img">
            <i class="bi bi-x-circle-fill"></i>
          </button>
        </div>
      </transition>
    </div>

    <button type="submit" class="submit-btn">
      <span>Avançar</span>
      <i class="bi bi-arrow-right"></i>
    </button>
  </form>
</template>

<script setup>
import { reactive, ref } from 'vue'

const emit = defineEmits(['next'])
const form = reactive({
  name: '',
  price: 0,
  ctaLink: '',
  image: null
})
const previewUrl = ref('')

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    alert('Imagem muito grande. Máximo: 2MB.')
    e.target.value = ''
    return
  }

  form.image = file
  previewUrl.value = URL.createObjectURL(file)
}

const removeImage = () => {
  form.image = null
  previewUrl.value = ''
  document.getElementById('file-upload').value = ''
}
</script>

<style scoped>
/* === IMPORTS === */
@import 'bootstrap-icons/font/bootstrap-icons.css';
@import '@fontsource/poppins/500.css';
@import '@fontsource/poppins/600.css';
@import '@fontsource/poppins/700.css';

/* === POPPINS GLOBAL === */
* {
  font-family: 'Poppins', sans-serif !important;
  box-sizing: border-box;
}

/* === FORMULÁRIO === */
.anuncie-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 420px;
  margin: 2rem auto;
  padding: 2rem;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  color: #ffffff;
}

/* === LABELS === */
.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #d0d0d0;
}

/* === INPUTS === */
.form-input {
  padding: 0.875rem;
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.2s ease;
  outline: none;
}

.form-input::placeholder {
  color: #a0a0a0;
  font-style: italic;
}

.form-input:focus {
  border-color: #800080;
  box-shadow: 0 0 0 3px rgba(128, 0, 128, 0.1);
}

/* === PREÇO COM MZN === */
.price-input {
  position: relative;
  display: flex;
  align-items: center;
}

.price-input .currency {
  position: absolute;
  left: 1rem;
  color: #66bb6a;
  font-weight: 600;
  font-size: 1rem;
  pointer-events: none;
  z-index: 1;
}

.price-input .form-input {
  padding-left: 3.5rem !important;
}

/* === UPLOAD DE IMAGEM === */
.file-input-wrapper {
  position: relative;
}

.file-input {
  opacity: 0;
  position: absolute;
  z-index: -1;
}

.file-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.875rem;
  background: rgba(128, 0, 128, 0.1);
  border: 1px dashed rgba(128, 0, 128, 0.4);
  border-radius: 0.5rem;
  color: #c29bff;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-label:hover {
  background: rgba(128, 0, 128, 0.15);
  border-color: #800080;
  color: #e0c3ff;
}

.file-label i {
  font-size: 1.1rem;
}

/* === PREVIEW DA IMAGEM === */
.image-preview {
  position: relative;
  margin-top: 1rem;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.image-preview img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.remove-img {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(239, 68, 68, 0.9);
  border: none;
  border-radius: 50%;
  width: 34px;
  height: 34px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-img:hover {
  background: #ef4444;
  transform: scale(1.1);
}

/* === BOTÃO AVANÇAR === */
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #800080, #66bb6a);
  color: #ffffff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #66bb6a, #800080);
  transform: scale(1.02);
}

.submit-btn i {
  font-size: 1.1rem;
  transition: transform 0.2s ease;
}

.submit-btn:hover i {
  transform: translateX(3px);
}

/* === ANIMAÇÃO === */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* === RESPONSIVO === */
@media (max-width: 480px) {
  .anuncie-form {
    padding: 1.5rem;
    margin: 1.5rem auto;
  }
  .image-preview img {
    height: 160px;
  }
}
</style>