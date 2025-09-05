<template> 
  <div class="doacao-container">
    <div class="doacao-header">
      <h3>Apoie o Projeto RPA!</h3>
    </div>
    <p class="doacao-desc">
      Ajude-nos a crescer! Doe por qualquer canal abaixo:
    </p>
    <div class="doacao-list">
      <div class="doacao-item">
        <span class="doacao-label">
          <span class="icon-paypal" title="PayPal">
            <!-- PayPal SVG -->
            <svg width="20" height="20" viewBox="0 0 32 32"><g><path fill="#003087" d="M25.6 6.4c-1.6-1.6-4-2.4-7.2-2.4H8c-1.6 0-2.4.8-2.4 2.4L2.4 27.2c0 .8.8 1.6 1.6 1.6h5.6l1.6-8h2.4c6.4 0 11.2-2.4 12.8-8 .8-2.4.8-4.8-1.6-6.4z"/></g></svg>
          </span>
          PayPal
        </span>
        <span class="doacao-value">{{ paypal }}</span>
        <button class="btn-copiar" @click="copiar(paypal)" :aria-label="`Copiar ${paypal}`">
          <i class="fas fa-copy"></i>
        </button>
      </div>
      <div class="doacao-item">
        <span class="doacao-label">
          <span class="icon-mpesa" title="M-Pesa">
            <!-- M-Pesa SVG -->
            <svg width="20" height="20" viewBox="0 0 32 32"><g><circle cx="16" cy="16" r="14" fill="#43b02a"/><text x="16" y="22" text-anchor="middle" font-size="14" fill="#fff" font-family="Arial" font-weight="bold">M</text></g></svg>
          </span>
          M-Pesa
        </span>
        <span class="doacao-value">{{ mpesa }}</span>
        <button class="btn-copiar" @click="copiar(mpesa)" :aria-label="`Copiar ${mpesa}`">
          <i class="fas fa-copy"></i>
        </button>
      </div>
      <div class="doacao-item">
        <span class="doacao-label">
          <span class="icon-emola" title="Emola">
            <!-- Emola SVG -->
            <svg width="20" height="20" viewBox="0 0 32 32"><g><circle cx="16" cy="16" r="14" fill="#fbbc05"/><text x="16" y="22" text-anchor="middle" font-size="14" fill="#fff" font-family="Arial" font-weight="bold">E</text></g></svg>
          </span>
          Emola
        </span>
        <span class="doacao-value">{{ emola }}</span>
        <button class="btn-copiar" @click="copiar(emola)" :aria-label="`Copiar ${emola}`">
          <i class="fas fa-copy"></i>
        </button>
      </div>
      <div class="doacao-item">
        <span class="doacao-label">
          <span class="icon-bim" title="BIM">
            <!-- BIM SVG -->
            <svg width="20" height="20" viewBox="0 0 32 32"><g><circle cx="16" cy="16" r="14" fill="#e30613"/><text x="16" y="22" text-anchor="middle" font-size="14" fill="#fff" font-family="Arial" font-weight="bold">B</text></g></svg>
          </span>
          NIB BIM
        </span>
        <span class="doacao-value">{{ nib }}</span>
        <button class="btn-copiar" @click="copiar(nib)" :aria-label="`Copiar ${nib}`">
          <i class="fas fa-copy"></i>
        </button>
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
const paypal = 'karinganastudio23@gmail.com'
const mpesa = '847877405'
const emola = '879642412'
const nib = '000100000074301049557'
const copiado = ref(false)
function copiar(valor) {
  navigator.clipboard.writeText(valor)
  copiado.value = true
  setTimeout(() => copiado.value = false, 1800)
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap');

.doacao-container {
  background: #fff;
  border-radius: 20px;
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  max-width: 370px;
  margin: 2rem auto;
  box-shadow: 0 4px 24px #0001, 0 1.5px 8px #80008011;
  text-align: center;
  border: 1.5px solid #eee;
  transition: box-shadow 0.2s;
}

/* Header com fundo roxo */
.doacao-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.7rem;
}

.doacao-header h3 {
  background: linear-gradient(135deg, #800080, #9b30ff);
  color: #fff;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  font-size: 1.4rem;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 12px #80008055;
  transition: transform 0.25s, box-shadow 0.25s;
  animation: brilho 3s infinite ease-in-out;
}

/* Efeito hover */
.doacao-header h3:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 18px #80008077;
}

/* Animação de brilho pulsante */
@keyframes brilho {
  0%, 100% {
    box-shadow: 0 4px 12px #80008055;
  }
  50% {
    box-shadow: 0 6px 20px #9b30ff88;
  }
}

.doacao-desc {
  color: #555;
  font-size: 1rem;
  margin-bottom: 1.3rem;
}

.doacao-list {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.doacao-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #faf7ff;
  border-radius: 12px;
  padding: 0.6rem 0.8rem;
  box-shadow: 0 1px 4px #80008009;
  border: 1px solid #f0e6fa;
}

.doacao-label {
  color: #800080;
  font-weight: 600;
  font-size: 1rem;
  min-width: 90px;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-paypal svg,
.icon-mpesa svg,
.icon-emola svg,
.icon-bim svg {
  vertical-align: middle;
}

.doacao-value {
  font-family: 'Open Sans', monospace, Arial, sans-serif;
  font-size: 0.98rem;
  color: #333;
  background: #fff;
  border-radius: 6px;
  padding: 2px 8px;
  margin: 0 8px;
  word-break: break-all;
  flex: 1 1 auto;
  text-align: center;
}

.btn-copiar {
  background: #800080;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  margin-left: 6px;
  box-shadow: 0 1px 4px #80008022;
}
.btn-copiar:hover {
  background: #198754;
  transform: scale(1.12);
}

.copiado-msg {
  color: #198754;
  margin-top: 1.2rem;
  font-weight: bold;
  font-size: 1.08rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  letter-spacing: 0.01em;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Responsividade */
@media (max-width: 480px) {
  .doacao-container {
    padding: 1.1rem 0.3rem 1rem 0.3rem;
    max-width: 98vw;
    font-size: 0.97rem;
  }
  .doacao-header h3 {
    font-size: 1.1rem;
  }
  .doacao-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.3rem;
    padding: 0.7rem 0.5rem;
  }
  .doacao-label {
    font-size: 0.97rem;
    margin-bottom: 2px;
    min-width: 0;
    justify-content: flex-start;
  }
  .doacao-value {
    font-size: 0.93rem;
    padding: 2px 4px;
    margin: 0 0 4px 0;
  }
  .btn-copiar {
    width: 28px;
    height: 28px;
    font-size: 1rem;
    margin-left: 0;
    align-self: flex-end;
  }
}
</style>
