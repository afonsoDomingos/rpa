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
import axios from 'axios';
import api from "../api"; // Sua instância da API existente
import { ref, nextTick, onUpdated } from 'vue';

const open = ref(false);
const input = ref("");
const faqOpen = ref(false);
const chatMessagesRef = ref(null);
const showScrollBtn = ref(false);

// Estados para o fluxo de busca de documentos
const buscandoDocumento = ref(false);
const dadosDocumento = ref({
  nome_completo: '',
  tipo_documento: '',
  numero_documento: '',
  provincia: '',
  etapa: 'inicial' // inicial, coletando_nome, coletando_tipo, coletando_numero, coletando_provincia, finalizando
});

const predefinidas = [
  { id: 1, pergunta: '🔐 1. Como criar uma conta?', resposta: 'Para criar uma conta, preencha seu nome, e-mail e senha.<br>Depois é só fazer login e começar a usar a plataforma normalmente.<br><a href="/" style="color:#800080;text-decoration:underline;">Clique aqui para fazer login</a>.' },
  { id: 2, pergunta: '🔑 2. Como fazer login?', resposta: 'Informe seu e-mail e senha cadastrados.<br>Você será direcionado(a) para a tela principal da plataforma.<br><a href="/" style="color:#800080;text-decoration:underline;">Ir para login</a>.' },
  { id: 3, pergunta: '🔍 3. Como procurar um documento?', resposta: 'Vá até a aba "Procurar", escolha o filtro desejado.<br>Clique em "Buscar" e veja se há algum resultado disponível.' },
  { id: 4, pergunta: '📥 4. Como solicitar um documento?', resposta: 'Se o documento for encontrado, clique em "Solicitar".<br>Será necessário ter uma assinatura ativa (Mensal ou Anual) para prosseguir.<br><a href="/assinaturas" style="color:#800080;text-decoration:underline;">Clique aqui para ver planos de assinatura</a> (opcional).' },
  { id: 5, pergunta: '💳 5. Como fazer uma assinatura?', resposta: 'Escolha um dos planos disponíveis:\n– 📅 Mensal: 150 MZN\n– 📆 Anual: 650 MZN\nApós o pagamento, sua assinatura será ativada imediatamente.' },
  { id: 6, pergunta: '📢 6. Como reportar um documento?', resposta: 'Se não encontrar o documento, vá à aba "Reportar".\nPreencha os dados do documento perdido e envie.\nVocê será notificado se alguém encontrá-lo.' },
  { id: 7, pergunta: '📁 7. Como guardar um documento?', resposta: 'Acesse "Guardar Documento", preencha os dados e clique em salvar.\nO documento ficará disponível na sua conta, com opção de gerar PDF.' },
  { id: 8, pergunta: '📄 8. Como gerar um PDF?', resposta: 'Após guardar um documento, clique em "Gerar PDF".\nUm arquivo será criado automaticamente com os dados preenchidos.' },
  { id: 9, pergunta: '🔁 9. Como renovar a assinatura?', resposta: 'Quando sua assinatura expirar, clique em "Renovar" no painel.\nEscolha o plano desejado e continue acessando todos os recursos.' },
  { id: 10, pergunta: '❓ 10. Como posso receber ajuda?', resposta: 'Você pode digitar perguntas como:\n"Assinar", "Reportar documento", "PDF", "Renovar" ou "Guardar".\nOu clique no botão "Ajuda" para ver todas as opções.' },
  { id: 11, pergunta: '🔎 11. Perdi meu documento', resposta: 'Vou te ajudar a procurar seu documento! Primeiro preciso de algumas informações.' }
];

const messages = ref([
  { from: 'bot', text: 'Olá! Como posso ajudar você?<br>💡 <strong>Dica:</strong> Se perdeu algum documento, só me dizer que eu ajudo a procurar automaticamente!<br><br>Selecione uma pergunta abaixo ou digite sua dúvida.' }
]);

// Lista de tipos de documentos (mesma da sua aplicação)
const tipo_documentos = [
  "Bilhete de Identidade", "Passaporte", "Cartão de Eleitor",
  "Cartão de Estudante", "Carta de Condução", "Seguro do Veículo",
  "Livrete", "Cartão de Identidade Militar"
];

// Lista de províncias (mesma da sua aplicação)
const provincias = [
  "Maputo", "Maputo Cidade", "Gaza", "Inhambane", "Sofala",
  "Manica", "Tete", "Zambézia", "Nampula", "Niassa", "Cabo Delgado"
];

function toggle() {
  open.value = !open.value;
}

const API_URL = "https://apirpa.onrender.com";

// Função para detectar se o usuário quer buscar documento perdido
function detectarBuscaDocumento(mensagem) {
  const palavrasChave = [
    'perdi', 'perdeu', 'perder', 'documento perdido', 'documento',
    'bi perdido', 'passaporte perdido', 'carta perdida', 'perda',
    'encontrar documento', 'procurar documento', 'buscar documento',
    'bilhete de identidade', 'passaporte', 'carta de condução'
  ];
  
  const mensagemLower = mensagem.toLowerCase();
  return palavrasChave.some(palavra => mensagemLower.includes(palavra));
}

// Função para processar o fluxo de coleta de dados do documento
async function processarFluxoDocumento(mensagem) {
  const etapa = dadosDocumento.value.etapa;
  
  switch (etapa) {
    case 'inicial':
      dadosDocumento.value.etapa = 'coletando_nome';
      typeWriter('📋 Entendi! Vou te ajudar a procurar seu documento.<br><br>Primeiro, me diga: <strong>qual é o nome completo que está no documento?</strong>');
      break;
      
    case 'coletando_nome':
      if (mensagem.trim().length < 3) {
        typeWriter('❌ Por favor, digite um nome válido com pelo menos 3 caracteres.');
        return;
      }
      dadosDocumento.value.nome_completo = mensagem.trim();
      dadosDocumento.value.etapa = 'coletando_tipo';
      
      let opcoesDocumentos = '<strong>Que tipo de documento você perdeu?</strong><br><br>';
      tipo_documentos.forEach((tipo, index) => {
        opcoesDocumentos += `${index + 1}. ${tipo}<br>`;
      });
      opcoesDocumentos += '<br>💬 Digite o <strong>número</strong> ou o <strong>nome completo</strong> do documento:';
      
      typeWriter(opcoesDocumentos);
      break;
      
    case 'coletando_tipo':
      let tipoSelecionado = '';
      
      // Verificar se é um número
      if (/^\d+$/.test(mensagem.trim())) {
        const index = parseInt(mensagem.trim()) - 1;
        if (index >= 0 && index < tipo_documentos.length) {
          tipoSelecionado = tipo_documentos[index];
        }
      } else {
        // Procurar por nome (busca flexível)
        const tipoEncontrado = tipo_documentos.find(tipo => 
          tipo.toLowerCase().includes(mensagem.trim().toLowerCase()) ||
          mensagem.trim().toLowerCase().includes(tipo.toLowerCase())
        );
        if (tipoEncontrado) {
          tipoSelecionado = tipoEncontrado;
        }
      }
      
      if (!tipoSelecionado) {
        typeWriter('❌ Tipo de documento não reconhecido. Por favor, escolha um número de 1 a ' + tipo_documentos.length + ' ou digite o nome exato.');
        return;
      }
      
      dadosDocumento.value.tipo_documento = tipoSelecionado;
      dadosDocumento.value.etapa = 'coletando_numero';
      
      typeWriter(`✅ Documento: <strong>${tipoSelecionado}</strong><br><br>📋 Se souber, me diga o <strong>número do documento</strong>.<br><br>💡 <em>Se não lembrar, pode digitar "não sei" ou "pular"</em>`);
      break;
      
    case 'coletando_numero':
      const mensagemNumero = mensagem.trim().toLowerCase();
      
      if (mensagemNumero === 'não sei' || mensagemNumero === 'nao sei' || mensagemNumero === 'pular') {
        dadosDocumento.value.numero_documento = '';
      } else {
        dadosDocumento.value.numero_documento = mensagem.trim();
      }
      
      dadosDocumento.value.etapa = 'coletando_provincia';
      
      let opcoesProvincias = '<strong>Em que província você perdeu o documento?</strong><br><br>';
      provincias.forEach((provincia, index) => {
        opcoesProvincias += `${index + 1}. ${provincia}<br>`;
      });
      opcoesProvincias += '<br>💬 Digite o <strong>número</strong> ou o <strong>nome da província</strong>:';
      
      typeWriter(opcoesProvincias);
      break;
      
    case 'coletando_provincia':
      let provinciaSelecionada = '';
      
      // Verificar se é um número
      if (/^\d+$/.test(mensagem.trim())) {
        const index = parseInt(mensagem.trim()) - 1;
        if (index >= 0 && index < provincias.length) {
          provinciaSelecionada = provincias[index];
        }
      } else {
        // Procurar por nome
        const provinciaEncontrada = provincias.find(provincia => 
          provincia.toLowerCase().includes(mensagem.trim().toLowerCase()) ||
          mensagem.trim().toLowerCase().includes(provincia.toLowerCase())
        );
        if (provinciaEncontrada) {
          provinciaSelecionada = provinciaEncontrada;
        }
      }
      
      if (!provinciaSelecionada) {
        typeWriter('❌ Província não reconhecida. Por favor, escolha um número de 1 a ' + provincias.length + ' ou digite o nome exato.');
        return;
      }
      
      dadosDocumento.value.provincia = provinciaSelecionada;
      dadosDocumento.value.etapa = 'finalizando';
      
      // Realizar a busca
      await realizarBuscaDocumento();
      break;
  }
}

// Função para buscar o documento na base de dados
async function realizarBuscaDocumento() {
  typeWriter('🔍 Buscando seu documento na nossa base de dados...<br><br>⏳ <em>Por favor aguarde...</em>');
  
  try {
    // Montar parâmetros para a busca (usando a mesma lógica da sua aplicação)
    let params = {};
    
    if (dadosDocumento.value.nome_completo) {
      params.nome_completo = dadosDocumento.value.nome_completo;
    }
    if (dadosDocumento.value.tipo_documento) {
      params.tipo_documento = dadosDocumento.value.tipo_documento;
    }
    if (dadosDocumento.value.numero_documento) {
      params.numero_documento = dadosDocumento.value.numero_documento;
    }
    if (dadosDocumento.value.provincia) {
      params.provincia = dadosDocumento.value.provincia;
    }
    
    // Fazer a consulta na sua API existente
    const response = await api.get('/documentos', { params });
    const documentosEncontrados = response.data;
    
    // Exibir resultados
    await exibirResultadosBusca(documentosEncontrados);
    
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    typeWriter('❌ Ocorreu um erro ao buscar o documento. Tente novamente mais tarde ou use a busca manual na aba "Procurar".');
    resetarFluxoDocumento();
  }
}

// Função para exibir os resultados da busca
async function exibirResultadosBusca(documentos) {
  if (documentos.length === 0) {
    const nomeUsuario = dadosDocumento.value.nome_completo.split(' ')[0];
    
    typeWriter(`❌ <strong>Documento não encontrado</strong><br><br>Olá ${nomeUsuario}, infelizmente não encontrei seu documento na nossa base de dados.<br><br>🤔 <strong>Mas não desanime!</strong><br><br>📋 <strong>O que você pode fazer:</strong><br>1️⃣ Cadastre seu documento na aba <strong>"Reportar"</strong><br>2️⃣ Assim, se alguém encontrá-lo, você será notificado!<br><br>💡 <em>Muitas pessoas encontram seus documentos alguns dias depois de cadastrá-los na plataforma.</em><br><br>Quer que eu te redirecione para o cadastro?`);
  } else {
    let resultadoTexto = `🎉 <strong>Ótimas notícias!</strong><br><br>Encontrei <strong>${documentos.length} documento(s)</strong> que pode(m) ser o seu:<br><br>`;
    
    documentos.forEach((doc, index) => {
      resultadoTexto += `📄 <strong>Resultado ${index + 1}:</strong><br>`;
      resultadoTexto += `👤 Nome: ${doc.nome_completo}<br>`;
      resultadoTexto += `📋 Tipo: ${doc.tipo_documento}<br>`;
      resultadoTexto += `📍 Província: ${doc.provincia}<br>`;
      if (doc.numero_documento) {
        resultadoTexto += `🔢 Número: ${doc.numero_documento}<br>`;
      }
      resultadoTexto += `📅 Data: ${doc.data_perda}<br>`;
      resultadoTexto += `<br>`;
    });
    
    resultadoTexto += `✅ <strong>Próximo passo:</strong><br>Vá até a aba <strong>"Procurar"</strong> para solicitar o documento oficialmente.<br><br>💡 <em>Você precisará de uma assinatura ativa para solicitar.</em><br><br><a href="/assinaturas" style="color:#800080;text-decoration:underline;">Ver planos de assinatura</a>`;
    
    typeWriter(resultadoTexto);
  }
  
  resetarFluxoDocumento();
}

// Função para resetar o fluxo de busca de documento
function resetarFluxoDocumento() {
  buscandoDocumento.value = false;
  dadosDocumento.value = {
    nome_completo: '',
    tipo_documento: '',
    numero_documento: '',
    provincia: '',
    etapa: 'inicial'
  };
}

async function send() {
  if (!input.value.trim()) return;

  const userMsg = input.value.trim();
  messages.value.push({ from: 'user', text: userMsg });

  const inputBackup = input.value;
  input.value = "";

  // Verificar se está em fluxo de busca de documento
  if (buscandoDocumento.value) {
    await processarFluxoDocumento(userMsg);
    return;
  }

  // Detectar se o usuário quer buscar documento perdido
  if (detectarBuscaDocumento(userMsg)) {
    buscandoDocumento.value = true;
    await processarFluxoDocumento(userMsg);
    return;
  }

  // Fluxo normal do chatbot
  try {
    const response = await axios.post(`${API_URL}/api/chatbot`, {
      message: userMsg,
    });

    const respostaIA = response.data.reply;
    typeWriter(respostaIA);
  } catch (err) {
    console.error(err);
    typeWriter("Desculpe, não consegui responder agora. Tente mais tarde.");
  }
}

function responderFaq(id) {
  const pergunta = predefinidas.find(p => p.id === id);
  if (pergunta) {
    messages.value.push({ from: 'user', text: pergunta.pergunta });
    
    // Se for a pergunta sobre documento perdido, iniciar fluxo
    if (id === 11) {
      buscandoDocumento.value = true;
      processarFluxoDocumento('perdi meu documento');
    } else {
      typeWriter(pergunta.resposta);
    }
  }
  faqOpen.value = false;
}

// Efeito digitação gradual
function typeWriter(text, callback) {
  let i = 0;
  const speed = 20;
  let current = "";

  function type() {
    if (i < text.length) {
      current += text[i++];
      if (messages.value.length === 0 || messages.value[messages.value.length - 1].from !== 'bot') {
        messages.value.push({ from: 'bot', text: current });
      } else {
        messages.value[messages.value.length - 1].text = current;
      }
      scrollToBottom();
      setTimeout(type, speed);
    } else if (callback) {
      callback();
    }
  }

  type();
}

function handleScroll() {
  const el = chatMessagesRef.value;
  if (!el) return;
  showScrollBtn.value = el.scrollTop + el.clientHeight < el.scrollHeight - 10;
}

function scrollToBottom() {
  const el = chatMessagesRef.value;
  if (el) {
    nextTick(() => {
      el.scrollTop = el.scrollHeight;
      showScrollBtn.value = false;
    });
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
