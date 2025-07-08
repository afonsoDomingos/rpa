<template>
  <div class="chat-assistente-fixed" v-show="open">
    <div class="chat-header" @click="toggle">
      <span class="chat-avatar">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#fff"/>
          <ellipse cx="16" cy="19" rx="10" ry="7" fill="#e6e6fa"/>
          <ellipse cx="16" cy="13" rx="7" ry="7" fill="#800080"/>
          <ellipse cx="13.5" cy="12.5" rx="1.2" ry="1.5" fill="#fff"/>
          <ellipse cx="18.5" cy="12.5" rx="1.2" ry="1.5" fill="#fff"/>
          <rect x="13" y="16" width="6" height="2" rx="1" fill="#fff"/>
        </svg>
      </span>
      <span class="chat-title">Assistente Virtual</span>
      <button class="close-btn" @click.stop="toggle">×</button>
    </div>

    <div class="chat-desc">Sou seu assistente virtual, posso ajudar?</div>

    <div class="chat-body">
      <!-- Menu suspenso de perguntas -->
      <div class="faq-menu-wrapper">
        <button class="faq-toggle-btn" @click="faqOpen = !faqOpen" :aria-expanded="faqOpen.toString()" aria-controls="faqMenuList">
          <span>❓ Perguntas Frequentes</span>
          <svg v-if="!faqOpen" width="18" height="18" viewBox="0 0 20 20"><path d="M5 8l5 5 5-5" stroke="#800080" stroke-width="2" fill="none"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 20 20"><path d="M15 12l-5-5-5 5" stroke="#800080" stroke-width="2" fill="none"/></svg>
        </button>
        <transition name="faq-fade">
          <div v-show="faqOpen" class="faq-menu" id="faqMenuList" role="menu">
            <ul class="faq-list">
              <li v-for="p in predefinidas" :key="p.id">
                <button class="faq-btn" @click="responderFaq(p.id)" role="menuitem">{{ p.pergunta }}</button>
              </li>
            </ul>
          </div>
        </transition>
      </div>
      <div class="chat-messages" ref="chatMessagesRef" @scroll="handleScroll">
        <div v-for="(msg, i) in messages" :key="'msg-' + i" :class="['msg', msg.from]">
          <span v-if="msg.from === 'bot'" class="msg-bot-avatar">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#fff"/>
              <ellipse cx="16" cy="19" rx="10" ry="7" fill="#e6e6fa"/>
              <ellipse cx="16" cy="13" rx="7" ry="7" fill="#800080"/>
              <ellipse cx="13.5" cy="12.5" rx="1.2" ry="1.5" fill="#fff"/>
              <ellipse cx="18.5" cy="12.5" rx="1.2" ry="1.5" fill="#fff"/>
              <rect x="13" y="16" width="6" height="2" rx="1" fill="#fff"/>
            </svg>
          </span>
          <span class="msg-text" v-if="msg.from === 'bot'" v-html="msg.text"></span>
          <span class="msg-text" v-else>{{ msg.text }}</span>
        </div>
        <button v-show="showScrollBtn" class="scroll-to-bottom-btn" @click="scrollToBottom" aria-label="Rolar para o fim do chat">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M19 12l-7 7-7-7" stroke="#800080" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>

    <form class="chat-footer" @submit.prevent="send">
      <input v-model="input" type="text" placeholder="Digite sua mensagem..." autocomplete="off" />
      <button type="submit">Enviar</button>
    </form>
  </div>

  <button v-show="!open" class="chat-fab" @click="toggle" aria-label="Falar com Assistente">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#800080"/>
      <path d="M12 17c2.8 0 5-2.2 5-5V9a5 5 0 0 0-10 0v3c0 2.8 2.2 5 5 5Zm-3-5V9a3 3 0 0 1 6 0v3a3 3 0 0 1-6 0Zm8 0a5.98 5.98 0 0 1-2 4.47V20h-4v-1.53A5.98 5.98 0 0 1 7 12" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
</template>


<script setup>
import { ref, nextTick, onUpdated } from 'vue';

const open = ref(false);
const input = ref("");
const faqOpen = ref(false);
const chatMessagesRef = ref(null);
const showScrollBtn = ref(false);

const predefinidas = [
  { id: 1, pergunta: '🔐 1. Como criar uma conta?', resposta: 'Para criar uma conta, preencha seu nome, e-mail e senha.<br>Depois é só fazer login e começar a usar a plataforma normalmente.<br><a href="/" style="color:#800080;text-decoration:underline;">Clique aqui para fazer login</a>.' },
  { id: 2, pergunta: '🔑 2. Como fazer login?', resposta: 'Informe seu e-mail e senha cadastrados.<br>Você será direcionado(a) para a tela principal da plataforma.<br><a href="/" style="color:#800080;text-decoration:underline;">Ir para login</a>.' },
  { id: 3, pergunta: '🔍 3. Como procurar um documento?', resposta: 'Vá até a aba “Procurar”, escolha o filtro desejado.<br>Clique em “Buscar” e veja se há algum resultado disponível.' },
  { id: 4, pergunta: '📥 4. Como solicitar um documento?', resposta: 'Se o documento for encontrado, clique em “Solicitar”.<br>Será necessário ter uma assinatura ativa (Mensal ou Anual) para prosseguir.<br><a href="/assinaturas" style="color:#800080;text-decoration:underline;">Clique aqui para ver planos de assinatura</a> (opcional).' },
  { id: 5, pergunta: '💳 5. Como fazer uma assinatura?', resposta: 'Escolha um dos planos disponíveis:\n– 📅 Mensal: 150 MZN\n– 📆 Anual: 650 MZN\nApós o pagamento, sua assinatura será ativada imediatamente.' },
  { id: 6, pergunta: '📢 6. Como reportar um documento?', resposta: 'Se não encontrar o documento, vá à aba “Reportar”.\nPreencha os dados do documento perdido e envie.\nVocê será notificado se alguém encontrá-lo.' },
  { id: 7, pergunta: '📁 7. Como guardar um documento?', resposta: 'Acesse “Guardar Documento”, preencha os dados e clique em salvar.\nO documento ficará disponível na sua conta, com opção de gerar PDF.' },
  { id: 8, pergunta: '📄 8. Como gerar um PDF?', resposta: 'Após guardar um documento, clique em “Gerar PDF”.\nUm arquivo será criado automaticamente com os dados preenchidos.' },
  { id: 9, pergunta: '🔁 9. Como renovar a assinatura?', resposta: 'Quando sua assinatura expirar, clique em “Renovar” no painel.\nEscolha o plano desejado e continue acessando todos os recursos.' },
  { id: 10, pergunta: '❓ 10. Como posso receber ajuda?', resposta: 'Você pode digitar perguntas como:\n“Assinar”, “Reportar documento”, “PDF”, “Renovar” ou “Guardar”.\nOu clique no botão “Ajuda” para ver todas as opções.' }
];

const messages = ref([
  { from: 'bot', text: 'Olá! Como posso ajudar você?\nSelecione uma pergunta abaixo ou digite sua dúvida.' }
]);

function toggle() {
  open.value = !open.value;
}

function send() {
  if (!input.value.trim()) return;
  const userMsg = input.value.trim();
  messages.value.push({ from: 'user', text: userMsg });
  const opt = parseInt(userMsg);
  if (!isNaN(opt) && predefinidas.some(p => p.id === opt)) {
    const msg = predefinidas.find(p => p.id === opt);
    setTimeout(() => {
      messages.value.push({ from: 'bot', text: msg.resposta });
    }, 500);
  } else {
    setTimeout(() => {
      messages.value.push({ from: 'bot', text: 'Recebi: ' + userMsg });
    }, 700);
  }
  input.value = "";
}

function responderFaq(id) {
  const pergunta = predefinidas.find(p => p.id === id);
  if (pergunta) {
    messages.value.push({ from: 'user', text: pergunta.pergunta });
    setTimeout(() => {
      messages.value.push({ from: 'bot', text: pergunta.resposta });
    }, 500);
  }
  faqOpen.value = false;
}

function handleScroll() {
  const el = chatMessagesRef.value;
  if (!el) return;
  // Mostra o botão se não está no fim
  showScrollBtn.value = el.scrollTop + el.clientHeight < el.scrollHeight - 10;
}

function scrollToBottom() {
  const el = chatMessagesRef.value;
  if (el) {
    el.scrollTop = el.scrollHeight;
    showScrollBtn.value = false;
  }
}

onUpdated(() => {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
      showScrollBtn.value = false;
    }
  });
});
</script>


<style scoped>
.faq-select-box {
  margin-bottom: 10px;
}
.faq-select-box select {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: #fff;
  font-size: 0.98rem;
  color: #333;
}
.faq-select-box select:focus {
  border-color: #800080;
  box-shadow: 0 0 4px rgba(128,0,128,0.2);
  outline: none;
}


/* FAQ menu styles */
.faq-menu {
  background: #f3f3f7;
  border-radius: 10px;
  padding: 10px 8px 8px 8px;
  margin-bottom: 10px;
  box-shadow: 0 1px 4px rgba(128,0,128,0.06);
}
.faq-title {
  font-weight: 600;
  color: #800080;
  margin-bottom: 6px;
  font-size: 1.08rem;
}
.faq-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.faq-btn {
  background: #fff;
  color: #800080;
  border: 1px solid #e6e6fa;
  border-radius: 8px;
  padding: 6px 10px;
  margin-bottom: 5px;
  width: 100%;
  text-align: left;
  font-size: 0.98rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.faq-btn:hover {
  background: #e6e6fa;
  color: #198754;
}
/* Posição original: canto inferior direito */
.chat-assistente-fixed {
  position: fixed;
  bottom: 18px;
  right: 18px;
  width: 320px;
  max-width: 95vw;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(60,60,60,0.18);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: inherit;
}
.chat-header {
  background: linear-gradient(90deg, #800080 60%, #198754 100%);
  color: #fff;
  font-weight: 600;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}
.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.3rem;
  cursor: pointer;
}
.chat-body {
  flex: 1;
  padding: 12px 10px;
  background: #f8f8fa;
  overflow-y: auto;
  max-height: 260px;
}
.msg {
  margin-bottom: 8px;
  display: flex;
}
.msg-bot-avatar {
  display: inline-flex;
  vertical-align: middle;
  margin-right: 6px;
  margin-bottom: -4px;
}
.msg-text {
  display: inline-block;
  vertical-align: middle;
}
.msg.bot .msg-text {
  background: #e6e6fa;
  color: #800080;
  border: 1.5px solid #d1c4e9;
  box-shadow: 0 2px 8px rgba(128,0,128,0.07);
  align-self: flex-start;
  padding: 7px 13px;
  border-radius: 14px;
  font-size: 1rem;
  max-width: 80%;
  word-break: break-word;
  margin-bottom: 2px;
}
.msg.user .msg-text {
  background: #d1e7dd;
  color: #198754;
  border: 1.5px solid #b7e4c7;
  align-self: flex-end;
  padding: 7px 13px;
  border-radius: 14px;
  font-size: 1rem;
  max-width: 80%;
  word-break: break-word;
  margin-bottom: 2px;
}
.chat-footer {
  display: flex;
  border-top: 1px solid #eee;
  background: #fff;
  padding: 8px 10px;
}
.chat-footer input {
  flex: 1;
  border: none;
  border-radius: 8px;
  padding: 7px 10px;
  font-size: 1rem;
  outline: none;
  background: #f3f3f7;
  margin-right: 8px;
}
.chat-footer button {
  background: #800080;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 7px 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.chat-footer button:hover {
  background: #198754;
}
/* Botão do chat no canto inferior direito, mesmo tamanho dos SocialIcons */
.chat-fab {
  position: fixed;
  bottom: 18px;
  right: 18px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #800080 60%, #198754 100%);
  color: #fff;
  border: none;
  box-shadow: 0 2px 8px rgba(60,60,60,0.10);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10001;
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
}
.chat-fab:hover {
  background: linear-gradient(135deg, #198754 60%, #800080 100%);
  box-shadow: 0 4px 16px rgba(128,0,128,0.18);
  transform: scale(1.13) rotate(-10deg);
}
@media (max-width: 600px) {
  .chat-assistente-fixed {
    width: 98vw;
    right: 1vw;
    bottom: 70px;
  }
  .chat-fab {
    right: 12px;
    bottom: 70px;
  }
}

/* FAQ suspenso */
.faq-menu-wrapper {
  position: relative;
  margin-bottom: 10px;
}
.faq-toggle-btn {
  width: 100%;
  background: #fff;
  color: #800080;
  border: 1.5px solid #e6e6fa;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 1.08rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  margin-bottom: 0;
  transition: background 0.15s, color 0.15s;
}
.faq-toggle-btn:hover {
  background: #e6e6fa;
  color: #198754;
}
.faq-menu {
  position: absolute;
  top: 110%;
  left: 0;
  width: 100%;
  background: #f3f3f7;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(128,0,128,0.13);
  z-index: 10;
  padding: 10px 8px 8px 8px;
}
.faq-fade-enter-active, .faq-fade-leave-active {
  transition: opacity 0.18s;
}
.faq-fade-enter-from, .faq-fade-leave-to {
  opacity: 0;
}

/* Botão de scroll para o fim do chat */
.scroll-to-bottom-btn {
  position: absolute;
  right: 12px;
  bottom: 18px;
  background: #fff;
  border: 2px solid #800080;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(128,0,128,0.10);
  cursor: pointer;
  z-index: 20;
  transition: background 0.18s, border 0.18s;
}
.scroll-to-bottom-btn:hover {
  background: #e6e6fa;
  border-color: #198754;
}
</style>
