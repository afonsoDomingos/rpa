<template>
  <div class="doacao-container">
    <div class="doacao-header">
      <h3>Apoie o Projeto RPA!</h3>
    </div>
    <p class="doacao-desc">
      Ajude-nos a crescer! Doe por qualquer canal abaixo:
    </p>
    <div class="doacao-list">
      <div class="doacao-item" v-for="(valor, metodo) in pagamentos" :key="metodo">
        <div class="doacao-label">
          <span class="doacao-icon" :title="metodo" v-html="icons[metodo]"></span>
          <span class="doacao-nome">{{ metodo }}</span>
        </div>
        <div class="doacao-right">
          <span class="doacao-value">{{ valor }}</span>
          <button class="btn-copiar" @click="copiar(valor)" :aria-label="`Copiar ${valor}`">
            <i class="fas fa-copy"></i>
          </button>
        </div>
      </div>
    </div>
    <transition name="fade">
      <div v-if="copiado" class="copiado-msg">
        <i class="fas fa-check-circle"></i> Copiado!
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const pagamentos = {
  PayPal: 'karinganastudio23@gmail.com',
  'M-Pesa': '847877405',
  Emola: '879642412',
  'NIB BIM': '000100000074301049557'
}

const icons = {
  PayPal: `<svg class="icon-svg" viewBox="0 0 32 32"><path fill="#003087" d="M25.6 6.4c-1.6-1.6-4-2.4-7.2-2.4H8c-1.6 0-2.4.8-2.4 2.4L2.4 27.2c0 .8.8 1.6 1.6 1.6h5.6l1.6-8h2.4c6.4 0 11.2-2.4 12.8-8 .8-2.4.8-4.8-1.6-6.4z"/></svg>`,
  'M-Pesa': `<svg class="icon-svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#43b02a"/><text x="16" y="22" text-anchor="middle" font-size="14" fill="#fff" font-family="Roboto" font-weight="bold">M</text></svg>`,
  Emola: `<svg class="icon-svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#fbbc05"/><text x="16" y="22" text-anchor="middle" font-size="14" fill="#fff" font-family="Roboto" font-weight="bold">E</text></svg>`,
  'NIB BIM': `<svg class="icon-svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#e30613"/><text x="16" y="22" text-anchor="middle" font-size="14" fill="#fff" font-family="Roboto" font-weight="bold">B</text></svg>`
}

const copiado = ref(false)

function copiar(valor) {
  navigator.clipboard.writeText(valor)
  copiado.value = true
  setTimeout(() => copiado.value = false, 1800)
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

body, .doacao-container { font-family: 'Roboto', sans-serif; }

.doacao-container {
  background: #fff;
  border-radius: 1.25rem;
  padding: clamp(1rem, 2vw, 2rem) clamp(0.8rem, 3vw, 1.5rem);
  max-width: 400px;
  width: 100%;
  margin: 2rem auto;
  box-shadow: 0 4px 24px rgba(0,0,0,0.05);
  text-align: center;
  border: 1.5px solid #eee;
  transition: box-shadow 0.3s ease;
}
.doacao-container:hover { box-shadow: 0 6px 32px rgba(0,0,0,0.1); }

.doacao-header h3 {
  font-family: 'Roboto', sans-serif;
  font-size: clamp(1rem, 4vw, 1.5rem);
  padding: clamp(0.5rem, 1vw, 0.7rem) clamp(0.8rem, 2vw, 1rem);
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #800080, #9b30ff);
  color: #fff;
  margin-bottom: 1rem;
  box-shadow: 0 4px 12px #80008055;
  animation: brilho 3s infinite ease-in-out;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.doacao-header h3:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 20px #9b30ff88;
}
@keyframes brilho { 0%,100%{box-shadow:0 4px 12px #80008055;} 50%{box-shadow:0 6px 20px #9b30ff88;} }

.doacao-desc { font-size: clamp(0.9rem, 3vw, 1rem); color: #555; margin-bottom: 1.3rem; }

.doacao-list { display: flex; flex-direction: column; gap: clamp(0.8rem, 2vw, 1rem); }

.doacao-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  background: #faf7ff;
  border-radius: 0.75rem;
  padding: clamp(0.4rem, 1vw, 0.6rem) clamp(0.5rem, 2vw, 0.8rem);
  box-shadow: 0 1px 4px rgba(128,0,128,0.05);
  border: 1px solid #f0e6fa;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.doacao-item:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(128,0,128,0.15); }

.doacao-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.doacao-icon { display: flex; align-items: center; justify-content: center; }
.icon-svg { width: clamp(20px, 4vw, 24px); height: clamp(20px, 4vw, 24px); }

.doacao-nome { font-size: clamp(0.85rem, 3vw, 1rem); color: #800080; }

.doacao-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.doacao-value {
  font-family: 'Roboto', sans-serif;
  font-size: clamp(0.8rem, 2.5vw, 0.95rem);
  color: #333;
  background: #fff;
  border-radius: 0.375rem;
  padding: clamp(2px, 0.5vw, 0.5rem);
  text-align: center;
  word-break: break-all;
  min-width: 80px;
}

.btn-copiar {
  width: clamp(28px, 6vw, 32px);
  height: clamp(28px, 6vw, 32px);
  font-size: clamp(0.85rem, 2.5vw, 1rem);
  background: #800080;
  color: #fff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}
.btn-copiar:hover { background: #198754; transform: scale(1.15); }

.copiado-msg {
  font-family: 'Roboto', sans-serif;
  font-size: clamp(0.9rem, 3vw, 1.08rem);
  color: #198754;
  margin-top: clamp(0.5rem, 1vw, 1.2rem);
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Responsividade para telas pequenas */
@media (max-width: 480px) {
  .doacao-item { flex-direction: column; align-items: center; gap: 0.3rem; }
  .doacao-label { flex-direction: column; align-items: center; gap: 0.2rem; }
  .doacao-nome { display: none; }
  .doacao-right { flex-direction: column; gap: 0.2rem; margin-top: 0.3rem; align-items: center; }
  .doacao-value { font-size: 0.8rem; padding: 2px 4px; }
  .btn-copiar { width: 24px; height: 24px; font-size: 0.85rem; }
  .icon-svg { width: 22px; height: 22px; }
}
</style>
