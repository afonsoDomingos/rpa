<template>
  <div class="chat-assistente-fixed" v-show="open">
    <div class="chat-header" @click="toggle">
      <span class="chat-avatar">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#fff" />
          <ellipse cx="16" cy="19" rx="10" ry="7" fill="#e6e6fa" />
          <ellipse cx="16" cy="13" rx="7" ry="7" fill="#800080" />
          <ellipse cx="13.5" cy="12.5" rx="1.2" ry="1.5" fill="#fff" />
          <ellipse cx="18.5" cy="12.5" rx="1.2" ry="1.5" fill="#fff" />
          <rect x="13" y="16" width="6" height="2" rx="1" fill="#fff" />
        </svg>
      </span>
      <span class="chat-title">Rpa.Ai</span>

      <!-- BOTÃO NOVO CHAT (só esta linha nova + o botão de fechar) -->
      <!-- BOTÃO NOVO CHAT + FECHAR -->
      <div class="header-right">
        <button
          @click.stop="abrirModalNovoChat"
          class="new-chat-btn"
          title="Começar novo chat novo"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span class="new-chat-text">Novo</span>
        </button>
        <button class="close-btn" @click.stop="toggle">×</button>
      </div>
    </div>

    <div class="chat-desc">Assistente Virtual</div>

    <div class="chat-body" ref="chatMessagesRef" @scroll="handleScroll">
      <!-- Menu suspenso de perguntas -->
      <div class="faq-menu-wrapper">
        <button
          class="faq-toggle-btn"
          @click="faqOpen = !faqOpen"
          :aria-expanded="faqOpen.toString()"
          aria-controls="faqMenuList"
        >
          <span>❓ Perguntas Frequentes</span>
          <svg v-if="!faqOpen" width="18" height="18" viewBox="0 0 20 20">
            <path
              d="M5 8l5 5 5-5"
              stroke="#800080"
              stroke-width="2"
              fill="none"
            />
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 20 20">
            <path
              d="M15 12l-5-5-5 5"
              stroke="#800080"
              stroke-width="2"
              fill="none"
            />
          </svg>
        </button>
        <transition name="faq-fade">
          <div v-show="faqOpen" class="faq-menu" id="faqMenuList" role="menu">
            <ul class="faq-list">
              <li v-for="p in predefinidas" :key="p.id">
                <button
                  class="faq-btn"
                  :class="{ 'faq-btn-highlight': p.id === 3 }"
                  @click="responderFaq(p.id)"
                  role="menuitem"
                >
                  {{ p.pergunta }}
                </button>
              </li>
            </ul>
          </div>
        </transition>
      </div>

      <!-- Status de gravação -->
      <div v-if="isRecording" class="recording-status">
        <div class="recording-indicator">
          <div class="recording-dot"></div>
          <span>Escutando... {{ recordingTime }}s</span>
        </div>
        <span class="recording-tip">Fale agora</span>
      </div>

      <!-- Status de processamento -->
      <div v-if="isProcessingAudio" class="processing-status">
        <div class="processing-indicator">
          <div class="spinner"></div>
          <span>Processando áudio...</span>
        </div>
      </div>

      <div class="chat-messages">
        <div
          v-for="(msg, i) in messages"
          :key="'msg-' + i"
          :class="['msg', msg.from]"
        >
          <span v-if="msg.from === 'bot'" class="msg-bot-avatar">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#fff" />
              <ellipse cx="16" cy="19" rx="10" ry="7" fill="#e6e6fa" />
              <ellipse cx="16" cy="13" rx="7" ry="7" fill="#800080" />
              <ellipse cx="13.5" cy="12.5" rx="1.2" ry="1.5" fill="#fff" />
              <ellipse cx="18.5" cy="12.5" rx="1.2" ry="1.5" fill="#fff" />
              <rect x="13" y="16" width="6" height="2" rx="1" fill="#fff" />
            </svg>
          </span>
          <span
            class="msg-text"
            v-if="msg.from === 'bot'"
            v-html="msg.text"
          ></span>
          <span class="msg-text" v-else>{{ msg.text }}</span>
        </div>
        <button
          v-show="showScrollBtn"
          class="scroll-to-bottom-btn"
          @click="scrollToBottom"
          aria-label="Rolar para o fim do chat"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M19 12l-7 7-7-7"
              stroke="#800080"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <form class="chat-footer" @submit.prevent="send">
      <input
        v-model="input"
        type="text"
        placeholder="Digite ou fale sua mensagem..."
        autocomplete="off"
      />

      <!-- Botão de microfone -->
      <button
        type="button"
        class="mic-btn"
        :class="{ recording: isRecording, disabled: !micSupported }"
        @click="toggleRecording"
        :disabled="!micSupported || isProcessingAudio || isRecording"
        :title="
          micSupported
            ? isRecording
              ? 'Escutando...'
              : 'Clique para falar'
            : 'Microfone não suportado'
        "
        style="
          padding: 1.5px 4px;
          font-size: 9px;
          border-radius: 12px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
        "
      >
        <svg
          v-if="!isRecording"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 1a4 4 0 0 0-4 4v6a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z"
            fill="#333"
          />
          <path
            d="M19 11v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8"
            stroke="#333"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg v-else width="10" height="10" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" fill="#333">
            <animate
              attributeName="r"
              values="3;6;3"
              dur="1s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0.3;1"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </button>

      <button
        type="submit"
        style="
          padding: 1.5px 6px;
          font-size: 9px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: #333;
        "
      >
        Enviar
      </button>
    </form>
  </div>

  <button
    v-show="!open && !props.hideFabWhenScrolled"
    class="chat-fab"
    @click="toggle"
    aria-label="Falar com Assistent"
  >
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"
        fill="#fff"
      />
      <path
        d="M7 10h10M7 14h7"
        stroke="#800080"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  </button>

  <!-- Modal bonito de confirmação -->
  <div
    v-if="modalNovoChat"
    class="modal-overlay"
    @click="modalNovoChat = false"
  >
    <div class="modal-novo-chat" @click.stop>
      <button class="modal-close" @click="modalNovoChat = false">×</button>
      <div class="modal-icon">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#800080"
          stroke-width="2"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
      <h3>Novo chat</h3>
      <p>Todas as mensagens serão apagadas.<br />Deseja continuar?</p>
      <div class="modal-botoes">
        <button @click="confirmarNovoChat" class="btn-sim">Sim, limpar</button>
        <button @click="modalNovoChat = false" class="btn-nao">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import api from "../api";
import { ref, nextTick, onUpdated, onMounted, onUnmounted } from "vue";

const props = defineProps({
  hideFabWhenScrolled: {
    type: Boolean,
    default: false,
  },
});

const open = ref(false);
const input = ref("");
const faqOpen = ref(false);
const chatMessagesRef = ref(null);
const showScrollBtn = ref(false);

// Estados para o microfone
const isRecording = ref(false);
const isProcessingAudio = ref(false);
const micSupported = ref(false);
const recordingTime = ref(0);
let mediaRecorder = null;
let audioChunks = [];
let recordingTimer = null;

// Estados para o fluxo de busca de documentos
const buscandoDocumento = ref(false);
const dadosDocumento = ref({
  nome_completo: "",
  tipo_documento: "",
  numero_documento: "",
  provincia: "",
  etapa: "inicial", // inicial, coletando_nome, coletando_tipo, coletando_numero, coletando_provincia, finalizando
});

const predefinidas = [
  {
    id: 1,
    pergunta: "🔐 1. Como criar uma conta na Rpa?",
    resposta:
      'Para criar uma conta, preencha seu nome, e-mail e senha.<br>Depois é só fazer login e começar a usar a plataforma normalmente.<br><a href="/" style="color:#800080;text-decoration:underline;">Clique aqui para fazer login</a>.',
  },
  {
    id: 2,
    pergunta: "🔑 2. Como fazer login na Rpa?",
    resposta:
      'Informe seu e-mail e senha cadastrados.<br>Você será direcionado(a) para a tela principal da plataforma.<br><a href="/" style="color:#800080;text-decoration:underline;">Ir para login</a>.',
  },
  {
    id: 3,
    pergunta: "🔎 3. Perdi um documento. Como faço para recuperar?",
    resposta:
      "Vou te ajudar a procurar seu documento! Primeiro preciso de algumas informações.",
  },
  {
    id: 4,
    pergunta: "📥 4. Como solicitar um documento na Rpa?",
    resposta:
      'Se o documento for encontrado, clique em "Solicitar".<br>Será necessário ter uma assinatura ativa (Mensal ou Anual) para prosseguir.<br><a href="/assinaturas" style="color:#800080;text-decoration:underline;">Clique aqui para ver planos de assinatura</a> (opcional).',
  },
  {
    id: 5,
    pergunta: "💳 5. Como pagar uma assinatura na Rpa?",
    resposta:
      "Escolha um dos planos disponíveis:\n– 📅 Mensal: 150 MZN\n– 📆 Anual: 650 MZN\nApós o pagamento, sua assinatura será ativada imediatamente.",
  },
  {
    id: 6,
    pergunta: "📢 6. Como reportar um documento na Rpa?",
    resposta:
      'Se não encontrar o documento, vá à aba "Reportar".\nPreencha os dados do documento perdido e envie.\nVocê será notificado se alguém encontrá-lo.',
  },
  {
    id: 7,
    pergunta: "📁 7. Como guardar um documento na Rpa?",
    resposta:
      'Acesse "Guardar Documento", preencha os dados e clique em salvar.\nO documento ficará disponível na sua conta, com opção de gerar PDF.',
  },
  {
    id: 8,
    pergunta: "📄 8. Como gerar um PDF na Rpa?",
    resposta:
      'Após guardar um documento, clique em "Gerar PDF".\nUm arquivo será criado automaticamente com os dados preenchidos.',
  },
  {
    id: 9,
    pergunta: "🔁 9. Como renovar a assinatura na Rpa?",
    resposta:
      'Quando sua assinatura expirar, clique em "Renovar" no painel.\nEscolha o plano desejado e continue acessando todos os recursos.',
  },
  {
    id: 10,
    pergunta: "❓ 10. Como posso receber ajuda na Rpa?",
    resposta:
      'Você pode digitar perguntas como:\n"Assinar", "Reportar documento", "PDF", "Renovar" ou "Guardar".\nOu clique no botão "Ajuda" para ver todas as opções.',
  },
  {
    id: 11,
    pergunta: "🔍 11. Como procurar um documento na Rpa?",
    resposta:
      'Vá até a aba "Procurar", escolha o filtro desejado.<br>Clique em "Buscar" e veja se há algum resultado disponível, 🔍 Ou digite "QUERO PROCURAR MEU DOCUMENTO" no chat para iniciar a busca de forma automatica.',
  },
];

const messages = ref([
  {
    from: "bot",
    text: "Olá! Como posso ajudar?<br>💡 <strong>Dica:</strong> Se perdeu algum documento, só me dizer que eu ajudo a procurar automaticamente!<br><br>🎤 <strong>Novo:</strong> Agora você pode falar comigo usando o microfone!<br><br>Selecione uma pergunta abaixo ou digite/fale sua dúvida.",
  },
]);

// Lista de tipos de documentos
const tipo_documentos = [
  "Bilhete de Identidade",
  "Passaporte",
  "Cartão de Eleitor",
  "Cartão de Estudante",
  "Carta de Condução",
  "Seguro do Veículo",
  "Livrete",
  "Cartão de Identidade Militar",
];

// Lista de províncias
const provincias = [
  "Maputo",
  "Maputo Cidade",
  "Gaza",
  "Inhambane",
  "Sofala",
  "Manica",
  "Tete",
  "Zambézia",
  "Nampula",
  "Niassa",
  "Cabo Delgado",
];

const API_URL = "https://apirpa.onrender.com";
//const API_URL = "http://localhost:5000";

// Inicialização do microfone
onMounted(async () => {
  await checkMicrophoneSupport();
});

onUnmounted(() => {
  if (recordingTimer) {
    clearInterval(recordingTimer);
  }
});

// Verificar suporte ao Web Speech API
async function checkMicrophoneSupport() {
  try {
    // Verificar se Web Speech API está disponível
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      micSupported.value = false;
      return;
    }

    micSupported.value = true;
  } catch (error) {
    console.warn("Web Speech API não disponível:", error);
    micSupported.value = false;
  }
}

// Alternar gravação (usar diretamente Web Speech API)
async function toggleRecording() {
  if (isRecording.value) {
    // Se estiver gravando, não podemos parar manualmente o Web Speech API
    // A API para automaticamente após alguns segundos de silêncio
    return;
  } else {
    await startRecording();
  }
}

// Iniciar gravação usando Web Speech API diretamente
async function startRecording() {
  try {
    isRecording.value = true;
    isProcessingAudio.value = false;
    recordingTime.value = 0;

    // Timer para mostrar tempo
    recordingTimer = setInterval(() => {
      recordingTime.value++;

      // Parar automaticamente após 10 segundos (limite da Web Speech API)
      if (recordingTime.value >= 10) {
        clearInterval(recordingTimer);
        recordingTimer = null;
      }
    }, 1000);

    // Usar Web Speech API diretamente
    const transcription = await speechToText();

    // Processar resultado
    if (transcription && transcription.trim()) {
      input.value = transcription;
      messages.value.push({ from: "user", text: `🎤 ${transcription}` });
      await processMessage(transcription);
    } else {
      typeWriter(
        "❌ Não consegui entender o áudio. Tente falar mais claramente."
      );
    }
  } catch (error) {
    console.error("Erro no reconhecimento de voz:", error);
    typeWriter(`❌ ${error.message}`);
  } finally {
    // Resetar estados
    isRecording.value = false;
    isProcessingAudio.value = false;
    input.value = "";

    if (recordingTimer) {
      clearInterval(recordingTimer);
      recordingTimer = null;
    }
  }
}

// Remover função de parar gravação (não necessária com Web Speech API)
// A Web Speech API para automaticamente após detectar silêncio

// Remover função processAudioFile (não necessária com Web Speech API)
// O processamento é feito diretamente na função speechToText

// Converter fala em texto usando apenas Web Speech API
async function speechToText() {
  return new Promise((resolve, reject) => {
    // Verificar se Web Speech API está disponível
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      reject(new Error("Reconhecimento de fala não suportado neste navegador"));
      return;
    }

    const recognition = new SpeechRecognition();

    // Configurações do reconhecimento
    recognition.lang = "pt-PT"; // Português
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // Quando obter resultado
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };

    // Em caso de erro
    recognition.onerror = (event) => {
      let errorMessage = "Erro no reconhecimento de voz";

      switch (event.error) {
        case "no-speech":
          errorMessage = "Nenhuma fala detectada. Tente falar mais alto";
          break;
        case "audio-capture":
          errorMessage = "Microfone não disponível.";
          break;
        case "not-allowed":
          errorMessage = "Permissão negada. Permita o acesso ao microfone.";
          break;
        case "network":
          errorMessage = "Erro de rede. Verifique sua conexão.";
          break;
      }

      reject(new Error(errorMessage));
    };

    // Quando terminar (sem resultado)
    recognition.onend = () => {
      // Se chegou até aqui sem onresult, significa que não captou nada
    };

    // Iniciar reconhecimento
    try {
      recognition.start();
    } catch (error) {
      reject(new Error("Erro ao iniciar reconhecimento de voz"));
    }
  });
}

// Usar reconhecimento de fala do navegador
async function useBrowserSpeechRecognition() {
  return await speechToText();
}

function toggle() {
  open.value = !open.value;
}

// Função para detectar se o usuário quer buscar documento perdido
function detectarBuscaDocumento(mensagem) {
  const palavrasChave = [
    "quero procurar meu documento",
    "como ver se meu documento esta disponivel?",
    "perdi meu bi",
    "procura meu documento",
    "perdi meu documento",
    "Podes me ajudar a procurar meu documento?",
    "como pesquisar meu documento?",
  ];

  const mensagemLower = mensagem.toLowerCase();
  return palavrasChave.some((palavra) => mensagemLower.includes(palavra));
}

// Processar mensagem (texto ou voz)
async function processMessage(userMsg) {
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

const modalNovoChat = ref(false);

function abrirModalNovoChat() {
  modalNovoChat.value = true;
}

function confirmarNovoChat() {
  messages.value = [
    {
      from: "bot",
      text: "Olá! Como posso ajudar?<br>Tip: Se perdeu algum documento, só me dizer que eu ajudo a procurar automaticamente!<br><br>New: Agora você pode falar comigo usando o microfone!<br><br>Selecione uma pergunta abaixo ou digite/fale sua dúvida.",
    },
  ];
  resetarFluxoDocumento();
  modalNovoChat.value = false;
  nextTick(() => scrollToBottom());
}

// Função para processar o fluxo de coleta de dados do documento
async function processarFluxoDocumento(mensagem) {
  const etapa = dadosDocumento.value.etapa;

  switch (etapa) {
    case "inicial":
      dadosDocumento.value.etapa = "coletando_nome";
      typeWriter(
        "📋 Entendi! Vou te ajudar a procurar seu documento.<br><br>Primeiro, me diga: <strong>qual é o nome completo que está no documento?</strong>"
      );
      break;

    case "coletando_nome":
      if (mensagem.trim().length < 3) {
        typeWriter(
          "❌ Por favor, digite um nome válido com pelo menos 3 caracteres."
        );
        return;
      }
      dadosDocumento.value.nome_completo = mensagem.trim();
      dadosDocumento.value.etapa = "coletando_tipo";

      let opcoesDocumentos =
        "<strong>Que tipo de documento você perdeu?</strong><br><br>";
      tipo_documentos.forEach((tipo, index) => {
        opcoesDocumentos += `${index + 1}. ${tipo}<br>`;
      });
      opcoesDocumentos +=
        "<br>💬 Digite o <strong>número</strong> ou o <strong>nome completo</strong> do documento:";

      typeWriter(opcoesDocumentos);
      break;

    case "coletando_tipo":
      let tipoSelecionado = "";

      // Verificar se é um número
      if (/^\d+$/.test(mensagem.trim())) {
        const index = parseInt(mensagem.trim()) - 1;
        if (index >= 0 && index < tipo_documentos.length) {
          tipoSelecionado = tipo_documentos[index];
        }
      } else {
        // Procurar por nome (busca flexível)
        const tipoEncontrado = tipo_documentos.find(
          (tipo) =>
            tipo.toLowerCase().includes(mensagem.trim().toLowerCase()) ||
            mensagem.trim().toLowerCase().includes(tipo.toLowerCase())
        );
        if (tipoEncontrado) {
          tipoSelecionado = tipoEncontrado;
        }
      }

      if (!tipoSelecionado) {
        typeWriter(
          "❌ Tipo de documento não reconhecido. Por favor, escolha um número de 1 a " +
            tipo_documentos.length +
            " ou digite o nome exato."
        );
        return;
      }

      dadosDocumento.value.tipo_documento = tipoSelecionado;
      dadosDocumento.value.etapa = "coletando_numero";

      typeWriter(
        `✅ Documento: <strong>${tipoSelecionado}</strong><br><br>📋 Se souber, me diga o <strong>número do documento</strong>.<br><br>💡 <em>Se não lembrar, pode digitar "não sei" ou "pular"</em>`
      );
      break;

    case "coletando_numero":
      const mensagemNumero = mensagem.trim().toLowerCase();

      if (
        mensagemNumero === "não sei" ||
        mensagemNumero === "nao sei" ||
        mensagemNumero === "pular"
      ) {
        dadosDocumento.value.numero_documento = "";
      } else {
        dadosDocumento.value.numero_documento = mensagem.trim();
      }

      dadosDocumento.value.etapa = "coletando_provincia";

      let opcoesProvincias =
        "<strong>Em que província você perdeu o documento?</strong><br><br>";
      provincias.forEach((provincia, index) => {
        opcoesProvincias += `${index + 1}. ${provincia}<br>`;
      });
      opcoesProvincias +=
        "<br>💬 Digite o <strong>número</strong> ou o <strong>nome da província</strong>:";

      typeWriter(opcoesProvincias);
      break;

    case "coletando_provincia":
      let provinciaSelecionada = "";

      // Verificar se é um número
      if (/^\d+$/.test(mensagem.trim())) {
        const index = parseInt(mensagem.trim()) - 1;
        if (index >= 0 && index < provincias.length) {
          provinciaSelecionada = provincias[index];
        }
      } else {
        // Procurar por nome
        const provinciaEncontrada = provincias.find(
          (provincia) =>
            provincia.toLowerCase().includes(mensagem.trim().toLowerCase()) ||
            mensagem.trim().toLowerCase().includes(provincia.toLowerCase())
        );
        if (provinciaEncontrada) {
          provinciaSelecionada = provinciaEncontrada;
        }
      }

      if (!provinciaSelecionada) {
        typeWriter(
          "❌ Província não reconhecida. Por favor, escolha um número de 1 a " +
            provincias.length +
            " ou digite o nome exato."
        );
        return;
      }

      dadosDocumento.value.provincia = provinciaSelecionada;
      dadosDocumento.value.etapa = "finalizando";

      // Realizar a busca
      await realizarBuscaDocumento();
      break;
  }
}

// Função para buscar o documento na base de dados
async function realizarBuscaDocumento() {
  typeWriter(
    "🔍 Buscando seu documento na nossa base de dados...<br><br>⏳ <em>Por favor aguarde...</em>"
  );

  try {
    // Montar parâmetros para a busca
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

    // Log da pesquisa para o admin
    const termoLog = dadosDocumento.value.nome_completo || dadosDocumento.value.numero_documento || "Pesquisa via Chat";
    api.post('/documentos/pesquisas', {
      termo: termoLog,
      filtro: "assistente",
      data: new Date().toISOString()
    }).catch(err => console.error("Erro ao salvar log do assistente:", err));

    // Fazer a consulta na API existente
    const response = await api.get("/documentos", { params });
    const documentosEncontrados = response.data;

    // Exibir resultados
    await exibirResultadosBusca(documentosEncontrados);
  } catch (error) {
    console.error("Erro ao buscar documentos:", error);
    typeWriter(
      'Ola! não encontramos o documento que esta a procura na nossa base de dados. Tente novamente mais tarde ou use a busca manual na aba "Procurar".'
    );
    resetarFluxoDocumento();
  }
}

// Função para exibir os resultados da busca
async function exibirResultadosBusca(documentos) {
  if (documentos.length === 0) {
    const nomeUsuario = dadosDocumento.value.nome_completo.split(" ")[0];

    typeWriter(
      `❌ <strong>Documento não encontrado</strong><br><br>Olá ${nomeUsuario}, infelizmente não encontrei seu documento na nossa base de dados.<br><br>🤔 <strong>Mas não desanime!</strong><br><br>📋 <strong>O que você pode fazer:</strong><br>1️⃣ Cadastre seu documento na aba <strong>"Reportar"</strong><br>2️⃣ Assim, se alguém encontrá-lo, você será notificado!<br><br>💡 <em>Muitas pessoas encontram seus documentos alguns dias depois de cadastrá-los na plataforma.</em><br><br>Quer que eu te redirecione para o cadastro?`
    );
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
    nome_completo: "",
    tipo_documento: "",
    numero_documento: "",
    provincia: "",
    etapa: "inicial",
  };
}

async function send() {
  if (!input.value.trim()) return;

  const userMsg = input.value.trim();
  messages.value.push({ from: "user", text: userMsg });
  nextTick(() => scrollToBottom());

  input.value = "";
  await processMessage(userMsg);
}

function responderFaq(id) {
  const pergunta = predefinidas.find((p) => p.id === id);
  if (pergunta) {
    messages.value.push({ from: "user", text: pergunta.pergunta });

    // Se for a pergunta sobre documento perdido, iniciar fluxo
    if (id === 3) {
      buscandoDocumento.value = true;
      processarFluxoDocumento("perdi meu documento");
    } else {
      typeWriter(pergunta.resposta);
    }
  }
  faqOpen.value = false;
}

// Efeito digitação gradual
function typeWriter(text, callback) {
  let i = 0;
  const speed = 20; // Aumentar um pouco a velocidade se necessário
  let current = "";

  function type() {
    if (i < text.length) {
      current += text[i++];
      if (
        messages.value.length === 0 ||
        messages.value[messages.value.length - 1].from !== "bot"
      ) {
        messages.value.push({ from: "bot", text: current });
      } else {
        messages.value[messages.value.length - 1].text = current;
      }
      scrollToBottom("auto"); // Scroll instantâneo durante a digitação
      setTimeout(type, speed);
    } else {
      // Garante scroll final suave
      scrollToBottom("smooth");
      if (callback) {
        callback();
      }
    }
  }

  type();
}

function handleScroll() {
  const el = chatMessagesRef.value;
  if (!el) return;
  // Mostra botão se não estiver no fim (tolerância de 50px)
  const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
  showScrollBtn.value = !isAtBottom;
}

function scrollToBottom(behavior = "auto") {
  const el = chatMessagesRef.value;
  if (el) {
    nextTick(() => {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: behavior,
      });
    });
  }
}

onMounted(() => {
  const avatar = document.querySelector(".chat-avatar svg");
  const olhoEsq = avatar.querySelector("ellipse:nth-child(4)");
  const olhoDir = avatar.querySelector("ellipse:nth-child(5)");

  let mouseX = 0;
  let mouseY = 0;
  let olhoX = 13.5;
  let olhoY = 12.5;
  let olhoXDir = 18.5;
  let olhoYDir = 12.5;

  const limite = 2; // máximo de movimento dos olhos (em px)

  function atualizarMouse(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  function animarOlhos() {
    const rect = avatar.getBoundingClientRect();
    const centroX = rect.left + rect.width / 2;
    const centroY = rect.top + rect.height / 2;

    // deslocamento proporcional
    let offsetX = (mouseX - centroX) / 30;
    let offsetY = (mouseY - centroY) / 30;

    // limitar deslocamento
    offsetX = Math.max(-limite, Math.min(limite, offsetX));
    offsetY = Math.max(-limite, Math.min(limite, offsetY));

    // interpolação suave
    olhoX += (13.5 + offsetX - olhoX) * 0.2;
    olhoY += (12.5 + offsetY - olhoY) * 0.2;
    olhoXDir += (18.5 + offsetX - olhoXDir) * 0.2;
    olhoYDir += (12.5 + offsetY - olhoYDir) * 0.2;

    // aplicar posições
    olhoEsq.setAttribute("cx", olhoX);
    olhoEsq.setAttribute("cy", olhoY);
    olhoDir.setAttribute("cx", olhoXDir);
    olhoDir.setAttribute("cy", olhoYDir);

    requestAnimationFrame(animarOlhos);
  }

  window.addEventListener("mousemove", atualizarMouse);
  animarOlhos();

  onUnmounted(() => {
    window.removeEventListener("mousemove", atualizarMouse);
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
  box-shadow: 0 0 4px rgba(128, 0, 128, 0.2);
  outline: none;
}

/* Estilos para gravação */
.recording-status {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.recording-indicator {
  display: flex;
  align-items: center;
  color: #d63031;
  font-weight: 600;
}

.recording-dot {
  width: 8px;
  height: 8px;
  background: #d63031;
  border-radius: 50%;
  margin-right: 8px;
  animation: recording-pulse 1s infinite;
}

.recording-tip {
  color: #856404;
  font-size: 0.9rem;
  font-style: italic;
}

@keyframes recording-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }
}

.processing-status {
  background: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.processing-indicator {
  display: flex;
  align-items: center;
  color: #1976d2;
  font-weight: 600;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e3f2fd;
  border-top: 2px solid #1976d2;
  border-radius: 50%;
  margin-right: 8px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Botão de microfone */
.mic-btn {
  background: #800080;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 10px;
  margin-right: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  min-width: 40px;
  height: 40px;
}

.mic-btn:hover:not(.disabled) {
  background: #198754;
  transform: scale(1.05);
}

.mic-btn.recording {
  background: #d63031;
  animation: recording-pulse 1s infinite;
}

.mic-btn.recording:hover {
  background: #a71e1e;
}

.mic-btn.disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

/* FAQ menu styles */
.faq-menu {
  background: #f3f3f7;
  border-radius: 10px;
  padding: 10px 8px 8px 8px;
  margin-bottom: 10px;
  box-shadow: 0 1px 4px rgba(128, 0, 128, 0.06);
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

.faq-btn-highlight {
  background: linear-gradient(90deg, #e8f5e9, #ffffff) !important;
  border: 1.5px solid #198754 !important;
  color: #155724 !important;
  font-weight: 700 !important;
  box-shadow: 0 4px 12px rgba(25, 135, 84, 0.2);
  transform: scale(1.02);
  margin-top: 5px;
  margin-bottom: 10px;
  position: relative;
  overflow: hidden;
}

.faq-btn-highlight::after {
  content: "✨ Recomendado";
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  background: #198754;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  opacity: 0.9;
}

.faq-btn-highlight:hover {
  transform: scale(1.04);
  box-shadow: 0 6px 16px rgba(25, 135, 84, 0.3);
}

/* Posição original: canto inferior direito */
.chat-assistente-fixed {
  position: fixed;
  bottom: 4px;
  right: 4px;

  width: auto;
  /* pode aumentar um pouco também */
  max-width: 500px;

  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(60, 60, 60, 0.18);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: inherit;

  /* Altura máxima do chat inteiro */
  max-height: 80vh;
  /* antes não tinha limite */
  /* ou: max-height: 720px; */
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

.chat-desc {
  background: #f8f8fa;
  color: #666;
  padding: 8px 16px;
  font-size: 0.9rem;
  border-bottom: 1px solid #eee;
}

.chat-body {
  flex: 1;
  padding: 12px 10px;
  background: #f8f8fa;
  overflow-y: auto;
  /* Altura antiga */
  /*  max-height: 280px; */

  /* Nova altura – escolha uma das opções abaixo */

  /* Opção 1: Altura fixa maior (ex: 500px) */
  max-height: 500px;

  /* Opção 2: Aproveita quase toda a tela (recomendado para mobile) */
  /* cmax-height: calc(90vh - 180px); */

  /* Opção 3: Ainda mais alto (quase tela cheia) */
  /* max-height: calc(100vh - 200px); */
}

.chat-messages {
  position: relative;
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
  box-shadow: 0 2px 8px rgba(128, 0, 128, 0.07);
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
  align-items: center;
}

.chat-footer input {
  flex: 1;
  border: none;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 1rem;
  outline: none;
  background: #f3f3f7;
  margin-right: 8px;
  height: 40px;
  box-sizing: border-box;
}

.chat-footer button[type="submit"] {
  background: #800080;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  height: 40px;
}

.chat-footer button[type="submit"]:hover {
  background: #198754;
}

/* Botão do chat no canto inferior direito */
.chat-fab {
  position: fixed;
  bottom: 16px;
  right: 18px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #800080 60%, #198754 100%);
  color: #fff;
  border: none;
  box-shadow: 0 4px 16px rgba(60, 60, 60, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10001;
  transition: all 0.2s;
}

.chat-fab:hover {
  background: linear-gradient(135deg, #198754 60%, #800080 100%);
  box-shadow: 0 6px 20px rgba(128, 0, 128, 0.25);
  transform: scale(1.1) rotate(-10deg);
}

@media (max-width: 600px) {
  .chat-assistente-fixed {
    width: 98vw;
    right: 1vw;
    bottom: 1px;
    height: calc(100dvh - 16px);
  }

  .chat-fab {
    right: 14px;
    bottom: 30px;
    width: 36px;
    height: 36px;
    /*right: 12px;
    bottom: 70px;
    width: 56px;
    height: 56px;*/
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
  box-shadow: 0 4px 16px rgba(128, 0, 128, 0.13);
  z-index: 10;
  padding: 10px 8px 8px 8px;
}

.faq-fade-enter-active,
.faq-fade-leave-active {
  transition: opacity 0.18s;
}

.faq-fade-enter-from,
.faq-fade-leave-to {
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
  box-shadow: 0 2px 8px rgba(128, 0, 128, 0.1);
  cursor: pointer;
  z-index: 20;
  transition: background 0.18s, border 0.18s;
}

.scroll-to-bottom-btn:hover {
  background: #e6e6fa;
  border-color: #198754;
}

/* Botão "Novo Chat" com texto visível */
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.new-chat-btn:hover {
  background: rgba(255, 255, 255, 0.32);
  transform: translateY(-1px);
}

/* Em telemóveis esconde só o texto, mantém o + */
@media (max-width: 480px) {
  .new-chat-text {
    display: none;
  }

  .new-chat-btn {
    padding: 8px;
  }
}

/* Modal bonito de novo chat */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20000;
}

.modal-novo-chat {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(128, 0, 128, 0.3);
  max-width: 320px;
  animation: modalShow 0.3s ease;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
}

.modal-icon {
  margin-bottom: 16px;
}

.modal-novo-chat h3 {
  margin: 0 0 12px 0;
  color: #800080;
  font-size: 1.4rem;
}

.modal-novo-chat p {
  color: #555;
  margin-bottom: 24px;
  line-height: 1.4;
}

.modal-botoes {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-sim {
  background: linear-gradient(90deg, #800080, #198754);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.btn-nao {
  background: #f0f0f0;
  color: #555;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
}

@keyframes modalShow {
  from {
    transform: scale(0.8);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
