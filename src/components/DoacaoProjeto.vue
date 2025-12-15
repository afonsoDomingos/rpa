<template>
  <div class="doacao-container">
    <div class="doacao-header">
      <h3>Apoie o Projeto Rpa!</h3>
    </div>
    <p class="doacao-desc">
      Ajude-nos a crescer! Contribua por qualquer canal abaixo:
    </p>
    <div class="doacao-list">
      <div
        class="doacao-item"
        v-for="(valor, metodo) in pagamentos"
        :key="metodo"
      >
        <div class="doacao-label">
          <!-- ícone sempre visível -->
          <span class="doacao-icon" v-html="icons[metodo]"></span>
          <!-- nome escondido em telas pequenas -->
          <span class="doacao-nome">{{ metodo }}</span>
        </div>
        <div class="doacao-right">
          <span class="doacao-value">{{ valor }}</span>
          <button
            class="btn-copiar"
            @click="copiar(valor)"
            :aria-label="`Copiar ${valor}`"
          >
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
import { ref } from "vue";

const pagamentos = {
  PayPal: "karinganastudio23@gmail.com",
  "M-Pesa": "847877405",
  Emola: "879642412",
  "NIB BIM": "000100000074301049557",
};

// SVGs completos com xmlns
const icons = {
  PayPal: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="icon-svg"><path fill="#003087" d="M25.6 6.4c-1.6-1.6-4-2.4-7.2-2.4H8c-1.6 0-2.4.8-2.4 2.4L2.4 27.2c0 .8.8 1.6 1.6 1.6h5.6l1.6-8h2.4c6.4 0 11.2-2.4 12.8-8 .8-2.4.8-4.8-1.6-6.4z"/></svg>`,
  "M-Pesa": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="icon-svg"><circle cx="16" cy="16" r="14" fill="#43b02a"/><text x="16" y="22" text-anchor="middle" font-size="14" fill="#fff" font-family="Roboto" font-weight="bold">M</text></svg>`,
  Emola: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="icon-svg"><circle cx="16" cy="16" r="14" fill="#fbbc05"/><text x="16" y="22" text-anchor="middle" font-size="14" fill="#fff" font-family="Roboto" font-weight="bold">E</text></svg>`,
  "NIB BIM": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="icon-svg"><circle cx="16" cy="16" r="14" fill="#e30613"/><text x="16" y="22" text-anchor="middle" font-size="14" fill="#fff" font-family="Roboto" font-weight="bold">B</text></svg>`,
};

const copiado = ref(false);

function copiar(valor) {
  navigator.clipboard.writeText(valor);
  copiado.value = true;
  setTimeout(() => (copiado.value = false), 1800);
}
</script>

<style scoped>
/* Fonts Imports */
@import "@fortawesome/fontawesome-free/css/all.min.css";
@import "@fontsource/roboto/400.css";
@import "@fontsource/roboto/500.css";
@import "@fontsource/roboto/700.css";

body,
.doacao-container {
  font-family: "Roboto", sans-serif;
}

.doacao-container {
  background: #fff;
  border-radius: 1.25rem;
  padding: 1.5rem;
  max-width: 420px;
  width: 100%;
  margin: 0 auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  text-align: center;
  border: 1px solid #f0f0f0;
}

/* Header Original */
.doacao-header h3 {
  font-family: "Roboto", sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  padding: 0.6rem 1.2rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #800080, #9b30ff);
  color: #fff;
  margin-bottom: 0.8rem;
  box-shadow: 0 4px 12px rgba(128, 0, 128, 0.3);
  display: inline-block;
}

.doacao-desc {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 1.5rem;
}

/* Lista */
.doacao-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.doacao-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #faf7ff;
  border-radius: 0.75rem;
  padding: 0.6rem 0.8rem;
  border: 1px solid #f0e6fa;
  gap: 0.5rem;
}

/* Esquerda */
.doacao-label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}

.icon-svg {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.doacao-nome {
  font-size: 0.95rem;
  font-weight: 600;
  color: #800080;
  white-space: nowrap;
}

/* Direita */
.doacao-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  flex: 1;
  justify-content: flex-end;
}

.doacao-value {
  font-size: 0.9rem;
  color: #333;
  background: #fff;
  border-radius: 6px;
  padding: 4px 8px;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.btn-copiar {
  width: 30px;
  height: 30px;
  background: #800080;
  color: #fff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  font-size: 0.9rem;
}

.btn-copiar:hover {
  background: #198754;
}

.copiado-msg {
  color: #198754;
  font-weight: bold;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Ajuste simples para mobile muito pequeno */
@media (max-width: 360px) {
  .doacao-container {
    padding: 1rem;
  }
  .doacao-nome {
    display: none;
  }
}
</style>