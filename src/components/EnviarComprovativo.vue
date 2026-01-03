<template>
  <div class="comprovativo-container">
    <div class="comprovativo-header">
      <h3>Enviar Comprovativo de Pagamento</h3>
      <p class="text-muted">Escolha o método de pagamento e envie o seu comprovativo</p>
    </div>

    <!-- Passo 0: Selecionar Tipo de Serviço -->
    <div v-if="step === 0" class="service-selection-section">
      <h4 class="section-title">O que você está pagando?</h4>
      <div class="service-options">
        <div
          v-for="servico in tiposServico"
          :key="servico.id"
          :class="['service-option', { selected: selectedService === servico.id }]"
          @click="selectService(servico)"
        >
          <div class="service-info">
            <i :class="getServiceIcon(servico.id)" class="service-icon"></i>
            <div class="service-details">
              <span class="service-name">{{ servico.nome }}</span>
              <span class="service-price" v-if="servico.valor > 0">{{ servico.valor }} MZN</span>
              <span class="service-price" v-else>Valor variável</span>
            </div>
          </div>
          <i v-if="selectedService === servico.id" class="bi bi-check-circle-fill text-success"></i>
        </div>
      </div>

      <button
        class="btn-continue"
        :disabled="!selectedService"
        @click="step = 1"
      >
        Próximo: Método de Pagamento
        <i class="bi bi-arrow-right ms-2"></i>
      </button>
    </div>

    <!-- Passo 1: Selecionar Método e Ver Números -->
    <div v-if="step === 1" class="payment-methods-section">
      <button class="btn-back" @click="step = 0">
        <i class="bi bi-arrow-left me-2"></i>
        Voltar
      </button>

      <h4 class="section-title mt-3">1. Escolha o Método de Pagamento</h4>
      <p class="text-muted small">Serviço: <strong>{{ getServiceName(selectedService) }}</strong></p>

      <div class="payment-options">
        <div
          v-for="(valor, metodo) in pagamentos"
          :key="metodo"
          :class="['payment-option', { selected: selectedMethod === metodo }]"
          @click="selectMethod(metodo)"
        >
          <div class="option-header">
            <span class="option-icon" v-html="icons[metodo]"></span>
            <span class="option-name">{{ metodo }}</span>
            <i v-if="selectedMethod === metodo" class="bi bi-check-circle-fill text-success"></i>
          </div>
          <div class="option-number">{{ valor }}</div>
          <button
            class="btn-copy-small"
            @click.stop="copiarNumero(valor)"
            :aria-label="`Copiar número ${metodo}`"
          >
            <i class="fa-solid fa-copy"></i>
          </button>
        </div>
      </div>

      <button
        class="btn-continue"
        :disabled="!selectedMethod"
        @click="step = 2"
      >
        Continuar para Upload
        <i class="bi bi-arrow-right ms-2"></i>
      </button>
    </div>

    <!-- Passo 2: Upload do Comprovativo -->
    <div v-if="step === 2" class="upload-section">
      <button class="btn-back" @click="step = 1">
        <i class="bi bi-arrow-left me-2"></i>
        Voltar
      </button>

      <h4 class="section-title mt-3">2. Enviar Comprovativo</h4>
      <div class="selection-summary mb-3 p-2 bg-light rounded shadow-sm">
        <p class="text-muted small mb-1">Serviço: <strong class="text-purple">{{ getServiceName(selectedService) }}</strong></p>
        <p class="text-muted small mb-0">Método: <strong>{{ selectedMethod }}</strong></p>
      </div>

      <!-- Área de Upload -->
      <div
        :class="['upload-area', { 'drag-over': isDragging }]"
        @click="triggerFileInput"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <div v-if="!comprovativoFile" class="upload-placeholder">
          <i class="bi bi-cloud-upload upload-icon"></i>
          <p class="upload-text">Clique ou arraste o comprovativo aqui</p>
          <p class="upload-hint">PNG, JPG, JPEG ou PDF (máx. 5MB)</p>
        </div>

        <div v-else class="upload-preview">
          <img
            v-if="comprovativoPreview && !isPDF"
            :src="comprovativoPreview"
            alt="Comprovativo"
            class="preview-image"
          />
          <div v-else class="pdf-preview">
            <i class="bi bi-file-earmark-pdf pdf-icon"></i>
            <p>{{ comprovativoFile.name }}</p>
          </div>
          <button class="btn-remove" @click.stop="removeFile">
            <i class="bi bi-x-circle"></i>
          </button>
        </div>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/png,image/jpeg,image/jpg,application/pdf"
        @change="handleFileSelect"
        style="display: none"
      />

      <!-- Campos Adicionais -->
      <div class="form-group mt-4">
        <label class="form-label">Valor Pago (MZN) *</label>
        <input
          v-model="valorPago"
          type="number"
          class="form-control"
          placeholder="Ex: 150"
          required
        />
      </div>

      <div class="form-group" v-if="selectedService === 'anuncio'">
        <label class="form-label">ID do Anúncio * (Obrigatório)</label>
        <input
          v-model="anuncioId"
          type="text"
          class="form-control"
          placeholder="Cole aqui o ID do Anúncio"
          required
        />
        <small class="text-muted">Informe o ID do anúncio que deseja ativar.</small>
      </div>

      <div class="form-group">
        <label class="form-label">Referência da Transação (opcional)</label>
        <input
          v-model="referencia"
          type="text"
          class="form-control"
          placeholder="Ex: MP12345678"
        />
        <small class="text-muted">O código fornecido pelo M-Pesa, e-Mola ou Banco.</small>
      </div>

      <div class="form-group">
        <label class="form-label">Observações (opcional)</label>
        <textarea
          v-model="observacoes"
          class="form-control"
          rows="3"
          placeholder="Adicione qualquer informação adicional..."
        ></textarea>
      </div>

      <!-- Botões de Ação -->
      <div class="action-buttons">
        <button
          class="btn-submit"
          @click="submitComprovativo"
          :disabled="!comprovativoFile || !valorPago || loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Enviando...' : 'Enviar Comprovativo' }}
          <i v-if="!loading" class="bi bi-send ms-2"></i>
        </button>
      </div>
    </div>

    <!-- Mensagem de Sucesso -->
    <div v-if="sucesso" class="success-message">
      <i class="bi bi-check-circle-fill success-icon"></i>
      <h4>Comprovativo Enviado!</h4>
      <p>Seu comprovativo foi recebido e será analisado em breve.</p>
      <p class="small text-muted">Você receberá uma confirmação assim que o administrador validar.</p>
      <button class="btn-close-success" @click="closeModal">
        Fechar
      </button>
    </div>

    <!-- Toast de Cópia -->
    <transition name="fade">
      <div v-if="copiado" class="toast-copy">
        <i class="fa-solid fa-check-circle me-2"></i> Número copiado!
      </div>
    </transition>

    <!-- Mensagem de Erro -->
    <div v-if="errorMessage" class="alert alert-danger mt-3">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api';

const props = defineProps({
  initialService: {
    type: String,
    default: null
  }
});

// ==================== ESTADO ====================
const step = ref(0);
const selectedService = ref(null);
const selectedMethod = ref(null);
const comprovativoFile = ref(null);
const comprovativoPreview = ref(null);
const isPDF = ref(false);
const isDragging = ref(false);
const valorPago = ref('');
const referencia = ref(''); // Código da transação (obrigatório agora ou opcional dependendo do backend, mas idealmente sempre enviado)
const anuncioId = ref(''); // Novo campo para ID do anúncio
const observacoes = ref('');
const loading = ref(false);
const sucesso = ref(false);
const errorMessage = ref('');
const copiado = ref(false);
const fileInput = ref(null);

// ==================== LIFECYCLE ====================
onMounted(() => {
  if (props.initialService) {
    const servicoFound = tiposServico.find(s => s.id === props.initialService);
    if (servicoFound) {
      selectService(servicoFound);
      step.value = 1; // Pular para o método de pagamento
    }
  }
});

// ==================== DADOS DE SERVIÇO ====================
const tiposServico = [
  { id: 'assinatura_mensal', nome: 'Assinatura Mensal', valor: 150 },
  { id: 'assinatura_anual', nome: 'Assinatura Anual', valor: 1500 },
  { id: 'anuncio', nome: 'Anúncio / Publicidade', valor: 0 },
];

// Emits para fechar o modal
const emit = defineEmits(['close']);

// ==================== DADOS DE PAGAMENTO ====================
const pagamentos = {
  PayPal: 'karinganastudio23@gmail.com',
  'M-Pesa': '847877405',
  Emola: '879642412',
  'NIB BIM': '000100000074301049557',
};

const icons = {
  PayPal: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="icon-svg"><path fill="#003087" d="M25.6 6.4c-1.6-1.6-4-2.4-7.2-2.4H8c-1.6 0-2.4.8-2.4 2.4L2.4 27.2c0 .8.8 1.6 1.6 1.6h5.6l1.6-8h2.4c6.4 0 11.2-2.4 12.8-8 .8-2.4.8-4.8-1.6-6.4z"/></svg>`,
  'M-Pesa': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="icon-svg"><circle cx="16" cy="16" r="14" fill="#43b02a"/><text x="16" y="22" text-anchor="middle" font-size="14" fill="#fff" font-family="Roboto" font-weight="bold">M</text></svg>`,
  Emola: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="icon-svg"><circle cx="16" cy="16" r="14" fill="#fbbc05"/><text x="16" y="22" text-anchor="middle" font-size="14" fill="#fff" font-family="Roboto" font-weight="bold">E</text></svg>`,
  'NIB BIM': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="icon-svg"><circle cx="16" cy="16" r="14" fill="#e30613"/><text x="16" y="22" text-anchor="middle" font-size="14" fill="#fff" font-family="Roboto" font-weight="bold">B</text></svg>`,
};

// ==================== FUNÇÕES ====================
const selectService = (servico) => {
  selectedService.value = servico.id;
  if (servico.valor > 0) {
    valorPago.value = servico.valor.toString();
  } else {
    valorPago.value = '';
  }
  errorMessage.value = '';
};

const getServiceName = (id) => {
  if (!id) return 'Não selecionado';
  return tiposServico.find(s => s.id === id)?.nome || id;
};

const getServiceIcon = (id) => {
  const iconsMap = {
    assinatura_mensal: 'bi bi-calendar-event',
    assinatura_anual: 'bi bi-calendar-check',
    anuncio: 'bi bi-megaphone',
  };
  return iconsMap[id] || 'bi bi-box';
};

const selectMethod = (metodo) => {
  selectedMethod.value = metodo;
  errorMessage.value = '';
};

const copiarNumero = (valor) => {
  navigator.clipboard.writeText(valor);
  copiado.value = true;
  setTimeout(() => (copiado.value = false), 2000);
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) processFile(file);
};

const handleDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file) processFile(file);
};

const processFile = (file) => {
  // Validar tipo de arquivo
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
    errorMessage.value = 'Formato inválido. Use PNG, JPG ou PDF.';
    return;
  }

  // Validar tamanho (5MB)
  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'Arquivo muito grande. Tamanho máximo: 5MB.';
    return;
  }

  comprovativoFile.value = file;
  isPDF.value = file.type === 'application/pdf';
  errorMessage.value = '';

  // Preview para imagens
  if (!isPDF.value) {
    const reader = new FileReader();
    reader.onload = (e) => {
      comprovativoPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const removeFile = () => {
  comprovativoFile.value = null;
  comprovativoPreview.value = null;
  isPDF.value = false;
  if (fileInput.value) fileInput.value.value = '';
};

const submitComprovativo = async () => {
  if (!comprovativoFile.value || !valorPago.value) {
    errorMessage.value = 'Preencha todos os campos obrigatórios.';
    return;
  }
  
  // Validar Anúncio ID se for anúncio
  if (selectedService.value === 'anuncio' && !anuncioId.value) {
    errorMessage.value = 'Por favor, informe o ID do Anúncio.';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    const formData = new FormData();
    formData.append('comprovativo', comprovativoFile.value);
    formData.append('metodo_pagamento', selectedMethod.value);
    formData.append('valor_pago', valorPago.value);
    formData.append('referencia', referencia.value || ''); // Referência da transação
    formData.append('observacoes', observacoes.value || '');
    
    // Lógica para tipo e pacote
    let tipo = 'assinatura';
    let pacote = '';
    
    if (selectedService.value === 'anuncio') {
      tipo = 'anuncio';
      formData.append('anuncioId', anuncioId.value);
    } else if (selectedService.value === 'assinatura_mensal') {
      pacote = 'mensal';
    } else if (selectedService.value === 'assinatura_anual') {
      pacote = 'anual';
    }
    
    formData.append('tipo', tipo);
    if (pacote) formData.append('pacote', pacote);

    const response = await api.post('/pagamentos/comprovativo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (response.data.sucesso) {
      sucesso.value = true;
      step.value = 0; // Reset para o passo 0
      // Limpar formulário
      comprovativoFile.value = null;
      comprovativoPreview.value = null;
      valorPago.value = '';
      referencia.value = '';
      anuncioId.value = '';
      observacoes.value = '';
      selectedMethod.value = null;
      selectedService.value = null;
      if (fileInput.value) fileInput.value.value = '';
    } else {
      errorMessage.value = response.data.mensagem || 'Erro ao enviar comprovativo.';
    }
  } catch (error) {
    console.error('Erro ao enviar comprovativo:', error);
    errorMessage.value = 'Erro de conexão. Tente novamente.';
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  sucesso.value = false;
  emit('close');
};
</script>

<style scoped>
@import "@fortawesome/fontawesome-free/css/all.min.css";
@import "bootstrap-icons/font/bootstrap-icons.css";
@import "@fontsource/poppins/500.css";
@import "@fontsource/poppins/600.css";

.comprovativo-container {
  background: #fff;
  border-radius: 1.5rem;
  padding: 1.5rem;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  font-family: 'Poppins', sans-serif;
}

/* Service Selection */
.service-options {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.service-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.service-option:hover {
  border-color: #800080;
  background: #faf7ff;
}

.service-option.selected {
  border-color: #800080;
  background: linear-gradient(135deg, #faf7ff, #f0e6fa);
}

.service-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.service-icon {
  font-size: 1.5rem;
  color: #800080;
  background: rgba(128, 0, 128, 0.1);
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
}

.service-details {
  display: flex;
  flex-direction: column;
}

.service-name {
  font-weight: 600;
  color: #333;
}

.service-price {
  font-size: 0.85rem;
  color: #666;
}

.text-purple {
  color: #800080 !important;
}

.selection-summary {
  border-left: 4px solid #800080;
}

.comprovativo-header h3 {
  font-size: clamp(1.25rem, 5vw, 1.75rem);
  font-weight: 700;
  color: #800080;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.comprovativo-header p {
  font-size: clamp(0.85rem, 3vw, 1rem);
}

.section-title {
  font-size: clamp(0.95rem, 3vw, 1.1rem);
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}

/* Payment Methods Grid */
.payment-options {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.payment-option {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 0.75rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 0.5rem;
}

.payment-option:hover {
  border-color: #800080;
  background: #faf7ff;
}

.payment-option.selected {
  border-color: #800080;
  background: linear-gradient(135deg, #faf7ff, #f0e6fa);
  box-shadow: 0 4px 12px rgba(128, 0, 128, 0.2);
}

.option-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.icon-svg {
  width: clamp(24px, 5vw, 32px);
  height: clamp(24px, 5vw, 32px);
  flex-shrink: 0;
}

.option-name {
  font-weight: 600;
  color: #800080;
  font-size: clamp(0.85rem, 3vw, 1rem);
  white-space: nowrap;
}

.option-number {
  font-size: clamp(0.75rem, 2.5vw, 0.9rem);
  color: #666;
  background: #fff;
  padding: 0.4rem 0.6rem;
  border-radius: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.btn-copy-small {
  background: #800080;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: clamp(32px, 8vw, 36px);
  height: clamp(32px, 8vw, 36px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.btn-copy-small:hover {
  background: #198754;
  transform: scale(1.1);
}

/* Upload Area */
.upload-area {
  border: 2px dashed #800080;
  border-radius: 1rem;
  padding: clamp(1.5rem, 5vw, 3rem) 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #faf7ff;
  position: relative;
}

.upload-area.drag-over {
  background: #f0e6fa;
  border-color: #9b30ff;
}

.upload-placeholder {
  color: #800080;
}

.upload-icon {
  font-size: clamp(2rem, 8vw, 3rem);
  margin-bottom: 0.75rem;
}

.upload-text {
  font-size: clamp(0.95rem, 3vw, 1.1rem);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.upload-hint {
  font-size: clamp(0.75rem, 2.5vw, 0.85rem);
  color: #666;
}

.upload-preview {
  position: relative;
}

.preview-image {
  max-width: 100%;
  max-height: clamp(200px, 40vw, 300px);
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pdf-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
}

.pdf-preview p {
  font-size: clamp(0.8rem, 2.5vw, 0.95rem);
  word-break: break-all;
}

.pdf-icon {
  font-size: clamp(2.5rem, 8vw, 4rem);
  color: #dc3545;
}

.btn-remove {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: clamp(32px, 8vw, 40px);
  height: clamp(32px, 8vw, 40px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: clamp(1.2rem, 4vw, 1.5rem);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.btn-remove:hover {
  background: #c82333;
  transform: scale(1.1);
}

/* Form Controls */
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  display: block;
  font-size: clamp(0.85rem, 3vw, 0.95rem);
}

.form-control {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 2px solid #e9ecef;
  border-radius: 0.75rem;
  font-size: clamp(0.85rem, 3vw, 1rem);
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #800080;
  box-shadow: 0 0 0 3px rgba(128, 0, 128, 0.1);
}

/* Buttons */
.btn-continue,
.btn-submit {
  width: 100%;
  padding: 0.85rem;
  background: linear-gradient(135deg, #800080, #9b30ff);
  color: #fff;
  border: none;
  border-radius: 0.75rem;
  font-size: clamp(0.95rem, 3vw, 1.1rem);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-continue:disabled,
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-continue:hover:not(:disabled),
.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(128, 0, 128, 0.3);
}

.btn-back {
  background: #6c757d;
  color: #fff;
  border: none;
  padding: 0.5rem 0.85rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: clamp(0.85rem, 3vw, 0.95rem);
}

.btn-back:hover {
  background: #5a6268;
}

/* Success Message */
.success-message {
  text-align: center;
  padding: 2rem 1rem;
}

.success-icon {
  font-size: clamp(3rem, 12vw, 5rem);
  color: #198754;
  margin-bottom: 1rem;
}

.success-message h4 {
  font-size: clamp(1.1rem, 4vw, 1.5rem);
  color: #198754;
  margin-bottom: 0.5rem;
}

.success-message p {
  font-size: clamp(0.85rem, 3vw, 1rem);
}

.btn-close-success {
  margin-top: 1.5rem;
  padding: 0.65rem 1.5rem;
  background: #198754;
  color: #fff;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: clamp(0.9rem, 3vw, 1rem);
}

.btn-close-success:hover {
  background: #157347;
  transform: translateY(-2px);
}

/* Toast */
.toast-copy {
  position: fixed;
  bottom: 2rem;
  right: 1rem;
  background: #198754;
  color: #fff;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  font-weight: 600;
  z-index: 10000;
  font-size: clamp(0.85rem, 3vw, 0.95rem);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .comprovativo-container {
    padding: 1.25rem;
    border-radius: 1rem;
  }

  .payment-option {
    flex-wrap: wrap;
    padding: 0.65rem;
  }

  .option-number {
    font-size: 0.75rem;
    max-width: 80px;
  }

  .upload-area {
    padding: 1.5rem 0.75rem;
  }

  .form-group {
    margin-bottom: 0.85rem;
  }

  .toast-copy {
    bottom: 1rem;
    right: 0.5rem;
    left: 0.5rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .comprovativo-container {
    padding: 1rem;
  }

  .comprovativo-header h3 {
    font-size: 1.15rem;
  }

  .option-name {
    font-size: 0.8rem;
  }

  .option-number {
    display: none;
  }

  .icon-svg {
    width: 24px;
    height: 24px;
  }

  .btn-copy-small {
    width: 32px;
    height: 32px;
  }
}
</style>
