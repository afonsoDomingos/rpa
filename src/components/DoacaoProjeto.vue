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
        <span class="doacao-label">PayPal</span>
        <span class="doacao-value">{{ paypal }}</span>
        <button class="btn-copiar" @click="copiar(paypal)" :aria-label="`Copiar ${paypal}`">
          <i class="fas fa-copy"></i>
        </button>
      </div>
      <div class="doacao-item">
        <span class="doacao-label">M-Pesa</span>
        <span class="doacao-value">{{ mpesa }}</span>
        <button class="btn-copiar" @click="copiar(mpesa)" :aria-label="`Copiar ${mpesa}`">
          <i class="fas fa-copy"></i>
        </button>
      </div>
      <div class="doacao-item">
        <span class="doacao-label">Emola</span>
        <span class="doacao-value">{{ emola }}</span>
        <button class="btn-copiar" @click="copiar(emola)" :aria-label="`Copiar ${emola}`">
          <i class="fas fa-copy"></i>
        </button>
      </div>
      <div class="doacao-item">
        <span class="doacao-label">NIB BIM</span>
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

.doacao-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.7rem;
}

.icon-heart {
  font-size: 2.2rem;
  color: #800080;
  margin-bottom: 0.2rem;
  filter: drop-shadow(0 2px 6px #80008022);
}

.doacao-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #222;
  margin: 0;
  letter-spacing: 0.01em;
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
  min-width: 70px;
  text-align: left;
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
    font-size: 1.05rem;
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

@media (max-width: 480px) {
  .doacao-container {
    padding: 0.7rem 0.1rem 0.7rem 0.1rem;
    max-width: 99vw;
    font-size: 0.95rem;
    margin: 1rem auto;
    border-radius: 14px;
  }
  .doacao-header {
    margin-bottom: 0.4rem;
  }
  .icon-heart {
    font-size: 1.5rem;
    margin-bottom: 0.1rem;
  }
  .doacao-header h3 {
    font-size: 0.98rem;
  }
  .doacao-desc {
    font-size: 0.93rem;
    margin-bottom: 0.7rem;
  }
  .doacao-list {
    gap: 0.7rem;
  }
  .doacao-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.2rem;
    padding: 0.5rem 0.3rem;
    border-radius: 9px;
  }
  .doacao-label {
    font-size: 0.93rem;
    margin-bottom: 1px;
  }
  .doacao-value {
    font-size: 0.89rem;
    padding: 2px 2px;
    margin: 0 0 2px 0;
    border-radius: 4px;
  }
  .btn-copiar {
    width: 24px;
    height: 24px;
    font-size: 0.95rem;
    margin-left: 0;
    align-self: flex-end;
    border-radius: 50%;
  }
  .copiado-msg {
    font-size: 0.97rem;
    margin-top: 0.7rem;
  }
}
</style>