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
    resumo: 'Documento essencial de identificação para cidadãos nacionais. Saiba como tratar, renovar ou pedir segunda via.',
    icone: 'bi-person-vcard',
    corClasse: 'bg-primary-soft text-primary',
    corTema: 'primary',
    requisitos: [
      'Assento de Nascimento ou BI caducado (para renovação)',
      'Presença física para recolha de dados biométricos',
      'Talão de depósito do valor correspondente',
      'Em caso de perda: Declaração policial de extravio'
    ],
    custo: '165 MT (Normal) | Taxa de urgência varia',
    locais: 'Direcção Nacional de Identificação Civil (DNIC) ou Conservatórias do Registo Civil.',
    dica: 'Chegue cedo para evitar longas filas. O serviço de agendamento online já está disponível em alguns postos de Maputo.'
  },
  {
    id: 2,
    titulo: 'Passaporte Biométrico',
    categoria: 'viagem',
    resumo: 'Necessário para viajar para fora do país. Requer BI válido e regularização do serviço militar (para jovens).',
    icone: 'bi-passport',
    corClasse: 'bg-success-soft text-success',
    corTema: 'success',
    requisitos: [
      'Bilhete de Identidade válido (Original e Cópia)',
      'Recenseamento Militar regularizado (18-35 anos)',
      'Formulário preenchido no local',
      'Comprovativo de pagamento'
    ],
    custo: 'Aproximadamente 3.750 MT (Válido por 5 anos)',
    locais: 'Direcção Nacional de Migração (SENAMI) nas capitais provinciais.',
    dica: 'Verifique a validade do seu BI antes de ir. Se o BI caducar em menos de 6 meses, renove-o primeiro.'
  },
  {
    id: 3,
    titulo: 'Carta de Condução',
    categoria: 'veiculos',
    resumo: 'Habilitação legal para conduzir veículos. Inclui exame teórico, prático e exame médico.',
    icone: 'bi-car-front',
    corClasse: 'bg-warning-soft text-warning',
    corTema: 'warning',
    requisitos: [
      'Ter idade mínima (18 anos para ligeiros)',
      'Exame médico e psicotécnico aprovados',
      'Inscrição em escola de condução credenciada',
      'Aprovação nos exames teórico e prático do INATRO'
    ],
    custo: 'Varia conforme a escola de condução + Taxas do INATRO (~2.500 MT taxas)',
    locais: 'Instituto Nacional dos Transportes Rodoviários (INATRO).',
    dica: 'A Carta Biométrica é agora o padrão. Cartas antigas devem ser substituídas.'
  },
  {
    id: 4,
    titulo: 'NUIT (Número Fiscal)',
    categoria: 'fiscal',
    resumo: 'Número Único de Identificação Tributária, necessário para emprego, contas bancárias e negócios.',
    icone: 'bi-123',
    corClasse: 'bg-info-soft text-info',
    corTema: 'info',
    requisitos: [
      'Bilhete de Identidade válido',
      'Formulário M/01 preenchido',
      'Comprovativo de residência (opcional em alguns casos)'
    ],
    custo: 'Gratuito',
    locais: 'Autoridade Tributária (AT) - Bairros Fiscais.',
    dica: 'O NUIT é pessoal e intransmissível. Guarde o documento original.'
  },
  {
    id: 5,
    titulo: 'DIRE (Residentes Estrangeiros)',
    categoria: 'identidade',
    resumo: 'Documento de Identificação e Residência para Estrangeiros. Essencial para viver legalmente em Moçambique.',
    icone: 'bi-globe-americas',
    corClasse: 'bg-danger-soft text-danger',
    corTema: 'danger',
    requisitos: [
      'Passaporte válido com visto adequado',
      'Carta de chamada ou contrato de trabalho',
      'Registo criminal do país de origem',
      'Atestado médico'
    ],
    custo: 'Varia conforme a nacionalidade e tipo de residência (Anual/Permanente)',
    locais: 'SENAMI (Migração).',
    dica: 'O processo pode ser demorado. Inicie a renovação 60 dias antes de caducar.'
  },
  {
    id: 6,
    titulo: 'Registo Criminal',
    categoria: 'civil',
    resumo: 'Certificado que comprova a ausência de crimes. Exigido para emprego, concursos públicos e vistos.',
    icone: 'bi-file-earmark-lock',
    corClasse: 'bg-secondary-soft text-secondary',
    corTema: 'secondary',
    requisitos: [
      'Bilhete de Identidade ou Passaporte válido',
      'Formulário preenchido (Modelo 2)',
      'Impressão digital recolhida no local'
    ],
    custo: 'Normal: 500 MT | Urgente: 750 MT',
    locais: 'Direcção do Registo Criminal ou Lojas de Registo nas capitais.',
    dica: 'A validade é de apenas 90 dias. Trate apenas quando for necessário.'
  },
  {
    id: 7,
    titulo: 'Assento de Nascimento',
    categoria: 'civil',
    resumo: 'Documento base para qualquer cidadão. Necessário para tratar o BI e matrícula escolar.',
    icone: 'bi-balloon-heart',
    corClasse: 'bg-primary-soft text-primary',
    corTema: 'primary',
    requisitos: [
      'Declaração da Maternidade ou Hospital',
      'BI dos pais (se casados) ou presença de ambos (se solteiros)',
      'Presença de duas testemunhas (se registo tardio)'
    ],
    custo: 'Gratuito até aos 120 dias. Pagável após prazo.',
    locais: 'Conservatórias do Registo Civil.',
    dica: 'Registe a criança logo após o nascimento para evitar multas e processos complexos de registo tardio.'
  },
  {
    id: 8,
    titulo: 'DUAT (Terra/Terreno)',
    categoria: 'imoveis',
    resumo: 'Direito de Uso e Aproveitamento da Terra. O documento oficial que garante a posse legal de um terreno.',
    icone: 'bi-geo-alt',
    corClasse: 'bg-success-soft text-success',
    corTema: 'success',
    requisitos: [
      'Croquis de localização',
      'Consulta comunitária (áreas rurais)',
      'Plano de exploração/edificação',
      'Pagamento de taxas de licença'
    ],
    custo: 'Varia conforme a dimensão (Hectares) e localização.',
    locais: 'Serviços Distritais de Planeamento e Infraestruturas (SDPI) ou Conselhos Municipais.',
    dica: 'O DUAT provisório vale 2 anos (estrangeiros) ou 5 anos (nacionais). Deve solicitar o definitivo após cumprir o plano.'
  },
  {
    id: 9,
    titulo: 'Alvará Comercial',
    categoria: 'fiscal',
    resumo: 'Licença necessária para abrir qualquer estabelecimento comercial ou empresa em funcionamento.',
    icone: 'bi-shop',
    corClasse: 'bg-warning-soft text-warning',
    corTema: 'warning',
    requisitos: [
      'Certidão de Registo Comercial (BUE)',
      'NUIT da Empresa',
      'Vistoria do local (Bombeiros, Saúde, Comércio)',
      'Contrato de Arrendamento ou DUAT'
    ],
    custo: 'Varia conforme a classe e atividade económica.',
    locais: 'Balcão de Atendimento Único (BAU) ou Direcções de Indústria e Comércio.',
    dica: 'Certifique-se de que o local cumpre os requisitos de segurança e higiene antes de pedir a vistoria.'
  },
  {
    id: 10,
    titulo: 'Inscrição no INSS',
    categoria: 'fiscal',
    resumo: 'Segurança Social obrigatória para todos os trabalhadores por conta de outrem e empresas.',
    icone: 'bi-shield-check',
    corClasse: 'bg-info-soft text-info',
    corTema: 'info',
    requisitos: [
      'Boletim de Identificação de Beneficiário (BIB)',
      'Cópia do BI e NUIT',
      'Ficha da Empresa (para empregadores)'
    ],
    custo: 'Gratuito (Descontos mensais no salário)',
    locais: 'Instituto Nacional de Segurança Social (INSS) - Delegações.',
    dica: 'Pode consultar os seus descontos e carreira contributiva online no portal "Minha Segurança Social".'
  },
  {
    id: 11,
    titulo: 'Abertura de Conta Bancária',
    categoria: 'bancos',
    resumo: 'Requisitos gerais para abrir conta nos principais bancos (BIM, BCI, Standard Bank, Absa, etc).',
    icone: 'bi-bank',
    corClasse: 'bg-primary-soft text-primary',
    corTema: 'primary',
    requisitos: [
      'Bilhete de Identidade válido ou Passaporte (+ DIRE para estrangeiros)',
      'NUIT (Número Único de Identificação Tributária)',
      'Comprovativo de Residência (Declaração do Bairro ou Fatura de Água/Luz)',
      'Declaração de Rendimentos (Carta da empresa ou recibo de vencimento)'
    ],
    custo: 'Varia (Geralmente depósito inicial mínimo de 500 a 1000 MT)',
    locais: 'Balcões de qualquer banco comercial.',
    dica: 'Para contas "Móvel" ou simplificadas, muitas vezes basta o BI e NUIT, mas têm limites de transação menores.'
  },
  {
    id: 12,
    titulo: 'M-Pesa (Vodacom)',
    categoria: 'bancos',
    resumo: 'Como registar e aumentar o limite da sua conta M-Pesa para transações maiores.',
    icone: 'bi-phone',
    corClasse: 'bg-danger-soft text-danger',
    corTema: 'danger',
    requisitos: [
      'Cartão SIM Vodacom registado',
      'Bilhete de Identidade válido (Original)',
      'Preenchimento do formulário de registo',
      'Presença física do titular'
    ],
    custo: 'Gratuito',
    locais: 'Lojas Vodacom ou Agentes autorizados M-Pesa.',
    dica: 'Para aumentar limites (Tier 2/3), deve ir a uma loja oficial com o BI e comprovativo de residência.'
  },
  {
    id: 13,
    titulo: 'E-Mola (Movitel)',
    categoria: 'bancos',
    resumo: 'Serviço financeiro móvel da Movitel. Saiba como ativar e usar.',
    icone: 'bi-phone-vibrate',
    corClasse: 'bg-warning-soft text-warning',
    corTema: 'warning',
    requisitos: [
      'Cartão SIM Movitel registado',
      'Documento de identificação válido (BI, Passaporte, DIRE)',
      'Registo via menu *898#'
    ],
    custo: 'Gratuito',
    locais: 'Lojas Movitel ou Agentes E-Mola.',
    dica: 'A E-Mola permite levantar dinheiro sem cartão em ATMs do BCI e Ponto24.'
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
