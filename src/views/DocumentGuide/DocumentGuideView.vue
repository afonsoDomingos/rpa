<template>
  <div class="guia-container">
    <!-- Navbar -->
    <NavbarDefault :sticky="true" />

    <!-- HERO SECTION -->
    <section class="hero-section text-center text-white position-relative">
      <div class="bg-overlay"></div>
      <div class="container position-relative z-index-2 py-5">
        <h1 class="display-4 fw-black mb-3">Guia de Documentos 🇲🇿</h1>
        <p class="lead mb-5 opacity-90 mx-auto" style="max-width: 700px;">
          Tudo o que precisa saber para tratar dos seus documentos em Moçambique.
          Processos, taxas, locais e requisitos explicados de forma simples.
        </p>

        <!-- Barra de Pesquisa -->
        <div class="search-wrapper mx-auto shadow-lg">
          <i class="bi bi-search text-muted"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Ex: Bilhete de Identidade, Passaporte, Carta de Condução..."
            class="form-control border-0"
          >
        </div>
      </div>
    </section>

    <!-- CONTEÚDO -->
    <div class="container py-5 mt-n5 position-relative z-index-3">
      
      <!-- Categorias (Filtros) -->
      <div class="d-flex justify-content-center flex-wrap gap-3 mb-5">
        <button 
          v-for="cat in categorias" 
          :key="cat.id"
          class="btn btn-category shadow-sm"
          :class="{ active: categoriaAtiva === cat.id }"
          @click="categoriaAtiva = cat.id"
        >
          <i :class="cat.icone" class="me-2"></i> {{ cat.nome }}
        </button>
      </div>

      <!-- Lista de Documentos -->
      <div class="row g-4">
        <div v-for="doc in documentosFiltrados" :key="doc.id" class="col-md-6 col-lg-4">
          <div class="card h-100 card-doc shadow-sm hover-up" @click="abrirDocumento(doc)">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <div class="icon-box me-3" :class="doc.corClasse">
                  <i :class="doc.icone"></i>
                </div>
                <h5 class="fw-bold mb-0 text-dark">{{ doc.titulo }}</h5>
              </div>
              <p class="text-sm text-secondary mb-3 line-clamp-3">
                {{ doc.resumo }}
              </p>
              <div class="d-flex justify-content-between align-items-center border-top pt-3 mt-auto">
                <span class="badge bg-light text-dark capitalize">
                  <i class="bi bi-tag-fill me-1"></i> {{ doc.categoria }}
                </span>
                <small class="text-primary fw-bold cursor-pointer">
                  Ver detalhes <i class="bi bi-arrow-right ms-1"></i>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Se nenhum resultado -->
      <div v-if="documentosFiltrados.length === 0" class="text-center py-5">
        <i class="bi bi-journal-x display-1 text-muted opacity-25"></i>
        <p class="mt-3 text-secondary">Nenhum documento encontrado para sua pesquisa.</p>
        <button @click="resetFiltros" class="btn btn-outline-primary btn-sm mt-2">Limpar Filtros</button>
      </div>

    </div>

    <!-- MODAL DE DETALHES -->
    <transition name="modal-fade">
      <div v-if="docSelecionado" class="modal-overlay" @click.self="fecharModal">
        <div class="modal-content-custom shadow-lg">
          <button class="btn-close-custom" @click="fecharModal">
            <i class="bi bi-x-lg"></i>
          </button>
          
          <div class="modal-header-custom p-4 text-white" :class="`bg-${docSelecionado.corTema}`">
            <div class="d-flex align-items-center">
              <i :class="docSelecionado.icone" class="display-4 me-3 opacity-75"></i>
              <div>
                <h3 class="fw-bold mb-1">{{ docSelecionado.titulo }}</h3>
                <span class="badge bg-white-softer">{{ docSelecionado.categoria }}</span>
              </div>
            </div>
          </div>

          <div class="modal-body-custom p-4">
            <!-- Abas ou Seções -->
            <div class="mb-4">
              <h5 class="fw-bold text-dark border-bottom pb-2 mb-3">
                <i class="bi bi-check-circle-fill text-success me-2"></i>Requisitos
              </h5>
              <ul class="list-unstyled">
                <li v-for="(req, idx) in docSelecionado.requisitos" :key="idx" class="mb-2 d-flex">
                  <i class="bi bi-dot text-primary me-2"></i>
                  <span>{{ req }}</span>
                </li>
              </ul>
            </div>

            <div class="mb-4">
              <h5 class="fw-bold text-dark border-bottom pb-2 mb-3">
                <i class="bi bi-cash-coin text-warning me-2"></i>Taxas e Custos
              </h5>
              <p class="alert alert-light border">
                <strong>Valor estimado:</strong> {{ docSelecionado.custo }}
              </p>
            </div>

            <div class="mb-4">
              <h5 class="fw-bold text-dark border-bottom pb-2 mb-3">
                <i class="bi bi-geo-alt-fill text-danger me-2"></i>Onde tratar
              </h5>
              <p>{{ docSelecionado.locais }}</p>
            </div>
            
            <div class="bg-light p-3 rounded border-start border-4 border-info">
              <h6 class="fw-bold text-info mb-2"><i class="bi bi-info-circle-fill me-2"></i>Nota Importante:</h6>
              <p class="mb-0 text-sm">{{ docSelecionado.dica }}</p>
            </div>

          </div>
          
          <div class="modal-footer-custom p-3 border-top bg-light d-flex justify-content-end">
            <button class="btn btn-dark" @click="fecharModal">Fechar</button>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- Footer -->
    <DefaultFooter />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import NavbarDefault from "@/examples/navbars/NavbarDefault.vue";
import DefaultFooter from "@/examples/footers/FooterDefault.vue";

// --- DADOS (Isso viria de um arquivo separado ou API futuramente) ---
const categorias = [
  { id: 'todos', nome: 'Todos', icone: 'bi-grid-fill' },
  { id: 'identidade', nome: 'Identidade', icone: 'bi-person-badge' },
  { id: 'viagem', nome: 'Viagem', icone: 'bi-airplane-fill' },
  { id: 'veiculos', nome: 'Veículos', icone: 'bi-car-front-fill' },
  { id: 'civil', nome: 'Registo Civil', icone: 'bi-people-fill' },
  { id: 'imoveis', nome: 'Imóveis', icone: 'bi-house-door-fill' },
  { id: 'fiscal', nome: 'Fiscal', icone: 'bi-receipt' },
  { id: 'bancos', nome: 'Bancos & Mobile', icone: 'bi-wallet2' }, // NOVA CATEGORIA
];

const documentos = [
  {
    id: 1,
    titulo: 'Bilhete de Identidade (BI)',
    categoria: 'identidade',
    resumo: 'O documento principal de identificação. Para 2ª via por perda, é obrigatório um Boletim de Ocorrência Policial.',
    icone: 'bi-person-vcard',
    corClasse: 'bg-primary-soft text-primary',
    corTema: 'primary',
    requisitos: [
      'Presença física (obrigatória para dados biométricos)',
      'Assento de Nascimento ou BI antigo (para renovação)',
      'Declaração de extravio da Polícia (Obrigatório para 2ª via)',
      'Talão de depósito pago no banco ou via canal eletrónico indicado no local'
    ],
    custo: '165 MT (Taxa normal). Taxas de urgência podem elevar o valor para ~500 MT.',
    locais: 'Postos da DIC (Identificação Civil) ou Balcões de Atendimento Único (BAU).',
    dica: 'O BI agora tem validade de 10 anos para maiores de 21 anos. Evite plastificar o talão de levantamento, pois o sistema precisa ler o código.'
  },
  {
    id: 2,
    titulo: 'Passaporte Biométrico',
    categoria: 'viagem',
    resumo: 'Indispensável para viagens internacionais. Requer Bilhete de Identidade válido e atualizado.',
    icone: 'bi-passport',
    corClasse: 'bg-success-soft text-success',
    corTema: 'success',
    requisitos: [
      'Bilhete de Identidade Válido (Original e Cópia)',
      'Talão de pagamento (obtido no local após captura)',
      'Autorização dos pais (para menores de 18 anos)',
      'Regularização militar (Cédula ou Declaração) para homens dos 18 aos 35 anos'
    ],
    custo: '3.750 MT (Validade de 5 anos para adultos).',
    locais: 'Serviço Nacional de Migração (SENAMI) e Postos de Atendimento em todas as Províncias.',
    dica: 'O SENAMI agora permite agendamento online em algumas províncias. Verifique o portal oficial para evitar filas.'
  },
  {
    id: 3,
    titulo: 'Carta de Condução',
    categoria: 'veiculos',
    resumo: 'Documento que habilita a condução de veículos. O processo de 2ª via exige exame médico atualizado.',
    icone: 'bi-car-front',
    corClasse: 'bg-warning-soft text-warning',
    corTema: 'warning',
    requisitos: [
      'Exame médico de aptidão física e mental',
      'Bilhete de Identidade válido',
      'Boletim de Ocorrência (em caso de perda/roubo)',
      'Formulário do INATRO devidamente preenchido'
    ],
    custo: 'Renovação/2ª Via: ~2.500 MT (Variável conforme taxas de emissão biométrica).',
    locais: 'Instituto Nacional dos Transportes Rodoviários (INATRO).',
    dica: 'Se a sua carta for do modelo antigo (papel), a troca para o modelo biométrico é obrigatória e exige nova captura de fotos e digitais.'
  },
  {
    id: 4,
    titulo: 'NUIT (Número Fiscal)',
    categoria: 'fiscal',
    resumo: 'O Número Único de Identificação Tributária é gratuito e obrigatório para qualquer atividade financeira.',
    icone: 'bi-123',
    corClasse: 'bg-info-soft text-info',
    corTema: 'info',
    requisitos: [
      'Cópia do Bilhete de Identidade ou Passaporte',
      'Preenchimento do Modelo 01 (disponível nas repartições)',
      'Comprovativo de residência ou declaração do bairro'
    ],
    custo: 'Gratuito (Emissão original e 2ª via).',
    locais: 'Autoridade Tributária (AT) ou Bairros Fiscais.',
    dica: 'Nunca pague pela emissão do NUIT, é um serviço totalmente gratuito por lei em Moçambique.'
  },
  {
    id: 6,
    titulo: 'Registo Criminal',
    categoria: 'civil',
    resumo: 'Documento que atesta se o cidadão tem ou não antecedentes criminais.',
    icone: 'bi-file-earmark-lock',
    corClasse: 'bg-secondary-soft text-secondary',
    corTema: 'secondary',
    requisitos: [
      'Bilhete de Identidade válido (Original)',
      'Indicação do fim a que se destina (Ex: Emprego ou Visto)',
      'Pagamento da taxa no local'
    ],
    custo: '500 MT (Normal - ~3 a 5 dias) | 750 MT (Urgente - ~24h).',
    locais: 'Direcção Provincial de Identificação Civil ou Lojas de Registo.',
    dica: 'A validade do registo criminal em Moçambique é de apenas 90 dias (3 meses).'
  },
  {
    id: 7,
    titulo: 'Certidão de Nascimento',
    categoria: 'civil',
    resumo: 'Base para todos os outros documentos. Em caso de perda, peça uma "Cópia Integral" ou "Narrativa".',
    icone: 'bi-balloon-heart',
    corClasse: 'bg-primary-soft text-primary',
    corTema: 'primary',
    requisitos: [
      'Dados do assento (Número, Ano e Livro - se souber)',
      'BI dos pais ou do próprio interessado',
      'Pagamento de emolumentos'
    ],
    custo: 'Aproximadamente 250 MT (Varia conforme o tipo de certidão).',
    locais: 'Conservatórias do Registo Civil onde foi feito o registo original.',
    dica: 'Se não souber os dados do livro, os serviços podem fazer uma busca pelo nome e data de nascimento, mas pode demorar mais.'
  }
];


// --- LÓGICA ---
const searchQuery = ref("");
const categoriaAtiva = ref("todos");
const docSelecionado = ref(null);

const documentosFiltrados = computed(() => {
  return documentos.filter(doc => {
    const matchesSearch = doc.titulo.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          doc.resumo.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCat = categoriaAtiva.value === 'todos' || doc.categoria === categoriaAtiva.value;
    return matchesSearch && matchesCat;
  });
});

const abrirDocumento = (doc) => {
  docSelecionado.value = doc;
  document.body.style.overflow = 'hidden'; // Bloqueia scroll do fundo
};

const fecharModal = () => {
  docSelecionado.value = null;
  document.body.style.overflow = ''; // Libera scroll
};

const resetFiltros = () => {
  searchQuery.value = "";
  categoriaAtiva.value = "todos";
};
</script>

<style scoped>
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css");
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap');

.guia-container {
  font-family: 'Poppins', sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* HERO */
.hero-section {
  background: linear-gradient(135deg, #240024 0%, #800080 100%);
  padding: 100px 0 120px;
  clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
}

.fw-black {
  font-weight: 900;
  font-family: 'Poppins', sans-serif;
  color: #fff;
}
.bg-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  /* background: url('@/assets/img/dots-pattern.png'); removido pois não existe */
  opacity: 0.1;
}

.search-wrapper {
  max-width: 600px;
  background: white;
  border-radius: 50px;
  padding: 0.5rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.search-wrapper input {
  width: 100%;
  font-size: 1.1rem;
  padding: 0.5rem;
}
.search-wrapper input:focus {
  outline: none;
  box-shadow: none;
}
.search-wrapper i {
  font-size: 1.2rem;
}

/* CARDS */
.card-doc {
  border: none;
  border-radius: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
}
.hover-up:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
}

.icon-box {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.btn-category {
  border: 1px solid #e0e0e0;
  background: white;
  color: #555;
  border-radius: 30px;
  padding: 8px 20px;
  font-weight: 500;
  transition: all 0.2s;
}
.btn-category:hover, .btn-category.active {
  background: #800080;
  color: white;
  border-color: #800080;
  transform: scale(1.05);
}

/* Cores Soft */
.bg-primary-soft { background: rgba(13, 110, 253, 0.1); }
.bg-success-soft { background: rgba(25, 135, 84, 0.1); }
.bg-warning-soft { background: rgba(255, 193, 7, 0.1); }
.bg-info-soft { background: rgba(13, 202, 240, 0.1); }
.bg-danger-soft { background: rgba(220, 53, 69, 0.1); }

/* UTIL */
.capitalize { text-transform: capitalize; }
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(5px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.modal-content-custom {
  background: white;
  width: 100%;
  max-width: 700px;
  border-radius: 20px;
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  animation: slideUp 0.3s ease-out;
}
.modal-header-custom {
  background: #333;
}
.modal-body-custom {
  overflow-y: auto;
}
.btn-close-custom {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0,0,0,0.2);
  border: none;
  color: white;
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-close-custom:hover { background: rgba(0,0,0,0.4); }

.bg-white-softer { background: rgba(255,255,255,0.2); color: white; }

/* Modal Transition */
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s; }

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
